import { createContext, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const api = useMemo(() => ({
    notify(message, variant = 'success') {
      const id = window.crypto.randomUUID();
      setToasts((items) => [...items, { id, message, variant }]);
      setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4500);
    }
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'flex min-w-72 items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm shadow-soft',
              toast.variant === 'error' ? 'border-red-200 bg-red-50 text-danger' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            )}
          >
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
