import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, AlertCircle, UserRound } from 'lucide-react';
import { api, Post } from '../lib/api';

type Props = {
  slug: string;
  onBack: () => void;
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

function renderInline(text: string) {
  const imageMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (imageMatch) return <img src={imageMatch[2]} alt={imageMatch[1]} />;

  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(text)) !== null) {
    parts.push(text.slice(lastIndex, match.index));
    parts.push(<a key={`${match.index}-${match[1]}`} href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a>);
    lastIndex = match.index + match[0].length;
  }
  parts.push(text.slice(lastIndex));
  return parts;
}

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-4" />;
    if (line.startsWith('# ')) return <h1 key={i} className="mt-10 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{line.slice(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="mt-9 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} className="mt-8 text-xl font-black text-slate-950">{line.slice(4)}</h3>;
    if (line.startsWith('> ')) return <blockquote key={i} className="my-6 rounded-r-2xl border-l-4 border-blue-500 bg-blue-50 px-5 py-4 text-lg italic leading-8 text-slate-700">{line.slice(2)}</blockquote>;
    if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc text-lg leading-8 text-slate-700">{renderInline(line.slice(2))}</li>;
    return <p key={i} className="text-lg leading-9 text-slate-700">{renderInline(line)}</p>;
  });
}

export default function PostPage({ slug, onBack }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.getPostBySlug(slug)
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /></div>;
  }

  if (notFound || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <AlertCircle size={44} className="mb-4 text-slate-300" />
        <h2 className="text-2xl font-black text-slate-950">Post not found</h2>
        <p className="mb-7 mt-2 text-slate-500">This article may have been removed or unpublished.</p>
        <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white"><ArrowLeft size={16} /> Back to Torials</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {post.cover_image_url && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[22rem] overflow-hidden sm:h-[32rem]">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        </motion.div>
      )}

      <article className={`mx-auto max-w-4xl px-4 sm:px-6 ${post.cover_image_url ? '-mt-20 relative z-10' : 'pt-28'} pb-24`}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-10 lg:p-12">
          <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
            <ArrowLeft size={16} /> All posts
          </button>
          <header className="mb-10">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">{post.title}</h1>
            {post.excerpt && <p className="mt-6 text-xl leading-9 text-slate-600">{post.excerpt}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-5 border-y border-slate-100 py-4 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-2"><UserRound size={16} />Vitoria Aketch</span>
              <span className="flex items-center gap-2"><Calendar size={16} />{formatDate(post.created_at)}</span>
              <span className="flex items-center gap-2"><Clock size={16} />{readingTime(post.content)} min read</span>
            </div>
          </header>
          <div className="prose-content space-y-4">{renderContent(post.content)}</div>
        </motion.div>
      </article>
    </main>
  );
}
