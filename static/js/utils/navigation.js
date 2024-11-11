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

document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.getElementById('dropdownMenu');
  const icon = document.getElementById('dropdownIcon');

  // Toggle dropdown visibility and icon
  function toggleDropdown(event) {
    event.stopPropagation();
    const isDropdownHidden = dropdown.style.display === 'none';
    dropdown.style.display = isDropdownHidden ? 'block' : 'none';
    icon.classList.toggle('fa-angle-down', !isDropdownHidden);
    icon.classList.toggle('fa-angle-up', isDropdownHidden);

    document.querySelector(".nav-link[href='javascript:void(0);']").blur();
  }

  // Add event listener to the "DATA" nav link
  document
    .querySelector(".nav-link[href='javascript:void(0);']")
    .addEventListener('click', toggleDropdown);

  // Close dropdown when clicking outside
  document.addEventListener('click', function (event) {
    if (
      !event.target.closest('.dropdown') &&
      dropdown.style.display === 'block'
    ) {
      dropdown.style.display = 'none';
      icon.classList.add('fa-angle-down');
      icon.classList.remove('fa-angle-up');
    }
  });

  // Close dropdown when clicking a dropdown item
  document.querySelectorAll('#dropdownMenu .dropdown-item').forEach((item) => {
    item.addEventListener('click', () => {
      dropdown.style.display = 'none';
      icon.classList.add('fa-angle-down');
      icon.classList.remove('fa-angle-up');
    });
  });
});
