import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, BarChart3, BriefcaseBusiness, ClipboardList, Database, Home, ListChecks, LogOut, Menu, Settings, ShieldAlert, Sparkles, Workflow, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../features/auth/AuthContext';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/organizations', label: 'Organizations', icon: BriefcaseBusiness },
  { to: '/projects', label: 'Projects', icon: Workflow },
  { to: '/queues', label: 'Queues', icon: ListChecks },
  { to: '/jobs', label: 'Jobs', icon: ClipboardList },
  { to: '/workers', label: 'Workers', icon: Activity },
  { to: '/logs', label: 'Logs', icon: Database },
  { to: '/retry-policies', label: 'Retries', icon: ShieldAlert },
  { to: '/dead-letter', label: 'Dead Letter', icon: ShieldAlert },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderNav = () => (
    <nav className="space-y-1 p-3">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => clsx(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
            isActive ? 'bg-accent text-white shadow-soft' : 'text-steel hover:bg-surface hover:text-ink'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-panel/95 shadow-card lg:block">
        <div className="border-b border-line bg-[linear-gradient(135deg,rgba(45,212,191,0.16),rgba(59,130,246,0.12))] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/15 p-2 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-ink">Job Scheduler</div>
              <div className="text-sm text-steel">Operations Console</div>
            </div>
          </div>
        </div>
        {renderNav()}
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-surface/85 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-line bg-panel p-2 text-ink lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="text-sm font-medium text-accent">Distributed Job Scheduling Platform</div>
                <h1 className="text-xl font-semibold text-ink">Control Plane</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-line bg-panel px-3 py-2 text-right text-sm md:block">
                <div className="font-medium text-ink">{user?.email}</div>
                <div className="text-steel">{user?.roles?.join(', ')}</div>
              </div>
              <Button variant="secondary" onClick={logout}><LogOut className="h-4 w-4" />Logout</Button>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 border-r border-line bg-panel/95 shadow-card" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <div className="text-base font-semibold text-ink">Navigation</div>
              <button className="rounded-lg border border-line p-2 text-ink" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderNav()}
          </div>
        </div>
      )}
    </div>
  );
}
