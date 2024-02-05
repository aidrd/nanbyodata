export const focusInput = () => {
  if(location.hash!=="") return;
  window.setTimeout(function () {
    document.getElementById("token-input-tokeninput")?.focus();
  }, 1);
}