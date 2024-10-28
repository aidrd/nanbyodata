import {
  linkedListEnColumns,
  linkedListJaColumns,
} from '../../utils/stanzaColumns.js';

export async function makeLinkedList(entryData, linkedListData) {
  const linkedItems = document.getElementById('temp-linked-items');
  const tabWrap = linkedItems.querySelector('.tab-wrap');
  const selectGraphType = document.getElementById('linked-items-graph');
  const currentLang = document.querySelector('.language-select').value;

  let isFirstTab = true;

  const items =
    currentLang === 'ja' ? linkedListJaColumns : linkedListEnColumns;
  for (const item of items) {
    const content = tabWrap.querySelector(`.${item.class}`);
    const exists = makeLinksTable(item, content, linkedListData);

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
        addTableOrTree(content, item, 'table', entryData); // 初期表示はテーブル
      }

      // タブのクリックイベントを追加
      currentTab.addEventListener('change', function () {
        if (this.checked) {
          // タブがアクティブになったときにテーブルまたはツリーを表示
          const displayType = selectGraphType.value || 'table'; // 選択された形式に従う
          addTableOrTree(content, item, displayType, entryData);
        }
      });

      // セレクトボックス変更時に表示形式を切り替える
      selectGraphType.addEventListener('change', function () {
        const displayType = this.value;
        if (currentTab.checked) {
          addTableOrTree(content, item, displayType, entryData);
        }
      });
    }
  }
}

function makeLinksTable(item, content, linkedListData) {
  const data = linkedListData[item.class];
  if (!data || data.length === 0) {
    return false;
  }

  const filteredData = data.filter((itemData) => itemData.displayid);

  // 既存のテーブルを削除
  const existingTable = content.querySelector('table');
  if (existingTable) {
    existingTable.remove();
  }

  // 新しいdivを生成してクラス名を設定
  const tableWrapper = document.createElement('div');
  tableWrapper.classList.add('table-contents');

  // 新しいテーブルを生成
  const table = document.createElement('table');
  table.classList.add('table');

  // theadを作成
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  item.labels.forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label.label; // 固定のラベルを設定
    headerRow.appendChild(th);
  });

  // Feedback列を追加
  const feedbackTh = document.createElement('th');
  feedbackTh.textContent = 'Feedback(*)';
  headerRow.appendChild(feedbackTh);
  thead.appendChild(headerRow);
  table.appendChild(thead); // theadをテーブルに追加

  // tbodyを作成
  const tbody = document.createElement('tbody');

  // 取得したデータをtableの行として追加
  filteredData.forEach((itemData) => {
    const row = document.createElement('tr');
    item.keys.forEach((key) => {
      const cell = document.createElement('td');

      // labels配列から一致するkeyを探し、typeが"url"であればリンクを作成
      const field = item.labels.find((labelItem) => labelItem.content === key);

      // modified_diseaseを表示し、original_diseaseをリンク先にするケース
      if (field && field.type === 'url' && field.hrefKey) {
        const link = document.createElement('a');
        link.href = itemData[field.hrefKey]; // href用のキーからリンク先を生成
        link.textContent = itemData[key]; // ラベルとして表示するデータ
        link.target = '_blank'; // 新しいタブで開く
        cell.appendChild(link);
      } else if (field && field.content === 'property') {
        // propertyの値から"#"以降を抽出してマッチング
        const propertyValue = itemData[key];
        const matchType = propertyValue.split('#')[1]; // #以降を抽出

        if (matchType === 'closeMatch') {
          cell.textContent = 'Close Match';
        } else if (matchType === 'exactMatch') {
          cell.textContent = 'Exact Match';
        } else {
          cell.textContent = matchType || propertyValue; // その他はそのまま表示
        }
      } else {
        // その他のデータをそのまま表示
        cell.textContent = itemData[key];
      }
      row.appendChild(cell);
    });

    // Feedback列にアイコンを追加
    const feedbackCell = document.createElement('td');
    feedbackCell.classList.add('feedback-cell');
    feedbackCell.innerHTML = `
        <a href="#" class="good-icon" title="Good"><i class="far fa-thumbs-up"></i></a>
        <a href="#" class="bad-icon" title="Bad"><i class="far fa-thumbs-down"></i></a>
        <a href="mailto:feedback@example.com" class="email-icon" title="Send Feedback"><i class="far fa-envelope"></i></a>
      `;
    row.appendChild(feedbackCell);

    tbody.appendChild(row); // tbodyに行を追加
  });

  table.appendChild(tbody); // tbodyをテーブルに追加

  // テーブルをdivに追加
  tableWrapper.appendChild(table);

  // contentにtableWrapperをpタグの前に追加
  content.prepend(tableWrapper); // テーブルを最初に追加する

  // アイコンクリックイベントを追加
  table.querySelectorAll('.good-icon').forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Good feedback received!');
    });
  });

  table.querySelectorAll('.bad-icon').forEach((icon) => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Bad feedback received!');
    });
  });

  table.querySelectorAll('.email-icon').forEach((icon) => {
    icon.addEventListener('click', (e) => {
      // メールリンクの処理はデフォルトの動作に任せる
      alert('Email icon clicked!');
    });
  });

  return true; // データがある場合、trueを返す
}

function addTableOrTree(content, item, displayType, entryData, linkedListData) {
  const currentLang = document.querySelector('.language-select').value;
  // 既存のツリーを削除する
  const existingTree = content.querySelector('togostanza-tree');
  if (existingTree) {
    existingTree.remove();
  }

  // overviewSectionのpaddingを変更
  const overviewSection = content.closest('.overview-section');

  if (displayType === 'table') {
    // テーブルが既に存在するか確認
    if (!content.querySelector('table')) {
      // テーブルが存在しない場合のみ生成
      overviewSection.style.paddingBottom = '0';
      makeLinksTable(item, content, linkedListData);

      if (!content.querySelector('p')) {
        const feedbackMessage = document.createElement('p');
        feedbackMessage.textContent =
          currentLang === 'ja'
            ? '*リンクに関するフィードバックをお待ちしております.'
            : 'We welcome feedback on the links.';
        content.appendChild(feedbackMessage);
      }
    }
  } else if (displayType === 'tree') {
    overviewSection.style.paddingBottom = '15px';
    const uniqueTreeId = `tree-${item.class}`;
    const apiUrl = new URL(item.apiUrl, window.location.origin);
    apiUrl.searchParams.set('nando_id', entryData.nando_id);
    content.innerHTML = `
      <togostanza-tree 
        id="${uniqueTreeId}" 
        data-url="${apiUrl}" 
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
      treeElement.style.setProperty('--togostanza-canvas-height', '200px');
      treeElement.style.setProperty('--togostanza-canvas-width', '1000px');
    }, 0);
  }
}

function createObjectUrlFromData(data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}
