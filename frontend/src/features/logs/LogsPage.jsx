import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { logsApi } from '../../api/resourceApi';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate, formatDuration } from '../../lib/format';

export function LogsPage() {
  const [tab, setTab] = useState('executions');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const api = tab === 'jobLogs' ? logsApi.jobLogs : tab === 'workerLogs' ? logsApi.workerLogs : logsApi.executions;
  const query = useQuery({ queryKey: ['logs', tab, { page, search }], queryFn: () => api({ page, limit: 10, search }), refetchInterval: 5000 });
  const rows = query.data?.data || [];

  const executionColumns = [
    { key: 'job', header: 'Job', render: (row) => row.job?.name || row.jobId },
    { key: 'worker', header: 'Worker', render: (row) => row.worker?.name || row.workerId || '-' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'attemptNumber', header: 'Attempt' },
    { key: 'durationMs', header: 'Duration', render: (row) => formatDuration(row.durationMs) },
    { key: 'errorMessage', header: 'Failure', render: (row) => row.errorMessage || '-' }
  ];
  const logColumns = [
    { key: 'level', header: 'Level', render: (row) => <StatusBadge value={row.level} /> },
    { key: 'message', header: 'Message' },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) }
  ];

  return (
    <div>
      <PageHeader title="Execution Logs" description="Inspect job logs, retry context, worker assignment, durations, and failure messages." />
      <div className="mb-4 flex gap-2">
        {['executions', 'jobLogs', 'workerLogs'].map((item) => <button key={item} className={`rounded-md px-3 py-2 text-sm font-medium ${tab === item ? 'bg-accent text-white' : 'border border-line bg-white text-steel'}`} onClick={() => { setTab(item); setPage(1); }}>{item}</button>)}
      </div>
      <DataTable search={search} onSearch={setSearch} page={page} totalPages={query.data?.meta?.totalPages || 1} onPage={setPage} rows={rows} loading={query.isLoading} columns={tab === 'executions' ? executionColumns : logColumns} />
    </div>
  );
}
