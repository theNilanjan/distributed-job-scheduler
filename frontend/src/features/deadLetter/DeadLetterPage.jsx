import { Eye, RotateCcw, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { deadLetterApi } from '../../api/resourceApi';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { useToast } from '../../components/ui/Toast';
import { formatDate, readError } from '../../lib/format';

export function DeadLetterPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const query = useQuery({ queryKey: ['dead-letter', { page, search }], queryFn: () => deadLetterApi.list({ page, limit: 10, search }), refetchInterval: 5000 });
  const detailQuery = useQuery({ queryKey: ['dead-letter-detail', selected?.id], queryFn: () => deadLetterApi.get(selected.id), enabled: Boolean(selected?.id) });
  const mutation = useMutation({
    mutationFn: ({ action, id }) => deadLetterApi[action](id),
    onSuccess: () => {
      toast.notify('Dead letter queue updated');
      setConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['dead-letter'] });
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });

  return (
    <div>
      <PageHeader title="Dead Letter Queue" description="Review permanently failed jobs, inspect failure details, replay, or delete entries." />
      <DataTable search={search} onSearch={setSearch} page={page} totalPages={query.data?.meta?.totalPages || 1} onPage={setPage} rows={query.data?.data || []} loading={query.isLoading} columns={[
        { key: 'job', header: 'Job', render: (row) => row.job?.name || row.jobId },
        { key: 'queue', header: 'Queue', render: (row) => row.queue?.name || row.queueId },
        { key: 'attempts', header: 'Attempts' },
        { key: 'failureReason', header: 'Failure' },
        { key: 'failedAt', header: 'Failed At', render: (row) => formatDate(row.failedAt) },
        { key: 'actions', header: 'Actions', render: (row) => <div className="flex gap-2"><Button variant="secondary" onClick={() => setSelected(row)}><Eye className="h-4 w-4" /></Button><Button variant="secondary" onClick={() => mutation.mutate({ action: 'retry', id: row.id })}><RotateCcw className="h-4 w-4" /></Button><Button variant="danger" onClick={() => setConfirm(row)}><Trash2 className="h-4 w-4" /></Button></div> }
      ]} />
      {selected && <div className="fixed inset-0 z-40 overflow-auto bg-ink/30 p-4"><div className="mx-auto max-w-5xl rounded-md border border-line bg-white p-5 shadow-soft"><div className="mb-4 flex justify-between"><h3 className="font-semibold text-ink">Failure details</h3><Button variant="secondary" onClick={() => setSelected(null)}>Close</Button></div><pre className="max-h-[70vh] overflow-auto rounded-md bg-surface p-4 text-xs">{JSON.stringify(detailQuery.data || selected, null, 2)}</pre></div></div>}
      {confirm && <ConfirmDialog title="Delete dead-letter entry" message={`Delete failed job ${confirm.jobId}?`} onCancel={() => setConfirm(null)} onConfirm={() => mutation.mutate({ action: 'remove', id: confirm.id })} busy={mutation.isPending} confirmLabel="Delete" />}
    </div>
  );
}
