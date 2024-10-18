import { navToggle } from './navigation.js';
import { focusInput } from './focusInput.js';
import { setLangChange } from './setLangChange.js';
import {
  drawDesignatedIntractableDiseaseColumnsTable,
  drawPediatricChronicSpecificDiseaseColumnsTable,
} from './epidemiology.js';
import { smartBox } from './smart_box.js';

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
}
