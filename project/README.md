# Torials by Vitoria Aketch

A full-stack blog website owned by **Vitoria Aketch** with email/password login, draft publishing, cover image uploads, a responsive reader UI, and Framer Motion animations.

## Run locally

```bash
npm install
npm run dev
```

That one command starts both the backend API and the frontend. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

If you only run the frontend, login cannot work because the backend is not running.

## Production-style run

```bash
npm install
npm run build
npm start
```

Then open `http://localhost:4173`.


## Owner-only login and post creation

The publishing dashboard is private. Only the website owner/blogger, **Vitoria Aketch**, can log in and create posts. Public sign-up is disabled in both the frontend and backend.

After starting the backend, log in with the default local owner account:

- Email: `owner@torials.local`
- Password: `Torials123`

Then click **Write** or **Dashboard → New post** to create blog posts, upload cover images, save drafts, publish posts, edit posts, and delete posts.

For production, change the owner credentials with environment variables before starting the server:

```bash
OWNER_EMAIL=your-email@example.com OWNER_PASSWORD='your-secure-password' JWT_SECRET='a-long-random-secret' npm start
```

## Backend

The backend is a dependency-free Node.js HTTP API in `server/index.js`.

It includes:

- Owner-only login with secure PBKDF2 password hashing
- HMAC-signed auth tokens
- Owner-protected create/edit/delete/publish endpoints
- Public published post endpoints
- Image upload endpoint for blog cover images
- Persistent JSON storage in `server/data/db.json`
- Uploaded images stored in `server/uploads`

Set `JWT_SECRET` in production.
