// Lightweight global toast dispatcher
export const showToast = (message, type = 'info') => {
  window.dispatchEvent(new CustomEvent('toast:show', { detail: { message, type } }));
};
