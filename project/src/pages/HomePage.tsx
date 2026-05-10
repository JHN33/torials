import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Feather,
  Heart,
  Mail,
  PenLine,
  Search,
  Sparkles,
} from 'lucide-react';
import { demoPosts, formatDate, isSupabaseConfigured, Post, readingTime, supabase } from '../lib/supabase';

type Props = {
  onReadPost: (slug: string) => void;
};

const categories = ['All', 'Essays', 'Creativity', 'Literature', 'Reflections', 'Slow Living', 'Culture'];

const categoryCards = [
  { name: 'Essays', icon: BookOpen, color: 'bg-[#d7f70b] text-[#101315]' },
  { name: 'Creativity', icon: Feather, color: 'bg-[#ff6b5a] text-white' },
  { name: 'Literature', icon: BookOpen, color: 'bg-[#b06cff] text-white' },
  { name: 'Reflections', icon: Heart, color: 'bg-[#3ad7ff] text-[#101315]' },
  { name: 'Slow Living', icon: Feather, color: 'bg-[#d7f70b] text-[#101315]' },
  { name: 'Culture', icon: Heart, color: 'bg-[#ff6b5a] text-white' },
];

export default function HomePage({ onReadPost }: Props) {
  const [posts, setPosts] = useState<Post[]>(demoPosts || []);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data?.length ? data : demoPosts);
        setLoading(false);
      })
      .catch(() => {
        setPosts(demoPosts);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const text = `${post.title || ''} ${post.excerpt || ''} ${post.content || ''}`.toLowerCase();

      const matchesCategory =
        activeCategory === 'All' || text.includes(activeCategory.toLowerCase());

      const matchesSearch = text.includes(query.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, query]);

  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[rgb(240,253,250)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#101315] border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-[#101315]/60">Loading Torials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[rgb(240,253,250)]">
      <section className="relative min-h-[780px] bg-[#101315] text-white">
        <div className="absolute inset-0 bg-[url('/assets/vitoria-cover.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/48 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101315] via-transparent to-black/35" />

        <div className="relative z-10 mx-auto flex min-h-[780px] max-w-7xl items-center px-5 pb-24 pt-32 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.25em] text-[#d7f70b] backdrop-blur">
              <Sparkles size={14} />
              Literary sanctuary
            </div>

            <h1 className="font-editorial text-7xl font-bold leading-[.84] tracking-[-.065em] md:text-8xl lg:text-9xl">
              Thoughts.<br />
              Stories.<br />
              <span className="text-[#d7f70b]">Real Life.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/86 md:text-2xl">
              A modern digital sanctuary for essays, reflections, creativity, healing, culture, and thoughtful living.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('essays')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl bg-[#d7f70b] px-7 py-4 text-sm font-black text-[#101315] shadow-2xl shadow-[#d7f70b]/20 transition hover:-translate-y-1"
              >
                Explore Essays <ArrowRight size={18} />
              </button>

              <button
                onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Join Newsletter <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 w-[92%] max-w-6xl -translate-x-1/2">
          <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-white/15 bg-black/35 shadow-2xl backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-6">
            {categoryCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveCategory(item.name);
                    document.getElementById('essays')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group border-white/10 p-5 text-left transition hover:bg-white/10 lg:border-r"
                >
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-black text-white">{item.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-10 lg:grid-cols-4 lg:px-8">
        {[
          ['Published essays', posts.length],
          ['Reading categories', categories.length - 1],
          ['Avg. reading time', `${Math.round(posts.reduce((a, p) => a + readingTime(p.content || ''), 0) / Math.max(posts.length, 1))} min`],
          ['Editorial mood', 'Calm'],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-3xl bg-white p-6 shadow-xl shadow-emerald-950/5">
            <p className="text-xs font-black uppercase tracking-[.22em] text-[#101315]/45">{label}</p>
            <p className="mt-4 font-editorial text-5xl font-bold tracking-[-.05em]">{value}</p>
          </div>
        ))}
      </section>

      <section id="essays" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[.28em] text-emerald-700">Featured essays</p>
            <h2 className="font-editorial text-6xl font-bold leading-none tracking-[-.055em] md:text-7xl">
              Recently written
            </h2>
          </div>

          <div className="flex max-w-xl flex-1 items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-emerald-950/5">
            <Search size={18} className="text-[#101315]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search essays, reflections, creativity..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[#101315]/35"
            />
          </div>
        </div>

        <div className="mb-10 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-sm font-black transition ${
                activeCategory === category
                  ? 'bg-[#101315] text-white'
                  : 'bg-white text-[#101315]/64 hover:bg-[#d7f70b] hover:text-[#101315]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {featured ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <article
              onClick={() => onReadPost(featured.slug)}
              className="group relative min-h-[560px] cursor-pointer overflow-hidden rounded-[2rem] bg-[#101315] text-white shadow-2xl"
            >
              <img
                src={featured.cover_image_url || '/assets/vitoria-cover.jpg'}
                alt={featured.title}
                className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
                <span className="rounded-full bg-[#d7f70b] px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#101315]">
                  Editor’s pick
                </span>
                <h3 className="mt-8 max-w-3xl font-editorial text-5xl font-bold leading-[.92] tracking-[-.055em] md:text-7xl">
                  {featured.title}
                </h3>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">{featured.excerpt}</p>
                <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-white/72">
                  <span className="inline-flex items-center gap-2"><Calendar size={16} /> {formatDate(featured.created_at)}</span>
                  <span className="inline-flex items-center gap-2"><Clock size={16} /> {readingTime(featured.content || '')} min read</span>
                </div>
              </div>
            </article>

            <div className="grid gap-6">
              {rest.map((post) => (
                <article
                  key={post.id}
                  onClick={() => onReadPost(post.slug)}
                  className="group grid cursor-pointer grid-cols-[120px_1fr] overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-950/5 transition hover:-translate-y-1 hover:shadow-2xl sm:grid-cols-[180px_1fr]"
                >
                  <img
                    src={post.cover_image_url || '/assets/vitoria-cover.jpg'}
                    alt={post.title}
                    className="h-full min-h-[190px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="p-5 sm:p-6">
                    <span className="rounded-full bg-[#d7f70b]/40 px-3 py-1 text-[10px] font-black uppercase tracking-[.18em] text-[#405000]">
                      Essay
                    </span>
                    <h3 className="mt-5 font-editorial text-3xl font-bold leading-none tracking-[-.04em] transition group-hover:text-emerald-700">
                      {post.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#101315]/60">{post.excerpt}</p>
                    <p className="mt-5 text-xs font-bold text-[#101315]/40">{readingTime(post.content || '')} min read</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-14 text-center shadow-xl">
            <PenLine className="mx-auto mb-5 text-[#101315]/30" size={44} />
            <h3 className="font-editorial text-4xl font-bold">No posts yet</h3>
            <p className="mt-3 text-[#101315]/60">Sign in as the owner and publish your first essay.</p>
          </div>
        )}
      </section>

      <section id="newsletter" className="bg-[#101315] px-5 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-white/10 bg-white/[.04] p-8 md:p-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[.3em] text-[#d7f70b]">The Sunday Letter</p>
            <h2 className="font-editorial text-5xl font-bold leading-none tracking-[-.055em] md:text-7xl">
              A softer inbox for deeper thinking.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
              One thoughtful note each week on creativity, literature, healing, culture, and meaningful living.
            </p>
          </div>

          <form className="self-center rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input className="min-h-14 flex-1 rounded-xl bg-white px-5 text-[#101315] outline-none" placeholder="Email address" />
              <button className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#d7f70b] px-7 font-black text-[#101315]">
                Subscribe <Mail size={18} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
