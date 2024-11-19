import {
  subclassTableEnColumns,
  subclassTableJaColumns,
  convertColumnToText,
} from '../../utils/stanzaColumns.js';

import { createObjectUrlFromData } from '../../utils/stanzaUtils.js';

import { calcTreeLength } from '../../utils/calcTreeDepth.js';

let isTableLoaded = false;
let isTreeLoaded = false;

export async function makeSubClass(data) {
  const targetDiv = document.getElementById('temp-sub-class');
  const chartTypeSelect = document.getElementById('sub-class-graph');
  const currentLang = document.querySelector('.language-select').value;

  // データの確認と処理
  if (!data || data.length <= 1) {
    const overviewSection = targetDiv.closest('.overview-section');
    overviewSection.remove();
    return;
  }

  // データの件数を表示
  const dataNum = document.querySelector('.overview-section .data-num');
  if (dataNum) {
    const count = (data?.length || 0) - 1;
    dataNum.textContent = count >= 0 ? count : 0;
  }

  const objectUrl = createObjectUrlFromData(data);

  // テーブルの初期表示を設定
  if (!isTableLoaded) {
    targetDiv.innerHTML = `
      <div id="tableView">
        <togostanza-pagination-table
          data-url="${objectUrl}"
          data-type="json"
          data-unavailable_message="No data found."
          custom-css-url=""
          width=""
          fixed-columns="1"
          padding="0px"
          page-size-option="100"
          page-slider="false"
          columns='${
            currentLang === 'ja'
              ? convertColumnToText(subclassTableJaColumns)
              : convertColumnToText(subclassTableEnColumns)
          }'
        ></togostanza-pagination-table>
      </div>
      <div id="treeView" style="display: none;"></div>
    `;

    // テーブル用スクリプトを読み込み
    addScript(targetDiv, 'table');
    isTableLoaded = true;
  }

  // チャートタイプが変更されたときに表示を更新
  chartTypeSelect.addEventListener('change', () => {
    const selectedChartType = chartTypeSelect.value;
    toggleDisplay(selectedChartType);
  });

  // 表示を切り替える関数
  function toggleDisplay(chartType) {
    const tableView = document.getElementById('tableView');
    const treeView = document.getElementById('treeView');

    if (chartType === 'table') {
      tableView.style.display = 'block';
      treeView.style.display = 'none';
    } else if (chartType === 'tree') {
      tableView.style.display = 'none';

      // Calc Tree Depth
      const treeDepth = calcTreeLength(data);

      // 初回表示時のみツリーの内容を生成
      if (!isTreeLoaded) {
        treeView.innerHTML = `
          <togostanza-tree
            data-url="${objectUrl}"
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
              --togostanza-canvas-height: ${treeDepth.maxLength * 60}px;
              --togostanza-canvas-width: ${treeDepth.maxDepth * 500}px;
              --togostanza-theme-series_0_color: #29697a;
            "
          ></togostanza-tree>
        `;

        // ツリー用スクリプトを読み込み
        addScript(treeView, 'tree');
        isTreeLoaded = true;
      }

      treeView.style.display = 'block';
    }
  }

  function addScript(target, chartType) {
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    scriptElement.src =
      chartType === 'table'
        ? 'https://togostanza.github.io/metastanza/pagination-table.js'
        : 'https://togostanza.github.io/metastanza-devel/tree.js';
    scriptElement.async = true;
    target.appendChild(scriptElement);
  }

  // 初回表示の設定
  toggleDisplay(chartTypeSelect.value);
}
