import { Activity, Octagon, Plus, RotateCcw } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { workersApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { formatDate, readError } from '../../lib/format';

export function WorkersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: 'local-worker', hostname: 'localhost', maxConcurrency: 5 });
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: ['workers', { page, search }], queryFn: () => workersApi.list({ page, limit: 10, search }), refetchInterval: 5000 });
  const mutation = useMutation({
    mutationFn: ({ action, id, payload }) => id ? workersApi[action](id, payload) : workersApi[action](payload),
    onSuccess: () => {
      toast.notify('Worker operation completed');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });

  return (
    <div>
      <PageHeader title="Workers" description="Monitor worker health, heartbeat, load, and graceful shutdown state." actions={<Button variant="secondary" onClick={() => mutation.mutate({ action: 'recover' })}><RotateCcw className="h-4 w-4" />Recover abandoned</Button>} />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate({ action: 'register', payload: { ...form, maxConcurrency: Number(form.maxConcurrency) } }); }}>
          <FormField label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FormField>
          <FormField label="Hostname"><input className={inputClass} value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} /></FormField>
          <FormField label="Max Concurrency"><input type="number" min="1" className={inputClass} value={form.maxConcurrency} onChange={(e) => setForm({ ...form, maxConcurrency: e.target.value })} /></FormField>
          <div className="flex items-end"><Button type="submit"><Plus className="h-4 w-4" />Register worker</Button></div>
        </form>
      </div>
      <DataTable search={search} onSearch={setSearch} page={page} totalPages={query.data?.meta?.totalPages || 1} onPage={setPage} rows={query.data?.data || []} loading={query.isLoading} columns={[
        { key: 'name', header: 'Worker' },
        { key: 'hostname', header: 'Host' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'load', header: 'Load', render: (row) => `${row.currentLoad}/${row.maxConcurrency}` },
        { key: 'lastHeartbeatAt', header: 'Last Heartbeat', render: (row) => formatDate(row.lastHeartbeatAt) },
        { key: 'startedAt', header: 'Started', render: (row) => formatDate(row.startedAt) },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => mutation.mutate({ action: 'drain', id: row.id })}><Activity className="h-4 w-4" /></Button><Button variant="danger" onClick={() => mutation.mutate({ action: 'stop', id: row.id })}><Octagon className="h-4 w-4" /></Button></div> }
      ]} />
    </div>
  );
}
