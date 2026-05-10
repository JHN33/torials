import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

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

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const demoPosts: Post[] = [
  {
    id: 'demo-1',
    title: 'The Beauty of Becoming',
    slug: 'the-beauty-of-becoming',
    excerpt: 'On the in-between seasons that shape us quietly and teach us to listen inward.',
    content: `There is a quiet magic in becoming.

## The beauty of the in-between

We often imagine transformation as a grand arrival, but the true work happens in the middle.

> A meaningful life is built from tenderness, attention, and courage.

To become is to practice intimacy with your own life.`,
    cover_image_url: '/assets/vitoria-cover.jpg',
    published: true,
    author_id: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
