import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  onSuccess: () => void;
};

export default function AuthPage({ onSuccess }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setStatus({ type: 'error', msg: error.message });
      return;
    }

    setStatus({ type: 'success', msg: 'Welcome back, Vitoria. Opening your publishing studio.' });
    setTimeout(onSuccess, 700);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-28 sm:px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.6),transparent_28rem)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-blue-100">
              <Sparkles size={15} /> Vitoria Aketch · Private Torials Studio
            </div>
            <div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">Owner-only publishing.</h1>
              <p className="mt-5 text-lg leading-8 text-slate-300">This login is reserved for Vitoria Aketch, the owner and blogger behind Torials. Readers can browse posts without an account.</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-10 lg:p-14"
        >
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-700">Private access</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Log in as Vitoria Aketch
          </h2>
          <p className="mt-3 text-slate-500">Only the website owner can access the dashboard, upload blog images, and create or publish posts.</p>
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <ShieldCheck size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-black">Owner-only account</p>
              <p className="mt-1">Public sign-up has been disabled. The backend will reject any non-owner account from accessing publishing tools.</p>
            </div>
          </div>

          {status && (
            <div className={`mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{status.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Owner email address</span>
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="owner@torials.local"
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
              <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <Lock size={18} className="text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Owner password"
                />
              </span>
            </label>
            <button
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Checking owner access...' : 'Log in to owner studio'}
            </button>
          </form>
        </motion.section>
      </div>
    </main>
  );
}
