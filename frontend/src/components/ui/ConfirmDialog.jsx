import { Button } from './Button';

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, busy }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-md border border-line bg-white p-5 shadow-soft">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-steel">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working...' : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
