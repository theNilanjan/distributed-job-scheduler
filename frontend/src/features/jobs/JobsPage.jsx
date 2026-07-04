import { Ban, Eye, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { jobsApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { formatDate, readError } from '../../lib/format';

const initialForm = {
  queueId: 1,
  type: 'IMMEDIATE',
  name: '',
  payload: '{\n  "task": "demo"\n}',
  priority: 0,
  delaySeconds: '',
  runAt: '',
  cronExpression: '',
  maxAttempts: 3,
  executionTimeoutSeconds: 300
};

export function JobsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [form, setForm] = useState(initialForm);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const listQuery = useQuery({ queryKey: ['jobs', { page, search, status }], queryFn: () => jobsApi.list({ page, limit: 10, search, status }) });
  const detailQuery = useQuery({ queryKey: ['job-detail', selected?.id], queryFn: () => jobsApi.get(selected.id), enabled: Boolean(selected?.id) });

  const createMutation = useMutation({
    mutationFn: (payload) => jobsApi.create(payload),
    onSuccess: () => {
      toast.notify('Job created');
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });
  const actionMutation = useMutation({
    mutationFn: ({ action, id }) => jobsApi[action](id),
    onSuccess: () => {
      toast.notify('Job updated');
      setConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });

  function submit(event) {
    event.preventDefault();
    let payload;
    try {
      payload = JSON.parse(form.payload || '{}');
    } catch {
      toast.notify('Payload must be valid JSON', 'error');
      return;
    }
    createMutation.mutate({
      queueId: Number(form.queueId),
      type: form.type,
      name: form.name,
      payload,
      priority: Number(form.priority),
      delaySeconds: form.delaySeconds ? Number(form.delaySeconds) : undefined,
      runAt: form.runAt ? new Date(form.runAt).toISOString() : undefined,
      cronExpression: form.cronExpression || undefined,
      maxAttempts: Number(form.maxAttempts),
      executionTimeoutSeconds: Number(form.executionTimeoutSeconds)
    });
  }

  const rows = listQuery.data?.data || [];
  const meta = listQuery.data?.meta || {};
  const detail = detailQuery.data;

  return (
    <div>
      <PageHeader title="Job Explorer" description="Create, search, inspect, cancel, retry, and delete jobs across the full lifecycle." />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={submit}>
          <FormField label="Queue ID"><input type="number" min="1" className={inputClass} value={form.queueId} onChange={(e) => setForm({ ...form, queueId: e.target.value })} /></FormField>
          <FormField label="Type"><select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>IMMEDIATE</option><option>DELAYED</option><option>SCHEDULED</option><option>CRON</option></select></FormField>
          <FormField label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
          <FormField label="Priority"><input type="number" className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} /></FormField>
          {form.type === 'DELAYED' && <FormField label="Delay Seconds"><input type="number" min="1" className={inputClass} value={form.delaySeconds} onChange={(e) => setForm({ ...form, delaySeconds: e.target.value })} /></FormField>}
          {(form.type === 'SCHEDULED' || form.type === 'CRON') && <FormField label="Run At"><input type="datetime-local" className={inputClass} value={form.runAt} onChange={(e) => setForm({ ...form, runAt: e.target.value })} /></FormField>}
          {form.type === 'CRON' && <FormField label="Cron Expression"><input className={inputClass} value={form.cronExpression} onChange={(e) => setForm({ ...form, cronExpression: e.target.value })} placeholder="*/5 * * * *" /></FormField>}
          <FormField label="Max Attempts"><input type="number" min="1" className={inputClass} value={form.maxAttempts} onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })} /></FormField>
          <FormField label="Timeout Seconds"><input type="number" min="1" className={inputClass} value={form.executionTimeoutSeconds} onChange={(e) => setForm({ ...form, executionTimeoutSeconds: e.target.value })} /></FormField>
          <div className="md:col-span-4"><FormField label="Payload JSON"><textarea className={`${inputClass} min-h-28 font-mono`} value={form.payload} onChange={(e) => setForm({ ...form, payload: e.target.value })} /></FormField></div>
          <div className="md:col-span-4"><Button type="submit" disabled={createMutation.isPending}><Plus className="h-4 w-4" />Create job</Button></div>
        </form>
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['QUEUED', 'SCHEDULED', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'CANCELLED'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <DataTable search={search} onSearch={setSearch} page={page} totalPages={meta.totalPages || 1} onPage={setPage} loading={listQuery.isLoading} rows={rows} columns={[
        { key: 'name', header: 'Name' },
        { key: 'type', header: 'Type' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'queue', header: 'Queue', render: (row) => row.queue?.name || row.queueId },
        { key: 'attempts', header: 'Retries', render: (row) => `${row.attempts}/${row.maxAttempts}` },
        { key: 'worker', header: 'Worker', render: (row) => row.lockedByWorker?.name || '-' },
        { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button><Button variant="secondary" onClick={() => actionMutation.mutate({ action: 'cancel', id: row.id })}><Ban className="h-4 w-4" /></Button><Button variant="danger" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> }
      ]} />
      {selected && (
        <div className="fixed inset-0 z-40 overflow-auto bg-ink/30 p-4">
          <div className="mx-auto max-w-5xl rounded-md border border-line bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold text-ink">{selected.name}</h3><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button></div>
            <div className="grid gap-4 md:grid-cols-3">
              <div><div className="text-xs text-steel">Status</div><StatusBadge value={detail?.status || selected.status} /></div>
              <div><div className="text-xs text-steel">Run At</div><div>{formatDate(detail?.runAt || selected.runAt)}</div></div>
              <div><div className="text-xs text-steel">Last Error</div><div className="text-danger">{detail?.lastError || '-'}</div></div>
            </div>
            <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-surface p-4 text-xs">{JSON.stringify(detail || selected, null, 2)}</pre>
          </div>
        </div>
      )}
      {confirm && <ConfirmDialog title="Delete job" message={`Delete ${confirm.name}?`} onCancel={() => setConfirm(null)} onConfirm={() => actionMutation.mutate({ action: 'remove', id: confirm.id })} busy={actionMutation.isPending} confirmLabel="Delete" />}
    </div>
  );
}
