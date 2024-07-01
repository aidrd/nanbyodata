import {
  epidemiologyJaColumns,
  epidemiologyEnColumns,
  convertColumntoText,
} from './paginationColumns.js';

export const drawEpidemiologyTable = async () => {
  const tableView = document.querySelector('#epidemiology-table');
  const currentLang = document.querySelector('.language-select').value;
  const epidemiologyColumns =
    currentLang === 'ja' ? epidemiologyJaColumns : epidemiologyEnColumns;

  try {
    const data = await fetchData();
    updateElementWithTable(
      tableView,
      convertColumntoText(epidemiologyColumns),
      data
    );
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

/**
 * Fetches data from the given URL.
 * @returns {Promise<Object>} The fetched data.
 */
async function fetchData() {
  const url = '/sparqlist/api/nanbyodata_get_stats_on_patient_number';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
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
 * Updates the specified HTML element with a table using the provided data and columns.
 * @param {HTMLElement} element - The HTML element to be updated for the table.
 * @param {string} columns - The columns configuration for the table.
 * @param {Object} data - The data to be displayed in the table.
 */
function updateElementWithTable(element, columns, data) {
  // Assuming data is an array of objects, we need to convert it to a format
  // that <togostanza-pagination-table> can understand, if required.
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
