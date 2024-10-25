import { makeSideNavigation } from './diseaseSideNavigation.js';
import {
  causalGeneColumns,
  geneticTestingColumns,
  phenotypesJaColumns,
  phenotypesEnColumns,
  bioResourceCellColumns,
  bioResourceMouseColumns,
  bioResourceDnaColumns,
  variantClinvarColumns,
  variantMgendColumns,
  convertColumntoText,
} from '../utils/paginationColumns.js';

makeSideNavigation();

// causalGene(疾患原因遺伝子)
export function makeCausalGene(causalGeneData) {
  makeData(
    causalGeneData,
    'causal-genes',
    'causal-genes-table',
    convertColumntoText(causalGeneColumns)
  );
  if (causalGeneData?.length > 0 && causalGeneData !== null) {
    const navLink = document.querySelector('.nav-link.causal-genes');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
}

// geneticTesting(診療用遺伝学的検査情報)
export function makeGeneticTesting(geneticTestingData) {
  makeData(
    geneticTestingData,
    'genetic-testing',
    'genetic-testing-table',
    convertColumntoText(geneticTestingColumns)
  );
  if (geneticTestingData?.length > 0 && geneticTestingData !== null) {
    const navLink = document.querySelector('.nav-link.genetic-testing');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
}

// phenotypes(臨床的特徴)
export function makePhenotypes(phenotypesData) {
  const currentLang = document.querySelector('.language-select').value;
  const phenotypeLang = currentLang === 'ja' ? 'phenotype-ja' : 'phenotype-en';
  const columns = {
    ja: convertColumntoText(phenotypesJaColumns),
    en: convertColumntoText(phenotypesEnColumns),
  };
  makeData(phenotypesData, 'phenotypes', phenotypeLang, columns[currentLang]);
  if (phenotypesData?.length > 0 && phenotypesData !== null) {
    const navLink = document.querySelector('.nav-link.phenotypes');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
}

// bioResource(難病特異的バイオリソース)
// Cell
export function makeCell(cellData) {
  const bioResource = document.getElementById('bio-resource');
  const tabWrap = bioResource.querySelector('.tab-wrap');

  const cellDataset = processData(cellData);

  const items = {
    id: 'cell',
    columns: convertColumntoText(bioResourceCellColumns),
    data: cellData,
    object: cellDataset.dataObject,
  };

  processTabs(items, 'bio-resource', tabWrap);
  if (cellData?.length > 0 && cellData !== null) {
    const navLink = document.querySelector('.nav-link.cell');
    const bioResource = document.querySelector('.bio-resource');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
    bioResource.classList.remove('-disabled');
  } else {
    document.querySelector('#bio-resource-cell').remove();
    document.querySelector('.tab-label.bio-resource-cell').remove();
    document.querySelector('.tab-content.cell').remove();
  }
}

// Mouse
export function makeMouse(mouseData) {
  const bioResource = document.getElementById('bio-resource');
  const tabWrap = bioResource.querySelector('.tab-wrap');

  const mouseDataset = processData(mouseData);

  const items = {
    id: 'mouse',
    columns: convertColumntoText(bioResourceMouseColumns),
    data: mouseData,
    object: mouseDataset.dataObject,
  };

  processTabs(items, 'bio-resource', tabWrap);
  if (mouseData?.length > 0 && mouseData !== null) {
    const navLink = document.querySelector('.nav-link.mouse');
    const bioResource = document.querySelector('.bio-resource');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
    bioResource.classList.remove('-disabled');
  } else {
    document.querySelector('#bio-resource-mouse').remove();
    document.querySelector('.tab-label.bio-resource-mouse').remove();
    document.querySelector('.tab-content.mouse').remove();
  }
}

// DNA
export function makeDNA(dnaData) {
  const bioResource = document.getElementById('bio-resource');
  const tabWrap = bioResource.querySelector('.tab-wrap');

  const dnaDataset = processData(dnaData);

  const items = {
    id: 'dna',
    columns: convertColumntoText(bioResourceDnaColumns),
    data: dnaData,
    object: dnaDataset.dataObject,
  };

  processTabs(items, 'bio-resource', tabWrap);
  if (dnaData?.length > 0 && dnaData !== null) {
    const navLink = document.querySelector('.nav-link.dna');
    const bioResource = document.querySelector('.bio-resource');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
    bioResource.classList.remove('-disabled');
  } else {
    document.querySelector('#bio-resource-dna').remove();
    document.querySelector('.tab-label.bio-resource-dna').remove();
    document.querySelector('.tab-content.dna').remove();
  }
}

// variant(バリアント)
// Clinvar
export function makeClinvar(clinvarData) {
  const variant = document.getElementById('variant');
  const tabWrap = variant.querySelector('.tab-wrap');

  const clinvarDataset = processData(clinvarData);

  const items = {
    id: 'clinvar',
    columns: convertColumntoText(variantClinvarColumns),
    data: clinvarData,
    object: clinvarDataset.dataObject,
  };

  processTabs(items, 'variant', tabWrap);
  if (clinvarData?.length > 0 && clinvarData !== null) {
    const navLink = document.querySelector('.nav-link.clinvar');
    const variant = document.querySelector('.variant');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
    variant.classList.remove('-disabled');
  } else {
    document.querySelector('#variant-clinvar').remove();
    document.querySelector('.tab-label.variant-clinvar').remove();
    document.querySelector('.tab-content.clinvar').remove();
  }
}

// Mgend
export function makeMgend(mgendData) {
  const variant = document.getElementById('variant');
  const tabWrap = variant.querySelector('.tab-wrap');

  const mgendDataset = processData(mgendData);

  const items = {
    id: 'mgend',
    columns: convertColumntoText(variantMgendColumns),
    data: mgendData,
    object: mgendDataset.dataObject,
  };

  processTabs(items, 'variant', tabWrap);
  if (mgendData?.length > 0 && mgendData !== null) {
    const navLink = document.querySelector('.nav-link.mgend');
    const variant = document.querySelector('.variant');
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
    variant.classList.remove('-disabled');
  } else {
    document.querySelector('#variant-mgend').remove();
    document.querySelector('.tab-label.variant-mgend').remove();
    document.querySelector('.tab-content.mgend').remove();
  }
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
  const tableView = container.querySelector(`#${tableId}`);
  const objectUrl = createObjectUrlFromData(data);
  updateElementWithTable(tableView, objectUrl, columns);
  updateDataNumElement(
    `#${categoryName}`,
    `.${categoryName}`,
    data === null ? 'error' : data.length
  );

  const links = document.querySelectorAll('#temp-side-navigation .nav-link');
  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (!link.classList.contains('-disabled')) {
        links.forEach((l) => l.classList.remove('selected'));
        link.classList.add('selected');
      }
    });
  });
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
  const navLoadingSpinner = document.querySelector(
    `${navWrapperName} .loading-spinner`
  );
  if (navLoadingSpinner) navLoadingSpinner.style.display = 'none';
  if (mainContentNumberEl) mainContentNumberEl.innerText = dataLength;
  if (navContentNumberEl) navContentNumberEl.innerText = dataLength;
}

// for BioResource & Variant
/**
 * Processes tabs for BioResource & Variant.
 * @param {Object[]} items - Array of tab items.
 * @param {string} rootId - ID of the root element.
 * @param {HTMLElement} tabWrap - The tab wrapper element.
 */
function processTabs(items, rootId, tabWrap) {
  // Ensure items is always an array
  if (!Array.isArray(items)) {
    items = [items];
  }

  items.forEach(({ id, columns, data, object }) => {
    const tableView = tabWrap.querySelector(`.${id}`);
    const currentTab = tabWrap.querySelector(`#${rootId}-${id}`);
    if (object !== null) {
      updateElementWithTable(tableView, object, columns);
    }
    updateDataNumElement(
      `.${rootId}-${id}`,
      `.${id}`,
      data === null ? 'error' : data.length
    );
  });
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
