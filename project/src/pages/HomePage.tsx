import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, TrendingUp, Sparkles, Users, PenLine } from 'lucide-react';
import { api, Post } from '../lib/api';
import coverImage from '../assets/vitoria-cover.jpg';

type Props = {
  onReadPost: (slug: string) => void;
};

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const fadeUp = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

export default function HomePage({ onReadPost }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPublishedPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Torials...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34rem)]" />
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.12 }}
          className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
              <Sparkles size={15} /> Vitoria Aketch's professional publishing home
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
              Welcome to Torials by Vitoria Aketch.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              A polished publishing space owned by Vitoria Aketch for tutorials, thoughtful articles, image-rich stories, and responsive reading experiences.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
              Vitoria Aketch · Torials
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                [PenLine, 'Write', 'Draft and publish posts'],
                [TrendingUp, 'Grow', 'Feature your best ideas'],
                [Users, 'Inspire', 'Responsive for every reader'],
              ].map(([Icon, title, copy]) => {
                const TypedIcon = Icon as typeof PenLine;
                return (
                  <div key={String(title)} className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <TypedIcon className="mb-3 text-blue-600" size={20} />
                    <p className="font-bold text-slate-950">{String(title)}</p>
                    <p className="mt-1 text-sm text-slate-500">{String(copy)}</p>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl shadow-slate-900/15">
              <div className="relative h-[38rem] overflow-hidden">
                <img
                  src={coverImage}
                  alt="Vitoria Aketch"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-amber-200">Vitoria Aketch — Torials</p>
                  <p className="mt-4 max-w-md text-4xl font-black leading-tight tracking-tight">
                    Tutorials, stories, and ideas curated by Vitoria Aketch.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
              <PenLine size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-950">No published posts yet</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-500">Log in as the owner to create the first Torials article with a title, cover image, excerpt, and full blog content.</p>
          </motion.div>
        ) : (
          <>
            {featured && (
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-sm font-black uppercase tracking-[0.25em] text-blue-700">Featured article</span>
                </div>
                <article
                  onClick={() => onReadPost(featured.slug)}
                  className="group grid cursor-pointer overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 lg:grid-cols-2"
                >
                  <div className="relative min-h-72 overflow-hidden bg-slate-100">
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full min-h-72 items-center justify-center bg-gradient-to-br from-blue-700 to-slate-950 text-8xl font-black text-white/15">{featured.title.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center p-8 sm:p-10">
                    <div className="mb-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-400">
                      <span className="flex items-center gap-2"><Calendar size={15} />{formatDate(featured.created_at)}</span>
                      <span className="flex items-center gap-2"><Clock size={15} />{readingTime(featured.content)} min read</span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 transition group-hover:text-blue-700 sm:text-4xl">{featured.title}</h2>
                    {featured.excerpt && <p className="mt-5 line-clamp-3 text-lg leading-8 text-slate-600">{featured.excerpt}</p>}
                    <span className="mt-8 inline-flex items-center gap-2 font-bold text-blue-700 transition-all group-hover:gap-4">Read article <ArrowRight size={18} /></span>
                  </div>
                </article>
              </motion.div>
            )}

            {rest.length > 0 && (
              <div>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-400">Latest</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Recent posts</h2>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => onReadPost(post.slug)}
                      className="group flex cursor-pointer flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                    >
                      <div className="h-52 overflow-hidden bg-slate-100">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-blue-100 text-5xl font-black text-slate-400">{post.title.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1"><Clock size={13} />{readingTime(post.content)} min</span>
                        </div>
                        <h3 className="line-clamp-2 text-xl font-black leading-snug text-slate-950 transition group-hover:text-blue-700">{post.title}</h3>
                        {post.excerpt && <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">{post.excerpt}</p>}
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">Read more <ArrowRight size={15} /></span>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
