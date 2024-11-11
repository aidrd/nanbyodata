export const setLangChange = () => {
  const langButton = document.querySelector('.language-select');
  langButton.addEventListener('change', function () {
    const value = this.value;
    const currentHash = window.location.hash;
    const newUrl = '?lang=' + value + currentHash;
    window.location.href = newUrl;
  });
};
