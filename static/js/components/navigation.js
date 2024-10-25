// close navigation

export const navToggle = () => {
  document.addEventListener('click', function (event) {
    const clickedElement = event.target;

    const navButton = document.querySelector('.navbar-toggler');
    const navAnimation = document.getElementById('navbarResponsive');
    const isNavOpen = navAnimation.classList.contains('show');

    navButton.classList.toggle('collapsed');
    navButton.setAttribute('aria-expanded', String(!isNavOpen));

    if (clickedElement.closest('.navbar-toggler') !== navButton && isNavOpen) {
      closeNav(navAnimation);
    }
  });

  function closeNav(navAnimation) {
    navAnimation.style.height = navAnimation.scrollHeight + 'px';
    navAnimation.classList.remove('collapse', 'show');
    navAnimation.classList.add('collapsing');

    setTimeout(function () {
      navAnimation.style.height = '0';
    }, 0);

    setTimeout(function () {
      navAnimation.classList.remove('collapsing');
      navAnimation.classList.add('collapse');
      navAnimation.style.height = '';
    }, 350);
  }
};
