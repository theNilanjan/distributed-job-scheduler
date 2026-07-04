import { PageHeader } from '../../components/ui/PageHeader';

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Operational configuration and environment details." />
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <dl className="grid gap-4 md:grid-cols-2">
          <Item label="API Base URL" value={import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'} />
          <Item label="Socket URL" value={import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'} />
          <Item label="Authentication" value="JWT access token with refresh-token rotation" />
          <Item label="Realtime" value="Socket.IO with polling fallback through React Query refetch intervals" />
        </dl>
      </div>
    </div>
  );
}

function Item({ label, value }) {
  return <div className="rounded-md border border-line bg-surface p-4"><dt className="text-sm font-medium text-steel">{label}</dt><dd className="mt-1 text-sm text-ink">{value}</dd></div>;
}
