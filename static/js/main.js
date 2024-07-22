import { navToggle } from './navigation.js';
import { focusInput } from './focusInput.js';
import { setLangChange } from './setLangChange.js';
import {
  drawDesignatedIntractableDiseaseColumnsTable,
  drawPediatricChronicSpecificDiseaseColumnsTable,
} from './epidemiology.js';
import { smartTextBox } from './smart_text_box.js';

navToggle();
focusInput();
setLangChange();
if (window.location.pathname === '/epidemiology') {
  drawDesignatedIntractableDiseaseColumnsTable();
  drawPediatricChronicSpecificDiseaseColumnsTable();
}

// smart text box
if (window.location.pathname === '/') {
  smartTextBox('NANDO', '/static/tsv/NANDO_20240516.tsv', {
    api_url: '',
  });

  document.addEventListener('selectedLabel', function (event) {
    const labelInfo = event.detail.labelInfo;
    window.location.href = `${location.origin}/disease/${labelInfo.ID}`;
  });
}
