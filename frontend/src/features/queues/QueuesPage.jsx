import { Pause, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queuesApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';
import { readError } from '../../lib/format';
import { useCrudPage } from '../common/useCrudPage';

const initialForm = {
  projectId: 1,
  retryPolicyId: '',
  name: '',
  slug: '',
  priority: 0,
  concurrencyLimit: 5,
  rateLimitPerMinute: '',
  shardKey: ''
};

export function QueuesPage() {
  const state = useCrudPage({ key: 'queues', api: queuesApi, initialForm });
  const queryClient = useQueryClient();
  const toast = useToast();
  const rows = state.listQuery.data?.data || [];
  const meta = state.listQuery.data?.meta || {};
  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => queuesApi[action](id),
    onSuccess: () => {
      toast.notify('Queue updated');
      queryClient.invalidateQueries({ queryKey: ['queues'] });
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });

  function payload(form) {
    return {
      ...form,
      projectId: Number(form.projectId),
      retryPolicyId: form.retryPolicyId ? Number(form.retryPolicyId) : null,
      priority: Number(form.priority),
      concurrencyLimit: Number(form.concurrencyLimit),
      rateLimitPerMinute: form.rateLimitPerMinute ? Number(form.rateLimitPerMinute) : null,
      shardKey: form.shardKey || null
    };
  }

  return (
    <div>
      <PageHeader title="Queues" description="Configure priority, concurrency, pause state, retry policy, and rate limits." />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); state.submit(payload); }}>
          {!state.editing && <FormField label="Project ID"><input type="number" min="1" className={inputClass} value={state.form.projectId} onChange={(e) => state.setForm({ ...state.form, projectId: e.target.value })} /></FormField>}
          <FormField label="Name"><input className={inputClass} value={state.form.name} onChange={(e) => state.setForm({ ...state.form, name: e.target.value })} required /></FormField>
          <FormField label="Slug"><input className={inputClass} value={state.form.slug} onChange={(e) => state.setForm({ ...state.form, slug: e.target.value })} required /></FormField>
          <FormField label="Retry Policy ID"><input type="number" min="1" className={inputClass} value={state.form.retryPolicyId || ''} onChange={(e) => state.setForm({ ...state.form, retryPolicyId: e.target.value })} /></FormField>
          <FormField label="Priority"><input type="number" className={inputClass} value={state.form.priority} onChange={(e) => state.setForm({ ...state.form, priority: e.target.value })} /></FormField>
          <FormField label="Concurrency"><input type="number" min="1" className={inputClass} value={state.form.concurrencyLimit} onChange={(e) => state.setForm({ ...state.form, concurrencyLimit: e.target.value })} /></FormField>
          <FormField label="Rate / minute"><input type="number" min="1" className={inputClass} value={state.form.rateLimitPerMinute || ''} onChange={(e) => state.setForm({ ...state.form, rateLimitPerMinute: e.target.value })} /></FormField>
          <FormField label="Shard Key"><input className={inputClass} value={state.form.shardKey || ''} onChange={(e) => state.setForm({ ...state.form, shardKey: e.target.value })} /></FormField>
          <div className="flex gap-2 md:col-span-4">
            <Button type="submit" disabled={state.busy}><Plus className="h-4 w-4" />{state.editing ? 'Save queue' : 'Create queue'}</Button>
            {state.editing && <Button type="button" variant="secondary" onClick={() => { state.setEditing(null); state.setForm(initialForm); }}>Cancel</Button>}
          </div>
        </form>
      </div>
      <DataTable
        search={state.search}
        onSearch={state.setSearch}
        page={state.page}
        totalPages={meta.totalPages || 1}
        onPage={state.setPage}
        loading={state.listQuery.isLoading}
        rows={rows}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'project', header: 'Project', render: (row) => row.project?.name || row.projectId },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          { key: 'priority', header: 'Priority' },
          { key: 'concurrencyLimit', header: 'Concurrency' },
          { key: 'retryPolicy', header: 'Retry', render: (row) => row.retryPolicy?.name || '-' },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => actionMutation.mutate({ id: row.id, action: row.status === 'PAUSED' ? 'resume' : 'pause' })}>{row.status === 'PAUSED' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</Button>
                <Button variant="secondary" onClick={() => state.beginEdit(row, ({ name, slug, retryPolicyId, priority, concurrencyLimit, rateLimitPerMinute, shardKey }) => ({ name, slug, retryPolicyId: retryPolicyId || '', priority, concurrencyLimit, rateLimitPerMinute: rateLimitPerMinute || '', shardKey: shardKey || '' }))}><Pencil className="h-4 w-4" /></Button>
                <Button variant="danger" onClick={() => state.setConfirm(row)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )
          }
        ]}
      />
      {state.confirm && <ConfirmDialog title="Delete queue" message={`Delete ${state.confirm.name}? Jobs in this queue will be removed.`} onCancel={() => state.setConfirm(null)} onConfirm={() => state.removeMutation.mutate(state.confirm.id)} busy={state.busy} confirmLabel="Delete" />}
    </div>
  );
}
