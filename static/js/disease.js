import { navToggle } from './navigation.js';
import { focusInput } from './focusInput.js';
import { changePlaceholder } from './changePlaceholder.js';
// import { popup } from './popup.js';
import { breadcrumb } from './breadcrumb.js';
// import { downloadDatasets } from './download.js';

// dispaly: none until loading is finished
document.getElementById('content').style.display = 'none';
document.getElementById('sidebar').style.display = 'none';

// get NANDO ID
const pathname = window.location.pathname;
const nandoIndex = pathname.indexOf('NANDO:');
const nandoId = pathname.slice(nandoIndex + 6);

// external functions
navToggle();
focusInput();
changePlaceholder();
// popup();
breadcrumb(nandoId);

(async () => {
  try {
    const entryDataPromise = fetch(
      'https://nanbyodata.jp/sparqlist/api/nanbyodata_get_metadata?nando_id=' +
        nandoId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    ).then((res) => res.json());

    const entryData = await entryDataPromise;

    async function fetchData(apiEndpoint) {
      const url = `https://nanbyodata.jp/sparqlist/api/${apiEndpoint}?nando_id=${nandoId}`;
      const response = await fetch(url);
      return response.json();
    }

    // get all data
    const geneData = await fetchData('nanbyodata_get_gene_by_nando_id');
    const geneTestData = await fetchData('nanbyodata_get_gene_test');
    const hpoData = await fetchData('nanbyodata_get_hpo_data_by_nando_id');
    const cellData = await fetchData(
      'nanbyodata_get_riken_brc_cell_info_by_nando_id'
    );
    const mouseData = await fetchData(
      'nanbyodata_get_riken_brc_mouse_info_by_nando_id'
    );
    const dnaData = await fetchData(
      'nanbyodata_get_riken_brc_dna_info_by_nando_id'
    );
    const clinvarData = await fetchData('nanbyodata_get_variant_by_nando_id');
    // TODO: add mgend data
    // const mgendData = await fetchData('');
    const mgendData = [];

    // download datasets
    const datasets = [
      { name: 'Overview', data: entryData },
      { name: 'Causal Genes', data: geneData },
      { name: 'Genetic Testing', data: geneTestData },
      { name: 'Phenotypes', data: hpoData },
      { name: 'Cell', data: cellData },
      { name: 'Mouse', data: mouseData },
      { name: 'DNA', data: dnaData },
      { name: 'Clinvar', data: clinvarData },
    ];

    // downloadDatasets(nandoId, datasets);

    await Promise.all([
      makeHeader(entryData),
      makeExternalLinks(entryData),
      makeAlternativeName(entryData),
      makeInheritanceUris(entryData),
      makeLinksList(entryData),
      checkSummaryData(entryData),
      checkInitialLanguage(),
      makeDiseaseDefinition(entryData),
      makeProperties(geneData),
      makeMedicalGeneticTestingInfo(geneTestData),
      changeLangHP(),
      makePhenotypeView(hpoData),
      makeSpecificBioResource(cellData, mouseData, dnaData),
      makeVariant(clinvarData, mgendData, entryData),
    ]);

    selectedItem();

    if (window.location.hash) {
      const hash = window.location.hash;
      const hashId = hash.replace('#', '');
      switchingDisplayContents(hashId, entryData);
    } else {
      switchingDisplayContents('overview', entryData);
    }
  } catch (error) {
    console.error('error:', error);
  }
})();

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
  labelJa.innerHTML =
    '<ruby>' +
    entryData.label_ja +
    '<rt>' +
    entryData.ruby +
    '</rt>' +
    '</ruby>';

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

  if (entryData.alt_label_ja) {
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
      const a = createLinkElement(item.url || item.uri, prefix + item.id);
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

function makeProperties(geneData) {
  const causativeGene = document.getElementById('causal-genes');
  const properties = causativeGene.querySelector('#temp-properties');
  const data = geneData;

  if (Array.isArray(data) && data.length === 0) {
    causativeGene.remove();
  } else {
    // to avoid hitting api twice Use createObjectURL
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    const objectUrl = URL.createObjectURL(blob);
    properties.innerHTML = `
      <togostanza-pagination-table
      data-url="${objectUrl}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;gene_symbol&quot;,&quot;label&quot;:&quot;Gene symbol&quot;,&quot;link&quot;:&quot;omim_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;ncbi_id&quot;,&quot;label&quot;:&quot;NCBI gene ID&quot;,&quot;link&quot;:&quot;ncbi_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;nando_label_e&quot;,&quot;label&quot;:&quot;NANDO disease label&quot;,&quot;link&quot;:&quot;nando_ida&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;mondo_label&quot;,&quot;label&quot;:&quot;Mondo disease label&quot;,&quot;link&quot;:&quot;mondo_url&quot;,&quot;target&quot;:&quot;_blank&quot;}]
      "
      ></togostanza-pagination-table>
      `;

    const tempSpanElement = document.querySelector('#causal-genes .data-num');
    const navSpanElement = document.querySelector('.causal-genes .data-num');
    tempSpanElement.innerText = data.length;
    navSpanElement.innerText = data.length;
  }
}

function checkSummaryData(entryData) {
  const items = [
    '.causal-genes',
    '.genetic-testing',
    '.phenotypes',
    '.brc',
    '.variant',
  ];
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
      for (const item of items) {
        const cleanedItem = item.replace(/^\./, '');
        const element = document.querySelector(item);
        if (element) {
          switchingDisplayContents(cleanedItem, entryData);
          break;
        }
      }
      if (diseaseDefinition) {
        summaryNav.style = 'display: block;';
        navBorderTop.style = 'border-top: block;';
      }
    }
  }
}

function checkInitialLanguage() {
  const selectLang = document.querySelector('.language-select');
  selectLang.addEventListener('change', changeLangHP);
}

function changeLangHP() {
  const selectedValue = document.querySelector('.language-select').value;
  const phenotypeViewJa = document.querySelector('.phenotype-ja');
  const phenotypeViewEn = document.querySelector('.phenotype-en');
  if (selectedValue === 'ja') {
    phenotypeViewJa.style.display = 'block';
    phenotypeViewEn.style.display = 'none';
  } else {
    phenotypeViewJa.style.display = 'none';
    phenotypeViewEn.style.display = 'block';
  }
}

function makeDiseaseDefinition(entryData) {
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const tabWrap = diseaseDefinition.querySelector(
    '#temp-disease-definition .tab-wrap'
  );

  const items = [
    {
      class: 'mhlw',
      existing: !!entryData.description,
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

function makeMedicalGeneticTestingInfo(geneTestData) {
  const medicalGeneticTestingInfo = document.getElementById('genetic-testing');
  const inspectionView =
    medicalGeneticTestingInfo.querySelector('.inspection-view');
  const data = geneTestData;

  if (Array.isArray(data) && data.length === 0) {
    medicalGeneticTestingInfo.remove();
  } else {
    // to avoid hitting api twice Use createObjectURL
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    const objectUrl = URL.createObjectURL(blob);
    inspectionView.innerHTML = `
      <togostanza-pagination-table
      data-url="${objectUrl}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;label&quot;,&quot;label&quot;:&quot;Test name&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;More information&quot;,&quot;link&quot;:&quot;hp&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;gene&quot;,&quot;label&quot;:&quot;Gene name&quot;},{&quot;id&quot;:&quot;facility&quot;,&quot;label&quot;:&quot;Test facility&quot;}]
      "
      ></togostanza-pagination-table>
      `;

    const tempSpanElement = document.querySelector(
      '#genetic-testing .data-num'
    );
    const navSpanElement = document.querySelector('.genetic-testing .data-num');
    tempSpanElement.innerText = data.length;
    navSpanElement.innerText = data.length;
  }
}

function makePhenotypeView(hpoData) {
  const tempPhenotypeView = document.getElementById('phenotypes');
  const phenotypeViewJa = tempPhenotypeView.querySelector('.phenotype-ja');
  const phenotypeViewEn = tempPhenotypeView.querySelector('.phenotype-en');
  const data = hpoData;

  if (Array.isArray(data) && data.length === 0) {
    tempPhenotypeView.remove();
  } else {
    // to avoid hitting api twice Use createObjectURL
    const blob = new Blob([JSON.stringify(data)], {
      type: 'application/json',
    });
    const objectUrl = URL.createObjectURL(blob);

    // lang ja
    phenotypeViewJa.innerHTML = `
      <togostanza-pagination-table
      data-url="${objectUrl}"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      data-type="json"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;hpo_label_ja&quot;,&quot;label&quot;:&quot;Symptom (JA)&quot;},{&quot;id&quot;:&quot;hpo_label_en&quot;,&quot;label&quot;:&quot;Symptom (EN)&quot;},{&quot;id&quot;:&quot;hpo_id&quot;,&quot;label&quot;:&quot;HPO ID&quot;,&quot;link&quot;:&quot;hpo_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;hpo_category_name_en&quot;,&quot;label&quot;:&quot;Symptom category&quot;,&quot;link&quot;:&quot;hpo_category&quot;,&quot;target&quot;:&quot;_blank&quot;}]"
      togostanza-custom_css_url=""
        ></togostanza-pagination-table>
        `;

    // lang eng
    phenotypeViewEn.innerHTML = `
      <togostanza-pagination-table
      data-url="${objectUrl}"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      data-type="json"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;hpo_label_en&quot;,&quot;label&quot;:&quot;Symptom&quot;},{&quot;id&quot;:&quot;hpo_id&quot;,&quot;label&quot;:&quot;HPO ID&quot;,&quot;link&quot;:&quot;hpo_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;hpo_category_name_en&quot;,&quot;label&quot;:&quot;Symptom category&quot;,&quot;link&quot;:&quot;hpo_category&quot;,&quot;target&quot;:&quot;_blank&quot;}]"
      togostanza-custom_css_url=""
        ></togostanza-pagination-table>
        `;

    const tempSpanElement = document.querySelector('#phenotypes .data-num');
    const navSpanElement = document.querySelector('.phenotypes .data-num');
    tempSpanElement.innerText = data.length;
    navSpanElement.innerText = data.length;
  }
}

function makeSpecificBioResource(cellData, mouseData, dnaData) {
  const specificBioResource = document.getElementById('brc');
  const tabWrap = specificBioResource.querySelector('.tab-wrap');

  let isCellData = false;
  let isMusData = false;
  let isDnaData = false;

  let cellObject = null;
  if (Array.isArray(cellData) && cellData.length > 0) {
    isCellData = true;
    const blob = new Blob([JSON.stringify(cellData)], {
      type: 'application/json',
    });
    cellObject = URL.createObjectURL(blob);
  }

  let mouseObject = null;
  if (Array.isArray(mouseData) && mouseData.length > 0) {
    isMusData = true;
    const blob = new Blob([JSON.stringify(mouseData)], {
      type: 'application/json',
    });
    mouseObject = URL.createObjectURL(blob);
  }

  let dnaObject = null;
  if (Array.isArray(dnaData) && dnaData.length > 0) {
    isDnaData = true;
    const blob = new Blob([JSON.stringify(dnaData)], {
      type: 'application/json',
    });
    dnaObject = URL.createObjectURL(blob);
  }

  // check existing tab
  function removeNavItemIfNotExist(entryDataProperty, className) {
    if (!entryDataProperty) {
      const navItem = document.querySelector(
        '.brc .' + className + '.nav-link'
      );
      if (navItem) {
        navItem.parentElement.remove();
      }
    }
  }

  removeNavItemIfNotExist(isCellData, 'cell');
  removeNavItemIfNotExist(isMusData, 'mouse');
  removeNavItemIfNotExist(isDnaData, 'dna');

  const items = [
    {
      existing: isCellData,
      id: 'cell',
      url: `https://nanbyodata.jp/sparqlist/api/nanbyodata_get_riken_brc_cell_info_by_nando_id?nando_id=${nandoId}`,
      columns:
        '[{&quot;id&quot;:&quot;ID&quot;,&quot;label&quot;:&quot;Cell No.&quot;},{&quot;id&quot;:&quot;Cell_name&quot;,&quot;label&quot;:&quot;Cell name&quot;},{&quot;id&quot;:&quot;Homepage&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;Homepage&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;Description_e&quot;,&quot;label&quot;:&quot;Description (EN)&quot;},{&quot;id&quot;:&quot;Description_j&quot;,&quot;label&quot;:&quot;Description (JA)&quot;}]',
      data: cellData,
      object: cellObject,
    },
    {
      existing: isMusData,
      id: 'mouse',
      url: `https://nanbyodata.jp/sparqlist/api/nanbyodata_get_riken_brc_mouse_info_by_nando_id?nando_id=${nandoId}`,
      columns:
        '[{&quot;id&quot;:&quot;mouse_id&quot;,&quot;label&quot;:&quot;RIKEN_BRC No.&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;Homepage&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;mouse_name&quot;,&quot;label&quot;:&quot;Strain name&quot;},{&quot;id&quot;:&quot;description&quot;,&quot;label&quot;:&quot;Strain description&quot;}]',
      data: mouseData,
      object: mouseObject,
    },
    {
      existing: isDnaData,
      id: 'dna',
      url: `https://nanbyodata.jp/sparqlist/api/nanbyodata_get_riken_brc_dna_info_by_nando_id?nando_id=${nandoId}`,
      columns:
        '[{&quot;id&quot;:&quot;gene_id&quot;,&quot;label&quot;:&quot;Catalog number&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;hp&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;gene_label&quot;,&quot;label&quot;:&quot;Name&quot;},{&quot;id&quot;:&quot;ncbi_gene&quot;,&quot;label&quot;:&quot;NCBI gene link&quot;,&quot;link&quot;:&quot;ncbi_gene&quot;,&quot;target&quot;:&quot;_blank&quot;}]',
      data: dnaData,
      object: dnaObject,
    },
  ];

  if (items.every((item) => !item.existing)) {
    specificBioResource.remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`bio-resource-${item.id}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      } else {
        const content = tabWrap.querySelector(`.${item.id}`);
        const currentTab = tabWrap.querySelector(`#bio-resource-${item.id}`);
        if (currentTab && isFirstTab) {
          currentTab.checked = true;
          isFirstTab = false;
        }
        content.innerHTML = `
        <togostanza-pagination-table data-type="json"
          data-url="${item.object}"
          columns="${item.columns}"
          custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
          page-size-option="100"
          page-slider="fales">
        </togostanza-pagination-table>
      `;
        const tempSpanElement = document.querySelector(
          `.bio-resource-${item.id} .data-num`
        );
        const navSpanElement = document.querySelector(`.${item.id} .data-num`);
        tempSpanElement.innerText = item.data.length;
        navSpanElement.innerText = item.data.length;
      }
    });
  }
}

function makeVariant(clinvarData, mgendData, entryData) {
  const variant = document.getElementById('variant');
  const tabWrap = variant.querySelector('.tab-wrap');

  let isClinvarData = false;
  let isMgendData = false;

  let clinvarObject = null;
  if (Array.isArray(clinvarData) && clinvarData.length > 0) {
    isClinvarData = true;
    const blob = new Blob([JSON.stringify(clinvarData)], {
      type: 'application/json',
    });
    clinvarObject = URL.createObjectURL(blob);
  }

  let mgendObject = null;
  if (Array.isArray(mgendData) && isMgendData.length > 0) {
    isMgendData = true;
    const blob = new Blob([JSON.stringify(isMgendData)], {
      type: 'application/json',
    });
    mgendObject = URL.createObjectURL(blob);
  }

  // check existing tab
  function removeNavItemIfNotExist(entryDataProperty, className) {
    if (!entryDataProperty) {
      const navItem = document.querySelector(
        '.variant .' + className + '.nav-link'
      );
      if (navItem) {
        navItem.parentElement.remove();
      }
    }
  }

  removeNavItemIfNotExist(isClinvarData, 'clinvar');
  removeNavItemIfNotExist(isMgendData, 'mgend');
  const items = [
    {
      existing: isClinvarData,
      id: 'clinvar',
      url: `https://nanbyodata.jp/sparqlist/api/nanbyodata_get_variant_by_nando_id=${nandoId}`,
      columns:
        '[{&quot;id&quot;:&quot;Clinvar_id&quot;,&quot;label&quot;:&quot;Clinvar_ID&quot;,&quot;link&quot;:&quot;Clinvar_link&quot;,&quot;target&quot;:&quot;_bkank&quot;}, {&quot;id&quot;:&quot;title&quot;,&quot;label&quot;:&quot;HGVS&quot;}, {&quot;id&quot;:&quot;Interpretation&quot;,&quot;label&quot;:&quot;Interpretation&quot;}, {&quot;id&quot;:&quot;type&quot;,&quot;label&quot;:&quot;Variant type&quot;}, {&quot;id&quot;:&quot;position&quot;,&quot;label&quot;:&quot;Chr:Position&quot;}, {&quot;id&quot;:&quot;tgv_id&quot;,&quot;label&quot;:&quot;TogoVar_ID&quot;,&quot;link&quot;:&quot;tgv_link&quot;,&quot;target&quot;:&quot;_blank&quot;} , {&quot;id&quot;:&quot;MedGen_id&quot;,&quot;label&quot;:&quot;MedGen_ID&quot;,&quot;link&quot;:&quot;MedGen_link&quot;,&quot;target&quot;:&quot;_bkank&quot;}, {&quot;id&quot;:&quot;mondo_id&quot;,&quot;label&quot;:&quot;MONDO_ID&quot;,&quot;link&quot;:&quot;mondo&quot;,&quot;target&quot;:&quot;_bkank&quot;}]',
      data: clinvarData,
      object: clinvarObject,
    },
    {
      existing: isMgendData,
      id: 'mgend',
      url: ``,
      columns: '',
      data: mgendData,
      object: mgendObject,
    },
  ];

  if (items.every((item) => !item.existing)) {
    variant.remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`variant-${item.id}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      } else {
        const content = tabWrap.querySelector(`.${item.id}`);
        const currentTab = tabWrap.querySelector(`#variant-${item.id}`);
        if (currentTab && isFirstTab) {
          currentTab.checked = true;
          isFirstTab = false;
        }
        content.innerHTML = `
        <togostanza-pagination-table data-type="json"
          data-url="${item.object}"
          columns="${item.columns}"
          custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
          page-size-option="100"
          page-slider="fales">
        </togostanza-pagination-table>
      `;
        const tempSpanElement = document.querySelector(
          `.variant-${item.id} .data-num`
        );
        const navSpanElement = document.querySelector(`.${item.id} .data-num`);
        tempSpanElement.innerText = item.data.length;
        navSpanElement.innerText = item.data.length;
      }
    });
  }
  makeSideNavigation(entryData);

  // When loading finishes
  document.querySelector('.loading-spinner').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';
}

function makeSideNavigation(entryData) {
  const sideNavigation = document.getElementById('temp-side-navigation');
  const sideNavigationUl = sideNavigation.querySelector('ul');
  const items = [
    'overview',
    'causal-genes',
    'genetic-testing',
    'phenotypes',
    'brc',
    'variant',
  ];
  const lis = sideNavigationUl.querySelectorAll('li');
  lis.forEach((li) => {
    li.addEventListener('click', () => {
      const id = li.querySelector('a').getAttribute('href').replace('#', '');
      switchingDisplayContents(id, entryData);
    });
  });

  items.forEach((id) => {
    const liElement = document.getElementById(id);
    if (!liElement) {
      switch (id) {
        case 'brc':
        case 'variant':
          const elementToRemove = document.querySelector(`.${id}`);
          if (elementToRemove && elementToRemove.parentNode) {
            elementToRemove.parentNode.remove();
          }
          break;
        default:
          const anchorElement = document.querySelector(`[href="#${id}"]`);
          if (anchorElement && anchorElement.parentElement) {
            const liToRemove = anchorElement.parentElement;
            if (liToRemove.parentNode) {
              liToRemove.remove();
            }
          }
          break;
      }
    }
  });

  document.querySelectorAll('a[href="#brc"]').forEach(function (aTag) {
    aTag.addEventListener('click', function (event) {
      document.querySelector('#brc').scrollIntoView({
        behavior: 'smooth',
      });
      event.preventDefault();
      const classList = this.classList[0];
      const selectName = 'bio-resource-' + classList;
      window.location.hash = selectName;
      const checkBox = document.getElementById(selectName);
      if (checkBox && !checkBox.checked) {
        checkBox.checked = true;
      }
    });
  });

  document.querySelectorAll('a[href="#variant"]').forEach(function (aTag) {
    aTag.addEventListener('click', function (event) {
      document.querySelector('#variant').scrollIntoView({
        behavior: 'smooth',
      });
      event.preventDefault();
      const classList = this.classList[0];
      const selectName = 'variant-' + classList;
      window.location.hash = selectName;
      const checkBox = document.getElementById(selectName);
      if (checkBox && !checkBox.checked) {
        checkBox.checked = true;
      }
    });
  });

  // processing when tabs are switched
  document.querySelectorAll('#brc .tab-switch').forEach(function (tabSwitch) {
    tabSwitch.addEventListener('change', function () {
      const selectedTabId = this.id.replace('bio-resource-', '');
      const tocItem = document.querySelector('.brc a.' + selectedTabId);
      document.querySelectorAll('a').forEach(function (item) {
        item.classList.remove('selected');
      });
      if (tocItem) {
        tocItem.classList.add('selected');
        window.location.hash = this.id;
      }
    });
  });

  document
    .querySelectorAll('#variant .tab-switch')
    .forEach(function (tabSwitch) {
      tabSwitch.addEventListener('change', function () {
        const selectedTabId = this.id.replace('variant-', '');
        const tocItem = document.querySelector('.variant a.' + selectedTabId);
        document.querySelectorAll('a').forEach(function (item) {
          item.classList.remove('selected');
        });
        if (tocItem) {
          tocItem.classList.add('selected');
          window.location.hash = this.id;
        }
      });
    });
}

function toggleDisplay(selector, displayStyle = 'none') {
  const element = document.querySelector(selector);
  if (element) element.style.display = displayStyle;
}

function toggleClassForElements(selector, className, condition) {
  document.querySelectorAll(selector).forEach((element) => {
    element.classList.toggle(className, condition(element));
  });
}

function switchingDisplayContents(selectedItemId, entryData) {
  const items = [
    '#overview',
    '#temp-disease-definition',
    '#causal-genes',
    '#genetic-testing',
    '#phenotypes',
    '#brc',
    '#variant',
  ];

  // Hide all elements
  items.forEach((selector) => toggleDisplay(selector));

  // Show selected items
  switch (selectedItemId) {
    case 'overview':
      toggleDisplay('#overview', 'block');
      ['temp-aliases', '.temp-wrapper', '#temp-disease-definition'].forEach(
        (selector) => {
          toggleDisplay(selector, 'block');
        }
      );
      checkSummaryData(entryData);
      break;
    case 'temp-disease-definition':
    case 'causal-genes':
    case 'genetic-testing':
    case 'phenotypes':
      prepareDataWrapper();
      toggleDisplay(`#${selectedItemId}`, 'block');
      toggleClassForElements('a', 'selected', (element) =>
        element.classList.contains(selectedItemId)
      );
      break;
    case 'brc':
    case 'bio-resource-cell':
    case 'bio-resource-mouse':
    case 'bio-resource-dna':
      prepareDataWrapper();
      toggleDisplay('#brc', 'block');
      let checkBoxBrc = document.getElementById(selectedItemId);
      if (checkBoxBrc) checkBoxBrc.checked = true;
      updateBioSelection('#brc .tab-switch:checked');
      break;
    case 'variant':
    case 'variant-clinvar':
    case 'variant-mgend':
      prepareDataWrapper();
      toggleDisplay('#variant', 'block');
      let checkBoxVariant = document.getElementById(selectedItemId);
      if (checkBoxVariant) checkBoxVariant.checked = true;
      updateVariantSelection('#variant .tab-switch:checked');
      break;
    default:
      window.location.href = window.location.href.split('#')[0];
  }
}

function prepareDataWrapper() {
  const dataWrapper = document.getElementById('data-wrapper');
  const summary = document.querySelector('.summary-header');
  if (dataWrapper.firstChild !== summary) {
    dataWrapper.insertBefore(summary, dataWrapper.firstChild);
  }
}

function updateBioSelection(selector) {
  const checkedSwitch = document.querySelector(selector);
  if (checkedSwitch) {
    window.location.hash = checkedSwitch.id;
    const selectedId = checkedSwitch.id.replace('bio-resource-', '');
    toggleClassForElements('a', 'selected', (element) =>
      element.classList.contains(selectedId)
    );
  }
}

function updateVariantSelection(selector) {
  const checkedSwitch = document.querySelector(selector);
  if (checkedSwitch) {
    window.location.hash = checkedSwitch.id;
    const selectedId = checkedSwitch.id.replace('variant-', '');
    toggleClassForElements('a', 'selected', (element) =>
      element.classList.contains(selectedId)
    );
  }
}

function selectedItem() {
  const links = document.querySelectorAll('#temp-side-navigation .nav-link');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((l) => l.classList.remove('selected'));
      link.classList.add('selected');
    });
  });
}
