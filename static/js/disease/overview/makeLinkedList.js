import {
  linkedListEnColumns,
  linkedListJaColumns,
} from '../../utils/stanzaColumns.js';

import { createObjectUrlFromData } from '../../utils/stanzaUtils.js';

import { calcTreeLength } from '../../utils/calcTreeDepth.js';

export async function makeLinkedList(linkedListData, nandoId) {
  const linkedItems = document.getElementById('temp-linked-items');
  const overviewSection = linkedItems.closest('.overview-section');
  const tabWrap = linkedItems.querySelector('.tab-wrap');
  const selectGraphType = document.getElementById('linked-items-graph');
  const currentLang = document.querySelector('.language-select').value;

  // linkedListDataが全て空の場合にoverviewSectionを削除
  const hasData = Object.values(linkedListData).some(
    (dataArray) => Array.isArray(dataArray) && dataArray.length > 0
  );
  if (!hasData) {
    overviewSection.remove();
    return;
  }

  let isFirstTab = true;
  const items =
    currentLang === 'ja' ? linkedListJaColumns : linkedListEnColumns;

  for (const item of items) {
    const content = tabWrap.querySelector(`.${item.class}`);
    const exists = makeLinksTable(item, content, linkedListData, nandoId);

    if (!exists) {
      const input = document.getElementById(`linked-item-${item.class}`);
      if (input) {
        const label = input.nextElementSibling;
        if (label) label.remove();
        input.remove();
      }
    } else {
      const currentTab = tabWrap.querySelector(`#linked-item-${item.class}`);

      // 初回のタブをチェック
      if (currentTab && isFirstTab) {
        currentTab.checked = true;
        isFirstTab = false;
        addTableOrTree(content, item, 'table', linkedListData); // 初期表示はテーブル
      }

      // タブのクリックイベントを追加
      currentTab.addEventListener('change', function () {
        if (this.checked) {
          // タブがアクティブになったときにテーブルまたはツリーを表示
          const displayType = selectGraphType.value || 'table'; // 選択された形式に従う
          addTableOrTree(content, item, displayType, linkedListData);
        }
      });

      // セレクトボックス変更時に表示形式を切り替える
      selectGraphType.addEventListener('change', function () {
        const displayType = this.value;
        if (currentTab.checked) {
          addTableOrTree(content, item, displayType, linkedListData);
        }
      });
    }
  }
}

function makeLinksTable(item, content, linkedListData, nandoId) {
  const data = linkedListData[item.class];
  if (!data || data.length === 0) {
    return false;
  }

  const filteredData = data.filter((itemData) => itemData.displayid);

  // 既存のテーブルを削除
  const existingTable = content.querySelector('table');
  if (existingTable) {
    existingTable.style.display = 'none';
  }

  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-contents');

  const table = document.createElement('table');
  table.classList.add('table');

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  item.labels.forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label.label;
    headerRow.appendChild(th);
  });

  const feedbackTh = document.createElement('th');
  feedbackTh.textContent = 'Feedback(*)';
  headerRow.appendChild(feedbackTh);
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  filteredData.forEach((itemData) => {
    const row = document.createElement('tr');
    item.keys.forEach((key) => {
      const cell = document.createElement('td');

      const field = item.labels.find((labelItem) => labelItem.content === key);

      if (field && field.type === 'url' && field.hrefKey) {
        const link = document.createElement('a');
        link.href = itemData[field.hrefKey];
        link.textContent = itemData[key];
        link.target = '_blank';
        cell.appendChild(link);
      } else if (field && field.content === 'property') {
        const propertyValue = itemData[key];
        const matchType = propertyValue.split('#')[1];
        cell.textContent =
          matchType === 'closeMatch'
            ? 'Close Match'
            : matchType === 'exactMatch'
            ? 'Exact Match'
            : propertyValue;
      } else {
        cell.textContent = itemData[key];
      }
      row.appendChild(cell);
    });

    const feedbackCell = document.createElement('td');
    feedbackCell.classList.add('feedback-cell');
    feedbackCell.innerHTML = `
        <a href="#" class="good-icon" title="Good"><i class="far fa-thumbs-up"></i></a>
        <a href="#" class="bad-icon" title="Bad"><i class="far fa-thumbs-down"></i></a>
        <a href="mailto:fujiwara@dbcls.rois.ac.jp?cc=takatter@dbcls.rois.ac.jp,shin@dbcls.rois.ac.jp&subject=Feedback%20on%20NanbyoData&body=NANDO:${nandoId}%20-%20${itemData.displayid}" class="email-icon" title="Send Feedback">
          <i class="far fa-envelope"></i>
        </a>
      `;
    row.appendChild(feedbackCell);

    feedbackCell.querySelector('.good-icon').addEventListener('click', (e) => {
      e.preventDefault();
      sendFeedback('GOOD', `NANDO:${nandoId}`, itemData.displayid);
    });

    feedbackCell.querySelector('.bad-icon').addEventListener('click', (e) => {
      e.preventDefault();
      sendFeedback('BAD', `NANDO:${nandoId}`, itemData.displayid);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  content.prepend(tableWrapper);

  return true;
}

function sendFeedback(type, idFrom, idTo) {
  // TODO: Cannot test locally with a relative link
  const url = `/feedback?id_from=${idFrom}&id_to=${idTo}&type=${type}`;

  fetch(url, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error while sending feedback.');
      }
      alert(`${type} feedback received.`);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error while sending feedback.');
    });
}

function addTableOrTree(content, item, displayType, linkedListData) {
  const currentLang = document.querySelector('.language-select').value;

  const table = content.querySelector('table');
  const tree = content.querySelector('togostanza-tree');
  let feedbackMessage = content.querySelector('p');

  const overviewSection = content.closest('.overview-section');

  if (!feedbackMessage) {
    feedbackMessage = document.createElement('p');
    feedbackMessage.textContent =
      currentLang === 'ja'
        ? '*リンクに関するフィードバックをお待ちしております.'
        : '*We welcome feedback on the links.';
    content.appendChild(feedbackMessage);
  }

  if (displayType === 'table') {
    overviewSection.style.paddingBottom = '0';

    if (table) {
      table.style.display = 'table';
    } else {
      makeLinksTable(item, content, linkedListData, nandoId);
    }

    feedbackMessage.style.display = 'block';

    if (tree) {
      tree.style.display = 'none';
    }
  } else if (displayType === 'tree') {
    overviewSection.style.paddingBottom = '15px';

    if (table) {
      table.style.display = 'none';
    }

    feedbackMessage.style.display = 'none';

    if (tree) {
      tree.style.display = 'block';
    } else {
      const uniqueTreeId = `tree-${item.class}`;
      const objectUrl = createObjectUrlFromData(linkedListData[item.class]);
      const treeDepth = calcTreeLength(linkedListData[item.class]);
      content.innerHTML += `
        <togostanza-tree 
          id="${uniqueTreeId}" 
          data-url="${objectUrl}" 
          data-type="json" 
          sort-key="id" 
          sort-order="ascending" 
          graph-layout="horizontal" 
          node-label-key="id" 
          node-label-margin="8" 
          node-size-key="size" 
          node-size-min="8" 
          node-size-max="8" 
          node-color-key="color" 
          node-color-group="group" 
          node-color-blend="normal" 
          tooltips-key="name"
          togostanza-custom_css_url="">
        </togostanza-tree>
      `;

      setTimeout(() => {
        const scriptElement = document.createElement('script');
        scriptElement.type = 'module';
        scriptElement.src =
          'https://togostanza.github.io/metastanza-devel/tree.js';
        scriptElement.async = true;
        content.appendChild(scriptElement);

        const treeElement = document.getElementById(uniqueTreeId);
        treeElement.style.setProperty(
          '--togostanza-theme-series_0_color',
          '#29697a'
        );
        treeElement.style.setProperty(
          '--togostanza-fonts-font_size_primary',
          '14'
        );
        treeElement.style.setProperty(
          '--togostanza-canvas-height',
          `${treeDepth.maxLength * 100} px`
        );
        treeElement.style.setProperty(
          '--togostanza-canvas-width',
          `${treeDepth.maxDepth * 500} px`
        );
      }, 0);
    }
  }
}
