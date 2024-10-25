export function makeInheritanceUris(entryData) {
  const inheritanceUris = document.querySelector('.inheritance-uris');
  const inheritanceSubTitle = document.querySelector(
    '.sub-title.-inheritance-uri'
  );
  const tempWrapper = document.querySelector('.temp-wrapper');
  const overviewSection = tempWrapper.closest('.overview-section');
  if (entryData.inheritance_uris) {
    appendLinks(entryData.inheritance_uris, inheritanceUris);
  } else {
    overviewSection.remove();
    inheritanceSubTitle.remove();
  }
}

function createLinkElement(url, text) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = text;
  return a;
}

function appendLinks(data, container, prefix = '') {
  if (data && data.length) {
    data.forEach((item, index) => {
      const dd = document.createElement('dd');
      const currentLang = document.querySelector('.language-select').value;
      let a;
      if (currentLang === 'en' && item.id_en) {
        a = createLinkElement(item.url || item.uri, prefix + item.id_en);
      } else {
        a = createLinkElement(item.url || item.uri, prefix + item.id);
      }
      dd.classList.add('linked-item');
      dd.append(a);
      container.append(dd);
      if (index < data.length - 1) {
        const space = document.createTextNode(' ');
        container.append(space);
      }
    });
  } else {
    container.remove();
  }
}
