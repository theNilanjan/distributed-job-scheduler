export function StatCard({ label, value }) {
  return (
    <div className="animate-fade-in rounded-2xl border border-line bg-panel p-5 shadow-card">
      <div className="text-sm font-medium text-steel">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-ink">{value}</div>
    </div>
  );
}
