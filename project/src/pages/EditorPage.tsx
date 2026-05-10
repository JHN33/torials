import { useState, useRef, useEffect } from 'react';
import { Save, Eye, EyeOff, X, ArrowLeft, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { api, Post } from '../lib/api';

type Props = {
  editPost?: Post | null;
  onSaved: () => void;
  onCancel: () => void;
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function EditorPage({ editPost, onSaved, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(editPost?.title ?? '');
  const [slug, setSlug] = useState(editPost?.slug ?? '');
  const [excerpt, setExcerpt] = useState(editPost?.excerpt ?? '');
  const [content, setContent] = useState(editPost?.content ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(editPost?.cover_image_url ?? '');
  const [published] = useState(editPost?.published ?? false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const slugEdited = useRef(!!editPost);

  useEffect(() => {
    if (!slugEdited.current && title) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', msg: 'Please select an image file.' });
      return;
    }
    setUploading(true);
    try {
      setCoverImageUrl(await api.uploadImage(file));
      setStatus({ type: 'success', msg: 'Image uploaded successfully.' });
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) {
      setStatus({ type: 'error', msg: 'Title is required.' });
      return;
    }
    if (!slug.trim()) {
      setStatus({ type: 'error', msg: 'Slug is required.' });
      return;
    }
    if (!content.trim()) {
      setStatus({ type: 'error', msg: 'Content is required.' });
      return;
    }

    setSaving(true);
    setStatus(null);

    const isPublished = publish !== undefined ? publish : published;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      cover_image_url: coverImageUrl,
      published: isPublished,
    };

    try {
      if (editPost) await api.updatePost(editPost.id, payload);
      else await api.createPost(payload);
      setStatus({ type: 'success', msg: isPublished ? 'Post published!' : 'Saved as draft.' });
      setTimeout(onSaved, 900);
    } catch (err) {
      setStatus({ type: 'error', msg: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-sm transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              Save draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {published ? <Eye size={14} /> : <EyeOff size={14} />}
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm border ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {status.msg}
          </div>
        )}

        {/* Cover image */}
        <div className="mb-6">
          {coverImageUrl ? (
            <div className="relative rounded-2xl overflow-hidden h-56 group">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  Change image
                </button>
                <button
                  onClick={() => setCoverImageUrl('')}
                  className="bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Image size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Add cover image</span>
                  <span className="text-xs mt-0.5">Click to upload</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
        </div>

        {/* Editor fields */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Your post title..."
                rows={2}
                className="w-full text-2xl sm:text-4xl font-extrabold text-slate-900 placeholder-slate-300 border-none outline-none resize-none leading-tight"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="A short summary shown in the post listing..."
                rows={2}
                className="w-full text-slate-600 placeholder-slate-300 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Slug</label>
              <div className="flex items-center gap-2 border border-slate-100 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500">
                <span className="text-slate-400 text-sm shrink-0">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => { slugEdited.current = true; setSlug(e.target.value); }}
                  placeholder="my-post-title"
                  className="w-full text-slate-700 text-sm border-none outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Content
                <span className="ml-2 font-normal normal-case text-slate-400 tracking-normal">Supports Markdown headings, blockquotes, and lists</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your post content here...

# Heading 1
## Heading 2
> Blockquote
- List item"
                rows={22}
                className="w-full text-slate-700 placeholder-slate-300 border border-slate-100 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
