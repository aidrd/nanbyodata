export const setLangChange = () => {
  const langButton = document.querySelector('.language-select');
  langButton.addEventListener('change', function () {
    const value = this.value;
    const currentHash = window.location.hash;
    const currentPath = window.location.pathname;
    const search = window.location.search;
    let newUrl = '';

    if (search.includes('post')) {
      const params = new URLSearchParams(search);
      params.set('lang', value);
      newUrl = currentPath + '?' + params.toString() + currentHash;
    } else {
      newUrl = currentPath + '?lang=' + value + currentHash;
    }
    window.location.href = newUrl;
  });
};
