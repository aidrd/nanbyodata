import { navToggle } from '../components/navigation.js';
import { focusInput } from '../components/focusInput.js';
import { popup } from '../components/popup.js';
import { breadcrumb } from './breadcrumb.js';
import { downloadDatasets } from './download.js';
import {
  makeCausalGene,
  makeGeneticTesting,
  makePhenotypes,
  makeCell,
  makeMouse,
  makeDNA,
  makeClinvar,
  makeMgend,
} from './diseaseContent.js';
import { switchingDisplayContents } from './diseaseSideNavigation.js';
import { setLangChange } from '../components/setLangChange.js';
import { smartBox } from '../components/smart_box.js';

// get NANDO ID
const pathname = window.location.pathname;
const nandoIndex = pathname.indexOf('NANDO:');
const nandoId = pathname.slice(nandoIndex + 6);

// for cache busting
const timestamp = Date.now();

// external functions
navToggle();
focusInput();
popup();
breadcrumb(nandoId);
setLangChange();

const datasets = [
  { name: 'Overview', data: null },
  { name: 'Causal Genes', data: null },
  { name: 'Genetic Testing', data: null },
  { name: 'Phenotypes', data: null },
  { name: 'Cell', data: null },
  { name: 'Mouse', data: null },
  { name: 'DNA', data: null },
  { name: 'Clinvar', data: null },
  { name: 'MGeND', data: null },
];

(async () => {
  try {
    const hash = window.location.hash.replace('#', '');
    async function fetchData(apiEndpoint) {
      const url = `/sparqlist/api/${apiEndpoint}?nando_id=${nandoId}&timestamp=${timestamp}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
      }
    }

    // get Overview data
    fetchData('nanbyodata_get_overview_by_nando_id').then((entryData) => {
      if (entryData) {
        makeHeader(entryData);
        makeExternalLinks(entryData);
        makeAlternativeName(entryData);
        makeInheritanceUris(entryData);
        makeLinkedItem(entryData);
        addChartToDiv(entryData);
        addContentToDiv(entryData);
        checkSummaryData(entryData);
        makeDiseaseDefinition(entryData);
        updateOverviewLinkAndContentDisplay();
        const numOfPatientsSelect = document.getElementById(
          'num-of-patients-graph'
        );
        numOfPatientsSelect.addEventListener('change', function () {
          addChartToDiv(entryData);
        });
        const subClassSelect = document.getElementById('sub-class-graph');
        subClassSelect.addEventListener('change', function () {
          addContentToDiv(entryData);
        });
        datasets.find((d) => d.name === 'Overview').data = entryData;
        checkAndLogDatasets();
        if (hash) {
          trySwitchingContent(hash);
        } else {
          switchingDisplayContents('overview');
          const overviewEl = document.querySelector('.nav-link.overview');
          overviewEl.classList.add('selected');
          overviewEl.style.cursor = 'pointer';
          document.getElementById('content').style.display = 'block';
        }
      }
    });

    // get Causal Genes data
    fetchData('nanbyodata_get_causal_gene_by_nando_id').then(
      (causalGeneData) => {
        makeCausalGene(causalGeneData);
        datasets.find((d) => d.name === 'Causal Genes').data = causalGeneData;
        checkAndLogDatasets();
      }
    );

    // get Genetic Testing data
    fetchData('nanbyodata_get_genetic_test_by_nando_id').then(
      (geneticTestingData) => {
        makeGeneticTesting(geneticTestingData);
        datasets.find((d) => d.name === 'Genetic Testing').data =
          geneticTestingData;
        checkAndLogDatasets();
      }
    );

    // get Phenotypes data
    fetchData('nanbyodata_get_hpo_data_by_nando_id').then((phenotypesData) => {
      makePhenotypes(phenotypesData);
      datasets.find((d) => d.name === 'Phenotypes').data = phenotypesData;
      checkAndLogDatasets();
    });

    // get Cell data
    fetchData('nanbyodata_get_riken_brc_cell_info_by_nando_id').then(
      (cellData) => {
        makeCell(cellData);
        datasets.find((d) => d.name === 'Cell').data = cellData;
        checkAndLogDatasets();
      }
    );

    // get Mouse data
    fetchData('nanbyodata_get_riken_brc_mouse_info_by_nando_id').then(
      (mouseData) => {
        makeMouse(mouseData);
        datasets.find((d) => d.name === 'Mouse').data = mouseData;
        checkAndLogDatasets();
      }
    );

    // get DNA data
    fetchData('nanbyodata_get_riken_brc_dna_info_by_nando_id').then(
      (dnaData) => {
        makeDNA(dnaData);
        datasets.find((d) => d.name === 'DNA').data = dnaData;
        checkAndLogDatasets();
      }
    );

    // get Clinvar data
    fetchData('nanbyodata_get_clinvar_variant_by_nando_id').then(
      (clinvarData) => {
        makeClinvar(clinvarData);
        datasets.find((d) => d.name === 'Clinvar').data = clinvarData;
        checkAndLogDatasets();
      }
    );

    // get MGenD data
    fetchData('nanbyodata_get_mgend_variant_by_nando_id').then((mgendData) => {
      makeMgend(mgendData);
      datasets.find((d) => d.name === 'MGeND').data = mgendData;
      checkAndLogDatasets();
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();

function checkAndLogDatasets() {
  if (datasets.every((dataset) => dataset.data !== null)) {
    downloadDatasets(nandoId, datasets);
    document.querySelector(
      '.summary-download > .open-popup-btn'
    ).disabled = false;
  }
}

function makeHeader(entryData) {
  const refNandoId = document.getElementById('temp-nando-id');
  refNandoId.textContent = nandoId;

  const refNandoLink = document.getElementById('temp-nando-link');
  refNandoLink.setAttribute(
    'href',
    refNandoLink.getAttribute('href') + nandoId
  );
  refNandoLink.textContent += nandoId;

  document
    .getElementById('temp-nando-copy')
    .addEventListener('click', async () => {
      const clipboardText = 'https://nanbyodata.jp/ontology/NANDO_' + nandoId;
      document.getElementById('temp-nando-copy').textContent = 'Copied!';
      await navigator.clipboard.writeText(clipboardText);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      document.getElementById('temp-nando-copy').textContent = 'Copy';
    });

  const labelJa = document.getElementById('temp-label-ja');
  if (labelJa) {
    labelJa.innerHTML =
      '<ruby>' +
      entryData.label_ja +
      '<rt>' +
      entryData.ruby +
      '</rt>' +
      '</ruby>';
  }

  const labelEn = document.getElementById('temp-label-en');
  labelEn.textContent = entryData.label_en;

  const notificationNumber = document.getElementById(
    'temp-notification-number'
  );
  notificationNumber.textContent = entryData.notification_number;
  if (!entryData.notification_number) {
    notificationNumber.parentNode.remove();
    const tempDataSummary = document.getElementById('overview');
    tempDataSummary.style.borderBottom = 'none';
  }
}

function makeExternalLinks(entryData) {
  const externalLinks = document.getElementById('temp-external-links');

  const items = [
    {
      url: entryData.mhlw?.url,
      element: externalLinks.querySelector('.linked-item.mhlw'),
      existing: !!entryData.mhlw,
    },
    {
      url: entryData.source,
      element: externalLinks.querySelector('.linked-item.source'),
      existing: !!entryData.source,
    },
    {
      url: entryData.nanbyou?.url,
      element: externalLinks.querySelector('.linked-item.nanbyou'),
      existing: !!entryData.nanbyou,
    },
    {
      url: entryData.shouman?.url,
      element: externalLinks.querySelector('.linked-item.shouman'),
      existing: !!entryData.shouman,
    },
  ];

  items.forEach((item) => {
    const { url, element } = item;
    if (url) {
      element.querySelector('a').setAttribute('href', url);
    } else {
      element.remove();
    }
  });
}

function makeAlternativeName(entryData) {
  const altLabelJa = document.querySelector('.alt-label-ja');
  const altLabelEn = document.querySelector('.alt-label-en');
  const currentLang = document.querySelector('.language-select').value;

  if (entryData.alt_label_ja && currentLang === 'ja') {
    const divElement = document.createElement('div');
    altLabelJa.append(divElement);
    entryData.alt_label_ja.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      ddElement.classList.add('linked-item', '-unlinked');
      divElement.append(ddElement);
    });
  } else {
    altLabelJa.remove();
  }
  if (entryData.alt_label_en) {
    const divElement = document.createElement('div');
    altLabelEn.append(divElement);
    entryData.alt_label_en.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      ddElement.classList.add('linked-item', '-unlinked');
      divElement.append(ddElement);
    });
  } else {
    altLabelEn.remove();
  }

  if (!(entryData.alt_label_ja || entryData.alt_label_en)) {
    document.querySelector('.sub-title.-alt-label').remove();
  }
}

function createLinkElement(url, text) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = text;
  return a;
}

function appendLinks(data, container, prefix = '') {
  if (data && data.length) {
    data.forEach((item, index) => {
      const dd = document.createElement('dd');
      const currentLang = document.querySelector('.language-select').value;
      let a;
      if (currentLang === 'en' && item.id_en) {
        a = createLinkElement(item.url || item.uri, prefix + item.id_en);
      } else {
        a = createLinkElement(item.url || item.uri, prefix + item.id);
      }
      dd.classList.add('linked-item');
      dd.append(a);
      container.append(dd);
      if (index < data.length - 1) {
        const space = document.createTextNode(' ');
        container.append(space);
      }
    });
  } else {
    container.remove();
  }
}

function makeInheritanceUris(entryData) {
  const inheritanceUris = document.querySelector('.inheritance-uris');
  const inheritanceSubTitle = document.querySelector(
    '.sub-title.-inheritance-uri'
  );
  if (entryData.inheritance_uris) {
    appendLinks(entryData.inheritance_uris, inheritanceUris);
  } else {
    inheritanceUris.remove();
    inheritanceSubTitle.remove();
  }
}

export function checkSummaryData(entryData) {
  const summaryWrapper = document.querySelector('.summary-wrapper');
  const summaryNav = document.querySelector('.nav-link.overview');
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const navBorderTop = document.querySelector(
    '#temp-side-navigation > ul > li:first-child'
  );
  if (
    !entryData.alt_label_ja &&
    !entryData.alt_label_en &&
    !entryData.db_xrefs?.omim &&
    !entryData.db_xrefs?.orphanet &&
    !entryData.medgen_id &&
    !entryData.mondos &&
    !entryData.kegg &&
    !entryData.urdbms
  ) {
    if (summaryWrapper) {
      summaryWrapper.style = 'display: none;';
      summaryNav.style = 'display: none;';
      navBorderTop.style = 'border-top: none;';
      if (diseaseDefinition) {
        summaryNav.style = 'display: block;';
        navBorderTop.style = 'border-top: block;';
      }
    }
  }
}

function makeDiseaseDefinition(entryData) {
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const tabWrap = diseaseDefinition.querySelector(
    '#temp-disease-definition .tab-wrap'
  );
  const currentLang = document.querySelector('.language-select').value;

  const items = [
    {
      class: 'mhlw',
      existing: currentLang === 'en' ? false : !!entryData.description,
      desc: entryData.description,
      translate: false,
    },
    {
      class: 'monarch-initiative',
      existing: !!entryData.mondo_decs,
      desc: entryData.mondo_decs?.map((dec) => dec.id).join(' '),
      translate: true,
    },
    {
      class: 'medgen',
      existing: !!entryData.medgen_definition,
      desc: entryData.medgen_definition,
      translate: true,
    },
  ];

  if (items.every((item) => !item.existing)) {
    diseaseDefinition.remove();
    document.querySelector('.sub-title.-disease-definition').remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`disease-${item.class}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      }

      const content = tabWrap.querySelector(`.${item.class}`);

      content.textContent = item.desc;
      const currentTab = tabWrap.querySelector(`#disease-${item.class}`);

      if (currentTab && isFirstTab) {
        currentTab.checked = true;
        isFirstTab = false;
      }

      if (item.translate) {
        const translationLink = document.createElement('a');
        const translationUrl = `https://translate.google.co.jp/?hl=ja#en/ja/${item.desc}`;
        translationLink.setAttribute('href', translationUrl);
        translationLink.setAttribute('target', '_blank');
        translationLink.setAttribute('rel', 'noopener noreferrer');
        translationLink.innerHTML =
          '<span class="google-translate">&nbsp;&gt;&gt;&nbsp;翻訳 (Google)</span>';
        content.append(translationLink);
      }
    });
  }
}

// TODO: fix api
async function fetchNandoData(entryData, item, content) {
  try {
    const response = await fetch(
      `${item.apiUrl}?nando_id=${entryData.nando_id}`
    );
    const data = await response.json();

    // データがnull、undefined、空配列、空オブジェクトの場合、falseを返す
    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0)
    ) {
      console.error('No data available from API:', item.apiUrl);
      return false; // データがない場合、falseを返す
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
        const field = item.labels.find(
          (labelItem) => labelItem.content === key
        );

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
  } catch (error) {
    console.error('Error fetching data:', error);
    return false; // エラーが発生した場合、falseを返す
  }
}

async function makeLinkedItem(entryData) {
  const linkedItems = document.getElementById('temp-linked-items');
  const tabWrap = linkedItems.querySelector('.tab-wrap');
  const selectGraphType = document.getElementById('linked-items-graph');

  const items = [
    {
      class: 'omim',
      labels: [
        {
          label: 'OMIM ID',
          content: 'id',
          type: 'url',
          hrefKey: 'original_disease',
        },
        { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
        { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
        { label: 'Parent', content: 'parent' },
        { label: 'Link Type', content: 'property' },
      ],
      keys: ['id', 'mondo_label_ja2', 'mondo_label_en2', 'parent', 'property'],
      apiUrl: 'https://dev-nanbyodata.dbcls.jp/sparqlist/api/test-nando-omim',
    },
    {
      class: 'orphanet',
      labels: [
        {
          label: 'Orphanet ID',
          content: 'id',
          type: 'url',
          hrefKey: 'original_disease',
        },
        { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
        { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
        { label: 'Parent', content: 'parent' },
        { label: 'Link Type', content: 'property' },
      ],
      keys: ['id', 'mondo_label_ja2', 'mondo_label_en2', 'parent', 'property'],
      apiUrl: 'https://dev-nanbyodata.dbcls.jp/sparqlist/api/link-mondo-ordo',
    },
    {
      class: 'monarch-initiative',
      labels: [
        {
          label: 'MONDO ID',
          content: 'id',
          type: 'url',
          hrefKey: 'mondo_url',
        },
        { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
        { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
        { label: 'Parent', content: 'parent' },
        { label: 'Link Type', content: 'property' },
      ],
      keys: ['id', 'mondo_label_ja', 'mondo_label_en', 'parent', 'property'],
      apiUrl:
        'https://dev-nanbyodata.dbcls.jp/sparqlist/api/test_nando_link_mond',
    },
    {
      class: 'medgen',
      labels: [
        {
          label: 'MedGen ID',
          content: 'medgen_id',
          type: 'url',
          hrefKey: 'medgen_url',
        },
        { label: 'Name', content: 'name' },
        { label: 'Disorder', content: 'disorder' },
        { label: 'Link Type', content: 'property' },
      ],
      keys: ['medgen_id', 'name', 'disorder', 'property'],
      apiUrl: 'https://dev-nanbyodata.dbcls.jp/sparqlist/api/test-nando-medgen',
    },
    {
      class: 'kegg-disease',
      labels: [
        {
          label: 'KEGG Disease ID',
          content: 'kegg_disease_id',
          type: 'url',
          hrefKey: 'kegg_url',
        },
        { label: 'Disease Name', content: 'disease_name' },
        { label: 'Pathway', content: 'pathway' },
        { label: 'Link Type', content: 'property' },
      ],
      keys: ['kegg_disease_id', 'disease_name', 'pathway', 'property'],
      apiUrl: 'https://dev-nanbyodata.dbcls.jp/sparqlist/api/test-nando-kegg',
    },
  ];

  let isFirstTab = true;

  for (const item of items) {
    const content = tabWrap.querySelector(`.${item.class}`);
    const exists = await fetchNandoData(entryData, item, content);

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

function addTableOrTree(content, item, displayType, entryData) {
  // 既存のツリーを削除する
  const existingTree = content.querySelector('togostanza-tree');
  if (existingTree) {
    existingTree.remove(); // 既存のツリーを削除
  }

  if (displayType === 'table') {
    fetchNandoData(entryData, item, content);
  } else if (displayType === 'tree') {
    // ユニークなIDを作成
    const uniqueTreeId = `tree-${item.class}`;

    content.innerHTML = `
      <togostanza-tree 
        id="${uniqueTreeId}" 
        data-url="${item.apiUrl}" 
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

    // DOMに要素が追加された後にスクリプトを実行するため、setTimeoutを使う
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

// TODO: Num of Patients
function addChartToDiv(entryData) {
  const targetDiv = document.getElementById('temp-num-of-patients');
  const chartTypeSelect = document.getElementById('num-of-patients-graph');
  const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'line';

  if (targetDiv) {
    targetDiv.innerHTML = ''; // Clear existing chart

    let chartElement;
    if (selectedChartType === 'bar') {
      // Create Bar Chart
      chartElement = document.createElement('togostanza-barchart');
      chartElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/takatsuki_test_20240322?nando_id=${entryData.nando_id}`
      );
      chartElement.setAttribute('data-type', 'json');
      chartElement.setAttribute('category', 'year');
      chartElement.setAttribute('value', 'num_of_patients');
      chartElement.setAttribute('category-title', 'Year');
      chartElement.setAttribute('value-title', 'Num of Patients');
      chartElement.setAttribute('chart-type', 'stacked');
      chartElement.setAttribute('width', '900');
      chartElement.setAttribute('height', '600');
      chartElement.setAttribute('legend', 'true');
      chartElement.setAttribute('xaxis-placement', 'bottom');
      chartElement.setAttribute('yaxis-placement', 'left');
      chartElement.setAttribute('xlabel-padding', '10');
      chartElement.setAttribute('ylabel-padding', '5');
      chartElement.setAttribute('xlabel-alignment', 'center');
      chartElement.setAttribute('ylabel-alignment', 'right');

      chartElement.setAttribute('padding-inner', '.8');
      chartElement.setAttribute('padding-outer', '.5');
      chartElement.setAttribute('bar-width', '0.8');
      chartElement.setAttribute('legend-title', 'Categories');
      chartElement.setAttribute('xgrid', 'false');
      chartElement.setAttribute('ygrid', 'true');
      chartElement.setAttribute('xtick', 'false');
      chartElement.setAttribute('ytick', 'true');
      chartElement.setAttribute('xlabel-max-width', '200');
      chartElement.setAttribute('ylabel-max-width', '200');
      chartElement.setAttribute('xlabel-alignment', 'center');
      chartElement.setAttribute('ylabel-alignment', 'right');
      // Apply custom styles
      chartElement.style.setProperty('--togostanza-series-0-color', '#29697a');
      chartElement.style.setProperty('--togostanza-label-font-size', '14');
    } else {
      // Create Line Chart
      chartElement = document.createElement('togostanza-linechart');
      chartElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/takatsuki_test_20240322?nando_id=${entryData.nando_id}`
      );
      chartElement.setAttribute('data-type', 'json');
      chartElement.setAttribute('axis-x-key', 'year');
      chartElement.setAttribute('axis-x-scale', 'ordinal');
      chartElement.setAttribute('axis-x-placement', 'bottom');
      chartElement.setAttribute('axis-x-title', 'Year');
      chartElement.setAttribute('axis-x-title_padding', '40');
      chartElement.setAttribute('axis-x-ticks_label_angle', '0');
      chartElement.setAttribute('axis-y-key', 'num_of_patients');
      chartElement.setAttribute('axis-y-scale', 'linear');
      chartElement.setAttribute('axis-y-placement', 'left');
      chartElement.setAttribute('axis-y-title', 'Num of Patients');
      chartElement.setAttribute('axis-y-title_padding', '50');
      chartElement.setAttribute('axis-y-ticks_label_angle', '0');
      chartElement.setAttribute('point_size', '10');
      chartElement.setAttribute('legend-title', 'Year');
      chartElement.setAttribute('tooltips-key', 'num_of_patients');
      chartElement.setAttribute('grouping-key', 'group');
      chartElement.style.setProperty(
        '--togostanza-theme-series_0_color',
        '#29697a'
      );
      chartElement.style.setProperty(
        '-togostanza-fonts-font_size_primary',
        '14'
      );
      chartElement.style.setProperty(
        '--togostanza-fonts-font_size_secondary',
        '14'
      );

      // Apply custom styles for line chart
      chartElement.style.setProperty('--togostanza-canvas-height', '600');
      chartElement.style.setProperty('--togostanza-canvas-width', '1000');
    }

    // Create and add the script dynamically
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    if (selectedChartType === 'bar') {
      scriptElement.src = `https://togostanza.github.io/metastanza/barchart.js`;
    } else {
      scriptElement.src = `https://togostanza.github.io/metastanza-devel/linechart.js`;
    }
    scriptElement.async = true;

    // Add chart and script to targetDiv
    targetDiv.appendChild(chartElement);
    targetDiv.appendChild(scriptElement);
  }
}

// TODO: Subclass
function addContentToDiv(entryData) {
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

function updateOverviewLinkAndContentDisplay() {
  const navLink = document.querySelector('.nav-link.overview');
  const loadingSpinner = navLink.querySelector('.loading-spinner');

  if (document.querySelector('.summary-wrapper').style.display === 'none') {
    loadingSpinner.style.display = 'none';
  } else {
    navLink.style.cursor = 'pointer';
    navLink.classList.remove('-disabled');
  }
  loadingSpinner.style.display = 'none';
}

function trySwitchingContent(hash, retries = 0) {
  const maxRetries = 10;
  let found = false;

  const items = [
    'overview',
    'causal-genes',
    'genetic-testing',
    'phenotypes',
    'bio-resource-cell',
    'bio-resource-mouse',
    'bio-resource-dna',
    'variant-clinvar',
    'variant-mgend',
  ];

  if (!items.includes(hash)) {
    window.location.hash = '';
    window.location.reload();
    return;
  }

  let modifiedHash = hash;
  switch (hash) {
    case 'bio-resource-cell':
    case 'bio-resource-mouse':
    case 'bio-resource-dna':
      modifiedHash = hash.substring('bio-resource-'.length);
      break;
    case 'variant-clinvar':
    case 'variant-mgend':
      modifiedHash = hash.substring('variant-'.length);
      break;
  }

  const element = document.querySelector(`.${modifiedHash}`);
  if (element && !element.classList.contains('-disabled')) found = true;

  const alreadySelected = document.querySelector('.nav-link.selected');

  if (found && (!alreadySelected || alreadySelected === element)) {
    element.classList.add('selected');
    switchingDisplayContents(hash);
    document.getElementById('content').style.display = 'block';
  } else if (!found && retries < maxRetries) {
    console.log('No hash item found, retrying...');
    setTimeout(() => {
      trySwitchingContent(hash, retries + 1);
    }, 3000);
  } else {
    if (alreadySelected) {
      return;
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  }
}

// smart box

smartBox('NANDO', '/static/tsv/NANDO_20240516.tsv', {
  api_url: '',
});

document.addEventListener('selectedLabel', function (event) {
  const labelInfo = event.detail.labelInfo;
  window.location.href = `${location.origin}/disease/${labelInfo.id}`;
});
