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
  const dropdowns = document.querySelectorAll('.nav-item.dropdown');
  let convertedNavItems = new Map();
  let originalDropdownItems = new Map();

  function saveOriginalDropdownItems() {
    dropdowns.forEach((dropdown) => {
      const dropdownMenu = dropdown.querySelector('.dropdown-menu');
      const items = Array.from(
        dropdownMenu.querySelectorAll('.dropdown-item')
      ).map((item) => ({
        href: item.getAttribute('href'),
        textContent: item.textContent,
      }));
      originalDropdownItems.set(dropdown, items);
      convertedNavItems.set(dropdown, []);
    });
  }

  function checkScreenWidth() {
    const isMobileView = window.getComputedStyle(navButton).display !== 'none';

    dropdowns.forEach((dropdown) => {
      const dropdownMenu = dropdown.querySelector('.dropdown-menu');

      if (isMobileView) {
        restoreDropdownItems(dropdown);
        convertDropdownItemsToNavItems(dropdown);
        dropdown.style.display = 'none';
      } else {
        restoreDropdownItems(dropdown);
        dropdown.style.display = '';
        enableHoverDropdown(dropdown, dropdownMenu);
      }
    });
  }

  function enableHoverDropdown(dropdown, dropdownMenu) {
    const dropdownLink = dropdown.querySelector('.nav-link');
    const dropdownIcon = dropdown.querySelector('.dropdown-icon');

    dropdownLink.addEventListener('mouseenter', () => {
      showDropdown(dropdownMenu);
      if (dropdownIcon) {
        dropdownIcon.classList.remove('fa-angle-down');
        dropdownIcon.classList.add('fa-angle-up');
      }
    });

    dropdownLink.addEventListener('mouseleave', () => {
      hideDropdown(dropdownMenu);
      if (dropdownIcon) {
        dropdownIcon.classList.remove('fa-angle-up');
        dropdownIcon.classList.add('fa-angle-down');
      }
    });

    dropdownMenu.addEventListener('mouseenter', () => {
      showDropdown(dropdownMenu);
      if (dropdownIcon) {
        dropdownIcon.classList.remove('fa-angle-down');
        dropdownIcon.classList.add('fa-angle-up');
      }
    });

    dropdownMenu.addEventListener('mouseleave', () => {
      hideDropdown(dropdownMenu);
      if (dropdownIcon) {
        dropdownIcon.classList.remove('fa-angle-up');
        dropdownIcon.classList.add('fa-angle-down');
      }
    });
  }

  function disableHoverDropdown(dropdown, dropdownMenu) {
    const dropdownLink = dropdown.querySelector('.nav-link');

    dropdownLink.removeEventListener('mouseenter', showDropdown);
    dropdownLink.removeEventListener('mouseleave', hideDropdown);
    dropdownMenu.removeEventListener('mouseenter', showDropdown);
    dropdownMenu.removeEventListener('mouseleave', hideDropdown);
    hideDropdown(dropdownMenu);
  }

  function showDropdown(menu) {
    menu.style.display = 'block';
  }

  function hideDropdown(menu) {
    menu.style.display = 'none';
  }

  function convertDropdownItemsToNavItems(dropdown) {
    const dropdownItems = originalDropdownItems.get(dropdown) || [];
    dropdownItems.forEach((itemData) => {
      const navItem = document.createElement('li');
      navItem.classList.add('nav-item');

      const navLink = document.createElement('a');
      navLink.classList.add('nav-link');
      navLink.href = itemData.href;
      navLink.textContent = itemData.textContent;

      navItem.appendChild(navLink);
      navbarNav.insertBefore(navItem, dropdown);
      convertedNavItems.get(dropdown).push(navItem);
    });
  }

  function restoreDropdownItems(dropdown) {
    const items = convertedNavItems.get(dropdown) || [];
    items.forEach((navItem) => navItem.remove());
    convertedNavItems.set(dropdown, []);

    disableHoverDropdown(dropdown, dropdown.querySelector('.dropdown-menu'));
  }

  saveOriginalDropdownItems();
  checkScreenWidth();
  window.addEventListener('resize', checkScreenWidth);

  navButton.addEventListener('click', () => {
    dropdowns.forEach((dropdown) => {
      hideDropdown(dropdown.querySelector('.dropdown-menu'));
    });
    checkScreenWidth();
  });
});
