import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../../api/dashboardApi';
import { PageHeader } from '../../components/ui/PageHeader';

const colors = ['#0f766e', '#2563eb', '#b54708', '#b42318', '#64748b', '#7c3aed'];

export function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ['analytics-summary'], queryFn: dashboardApi.summary, refetchInterval: 5000 });
  const statusData = Object.entries(data?.jobsByStatus || {}).map(([name, value]) => ({ name, value }));
  const queueData = (data?.queueRows || []).map((queue) => ({ name: queue.name, priority: queue.priority, concurrency: queue.concurrencyLimit }));
  const workerData = (data?.workerRows || []).map((worker) => ({ name: worker.name, load: worker.currentLoad, capacity: worker.maxConcurrency }));

  return (
    <div>
      <PageHeader title="Analytics" description="Queue load, job status distribution, worker utilization, success rate, retries, and throughput indicators." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Chart title="Job Status Distribution">
          <PieChart>
            <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={110} label>
              {statusData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </Chart>
        <Chart title="Queue Capacity">
          <BarChart data={queueData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="concurrency" fill="#0f766e" /><Bar dataKey="priority" fill="#2563eb" /></BarChart>
        </Chart>
        <Chart title="Worker Utilization">
          <BarChart data={workerData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="load" fill="#b54708" /><Bar dataKey="capacity" fill="#0f766e" /></BarChart>
        </Chart>
        <div className="rounded-md border border-line bg-white p-6 shadow-soft">
          <h3 className="font-semibold text-ink">Reliability Snapshot</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Metric label="Success Rate" value={`${data?.successRate ?? 100}%`} />
            <Metric label="Average Execution" value={`${data?.averageExecutionTime ?? 0} ms`} />
            <Metric label="Retry Policies" value={data?.retryPolicies ?? 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Chart({ title, children }) {
  return <div className="rounded-md border border-line bg-white p-5 shadow-soft"><h3 className="mb-4 font-semibold text-ink">{title}</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div>;
}

function Metric({ label, value }) {
  return <div className="rounded-md border border-line bg-surface p-4"><div className="text-sm text-steel">{label}</div><div className="mt-2 text-2xl font-semibold text-ink">{value}</div></div>;
}
