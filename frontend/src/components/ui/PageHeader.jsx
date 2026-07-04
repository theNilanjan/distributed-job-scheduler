export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-line bg-panel/90 p-5 shadow-card md:flex-row md:items-end">
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-steel">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
