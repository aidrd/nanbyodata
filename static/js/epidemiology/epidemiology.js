import {
  designatedIntractableDiseaseJaColumns,
  designatedIntractableDiseaseEnColumns,
  pediatricChronicSpecificDiseaseJaColumns,
  pediatricChronicSpecificDiseaseEnColumns,
  convertColumntoText,
} from '../utils/paginationColumns.js';

export const drawDesignatedIntractableDiseaseColumnsTable = async () => {
  await drawColumnsTable(
    '#designated-intractable-disease-table',
    'ja',
    designatedIntractableDiseaseJaColumns,
    designatedIntractableDiseaseEnColumns,
    designatedIntractableDiseaseFetchData
  );
};

export const drawPediatricChronicSpecificDiseaseColumnsTable = async () => {
  await drawColumnsTable(
    '#pediatric-chronic-specific-disease-table',
    'ja',
    pediatricChronicSpecificDiseaseJaColumns,
    pediatricChronicSpecificDiseaseEnColumns,
    pediatricChronicSpecificDiseaseFetchData
  );
};

const drawColumnsTable = async (
  tableSelector,
  defaultLang,
  jaColumns,
  enColumns,
  fetchDataFunc
) => {
  const tableView = document.querySelector(tableSelector);
  const currentLang =
    document.querySelector('.language-select').value || defaultLang;
  const columns = currentLang === 'ja' ? jaColumns : enColumns;

  try {
    const data = await fetchDataFunc();
    updateElementWithTable(tableView, convertColumntoText(columns), data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

async function designatedIntractableDiseaseFetchData() {
  return await fetchDataFromUrl(
    '/sparqlist/api/nanbyodata_get_stats_on_patient_number_shitei'
  );
}

async function pediatricChronicSpecificDiseaseFetchData() {
  return await fetchDataFromUrl(
    '/sparqlist/api/nanbyodata_get_stats_on_patient_number_shoman'
  );
}

async function fetchDataFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function createObjectUrlFromData(data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

function updateElementWithTable(element, columns, data) {
  const objectUrl = createObjectUrlFromData(data);
  element.innerHTML = `
    <togostanza-pagination-table
      data-url="${objectUrl}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="350"
      page-slider="false"
      columns="${columns}"
    ></togostanza-pagination-table>
  `;
}
