export function makeDiseaseDefinition(entryData) {
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const tabWrap = diseaseDefinition.querySelector(
    '#temp-disease-definition .tab-wrap'
  );
  const currentLang = document.querySelector('.language-select').value;

  const items = [
    {
      class: 'mhlw',
      existing: currentLang === 'en' ? false : !!entryData.description,
      desc: entryData.description,
      translate: false,
    },
    {
      class: 'ordo',
      existing: !!entryData.ordo_dif && entryData.ordo_dif.length > 0,
      desc: entryData.ordo_dif
        ? entryData.ordo_dif.map((item) => item.data).join(' ')
        : '',
      translate: true,
    },
    {
      class: 'monarch-initiative',
      existing: !!entryData.mondo_decs,
      desc: entryData.mondo_decs?.map((dec) => dec.id).join(' '),
      translate: true,
    },
    {
      class: 'medgen',
      existing: !!entryData.medgen_definition,
      desc: entryData.medgen_definition,
      translate: true,
    },
    {
      class: 'kegg',
      existing: !!entryData.kegg_description,
      desc: entryData.kegg_description,
      translate: true,
    },
  ];

  if (items.every((item) => !item.existing)) {
    diseaseDefinition.remove();
    const subTitle = document.querySelector('.sub-title.-disease-definition');
    const overviewSection = subTitle.closest('.overview-section');
    overviewSection.remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`disease-${item.class}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      }

      const content = tabWrap.querySelector(`.${item.class}`);

      content.textContent = item.desc;
      const currentTab = tabWrap.querySelector(`#disease-${item.class}`);

      if (currentTab && isFirstTab) {
        currentTab.checked = true;
        isFirstTab = false;
      }

      if (item.translate) {
        const translationLink = document.createElement('a');
        const translationUrl = `https://translate.google.co.jp/?hl=ja&sl=en&tl=ja&text=${encodeURIComponent(
          item.desc
        )}`;
        translationLink.setAttribute('href', translationUrl);
        translationLink.setAttribute('target', '_blank');
        translationLink.setAttribute('rel', 'noopener noreferrer');
        translationLink.innerHTML =
          '<span class="google-translate">&nbsp;&gt;&gt;&nbsp;翻訳 (Google)</span>';
        content.append(translationLink);
      }
    });
  }
}
