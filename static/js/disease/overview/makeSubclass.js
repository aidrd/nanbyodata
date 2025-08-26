import {
  subclassTableEnColumns,
  subclassTableJaColumns,
  convertColumnToText,
} from '../../utils/stanzaColumns.js';

import { createObjectUrlFromData } from '../../utils/stanzaUtils.js';

import { calcTreeLength } from '../../utils/calcTreeDepth.js';

export async function makeSubClass(data) {
  const targetDiv = document.getElementById('temp-sub-class');
  const chartTypeSelect = document.getElementById('sub-class-graph');
  const currentLang = document.querySelector('.language-select').value;

  // parentが設定されていないデータを除外するためのフィルタリング
  const filteredDataForTable = data.filter((item) => item.parent !== undefined);

  // objectUrlをそれぞれ作成
  const tableObjectUrl = createObjectUrlFromData(filteredDataForTable);
  const treeObjectUrl = createObjectUrlFromData(data);

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

  // 初期表示用のHTMLを設定
  targetDiv.innerHTML = `
    <div id="tableView" style="display: none;">
      <togostanza-pagination-table
        data-url="${tableObjectUrl}"
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
    <div id="treeView" style="display: block;">
    </div>
  `;

  // 初期表示をツリーに設定
  setTimeout(() => {
    toggleDisplay('tree');
  }, 500);

  // チャートタイプが変更されたときに表示を更新
  chartTypeSelect.addEventListener('change', () => {
    const selectedChartType = chartTypeSelect.value;
    toggleDisplay(selectedChartType);
  });

  // URLハッシュ変更時にツリーを再レンダリング
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;

    // ツリーが選択されている場合のみ再レンダリング
    if (chartTypeSelect.value === 'tree' && hash === '#overview') {
      toggleDisplay('tree');
    }
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

      // データの存在チェックを追加
      if (!data || !Array.isArray(data)) {
        console.warn('Tree data not available');
        treeView.innerHTML = '<p>データが利用できません</p>';
        treeView.style.display = 'block';
        return;
      }

      // データを元にツリーの深さを計算
      const treeDepth = calcTreeLength(data);

      // ツリーの内容を毎回生成
      treeView.innerHTML = `
        <togostanza-tree
          data-url="${treeObjectUrl}"
          data-type="json"
          layout-orientation="horizontal"
          node-label_key="${currentLang === 'ja' ? 'label' : 'engLabel'}"
          node-label_margin="8"
          node-size_key="size"
          node-size_min="8"
          node-size_max="8"
          node-color_key="color"
          group-key="group"
          node-color_blend="normal"
          tooltip="{{#if idurl}}&lt;a href&#x3D;{{idurl}}&gt;{{id}}&lt;/a&gt;{{else}}&lt;span&gt;{{id}}&lt;/span&gt;{{/if}}"
          togostanza-custom_css_url=""
          style="
            --togostanza-fonts-font_size_default: 14;
            --togostanza-canvas-height: ${treeDepth.maxLength * 60}px;
            --togostanza-canvas-width: ${treeDepth.maxDepth * 500}px;
            --togostanza-theme-series_0_color: #29697a;
          "
        ></togostanza-tree>
      `;

      // ツリー用スクリプトを読み込み
      addScript(treeView, 'tree');
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
}
