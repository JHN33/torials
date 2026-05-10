import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const uploadDir = path.join(__dirname, 'uploads');
const dbPath = path.join(dataDir, 'db.json');
const port = Number(process.env.PORT || 4173);
const secret = process.env.JWT_SECRET || 'change-this-secret-in-production';

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ users: [], posts: [] }, null, 2));

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const writeDb = db => fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', ...headers });
  res.end(JSON.stringify(body));
};
const id = () => crypto.randomUUID();
const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
const sign = payload => crypto.createHmac('sha256', secret).update(payload).digest('base64url');
const tokenFor = user => { const payload = b64({ sub: user.id, email: user.email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }); return `${payload}.${sign(payload)}`; };
const verify = token => {
  const [payload, sig] = String(token || '').split('.');
  if (!payload || !sig || sign(payload) !== sig) return null;
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  if (parsed.exp < Date.now()) return null;
  const db = readDb();
  return db.users.find(u => u.id === parsed.sub) || null;
};
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};
const passwordOk = (password, stored) => {
  const [salt] = stored.split(':');
  return crypto.timingSafeEqual(Buffer.from(hashPassword(password, salt)), Buffer.from(stored));
};
const parseBody = req => new Promise((resolve, reject) => {
  let data = '';
  req.on('data', chunk => { data += chunk; if (data.length > 2_000_000) reject(new Error('Body too large')); });
  req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); } });
});
const parseMultipart = req => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.match(/boundary=(.+)$/)?.[1];
    if (!boundary) return reject(new Error('Missing multipart boundary'));
    const raw = buffer.toString('binary');
    const marker = `--${boundary}`;
    const part = raw.split(marker).find(p => p.includes('Content-Disposition') && p.includes('filename='));
    if (!part) return reject(new Error('No file uploaded'));
    const headerEnd = part.indexOf('\r\n\r\n');
    const headers = part.slice(0, headerEnd);
    let body = part.slice(headerEnd + 4);
    body = body.replace(/\r\n--$/, '').replace(/\r\n$/, '');
    const filename = headers.match(/filename="([^"]+)"/)?.[1] || 'upload';
    const mime = headers.match(/Content-Type: ([^\r\n]+)/i)?.[1] || 'application/octet-stream';
    resolve({ filename, mime, data: Buffer.from(body, 'binary') });
  });
  req.on('error', reject);
});

const ensureDefaultOwner = () => {
  const ownerEmail = (process.env.OWNER_EMAIL || 'owner@torials.local').toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD || 'Torials123';
  const db = readDb();
  const existingOwner = db.users.find(u => u.email.toLowerCase() === ownerEmail);
  if (existingOwner) {
    existingOwner.role = 'owner';
    existingOwner.name = 'Vitoria Aketch';
    writeDb(db);
    return;
  }
  if (!db.users.some(u => u.email.toLowerCase() === ownerEmail)) {
    db.users.push({
      id: id(),
      email: ownerEmail,
      password_hash: hashPassword(ownerPassword),
      role: 'owner',
      name: 'Vitoria Aketch',
      created_at: new Date().toISOString(),
    });
    writeDb(db);
    console.log(`Created default Torials owner login: ${ownerEmail}`);
  }
};
ensureDefaultOwner();

const requireUser = req => verify((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
const requireOwner = req => {
  const user = requireUser(req);
  return user && user.role === 'owner' ? user : null;
};
const publicPost = p => ({ ...p });
const uniqueSlug = (db, slug, existingId) => !db.posts.some(p => p.slug === slug && p.id !== existingId);

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, {});
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname.startsWith('/uploads/')) {
      const file = path.join(uploadDir, path.basename(url.pathname));
      if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': mimeFor(file) });
      return fs.createReadStream(file).pipe(res);
    }

    if (url.pathname === '/api/health') return send(res, 200, { ok: true, name: 'Torials API', owner: 'Vitoria Aketch' });

    if (url.pathname === '/api/auth/signup' && req.method === 'POST') {
      return send(res, 403, { error: 'Sign up is disabled. Only Vitoria Aketch, the site owner, can log in and publish on Torials.' });
    }

    if (url.pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await parseBody(req);
      const db = readDb();
      const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
      if (!user || !passwordOk(password || '', user.password_hash)) return send(res, 401, { error: 'Invalid email or password.' });
      if (user.role !== 'owner') return send(res, 403, { error: 'Only the Torials owner can access the publishing dashboard.' });
      return send(res, 200, { token: tokenFor(user), user: { id: user.id, email: user.email, name: user.name || '', role: user.role || 'owner' } });
    }

    if (url.pathname === '/api/auth/me' && req.method === 'GET') {
      const user = requireOwner(req);
      if (!user) return send(res, 401, { error: 'Owner authentication required.' });
      return send(res, 200, { user: { id: user.id, email: user.email, name: user.name || '', role: 'owner' } });
    }

    if (url.pathname === '/api/posts' && req.method === 'GET') {
      const db = readDb();
      const mine = url.searchParams.get('mine') === 'true';
      let posts = db.posts;
      if (mine) {
        const user = requireOwner(req); if (!user) return send(res, 401, { error: 'Owner authentication required.' });
        posts = posts.filter(p => p.author_id === user.id);
      } else posts = posts.filter(p => p.published);
      posts = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(publicPost);
      return send(res, 200, { posts });
    }

    if (url.pathname.match(/^\/api\/posts\/slug\//) && req.method === 'GET') {
      const slug = decodeURIComponent(url.pathname.split('/').pop());
      const post = readDb().posts.find(p => p.slug === slug && p.published);
      return post ? send(res, 200, { post: publicPost(post) }) : send(res, 404, { error: 'Post not found.' });
    }

    if (url.pathname === '/api/posts' && req.method === 'POST') {
      const user = requireOwner(req); if (!user) return send(res, 401, { error: 'Owner authentication required.' });
      const body = await parseBody(req); const db = readDb();
      if (!body.title || !body.slug || !body.content) return send(res, 400, { error: 'Title, slug, and content are required.' });
      if (!uniqueSlug(db, body.slug)) return send(res, 409, { error: 'That slug is already in use.' });
      const now = new Date().toISOString();
      const post = { id: id(), title: body.title, slug: body.slug, excerpt: body.excerpt || '', content: body.content, cover_image_url: body.cover_image_url || '', published: !!body.published, author_id: user.id, created_at: now, updated_at: now };
      db.posts.push(post); writeDb(db); return send(res, 201, { post });
    }

    if (url.pathname.match(/^\/api\/posts\/[^/]+$/) && req.method === 'PUT') {
      const user = requireOwner(req); if (!user) return send(res, 401, { error: 'Owner authentication required.' });
      const postId = url.pathname.split('/').pop(); const body = await parseBody(req); const db = readDb();
      const index = db.posts.findIndex(p => p.id === postId && p.author_id === user.id);
      if (index < 0) return send(res, 404, { error: 'Post not found.' });
      if (body.slug && !uniqueSlug(db, body.slug, postId)) return send(res, 409, { error: 'That slug is already in use.' });
      db.posts[index] = { ...db.posts[index], ...body, author_id: user.id, updated_at: new Date().toISOString() };
      writeDb(db); return send(res, 200, { post: db.posts[index] });
    }

    if (url.pathname.match(/^\/api\/posts\/[^/]+$/) && req.method === 'DELETE') {
      const user = requireOwner(req); if (!user) return send(res, 401, { error: 'Owner authentication required.' });
      const postId = url.pathname.split('/').pop(); const db = readDb(); const before = db.posts.length;
      db.posts = db.posts.filter(p => !(p.id === postId && p.author_id === user.id));
      if (db.posts.length === before) return send(res, 404, { error: 'Post not found.' });
      writeDb(db); return send(res, 200, { ok: true });
    }

    if (url.pathname === '/api/upload' && req.method === 'POST') {
      const user = requireOwner(req); if (!user) return send(res, 401, { error: 'Owner authentication required.' });
      const file = await parseMultipart(req);
      if (!file.mime.startsWith('image/')) return send(res, 400, { error: 'Only image uploads are allowed.' });
      if (file.data.length > 5_000_000) return send(res, 400, { error: 'Image must be under 5MB.' });
      const ext = path.extname(file.filename).toLowerCase() || '.jpg';
      const safe = `${user.id}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
      fs.writeFileSync(path.join(uploadDir, safe), file.data);
      return send(res, 201, { url: `/uploads/${safe}` });
    }

    // Serve built frontend when present.
    const dist = path.join(root, 'dist');
    if (fs.existsSync(dist)) {
      const filePath = path.join(dist, url.pathname === '/' ? 'index.html' : url.pathname);
      const safePath = filePath.startsWith(dist) && fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(dist, 'index.html');
      res.writeHead(200, { 'Content-Type': mimeFor(safePath) }); return fs.createReadStream(safePath).pipe(res);
    }

    return send(res, 404, { error: 'Route not found.' });
  } catch (error) {
    return send(res, 500, { error: error.message || 'Server error.' });
  }
});

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' })[ext] || 'application/octet-stream';
}

server.listen(port, () => console.log(`Torials backend running on http://localhost:${port}`));
