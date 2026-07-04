import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, MoonStar, ShieldCheck, Sparkles, SunMedium, Workflow } from 'lucide-react';
import { useAuth } from './AuthContext';
import { readError } from '../../lib/format';

export function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [theme, setTheme] = useState('dark');
  const isDark = theme === 'dark';
  const mutation = useMutation({
    mutationFn: (payload) => auth.register(payload),
    onSuccess: () => navigate('/')
  });

  const shellClasses = isDark
    ? 'bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.2),_transparent_35%),linear-gradient(135deg,_#020617_0%,_#0f172a_100%)] text-slate-100'
    : 'bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.22),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eef2f7_100%)] text-slate-900';
  const panelClasses = isDark
    ? 'border-slate-800/80 bg-slate-900/80 text-slate-100 shadow-[0_25px_70px_rgba(2,8,23,0.45)]'
    : 'border-line bg-white shadow-[0_30px_80px_rgba(15,23,42,0.16)]';
  const heroClasses = isDark
    ? 'border-white/10 bg-[linear-gradient(135deg,rgba(45,212,191,0.18),rgba(59,130,246,0.14))]'
    : 'border-white/80 bg-[linear-gradient(135deg,rgba(45,212,191,0.16),rgba(59,130,246,0.12))]';
  const cardClasses = isDark
    ? 'border-white/10 bg-slate-950/70 text-slate-300'
    : 'border-white/70 bg-white/80 text-steel';
  const badgeClasses = isDark
    ? 'border-teal-400/20 bg-slate-900/80 text-teal-300'
    : 'border-accent/20 bg-white/80 text-accent';
  const statClasses = isDark
    ? 'border-white/10 bg-slate-900/70 text-slate-200'
    : 'border-white/80 bg-white/80 text-steel';
  const inputClasses = isDark
    ? 'border-slate-700 bg-slate-950/80 text-slate-100 focus:border-teal-400 focus:ring-teal-400/20'
    : 'border-line bg-white text-ink focus:border-accent focus:ring-accent/20';
  const buttonClasses = isDark
    ? 'bg-teal-400 text-slate-950 hover:bg-teal-300'
    : 'bg-accent text-slate-950 hover:bg-teal-300';

  return (
    <div className={`relative grid min-h-screen place-items-center overflow-hidden px-4 py-10 ${shellClasses}`}>
      <div className="auth-orb auth-orb--one animate-drift" />
      <div className="auth-orb auth-orb--two animate-drift animate-pulse-glow" />
      <div className="auth-orb auth-orb--three animate-drift" />
      <div className={`relative w-full max-w-6xl overflow-hidden rounded-[32px] border lg:grid lg:grid-cols-[1.05fr_0.95fr] ${panelClasses}`}>
        <div className={`relative flex flex-col justify-between overflow-hidden p-8 lg:p-10 ${heroClasses}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.8),_transparent_35%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium backdrop-blur ${badgeClasses}`}>
                <ShieldCheck className="h-4 w-4" />
                Job scheduling workspace
              </div>
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${isDark ? 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-teal-400/40' : 'border-line bg-white/80 text-steel hover:border-accent/30'}`}
              >
                {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {isDark ? 'Light preview' : 'Dark preview'}
              </button>
            </div>
            <h1 className={`mt-6 text-3xl font-semibold leading-tight sm:text-4xl ${isDark ? 'text-slate-50' : 'text-ink'}`}>Create your workspace and start managing background jobs with confidence.</h1>
            <p className={`mt-3 max-w-xl text-base leading-7 ${isDark ? 'text-slate-300' : 'text-steel'}`}>Register to monitor queues, coordinate workers, automate retries, and keep distributed workloads moving.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className={`rounded-2xl border px-4 py-3 text-sm shadow-card ${cardClasses}`}>
                <div className={`flex items-center gap-2 font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}><Workflow className="h-4 w-4 text-accent" />Workflow-ready</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 text-sm shadow-card ${cardClasses}`}>
                <div className={`flex items-center gap-2 font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}><Sparkles className="h-4 w-4 text-accent" />Secure by design</div>
              </div>
            </div>
          </div>
          <div className={`relative mt-8 rounded-[24px] border p-5 text-sm shadow-card ${cardClasses}`}>
            <div className={`font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}>Why teams use it</div>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Unified visibility into queue and worker health</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Reliable recovery paths for failed jobs</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Built for observability and operational control</li>
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className={`rounded-2xl border p-3 ${statClasses}`}>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Visibility</div>
                <div className={`mt-1 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}>Instant</div>
              </div>
              <div className={`rounded-2xl border p-3 ${statClasses}`}>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Retries</div>
                <div className={`mt-1 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}>Smart</div>
              </div>
              <div className={`rounded-2xl border p-3 ${statClasses}`}>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Ops</div>
                <div className={`mt-1 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-ink'}`}>Fast</div>
              </div>
            </div>
          </div>
        </div>
        <form
          className="flex flex-col justify-center p-8 lg:p-10"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(form);
          }}
        >
          <div className={`rounded-[24px] border p-6 shadow-card ${isDark ? 'border-slate-800 bg-slate-950/80' : 'border-line bg-slate-50/80'}`}>
            <div className={`inline-flex rounded-full p-2 ${isDark ? 'bg-teal-400/10 text-teal-300' : 'bg-accent/10 text-accent'}`}><LockKeyhole className="h-5 w-5" /></div>
            <h2 className={`mt-4 text-2xl font-semibold ${isDark ? 'text-slate-50' : 'text-ink'}`}>Create account</h2>
            <p className={`mt-1 text-sm leading-6 ${isDark ? 'text-slate-400' : 'text-steel'}`}>Create an account to manage queues, workers, retries, and workflow health.</p>
            <div className="mt-6 space-y-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-steel'}`}>
                Name
                <input className={`mt-1 w-full rounded-2xl border px-3 py-2.75 outline-none transition focus:ring-2 ${inputClasses}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-steel'}`}>
                Email
                <input className={`mt-1 w-full rounded-2xl border px-3 py-2.75 outline-none transition focus:ring-2 ${inputClasses}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-steel'}`}>
                Password
                <input type="password" className={`mt-1 w-full rounded-2xl border px-3 py-2.75 outline-none transition focus:ring-2 ${inputClasses}`} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </label>
            </div>
            {mutation.isError && <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-danger/20 bg-red-50 text-danger'}`}>{readError(mutation.error)}</div>}
            <button className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition ${buttonClasses}`} disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create account'}
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className={`mt-4 text-center text-sm ${isDark ? 'text-slate-400' : 'text-steel'}`}>
              Already registered? <Link className="font-medium text-accent" to="/login">Sign in</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
