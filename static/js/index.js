// News open/close function
const moreButtonEl = document.querySelector('#service > .news > .more');
const moreListEl = document.querySelector(
  '#service > .news > .logdata > .more-list'
);
moreButtonEl.addEventListener('click', () => {
  const isOpen = moreButtonEl.classList.toggle('open');
  moreButtonEl.textContent = isOpen ? 'close' : 'more';
  moreListEl.classList.toggle('open');
});
