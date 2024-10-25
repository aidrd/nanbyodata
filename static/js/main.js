import { navToggle } from './components/navigation.js';
import { focusInput } from './components/focusInput.js';
import { setLangChange } from './components/setLangChange.js';
import {
  drawDesignatedIntractableDiseaseColumnsTable,
  drawPediatricChronicSpecificDiseaseColumnsTable,
} from './epidemiology/epidemiology.js';
import { smartBox } from './components/smart_box.js';

navToggle();
focusInput();
setLangChange();
if (window.location.pathname === '/epidemiology') {
  drawDesignatedIntractableDiseaseColumnsTable();
  drawPediatricChronicSpecificDiseaseColumnsTable();
}

// smart box
if (window.location.pathname === '/') {
  smartBox('NANDO', '/static/tsv/NANDO_20240516.tsv', {
    api_url: '',
  });

  document.addEventListener('selectedLabel', function (event) {
    const labelInfo = event.detail.labelInfo;
    window.location.href = `${location.origin}/disease/${labelInfo.id}`;
  });

  // News open/close function
  const newsWrapperEl = document.querySelector('.news-summary > .news-wrapper');
  const moreButtonEl = newsWrapperEl.querySelector('.more');
  const moreListEl = newsWrapperEl.querySelector('.logdata > .more-list');
  moreButtonEl.addEventListener('click', () => {
    const isOpen = moreButtonEl.classList.toggle('open');
    moreButtonEl.textContent = isOpen ? 'close' : 'more';
    moreListEl.classList.toggle('open');
  });
}
