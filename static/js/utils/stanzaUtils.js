/**
 * Creates an object URL from the provided data.
 * @param {Array} data - The data to be converted to JSON.
 * @returns {string} - The object URL created from the data.
 */
export function createObjectUrlFromData(data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

/**
 * Updates the specified HTML element with a table using the provided object URL and columns.
 * @param {HTMLElement} element - The HTML element to be updated for the table.
 * @param {string} objectUrl - The object URL containing the data for the table.
 * @param {string} columns - The columns configuration for the table.
 */

// TODO: togostanza-themesのファイルで以下の内容を上書きする custom-css-urlを指定する
export function updateElementWithTable(element, objectUrl, columns) {
  element.innerHTML = `
    <togostanza-pagination-table
      data-url="${objectUrl}"
      data-type="json"
      custom-css-url="https://gstein314.github.io/sample_api/test-vertical-align-top.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="${columns}"
    ></togostanza-pagination-table>
  `;
}
