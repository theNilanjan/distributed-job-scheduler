export function FormField({ label, children }) {
  return (
    <label className="block text-sm font-medium text-steel">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass = 'w-full rounded-md border border-line px-3 py-2 text-sm text-ink outline-none focus:border-accent';
