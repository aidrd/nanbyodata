export const focusInput = () => {
  if (location.hash !== '') return;
  window.setTimeout(function () {
    document.getElementById('inputBoxNanbyo')?.focus();
  }, 1);
};
