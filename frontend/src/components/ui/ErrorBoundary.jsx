import { useRouteError } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError();
  const message = error?.message || 'Something went wrong';

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-xl rounded-lg border border-line bg-white p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">Unexpected error</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">We could not load this page.</h1>
        <p className="mt-3 text-sm text-steel">{message}</p>
        <p className="mt-4 text-sm text-steel">Try refreshing the page or returning to the dashboard.</p>
      </div>
    </div>
  );
}
