import { navToggle } from './navigation.js';
import { focusInput } from './focusInput.js';
import { setLangChange } from './setLangChange.js';
import { drawEpidemiologyTable } from './epidemiology.js';
import { smartTextBox } from './smart_text_box.js';

navToggle();
focusInput();
setLangChange();
if (window.location.pathname === '/epidemiology') {
  drawEpidemiologyTable();
}

// smart text box

smartTextBox('NANDO', '/static/tsv/NANDO.tsv', {
  api_url: '',
});

document.addEventListener('selectedLabel', function (event) {
  const labelInfo = event.detail.labelInfo;
  console.log('object', labelInfo);
});
