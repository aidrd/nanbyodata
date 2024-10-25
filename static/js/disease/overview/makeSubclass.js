export function makeSubClass(entryData) {
  const targetDiv = document.getElementById('temp-sub-class');
  const chartTypeSelect = document.getElementById('sub-class-graph');
  const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'table';
  if (targetDiv) {
    targetDiv.innerHTML = '';

    if (selectedChartType === 'table') {
      const tableElement = document.createElement(
        'togostanza-pagination-table'
      );
      tableElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/test_get_nandoID?nando_id=${entryData.nando_id}`
      );
      tableElement.setAttribute('data-type', 'json');
      tableElement.setAttribute('data-unavailable_message', 'No data found.');
      tableElement.setAttribute('custom-css-url', '');
      tableElement.setAttribute('width', '');
      tableElement.setAttribute('fixed-columns', '1');
      tableElement.setAttribute('padding', '0px');
      tableElement.setAttribute('page-size-option', '100');
      tableElement.setAttribute('page-slider', 'false');
      tableElement.setAttribute(
        'columns',
        `[{
          "id": "label",
          "label": "Subclass(JA)",
          "escape": false,
          "line-clamp": 2
        },
        {
          "id": "engLabel",
          "label": "Subclass(En)",
          "escape": false,
          "line-clamp": 2
        },
        {
          "id": "id",
          "label": "Notification Number",
          "escape": true,
          "line-clamp": 1,
          "link": "idurl",
          "target": "_blank"
        }]`
      );

      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.src =
        'https://togostanza.github.io/metastanza/pagination-table.js';
      scriptElement.async = true;

      targetDiv.appendChild(tableElement);
      targetDiv.appendChild(scriptElement);
    } else if (selectedChartType === 'tree') {
      const currentLang = document.querySelector('.language-select').value;
      const treeElement = document.createElement('togostanza-tree');
      treeElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/test_get_nandoID?nando_id=${entryData.nando_id}`
      );
      treeElement.setAttribute('data-type', 'json');
      treeElement.setAttribute('sort-key', 'id');
      treeElement.setAttribute('sort-order', 'ascending');
      treeElement.setAttribute('graph-layout', 'horizontal');
      treeElement.setAttribute(
        'node-label-key',
        currentLang === 'ja' ? 'label' : 'engLabel'
      );
      treeElement.setAttribute('node-label-margin', '8');
      treeElement.setAttribute('node-size-key', 'size');
      treeElement.setAttribute('node-size-min', '8');
      treeElement.setAttribute('node-size-max', '8');
      treeElement.setAttribute('node-color-key', 'color');
      treeElement.setAttribute('node-color-group', 'group');
      treeElement.setAttribute('node-color-blend', 'normal');
      treeElement.setAttribute('tooltips-key', 'name');
      treeElement.setAttribute('togostanza-custom_css_url', '');

      treeElement.style.setProperty(
        '--togostanza-fonts-font_size_primary',
        '14'
      );
      treeElement.style.setProperty('--togostanza-canvas-height', '1000px');
      treeElement.style.setProperty('--togostanza-canvas-width', '1000px');

      treeElement.style.setProperty(
        '--togostanza-theme-series_0_color',
        '#29697a'
      );

      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.src =
        'https://togostanza.github.io/metastanza-devel/tree.js';
      scriptElement.async = true;

      targetDiv.appendChild(treeElement);
      targetDiv.appendChild(scriptElement);
    }
  }
}
