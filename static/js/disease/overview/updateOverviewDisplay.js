export function updateOverviewDisplay() {
  const navLink = document.querySelector('.nav-link.overview');
  const loadingSpinner = navLink.querySelector('.loading-spinner');

  if (document.querySelector('.summary-wrapper')?.style.display === 'none') {
    loadingSpinner.style.display = 'none';
  } else {
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
  loadingSpinner.style.display = 'none';
}
