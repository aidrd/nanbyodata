export const focusInput = () => {
  if (location.hash !== '') return;
  window.setTimeout(function () {
    document.getElementById('NANDO')?.focus();
  }, 1);
};
