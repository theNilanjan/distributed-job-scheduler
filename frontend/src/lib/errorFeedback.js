export function emitAppToast(message, variant = 'success', options = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:toast', {
    detail: {
      message,
      variant,
      title: options.title || (variant === 'error' ? 'Something went wrong' : 'Update'),
      action: options.action || 'Please try again.'
    }
  }));
}

export function emitAppError(message, options = {}) {
  emitAppToast(message, 'error', options);
}
