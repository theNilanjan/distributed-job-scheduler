import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../components/ui/Toast';
import { readError } from '../../lib/format';

export function useCrudPage({ key, api, initialForm }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [confirm, setConfirm] = useState(null);

  const listQuery = useQuery({
    queryKey: [key, { page, search }],
    queryFn: () => api.list({ page, limit: 10, search })
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: [key] });
  const createMutation = useMutation({
    mutationFn: (payload) => api.create(payload),
    onSuccess: () => {
      toast.notify('Created successfully');
      setForm(initialForm);
      refresh();
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.update(id, payload),
    onSuccess: () => {
      toast.notify('Updated successfully');
      setEditing(null);
      setForm(initialForm);
      refresh();
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });
  const removeMutation = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => {
      toast.notify('Deleted successfully');
      setConfirm(null);
      refresh();
    },
    onError: (error) => toast.notify(readError(error), 'error')
  });

  function beginEdit(row, mapper = (value) => value) {
    setEditing(row);
    setForm(mapper(row));
  }

  function submit(payloadMapper = (value) => value) {
    const payload = payloadMapper(form);
    if (editing) updateMutation.mutate({ id: editing.id, payload });
    else createMutation.mutate(payload);
  }

  return {
    page,
    setPage,
    search,
    setSearch,
    editing,
    setEditing,
    form,
    setForm,
    confirm,
    setConfirm,
    listQuery,
    createMutation,
    updateMutation,
    removeMutation,
    beginEdit,
    submit,
    refresh,
    busy: createMutation.isPending || updateMutation.isPending || removeMutation.isPending
  };
}
