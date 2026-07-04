import { Pencil, Plus, Trash2 } from 'lucide-react';
import { projectsApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/format';
import { useCrudPage } from '../common/useCrudPage';

const initialForm = { organizationId: 1, name: '', key: '', description: '', status: 'ACTIVE' };

export function ProjectsPage() {
  const state = useCrudPage({ key: 'projects', api: projectsApi, initialForm });
  const rows = state.listQuery.data?.data || [];
  const meta = state.listQuery.data?.meta || {};

  return (
    <div>
      <PageHeader title="Projects" description="Projects group queues and jobs under an organization." />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <form className="grid gap-4 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); state.submit((form) => ({ ...form, organizationId: Number(form.organizationId) })); }}>
          {!state.editing && <FormField label="Organization ID"><input type="number" min="1" className={inputClass} value={state.form.organizationId} onChange={(e) => state.setForm({ ...state.form, organizationId: e.target.value })} required /></FormField>}
          <FormField label="Name"><input className={inputClass} value={state.form.name} onChange={(e) => state.setForm({ ...state.form, name: e.target.value })} required /></FormField>
          <FormField label="Key"><input className={inputClass} value={state.form.key} onChange={(e) => state.setForm({ ...state.form, key: e.target.value.toUpperCase() })} required /></FormField>
          <FormField label="Description"><input className={inputClass} value={state.form.description || ''} onChange={(e) => state.setForm({ ...state.form, description: e.target.value })} /></FormField>
          {state.editing && <FormField label="Status"><select className={inputClass} value={state.form.status} onChange={(e) => state.setForm({ ...state.form, status: e.target.value })}><option>ACTIVE</option><option>ARCHIVED</option></select></FormField>}
          <div className="flex items-end gap-2"><Button type="submit" disabled={state.busy}><Plus className="h-4 w-4" />{state.editing ? 'Save' : 'Create'}</Button>{state.editing && <Button type="button" variant="secondary" onClick={() => { state.setEditing(null); state.setForm(initialForm); }}>Cancel</Button>}</div>
        </form>
      </div>
      <DataTable search={state.search} onSearch={state.setSearch} page={state.page} totalPages={meta.totalPages || 1} onPage={state.setPage} loading={state.listQuery.isLoading} rows={rows} columns={[
        { key: 'name', header: 'Name' },
        { key: 'key', header: 'Key' },
        { key: 'organization', header: 'Organization', render: (row) => row.organization?.name || row.organizationId },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => state.beginEdit(row, ({ name, key, description, status }) => ({ name, key, description: description || '', status }))}><Pencil className="h-4 w-4" /></Button><Button variant="danger" onClick={() => state.setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> }
      ]} />
      {state.confirm && <ConfirmDialog title="Delete project" message={`Delete ${state.confirm.name}? Queues and jobs under it will be removed.`} onCancel={() => state.setConfirm(null)} onConfirm={() => state.removeMutation.mutate(state.confirm.id)} busy={state.busy} confirmLabel="Delete" />}
    </div>
  );
}
