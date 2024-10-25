export function makeSubClass(entryData) {
  const targetDiv = document.getElementById('temp-sub-class');
  const chartTypeSelect = document.getElementById('sub-class-graph');
  const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'table';

  if (targetDiv) {
    targetDiv.innerHTML = '';

    if (selectedChartType === 'table') {
      targetDiv.innerHTML = `
        <togostanza-pagination-table
          data-url="https://dev-nanbyodata.dbcls.jp/sparqlist/api/test_get_nandoID?nando_id=${entryData.nando_id}"
          data-type="json"
          data-unavailable_message="No data found."
          custom-css-url=""
          width=""
          fixed-columns="1"
          padding="0px"
          page-size-option="100"
          page-slider="false"
          columns='[{
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
          }]'
        ></togostanza-pagination-table>
      `;

      // script を動的に追加
      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.src =
        'https://togostanza.github.io/metastanza/pagination-table.js';
      scriptElement.async = true;
      targetDiv.appendChild(scriptElement);
    } else if (selectedChartType === 'tree') {
      const currentLang = document.querySelector('.language-select').value;
      targetDiv.innerHTML = `
        <togostanza-tree
          data-url="https://dev-nanbyodata.dbcls.jp/sparqlist/api/test_get_nandoID?nando_id=${
            entryData.nando_id
          }"
          data-type="json"
          sort-key="id"
          sort-order="ascending"
          graph-layout="horizontal"
          node-label-key="${currentLang === 'ja' ? 'label' : 'engLabel'}"
          node-label-margin="8"
          node-size-key="size"
          node-size-min="8"
          node-size-max="8"
          node-color-key="color"
          node-color-group="group"
          node-color-blend="normal"
          tooltips-key="name"
          togostanza-custom_css_url=""
          style="
            --togostanza-fonts-font_size_primary: 14;
            --togostanza-canvas-height: 1000px;
            --togostanza-canvas-width: 1000px;
            --togostanza-theme-series_0_color: #29697a;
          "
        ></togostanza-tree>
      `;

      // script を動的に追加
      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.src =
        'https://togostanza.github.io/metastanza-devel/tree.js';
      scriptElement.async = true;
      targetDiv.appendChild(scriptElement);
    }
  }
}
