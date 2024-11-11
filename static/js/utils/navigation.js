export const navToggle = () => {
  const navButton = document.querySelector('.navbar-toggler');
  const navAnimation = document.getElementById('navbarResponsive');

  document.addEventListener('click', (event) => {
    const clickedElement = event.target;
    const isNavOpen = navAnimation.classList.contains('show');

    navButton.classList.toggle('collapsed');
    navButton.setAttribute('aria-expanded', String(!isNavOpen));

    if (clickedElement.closest('.navbar-toggler') !== navButton && isNavOpen) {
      closeNav();
    }
  });

  function closeNav() {
    navAnimation.style.height = `${navAnimation.scrollHeight}px`;
    navAnimation.classList.remove('collapse', 'show');
    navAnimation.classList.add('collapsing');

    setTimeout(() => {
      navAnimation.style.height = '0';
    }, 0);

    setTimeout(() => {
      navAnimation.classList.remove('collapsing');
      navAnimation.classList.add('collapse');
      navAnimation.style.height = '';
    }, 350);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const navButton = document.querySelector('.navbar-toggler');
  const navbarNav = document.querySelector('.navbar-nav');
  const dropdown = document.querySelector('.nav-item.dropdown');
  const dropdownLink = dropdown.querySelector('.nav-link');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const dropdownIcon = document.getElementById('dropdownIcon');
  let convertedNavItems = [];
  let originalDropdownItems = [];

  function saveOriginalDropdownItems() {
    originalDropdownItems = Array.from(
      dropdownMenu.querySelectorAll('.dropdown-item')
    ).map((item) => ({
      href: item.getAttribute('href'),
      textContent: item.textContent,
    }));
  }

  function checkScreenWidth() {
    const isMobileView = window.getComputedStyle(navButton).display !== 'none';
    if (isMobileView) {
      if (dropdown && dropdownMenu) {
        restoreDropdownItems();
        convertDropdownItemsToNavItems();
        dropdown.style.display = 'none';
      }
    } else {
      restoreDropdownItems();
      dropdown.style.display = '';
      enableHoverDropdown();
    }
  }

  function toggleDropdownIcon(show) {
    dropdownIcon.classList.toggle('fa-angle-down', !show);
    dropdownIcon.classList.toggle('fa-angle-up', show);
  }

  function enableHoverDropdown() {
    dropdownLink.addEventListener('mouseenter', showDropdown);
    dropdownLink.addEventListener('mouseleave', hideDropdown);
    dropdownMenu.addEventListener('mouseenter', showDropdown);
    dropdownMenu.addEventListener('mouseleave', hideDropdown);
  }

  function disableHoverDropdown() {
    dropdownLink.removeEventListener('mouseenter', showDropdown);
    dropdownLink.removeEventListener('mouseleave', hideDropdown);
    dropdownMenu.removeEventListener('mouseenter', showDropdown);
    dropdownMenu.removeEventListener('mouseleave', hideDropdown);
    hideDropdown();
  }

  function showDropdown() {
    dropdownMenu.style.display = 'block';
    toggleDropdownIcon(true);
  }

  function hideDropdown() {
    dropdownMenu.style.display = 'none';
    toggleDropdownIcon(false);
  }

  function convertDropdownItemsToNavItems() {
    originalDropdownItems.forEach((itemData) => {
      const navItem = document.createElement('li');
      navItem.classList.add('nav-item');

      const navLink = document.createElement('a');
      navLink.classList.add('nav-link');
      navLink.href = itemData.href;
      navLink.textContent = itemData.textContent;

      navItem.appendChild(navLink);
      navbarNav.insertBefore(navItem, dropdown);
      convertedNavItems.push(navItem);
    });
  }

  function restoreDropdownItems() {
    convertedNavItems.forEach((navItem) => navItem.remove());
    convertedNavItems = [];
    if (dropdown) dropdown.style.display = '';
    disableHoverDropdown();
  }

  saveOriginalDropdownItems();
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);
});
