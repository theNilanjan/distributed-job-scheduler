import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle2, Layers3, ListChecks, ServerCog, TimerReset } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import { StatCard } from '../../components/ui/StatCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { getSocket } from '../../lib/socket';

const fallback = { organizations: 0, projects: 0, queues: 0, activeWorkers: 0, runningJobs: 0, scheduledJobs: 0, completedJobs: 0, failedJobs: 0, deadLetterJobs: 0, successRate: 100, averageExecutionTime: 0, jobsByStatus: {} };

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { data = fallback } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.summary, refetchInterval: 5000 });
  useEffect(() => {
    const socket = getSocket();
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    socket.connect();
    ['job:created', 'job:transitioned', 'jobs:claimed', 'worker:heartbeat', 'dead-letter:retried'].forEach((event) => socket.on(event, refresh));
    return () => {
      ['job:created', 'job:transitioned', 'jobs:claimed', 'worker:heartbeat', 'dead-letter:retried'].forEach((event) => socket.off(event, refresh));
    };
  }, [queryClient]);

  const quickLinks = [
    { title: 'Queue Health', description: 'Pause, resume, and tune queue throughput.', href: '/queues', icon: Layers3 },
    { title: 'Worker Status', description: 'Track heartbeat health and active workers.', href: '/workers', icon: ServerCog },
    { title: 'Job Explorer', description: 'Inspect, cancel, and review job lifecycle state.', href: '/jobs', icon: ListChecks },
    { title: 'Execution Logs', description: 'Review execution traces and failures.', href: '/logs', icon: TimerReset }
  ];

  const chartData = [
    { name: 'Running', value: data.runningJobs },
    { name: 'Scheduled', value: data.scheduledJobs },
    { name: 'Completed', value: data.completedJobs },
    { name: 'Failed', value: data.failedJobs },
    { name: 'DLQ', value: data.deadLetterJobs }
  ];
  const statusData = Object.entries(data.jobsByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Live control-plane overview of organizations, queues, jobs, workers, reliability, and health." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Organizations" value={data.organizations} />
        <StatCard label="Projects" value={data.projects} />
        <StatCard label="Queues" value={data.queues} />
        <StatCard label="Active Workers" value={data.activeWorkers} />
        <StatCard label="Success Rate" value={`${data.successRate}%`} />
        <StatCard label="Running Jobs" value={data.runningJobs} />
        <StatCard label="Scheduled Jobs" value={data.scheduledJobs} />
        <StatCard label="Dead Letter" value={data.deadLetterJobs} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-line bg-panel p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Operational Areas</h2>
              <p className="mt-1 text-sm text-steel">Direct access to the main monitoring and management workflows.</p>
            </div>
            <div className="rounded-full bg-accent/15 p-2 text-accent"><Activity className="h-5 w-5" /></div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {quickLinks.map(({ title, description, href, icon: Icon }) => (
              <a key={title} href={href} className="rounded-xl border border-line bg-surface/70 p-4 transition hover:border-accent hover:bg-surface">
                <div className="flex items-center gap-2 text-accent"><Icon className="h-4 w-4" /><span className="text-sm font-semibold">{title}</span></div>
                <p className="mt-2 text-sm text-steel">{description}</p>
              </a>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-panel p-5 shadow-card">
          <h2 className="text-base font-semibold text-ink">Queue Throughput Indicators</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#111c2d', border: '1px solid #1e293b', borderRadius: '0.75rem' }} />
                <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-panel p-5 shadow-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-base font-semibold text-ink">Job Status Distribution</h2>
          </div>
          <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
                {statusData.map((entry, index) => <Cell key={entry.name} fill={['#0f766e', '#2563eb', '#b54708', '#b42318', '#64748b'][index % 5]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#111c2d', border: '1px solid #1e293b', borderRadius: '0.75rem' }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-5 shadow-card">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-ink">System Health Snapshot</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface/70 p-4">
            <div className="text-sm text-steel">Queue Health</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{data.queues}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface/70 p-4">
            <div className="text-sm text-steel">Workers Online</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{data.activeWorkers}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface/70 p-4">
            <div className="text-sm text-steel">Avg Execution</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{data.averageExecutionTime} ms</div>
          </div>
        </div>
      </section>
    </div>
  );
}
