// News open/close function
const newsWrapperEl = document.querySelector('.news-summary > .news-wrapper');
const moreButtonEl = newsWrapperEl.querySelector('.more');
const moreListEl = newsWrapperEl.querySelector('.logdata > .more-list');
moreButtonEl.addEventListener('click', () => {
  const isOpen = moreButtonEl.classList.toggle('open');
  moreButtonEl.textContent = isOpen ? 'close' : 'more';
  moreListEl.classList.toggle('open');
});
