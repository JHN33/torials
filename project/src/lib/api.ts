export type User = { id: string; email: string; name?: string; role?: string };
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
};

type AuthResponse = { token: string; user: User };
const API_URL = import.meta.env.VITE_API_URL || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '4173' ? 'http://localhost:4173' : '');

function offlineError(path: string) {
  const apiTarget = API_URL || window.location.origin;
  return new Error(
    `Could not reach the Torials backend at ${apiTarget}${path}. Start the full app with npm run dev, then log in again.`
  );
}
const TOKEN_KEY = 'torials_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw offlineError(path);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  async signIn(email: string, password: string) {
    const data = await request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setToken(data.token); return data.user;
  },
  async me() { return (await request<{ user: User }>('/api/auth/me')).user; },
  signOut() { clearToken(); },
  async listPublishedPosts() { return (await request<{ posts: Post[] }>('/api/posts')).posts; },
  async listMyPosts() { return (await request<{ posts: Post[] }>('/api/posts?mine=true')).posts; },
  async getPostBySlug(slug: string) { return (await request<{ post: Post }>(`/api/posts/slug/${encodeURIComponent(slug)}`)).post; },
  async createPost(payload: Omit<Post, 'id' | 'author_id' | 'created_at' | 'updated_at'>) {
    return (await request<{ post: Post }>('/api/posts', { method: 'POST', body: JSON.stringify(payload) })).post;
  },
  async updatePost(id: string, payload: Partial<Post>) {
    return (await request<{ post: Post }>(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) })).post;
  },
  async deletePost(id: string) { await request<{ ok: true }>(`/api/posts/${id}`, { method: 'DELETE' }); },
  async uploadImage(file: File) {
    const form = new FormData(); form.append('image', file);
    const token = getToken();
    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch {
      throw offlineError('/api/upload');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return `${API_URL}${data.url}`;
  },
};
