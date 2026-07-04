export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function formatDuration(ms) {
  if (!ms) return '-';
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function readError(error) {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
}
