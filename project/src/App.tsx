import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AuthPage from './pages/AuthPage';
import EditorPage from './pages/EditorPage';
import DashboardPage from './pages/DashboardPage';
import { Post } from './lib/api';

type View = 'home' | 'post' | 'editor' | 'auth' | 'dashboard';

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>('home');
  const [currentSlug, setCurrentSlug] = useState('');
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [authTarget, setAuthTarget] = useState<View>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navigate = (v: View) => {
    if ((v === 'editor' || v === 'dashboard') && !user) {
      setAuthTarget(v);
      setView('auth');
      return;
    }
    if (v !== 'editor') setEditPost(null);
    setView(v);
  };

  const handleReadPost = (slug: string) => {
    setCurrentSlug(slug);
    setView('post');
  };

  const handleEdit = (post: Post) => {
    setEditPost(post);
    setView('editor');
  };

  const handleEditorSaved = () => {
    setEditPost(null);
    setView('dashboard');
  };

  return (
    <div className="font-sans">
      <Navbar currentView={view} onNavigate={navigate} />

      {view === 'home' && (
        <HomePage onReadPost={handleReadPost} />
      )}
      {view === 'post' && (
        <PostPage slug={currentSlug} onBack={() => setView('home')} />
      )}
      {view === 'auth' && (
        <AuthPage onSuccess={() => navigate(authTarget)} />
      )}
      {view === 'editor' && user && (
        <EditorPage
          editPost={editPost}
          onSaved={handleEditorSaved}
          onCancel={() => navigate(editPost ? 'dashboard' : 'home')}
        />
      )}
      {view === 'editor' && !user && (
        <AuthPage onSuccess={() => navigate('editor')} />
      )}
      {view === 'dashboard' && user && (
        <DashboardPage
          onEdit={handleEdit}
          onNew={() => { setEditPost(null); setView('editor'); }}
          onView={handleReadPost}
        />
      )}
      {view === 'dashboard' && !user && (
        <AuthPage onSuccess={() => navigate('dashboard')} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
