import { makeSideNavigation } from './diseaseSideNavigation.js';

// causalGene(疾患原因遺伝子)
export function makeCausalGene(causalGeneData) {
  const columns = `[{&quot;id&quot;:&quot;gene_symbol&quot;,&quot;label&quot;:&quot;Gene symbol&quot;,&quot;link&quot;:&quot;omim_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;ncbi_id&quot;,&quot;label&quot;:&quot;NCBI gene ID&quot;,&quot;link&quot;:&quot;ncbi_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;nando_label_e&quot;,&quot;label&quot;:&quot;NANDO disease label&quot;,&quot;link&quot;:&quot;nando_ida&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;mondo_label&quot;,&quot;label&quot;:&quot;Mondo disease label&quot;,&quot;link&quot;:&quot;mondo_url&quot;,&quot;target&quot;:&quot;_blank&quot;}]`;
  makeData(causalGeneData, 'causal-genes', 'causal-genes-table', columns);
}

// geneticTesting(診療用遺伝学的検査情報)
export function makeGeneticTesting(geneticTestingData) {
  const columns = `[{&quot;id&quot;:&quot;label&quot;,&quot;label&quot;:&quot;Test name&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;More information&quot;,&quot;link&quot;:&quot;hp&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;gene&quot;,&quot;label&quot;:&quot;Gene name&quot;},{&quot;id&quot;:&quot;facility&quot;,&quot;label&quot;:&quot;Test facility&quot;}]`;
  makeData(
    geneticTestingData,
    'genetic-testing',
    'genetic-testing-table',
    columns
  );
}

// phenotypes(臨床的特徴)
export function makePhenotypes(phenotypesData) {
  const currentLang = document.querySelector('.language-select').value;
  const phenotypeLang = currentLang === 'ja' ? 'phenotype-ja' : 'phenotype-en';
  const columns = {
    ja: '[{&quot;id&quot;:&quot;hpo_label_ja&quot;,&quot;label&quot;:&quot;Symptom (JA)&quot;},{&quot;id&quot;:&quot;hpo_label_en&quot;,&quot;label&quot;:&quot;Symptom (EN)&quot;},{&quot;id&quot;:&quot;hpo_id&quot;,&quot;label&quot;:&quot;HPO ID&quot;,&quot;link&quot;:&quot;hpo_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;hpo_category_name_en&quot;,&quot;label&quot;:&quot;Symptom category&quot;,&quot;link&quot;:&quot;hpo_category&quot;,&quot;target&quot;:&quot;_blank&quot;}]',
    en: '[{&quot;id&quot;:&quot;hpo_label_en&quot;,&quot;label&quot;:&quot;Symptom&quot;},{&quot;id&quot;:&quot;hpo_id&quot;,&quot;label&quot;:&quot;HPO ID&quot;,&quot;link&quot;:&quot;hpo_url&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;hpo_category_name_en&quot;,&quot;label&quot;:&quot;Symptom category&quot;,&quot;link&quot;:&quot;hpo_category&quot;,&quot;target&quot;:&quot;_blank&quot;}]',
  };
  makeData(phenotypesData, 'phenotypes', phenotypeLang, columns[currentLang]);
}

// bioResource(難病特異的バイオリソース)
export function makeBioResource(cellData, mouseData, dnaData) {
  const bioResource = document.getElementById('bio-resource');
  const tabWrap = bioResource.querySelector('.tab-wrap');

  const cellDataset = processDataAndRemoveNavItems(
    'bio-resource',
    cellData,
    'cell'
  );
  const mouseDataset = processDataAndRemoveNavItems(
    'bio-resource',
    mouseData,
    'mouse'
  );
  const dnaDataset = processDataAndRemoveNavItems(
    'bio-resource',
    dnaData,
    'dna'
  );

  const items = [
    {
      existing: cellDataset.hasData,
      id: 'cell',
      columns:
        '[{&quot;id&quot;:&quot;ID&quot;,&quot;label&quot;:&quot;Cell No.&quot;},{&quot;id&quot;:&quot;Cell_name&quot;,&quot;label&quot;:&quot;Cell name&quot;},{&quot;id&quot;:&quot;Homepage&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;Homepage&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;Description_e&quot;,&quot;label&quot;:&quot;Description (EN)&quot;},{&quot;id&quot;:&quot;Description_j&quot;,&quot;label&quot;:&quot;Description (JA)&quot;}]',
      data: cellData,
      object: cellDataset.dataObject,
    },
    {
      existing: mouseDataset.hasData,
      id: 'mouse',
      columns:
        '[{&quot;id&quot;:&quot;mouse_id&quot;,&quot;label&quot;:&quot;RIKEN_BRC No.&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;Homepage&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;mouse_name&quot;,&quot;label&quot;:&quot;Strain name&quot;},{&quot;id&quot;:&quot;description&quot;,&quot;label&quot;:&quot;Strain description&quot;}]',
      data: mouseData,
      object: mouseDataset.dataObject,
    },
    {
      existing: dnaDataset.hasData,
      id: 'dna',
      columns:
        '[{&quot;id&quot;:&quot;gene_id&quot;,&quot;label&quot;:&quot;Catalog number&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;hp&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;gene_label&quot;,&quot;label&quot;:&quot;Name&quot;},{&quot;id&quot;:&quot;ncbi_gene&quot;,&quot;label&quot;:&quot;NCBI gene link&quot;,&quot;link&quot;:&quot;ncbi_gene&quot;,&quot;target&quot;:&quot;_blank&quot;}]',
      data: dnaData,
      object: dnaDataset.dataObject,
    },
  ];

  processTabs(items, 'bio-resource', tabWrap);
}

// variant(バリアント)
export function makeVariant(clinvarData, mgendData, entryData) {
  const variant = document.getElementById('variant');
  const tabWrap = variant.querySelector('.tab-wrap');

  const clinvarDataset = processDataAndRemoveNavItems(
    'variant',
    clinvarData,
    'clinvar'
  );
  const mgendDataset = processDataAndRemoveNavItems(
    'variant',
    mgendData,
    'mgend'
  );

  const items = [
    {
      existing: clinvarDataset.hasData,
      id: 'clinvar',
      columns:
        '[{&quot;id&quot;:&quot;Clinvar_id&quot;,&quot;label&quot;:&quot;Clinvar_ID&quot;,&quot;link&quot;:&quot;Clinvar_link&quot;,&quot;target&quot;:&quot;_bkank&quot;}, {&quot;id&quot;:&quot;title&quot;,&quot;label&quot;:&quot;HGVS&quot;}, {&quot;id&quot;:&quot;Interpretation&quot;,&quot;label&quot;:&quot;Interpretation&quot;}, {&quot;id&quot;:&quot;type&quot;,&quot;label&quot;:&quot;Variant type&quot;}, {&quot;id&quot;:&quot;position&quot;,&quot;label&quot;:&quot;Chr:Position&quot;}, {&quot;id&quot;:&quot;tgv_id&quot;,&quot;label&quot;:&quot;TogoVar_ID&quot;,&quot;link&quot;:&quot;tgv_link&quot;,&quot;target&quot;:&quot;_blank&quot;} , {&quot;id&quot;:&quot;MedGen_id&quot;,&quot;label&quot;:&quot;MedGen_ID&quot;,&quot;link&quot;:&quot;MedGen_link&quot;,&quot;target&quot;:&quot;_bkank&quot;}, {&quot;id&quot;:&quot;mondo_id&quot;,&quot;label&quot;:&quot;MONDO_ID&quot;,&quot;link&quot;:&quot;mondo&quot;,&quot;target&quot;:&quot;_bkank&quot;}]',
      data: clinvarData,
      object: clinvarDataset.dataObject,
    },
    {
      existing: mgendDataset.hasData,
      id: 'mgend',
      columns: '',
      data: mgendData,
      object: mgendDataset.dataObject,
    },
  ];

  processTabs(items, 'variant', tabWrap);

  makeSideNavigation(entryData);
  // finish loading
  document.querySelector('.loading-spinner').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.getElementById('sidebar').style.display = 'block';
}

/**
 * Generates and updates data table for causalGene, geneticTesting and phenotypes.
 * @param {Array} data - Data from API (e.g., causalGeneData, geneticTestingData, phenotypesData).
 * @param {string} categoryName - Category name (e.g., 'causal-genes', 'genetic-testing', 'phenotypes').
 * @param {string} tableId - Table element ID (e.g., 'causal-genes-table', 'genetic-testing-table', 'phenotype-ja', 'phenotype-en').
 * @param {string} columns - Columns for togostanza-pagination-table.
 */
function makeData(data, categoryName, tableId, columns) {
  const container = document.getElementById(categoryName);
  if (Array.isArray(data) && data.length === 0) {
    container.remove();
    return;
  }
  const tableView = container.querySelector(`#${tableId}`);
  const objectUrl = createObjectUrlFromData(data);
  updateElementWithTable(tableView, objectUrl, columns);
  updateDataNumElement(`#${categoryName}`, `.${categoryName}`, data.length);
}

/**
 * Creates an object URL from the provided data.
 * @param {Array} data - The data to be converted to JSON.
 * @returns {string} - The object URL created from the data.
 */
function createObjectUrlFromData(data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * Updates the specified HTML element with a table using the provided object URL and columns.
 * @param {HTMLElement} element - The HTML element to be updated for the table.
 * @param {string} objectUrl - The object URL containing the data for the table.
 * @param {string} columns - The columns configuration for the table.
 */
function updateElementWithTable(element, objectUrl, columns) {
  element.innerHTML = `
    <togostanza-pagination-table
      data-url="${objectUrl}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="${columns}"
    ></togostanza-pagination-table>
  `;
}

/**
 * Updates the data number element with the provided data length in both the main content area and the navigation area.
 * @param {string} mainWrapperName - The name of the main wrapper element.
 * @param {string} navWrapperName - The name of the navigation wrapper element.
 * @param {number} dataLength - The length of the data.
 */
function updateDataNumElement(mainWrapperName, navWrapperName, dataLength) {
  const mainContentNumberEl = document.querySelector(
    `${mainWrapperName} .data-num`
  );
  const navContentNumberEl = document.querySelector(
    `${navWrapperName} .data-num`
  );
  mainContentNumberEl.innerText = dataLength;
  navContentNumberEl.innerText = dataLength;
}

// for BioResource & Variant
/**
 * Processes tabs for BioResource & Variant.
 * @param {Object[]} items - Array of tab items.
 * @param {string} rootId - ID of the root element.
 * @param {HTMLElement} tabWrap - The tab wrapper element.
 */
function processTabs(items, rootId, tabWrap) {
  if (!items.some((item) => item.existing)) {
    // If all tabs do not exist, remove the element
    document.getElementById(rootId).remove();
  } else {
    let isFirstTab = true;
    items.forEach(({ existing, id, columns, data, object }) => {
      if (!existing) {
        // If there is no data, remove the input, label, and div
        document.getElementById(`${rootId}-${id}`).remove();
        tabWrap.querySelector(`label.tab-label.${rootId}-${id}`).remove();
        tabWrap.querySelector(`.tab-content.${id}`).remove();
      } else {
        const tableView = tabWrap.querySelector(`.${id}`);
        const currentTab = tabWrap.querySelector(`#${rootId}-${id}`);
        if (currentTab && isFirstTab) {
          currentTab.checked = true;
          isFirstTab = false;
        }
        updateElementWithTable(tableView, object, columns);
        updateDataNumElement(`.${rootId}-${id}`, `.${id}`, data.length);
      }
    });
  }
}

/**
 * Processes the provided data and removes navigation items if the data does not exist.
 * @param {string} rootId - The root ID of the elements.
 * @param {Array} data - The data to be processed.
 * @param {string} className - The class name of the navigation item.
 * @returns {Object} - An object containing information about the processed data.
 */
function processDataAndRemoveNavItems(rootId, data, className) {
  const processDataResult = processData(data);
  removeNavItemIfNotExist(rootId, processDataResult.hasData, className);
  return processDataResult;
}
/**
 * Processes the provided data and checks if it exists.
 * @param {Array} data - The data to be processed.
 * @returns {Object} - An object containing information about the processed data.
 */
function processData(data) {
  let hasData = false;
  let dataObject = null;
  if (Array.isArray(data) && data.length > 0) {
    hasData = true;
    dataObject = createObjectUrlFromData(data);
  }
  return { hasData, dataObject };
}
/**
 * Removes the navigation item if the provided data does not exist.
 * @param {string} rootId - The root ID of the elements.
 * @param {boolean} hasData - Indicates whether the data exists.
 * @param {string} className - The class name of the navigation item.
 */
function removeNavItemIfNotExist(rootId, hasData, className) {
  if (!hasData) {
    const navItem = document.querySelector(`.${rootId} .${className}.nav-link`);
    if (navItem) {
      navItem.parentElement.remove();
    }
  }
}
