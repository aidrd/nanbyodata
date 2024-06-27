import { navToggle } from './navigation.js';
import { focusInput } from './focusInput.js';
import { changePlaceholder } from './changePlaceholder.js';
import { popup } from './popup.js';
import { breadcrumb } from './breadcrumb.js';
import { downloadDatasets } from './download.js';
import {
  makeCausalGene,
  makeGeneticTesting,
  makePhenotypes,
  makeCell,
  makeMouse,
  makeDNA,
  makeClinvar,
  makeMgend,
} from './diseaseContent.js';
import { switchingDisplayContents } from './diseaseSideNavigation.js';
import { setLangChange } from './setLangChange.js';

// // get NANDO ID
const pathname = window.location.pathname;
const nandoIndex = pathname.indexOf('NANDO:');
const nandoId = pathname.slice(nandoIndex + 6);

// // for cache busting
const timestamp = Date.now();

// external functions
navToggle();
focusInput();
changePlaceholder();
popup();
breadcrumb(nandoId);
setLangChange();

const datasets = [
  { name: 'Overview', data: null },
  { name: 'Causal Genes', data: null },
  { name: 'Genetic Testing', data: null },
  { name: 'Phenotypes', data: null },
  { name: 'Cell', data: null },
  { name: 'Mouse', data: null },
  { name: 'DNA', data: null },
  { name: 'Clinvar', data: null },
  { name: 'MGeND', data: null },
];

(async () => {
  try {
    const hash = window.location.hash.replace('#', '');
    async function fetchData(apiEndpoint) {
      const url = `/sparqlist/api/${apiEndpoint}?nando_id=${nandoId}&timestamp=${timestamp}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
      }
    }

    // get Overview data
    fetchData('nanbyodata_get_overview_by_nando_id').then((entryData) => {
      if (entryData) {
        makeHeader(entryData);
        makeExternalLinks(entryData);
        makeAlternativeName(entryData);
        makeInheritanceUris(entryData);
        makeLinksList(entryData);
        checkSummaryData(entryData);
        makeDiseaseDefinition(entryData);
        updateOverviewLinkAndContentDisplay();
        datasets.find((d) => d.name === 'Overview').data = entryData;
        checkAndLogDatasets();
        if (hash) {
          trySwitchingContent(hash);
        } else {
          switchingDisplayContents('overview');
          const overviewEl = document.querySelector('.nav-link.overview');
          overviewEl.classList.add('selected');
          overviewEl.style.cursor = 'pointer';
          document.getElementById('content').style.display = 'block';
        }
      }
    });

    // get Causal Genes data
    fetchData('nanbyodata_get_causal_gene_by_nando_id').then(
      (causalGeneData) => {
        makeCausalGene(causalGeneData);
        datasets.find((d) => d.name === 'Causal Genes').data = causalGeneData;
        checkAndLogDatasets();
      }
    );

    // get Genetic Testing data
    fetchData('nanbyodata_get_genetic_test_by_nando_id').then(
      (geneticTestingData) => {
        makeGeneticTesting(geneticTestingData);
        datasets.find((d) => d.name === 'Genetic Testing').data =
          geneticTestingData;
        checkAndLogDatasets();
      }
    );

    // get Phenotypes data
    fetchData('nanbyodata_get_hpo_data_by_nando_id').then((phenotypesData) => {
      makePhenotypes(phenotypesData);
      datasets.find((d) => d.name === 'Phenotypes').data = phenotypesData;
      checkAndLogDatasets();
    });

    // get Cell data
    fetchData('nanbyodata_get_riken_brc_cell_info_by_nando_id').then(
      (cellData) => {
        makeCell(cellData);
        datasets.find((d) => d.name === 'Cell').data = cellData;
        checkAndLogDatasets();
      }
    );

    // get Mouse data
    fetchData('nanbyodata_get_riken_brc_mouse_info_by_nando_id').then(
      (mouseData) => {
        makeMouse(mouseData);
        datasets.find((d) => d.name === 'Mouse').data = mouseData;
        checkAndLogDatasets();
      }
    );

    // get DNA data
    fetchData('nanbyodata_get_riken_brc_dna_info_by_nando_id').then(
      (dnaData) => {
        makeDNA(dnaData);
        datasets.find((d) => d.name === 'DNA').data = dnaData;
        checkAndLogDatasets();
      }
    );

    // get Clinvar data
    fetchData('nanbyodata_get_clinvar_variant_by_nando_id').then(
      (clinvarData) => {
        makeClinvar(clinvarData);
        datasets.find((d) => d.name === 'Clinvar').data = clinvarData;
        checkAndLogDatasets();
      }
    );

    // get MGenD data
    fetchData('nanbyodata_get_mgend_variant_by_nando_id').then((mgendData) => {
      makeMgend(mgendData);
      datasets.find((d) => d.name === 'MGeND').data = mgendData;
      checkAndLogDatasets();
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();

function checkAndLogDatasets() {
  if (datasets.every((dataset) => dataset.data !== null)) {
    downloadDatasets(nandoId, datasets);
    document.querySelector(
      '.summary-download > .open-popup-btn'
    ).disabled = false;
  }
}

function makeHeader(entryData) {
  const refNandoId = document.getElementById('temp-nando-id');
  refNandoId.textContent = nandoId;

  const refNandoLink = document.getElementById('temp-nando-link');
  refNandoLink.setAttribute(
    'href',
    refNandoLink.getAttribute('href') + nandoId
  );
  refNandoLink.textContent += nandoId;

  document
    .getElementById('temp-nando-copy')
    .addEventListener('click', async () => {
      const clipboardText = 'https://nanbyodata.jp/ontology/NANDO_' + nandoId;
      document.getElementById('temp-nando-copy').textContent = 'Copied!';
      await navigator.clipboard.writeText(clipboardText);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      document.getElementById('temp-nando-copy').textContent = 'Copy';
    });

  const labelJa = document.getElementById('temp-label-ja');
  if (labelJa) {
    labelJa.innerHTML =
      '<ruby>' +
      entryData.label_ja +
      '<rt>' +
      entryData.ruby +
      '</rt>' +
      '</ruby>';
  }

  const labelEn = document.getElementById('temp-label-en');
  labelEn.textContent = entryData.label_en;

  const notificationNumber = document.getElementById(
    'temp-notification-number'
  );
  notificationNumber.textContent = entryData.notification_number;
  if (!entryData.notification_number) {
    notificationNumber.parentNode.remove();
    const tempDataSummary = document.getElementById('overview');
    tempDataSummary.style.borderBottom = 'none';
  }
}

function makeExternalLinks(entryData) {
  const externalLinks = document.getElementById('temp-external-links');

  const items = [
    {
      url: entryData.mhlw?.url,
      element: externalLinks.querySelector('.linked-item.mhlw'),
      existing: !!entryData.mhlw,
    },
    {
      url: entryData.source,
      element: externalLinks.querySelector('.linked-item.source'),
      existing: !!entryData.source,
    },
    {
      url: entryData.nanbyou?.url,
      element: externalLinks.querySelector('.linked-item.nanbyou'),
      existing: !!entryData.nanbyou,
    },
    {
      url: entryData.shouman?.url,
      element: externalLinks.querySelector('.linked-item.shouman'),
      existing: !!entryData.shouman,
    },
  ];

  items.forEach((item) => {
    const { url, element } = item;
    if (url) {
      element.querySelector('a').setAttribute('href', url);
    } else {
      element.remove();
    }
  });

  const allFalse = items.every((item) => item.existing === false);
  if (allFalse) {
    document.getElementById('temp-data-summary').style.borderBottom = 'none';
  }
}

function makeAlternativeName(entryData) {
  const altLabelJa = document.querySelector('.alt-label-ja');
  const altLabelEn = document.querySelector('.alt-label-en');
  const currentLang = document.querySelector('.language-select').value;

  if (entryData.alt_label_ja && currentLang === 'ja') {
    const divElement = document.createElement('div');
    altLabelJa.append(divElement);
    entryData.alt_label_ja.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      ddElement.classList.add('linked-item', '-unlinked');
      divElement.append(ddElement);
    });
  } else {
    altLabelJa.remove();
  }
  if (entryData.alt_label_en) {
    const divElement = document.createElement('div');
    altLabelEn.append(divElement);
    entryData.alt_label_en.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      ddElement.classList.add('linked-item', '-unlinked');
      divElement.append(ddElement);
    });
  } else {
    altLabelEn.remove();
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

function makeInheritanceUris(entryData) {
  const inheritanceUris = document.querySelector('.inheritance-uri');
  if (entryData.inheritance_uris) {
    appendLinks(entryData.inheritance_uris, inheritanceUris);
  } else {
    inheritanceUris.remove();
  }
}

function makeLinksList(entryData) {
  const linksListProperties = document.querySelector('.properties');
  const omim = linksListProperties.querySelector('.omim');
  const orphanet = linksListProperties.querySelector('.orphanet');
  const medgen = linksListProperties.querySelector('.medgen');
  const mondos = linksListProperties.querySelector('.mondos');
  const kegg = linksListProperties.querySelector('.kegg');
  const urdbms = linksListProperties.querySelector('.urdbms');

  appendLinks(entryData.db_xrefs?.omim, omim);
  appendLinks(entryData.db_xrefs?.orphanet, orphanet, 'ORPHA:');

  if (entryData.medgen_id) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.medgen_uri, entryData.medgen_id);
    dd.classList.add('linked-item');
    dd.append(a);
    medgen.append(dd);
  } else {
    medgen.remove();
  }

  appendLinks(entryData.mondos, mondos);

  if (entryData.kegg) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.kegg.url, entryData.kegg.id);
    dd.classList.add('linked-item');
    dd.append(a);
    kegg.append(dd);
  } else {
    kegg.remove();
  }

  if (entryData.urdbms) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.urdbms.url, entryData.urdbms.id);
    dd.classList.add('linked-item');
    dd.append(a);
    urdbms.append(dd);
  } else {
    urdbms.remove();
  }
}

export function checkSummaryData(entryData) {
  const summaryWrapper = document.querySelector('.summary-wrapper');
  const summaryNav = document.querySelector('.nav-link.overview');
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const navBorderTop = document.querySelector(
    '#temp-side-navigation > ul > li:first-child'
  );
  if (
    !entryData.alt_label_ja &&
    !entryData.alt_label_en &&
    !entryData.db_xrefs?.omim &&
    !entryData.db_xrefs?.orphanet &&
    !entryData.medgen_id &&
    !entryData.mondos &&
    !entryData.kegg &&
    !entryData.urdbms
  ) {
    if (summaryWrapper) {
      summaryWrapper.style = 'display: none;';
      summaryNav.style = 'display: none;';
      navBorderTop.style = 'border-top: none;';
      if (diseaseDefinition) {
        summaryNav.style = 'display: block;';
        navBorderTop.style = 'border-top: block;';
      }
    }
  }
}

function makeDiseaseDefinition(entryData) {
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
  ];

  if (items.every((item) => !item.existing)) {
    diseaseDefinition.remove();
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
        const translationUrl = `https://translate.google.co.jp/?hl=ja#en/ja/${item.desc}`;
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

function updateOverviewLinkAndContentDisplay() {
  const navLink = document.querySelector('.nav-link.overview');
  const loadingSpinner = navLink.querySelector('.loading-spinner');

  if (document.querySelector('.summary-wrapper').style.display === 'none') {
    loadingSpinner.style.display = 'none';
  } else {
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
  loadingSpinner.style.display = 'none';
}

function trySwitchingContent(hash, retries = 0) {
  const maxRetries = 10;
  let found = false;

  const items = [
    'overview',
    'causal-genes',
    'genetic-testing',
    'phenotypes',
    'bio-resource-cell',
    'bio-resource-mouse',
    'bio-resource-dna',
    'variant-clinvar',
    'variant-mgend',
  ];

  if (!items.includes(hash)) {
    window.location.hash = '';
    window.location.reload();
    return;
  }

  let modifiedHash = hash;
  switch (hash) {
    case 'bio-resource-cell':
    case 'bio-resource-mouse':
    case 'bio-resource-dna':
      modifiedHash = hash.substring('bio-resource-'.length);
      break;
    case 'variant-clinvar':
    case 'variant-mgend':
      modifiedHash = hash.substring('variant-'.length);
      break;
  }

  const element = document.querySelector(`.${modifiedHash}`);
  if (element && !element.classList.contains('-disabled')) found = true;

  const alreadySelected = document.querySelector('.nav-link.selected');

  if (found && (!alreadySelected || alreadySelected === element)) {
    element.classList.add('selected');
    switchingDisplayContents(hash);
    document.getElementById('content').style.display = 'block';
  } else if (!found && retries < maxRetries) {
    console.log('No hash item found, retrying...');
    setTimeout(() => {
      trySwitchingContent(hash, retries + 1);
    }, 3000);
  } else {
    if (alreadySelected) {
      return;
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  }
}
