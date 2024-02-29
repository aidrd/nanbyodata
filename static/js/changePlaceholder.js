// Change the placeholder of the input field depending on the language
export const changePlaceholder = () => {
  const observer = new MutationObserver(() => {
    const currentLanguage = document.querySelector('.language-select').value;
    const inputElement = document.getElementById('token-input-tokeninput');
    if (inputElement) {
      inputElement.placeholder =
        currentLanguage === 'ja' ? '難病名を入力' : 'Type in disease name';
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};
