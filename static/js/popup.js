const openModalBtns = document.querySelectorAll('.open-modal-btn');
const modalViews = document.querySelectorAll('.modal-view');

export const popup = () => {
  openModalBtns.forEach((button) => {
    button.addEventListener('click', (e) => {
      const activeActionContent = e.target.closest('div');
      const activeModal = activeActionContent.querySelector('.modal-view');
      if (button.getAttribute('aria-expanded') === 'true') {
        closeModal(activeModal);
      } else {
        openModal(activeModal);
      }
    });
  });

  function openModal(modal) {
    modal.setAttribute('aria-hidden', false);
    const activeButton = Array.from(openModalBtns).find((button) => {
      return button.getAttribute('aria-controls') === modal.id;
    });
    activeButton.setAttribute('aria-expanded', true);
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', true);
    const activeButton = Array.from(openModalBtns).find(
      (button) => button.getAttribute('aria-controls') === modal.id
    );
    activeButton.setAttribute('aria-expanded', false);
  }

  document.addEventListener('click', function (e) {
    const isOpenModalBtn = e.target.closest('.open-modal-btn');
    if (isOpenModalBtn) {
      const targetName = isOpenModalBtn.getAttribute('aria-controls');
      if (
        targetName === 'modal-download' &&
        openModalBtns[1].getAttribute('aria-expanded') === 'true'
      ) {
        openModalBtns[1].setAttribute('aria-expanded', false);
        modalViews[1].setAttribute('aria-hidden', true);
        return;
      } else if (
        targetName === 'modal-share' &&
        openModalBtns[0].getAttribute('aria-expanded') === 'true'
      ) {
        openModalBtns[0].setAttribute('aria-expanded', false);
        modalViews[0].setAttribute('aria-hidden', true);
        return;
      }
    }

    document.querySelectorAll('.modal-view').forEach((modal) => {
      if (isOpenModalBtn || e.target.closest('.modal-view')) {
        return;
      } else {
        modal.parentElement
          .querySelector('.open-modal-btn')
          .setAttribute('aria-expanded', false);
        modal.setAttribute('aria-hidden', true);
      }
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.summary-share .share-link').textContent =
    window.location.href;
});

document.querySelectorAll('#temp-side-navigation .nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    //本当はsetIntervalではなくdispatchEventを使いたいが、どこで行っているかわからないので保留
    setInterval(() => {
      document.querySelector('.summary-share .share-link').textContent =
        window.location.href;
    }, 1);
  });
});
