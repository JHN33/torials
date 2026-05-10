import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SquarePen as PenSquare, LogOut, LogIn, Menu, X, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type View = 'home' | 'post' | 'editor' | 'auth' | 'dashboard';

type Props = {
  currentView: View;
  onNavigate: (view: View) => void;
};

export default function Navbar({ currentView, onNavigate }: Props) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (view: View) => {
    onNavigate(view);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    go('home');
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => go('home')}
            className="flex items-center gap-2.5 text-slate-950 transition-colors hover:text-blue-700"
            aria-label="Go to Vitoria Aketch - Torials home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
              <BookOpen size={20} />
            </span>
            <span className="leading-tight"><span className="block text-xl font-black tracking-tight">Torials</span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Vitoria Aketch</span></span>
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => go('home')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${currentView === 'home' ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
            >
              Explore
            </button>
            {user ? (
              <>
                <button
                  onClick={() => go('dashboard')}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${currentView === 'dashboard' ? 'bg-slate-100 text-slate-950' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  onClick={() => go('editor')}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <PenSquare size={16} /> Write
                </button>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => go('auth')}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <LogIn size={16} /> Log in
              </button>
            )}
          </div>

          <button
            className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden md:hidden"
            >
              <div className="space-y-2 border-t border-slate-100 py-4">
                <button onClick={() => go('home')} className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Explore</button>
                {user ? (
                  <>
                    <button onClick={() => go('dashboard')} className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">Dashboard</button>
                    <button onClick={() => go('editor')} className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-bold text-white">Write new post</button>
                    <button onClick={handleSignOut} className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Sign out</button>
                  </>
                ) : (
                  <button onClick={() => go('auth')} className="block w-full rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-bold text-white">Log in to publish</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
