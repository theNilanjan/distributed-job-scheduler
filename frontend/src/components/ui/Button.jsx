import { clsx } from 'clsx';

export function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-accent text-slate-950 hover:bg-teal-300',
        variant === 'secondary' && 'border border-line bg-panel text-ink hover:bg-slate-800',
        variant === 'danger' && 'bg-danger text-white hover:bg-red-600',
        variant === 'ghost' && 'text-steel hover:bg-slate-800 hover:text-ink',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
