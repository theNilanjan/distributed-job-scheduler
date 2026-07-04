import { Pencil, Plus, Trash2 } from 'lucide-react';
import { retryPoliciesApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { useCrudPage } from '../common/useCrudPage';

const initialForm = { name: '', strategy: 'FIXED', maxAttempts: 3, baseDelaySeconds: 30, maxDelaySeconds: 3600, jitterEnabled: true };

export function RetryPoliciesPage() {
  const state = useCrudPage({ key: 'retry-policies', api: retryPoliciesApi, initialForm });
  const rows = state.listQuery.data?.data || [];

  function numeric(form) {
    return { ...form, maxAttempts: Number(form.maxAttempts), baseDelaySeconds: Number(form.baseDelaySeconds), maxDelaySeconds: Number(form.maxDelaySeconds), jitterEnabled: Boolean(form.jitterEnabled) };
  }

  return (
    <div>
      <PageHeader title="Retry Policies" description="Configure fixed delay, linear backoff, and exponential backoff strategies." />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-6" onSubmit={(event) => { event.preventDefault(); state.submit(numeric); }}>
          <FormField label="Name"><input className={inputClass} value={state.form.name} onChange={(e) => state.setForm({ ...state.form, name: e.target.value })} required /></FormField>
          <FormField label="Strategy"><select className={inputClass} value={state.form.strategy} onChange={(e) => state.setForm({ ...state.form, strategy: e.target.value })}><option>FIXED</option><option>LINEAR</option><option>EXPONENTIAL</option></select></FormField>
          <FormField label="Max Attempts"><input type="number" className={inputClass} value={state.form.maxAttempts} onChange={(e) => state.setForm({ ...state.form, maxAttempts: e.target.value })} /></FormField>
          <FormField label="Base Delay"><input type="number" className={inputClass} value={state.form.baseDelaySeconds} onChange={(e) => state.setForm({ ...state.form, baseDelaySeconds: e.target.value })} /></FormField>
          <FormField label="Max Delay"><input type="number" className={inputClass} value={state.form.maxDelaySeconds} onChange={(e) => state.setForm({ ...state.form, maxDelaySeconds: e.target.value })} /></FormField>
          <FormField label="Jitter"><select className={inputClass} value={String(state.form.jitterEnabled)} onChange={(e) => state.setForm({ ...state.form, jitterEnabled: e.target.value === 'true' })}><option value="true">Enabled</option><option value="false">Disabled</option></select></FormField>
          <div className="flex gap-2 md:col-span-6"><Button type="submit"><Plus className="h-4 w-4" />{state.editing ? 'Save policy' : 'Create policy'}</Button>{state.editing && <Button type="button" variant="secondary" onClick={() => { state.setEditing(null); state.setForm(initialForm); }}>Cancel</Button>}</div>
        </form>
      </div>
      <DataTable rows={rows} loading={state.listQuery.isLoading} search={state.search} onSearch={state.setSearch} page={state.page} totalPages={state.listQuery.data?.meta?.totalPages || 1} onPage={state.setPage} columns={[
        { key: 'name', header: 'Name' },
        { key: 'strategy', header: 'Strategy' },
        { key: 'maxAttempts', header: 'Attempts' },
        { key: 'baseDelaySeconds', header: 'Base Delay' },
        { key: 'maxDelaySeconds', header: 'Max Delay' },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => state.beginEdit(row, ({ name, strategy, maxAttempts, baseDelaySeconds, maxDelaySeconds, jitterEnabled }) => ({ name, strategy, maxAttempts, baseDelaySeconds, maxDelaySeconds, jitterEnabled }))}><Pencil className="h-4 w-4" /></Button><Button variant="danger" onClick={() => state.setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> }
      ]} />
      {state.confirm && <ConfirmDialog title="Delete retry policy" message={`Delete ${state.confirm.name}? Queues using it will keep running without this policy reference.`} onCancel={() => state.setConfirm(null)} onConfirm={() => state.removeMutation.mutate(state.confirm.id)} busy={state.busy} confirmLabel="Delete" />}
    </div>
  );
}
