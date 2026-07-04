import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { organizationsApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { FormField, inputClass } from '../../components/ui/FormField';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatDate } from '../../lib/format';
import { useCrudPage } from '../common/useCrudPage';

const initialForm = { name: '', slug: '', description: '' };

export function OrganizationsPage() {
  const state = useCrudPage({ key: 'organizations', api: organizationsApi, initialForm });
  const rows = state.listQuery.data?.data || [];
  const meta = state.listQuery.data?.meta || {};

  return (
    <div>
      <PageHeader title="Organizations" description="Manage tenant boundaries, ownership, and organization membership." />
      <div className="mb-6 rounded-md border border-line bg-white p-5 shadow-soft">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-ink"><Building2 className="h-4 w-4" />{state.editing ? 'Edit organization' : 'Create organization'}</h3>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); state.submit(); }}>
          <FormField label="Name"><input className={inputClass} value={state.form.name} onChange={(e) => state.setForm({ ...state.form, name: e.target.value })} required /></FormField>
          <FormField label="Slug"><input className={inputClass} value={state.form.slug} onChange={(e) => state.setForm({ ...state.form, slug: e.target.value })} required /></FormField>
          <FormField label="Description"><input className={inputClass} value={state.form.description || ''} onChange={(e) => state.setForm({ ...state.form, description: e.target.value })} /></FormField>
          <div className="flex gap-2 md:col-span-3">
            <Button type="submit" disabled={state.busy}><Plus className="h-4 w-4" />{state.editing ? 'Save organization' : 'Create organization'}</Button>
            {state.editing && <Button type="button" variant="secondary" onClick={() => { state.setEditing(null); state.setForm(initialForm); }}>Cancel edit</Button>}
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
          { key: 'slug', header: 'Slug' },
          { key: 'description', header: 'Description', render: (row) => row.description || '-' },
          { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
          { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => state.beginEdit(row, ({ name, slug, description }) => ({ name, slug, description: description || '' }))}><Pencil className="h-4 w-4" /></Button><Button variant="danger" onClick={() => state.setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> }
        ]}
      />
      {state.confirm && <ConfirmDialog title="Delete organization" message={`Delete ${state.confirm.name}? Projects, queues, and jobs under it will be removed by database cascade rules.`} onCancel={() => state.setConfirm(null)} onConfirm={() => state.removeMutation.mutate(state.confirm.id)} busy={state.busy} confirmLabel="Delete" />}
    </div>
  );
}
