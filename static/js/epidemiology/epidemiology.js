import {
  designatedIntractableDiseaseJaColumns,
  designatedIntractableDiseaseEnColumns,
  pediatricChronicSpecificDiseaseJaColumns,
  pediatricChronicSpecificDiseaseEnColumns,
  convertColumnToText,
} from '../utils/stanzaColumns.js';

import {
  createObjectUrlFromData,
  updateElementWithTable,
} from '../utils/stanzaUtils.js';

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
    const objectUrl = createObjectUrlFromData(data);
    updateElementWithTable(tableView, objectUrl, convertColumnToText(columns));
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
