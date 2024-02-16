export const breadcrumb = (nandoId) => {
  const selectTreeBox = document.querySelector(
    `.wrapper[data-value="${nandoId}"] > .select-option`
  );
  if (selectTreeBox) {
    selectTreeBox.style.backgroundColor = 'rgba(22, 35, 78, 0.2)';
  }

  function handleOptionClick(event) {
    const selectedLi = event.target;
    const selectOption = selectedLi
      .closest('.wrapper')
      .querySelector('.select-option');
    selectOption.textContent = selectedLi.textContent;
    if (selectedLi.dataset.value !== nandoId) {
      window.location.href = `/disease/NANDO:${selectedLi.dataset.value}`;
    }
  }

  document
    .querySelectorAll('.wrapper .options .option')
    .forEach((item) => item.addEventListener('click', handleOptionClick));

  document.querySelectorAll('.wrapper').forEach((wrapper) => {
    const selectBtn = wrapper.querySelector('.select-option');
    selectBtn?.addEventListener('click', () => {
      wrapper.classList.toggle('active');
    });

    wrapper.querySelectorAll('.option').forEach((option) => {
      if (option.dataset.value === wrapper.dataset.value) {
        option.classList.add('selected');
      }
    });
  });

  document.addEventListener('click', (e) => {
    const isSelectOptionClicked = e.target.closest('.select-option');
    document.querySelectorAll('.wrapper').forEach((wrapper) => {
      if (isSelectOptionClicked && wrapper.contains(isSelectOptionClicked)) {
        return;
      }
      wrapper.classList.remove('active');
    });
  });
};
