import { useEffect, useState } from 'react';
import { SquarePen as PenSquare, Trash2, Eye, EyeOff, Plus, AlertCircle, Clock, Globe } from 'lucide-react';
import { api, Post } from '../lib/api';

type Props = {
  onEdit: (post: Post) => void;
  onNew: () => void;
  onView: (slug: string) => void;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function DashboardPage({ onEdit, onNew, onView }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try { setPosts(await api.listMyPosts()); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const togglePublish = async (post: Post) => {
    const updated = await api.updatePost(post.id, { published: !post.published });
    setPosts(prev => prev.map(p => p.id === post.id ? updated : p));
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeletingId(id);
    await api.deletePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vitoria Aketch's Posts</h1>
            <p className="text-slate-500 text-sm mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onNew}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            New post
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} className="text-slate-400" />
            </div>
            <h2 className="font-semibold text-slate-800 mb-1">No posts yet</h2>
            <p className="text-slate-500 text-sm mb-6">Create your first post to get started.</p>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
            >
              <Plus size={15} /> Write your first post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.id}
                className="bg-white border border-slate-100 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm hover:border-slate-200 transition-all"
              >
                {post.cover_image_url && (
                  <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                    <img src={post.cover_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{post.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {formatDate(post.updated_at)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      post.published
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {post.published ? <><Globe size={10} /> Published</> : <><EyeOff size={10} /> Draft</>}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.published && (
                    <button
                      onClick={() => onView(post.slug)}
                      title="View post"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.published ? 'Unpublish' : 'Publish'}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    {post.published ? <EyeOff size={16} /> : <Globe size={16} />}
                  </button>
                  <button
                    onClick={() => onEdit(post)}
                    title="Edit"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <PenSquare size={16} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deletingId === post.id}
                    title="Delete"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
