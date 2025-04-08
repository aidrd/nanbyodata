export const setLangChange = () => {
  const langButton = document.querySelector('.language-select');
  langButton.addEventListener('change', function () {
    const value = this.value;
    const currentHash = window.location.hash;
    const search = window.location.search;
    let newUrl = '';
    if (search.includes('post')) {
      const params = new URLSearchParams(search);
      params.set('lang', value);
      newUrl = '?' + params.toString();
    } else {
      newUrl = currentHash + '?' + 'lang=' + value;
    }
    window.location.href = newUrl;
  });
};
