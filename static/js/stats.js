// Stats page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // 統計データを読み込んで表示
  loadStatsData();

  // 言語切り替えイベントリスナーを追加
  const languageSelect = document.querySelector('.language-select');
  if (languageSelect) {
    languageSelect.addEventListener('change', function () {
      const value = this.value;
      const currentHash = window.location.hash;
      const currentPath = window.location.pathname;
      const search = window.location.search;
      let newUrl = '';

      if (search.includes('post')) {
        const params = new URLSearchParams(search);
        params.set('lang', value);
        newUrl = currentPath + '?' + params.toString() + currentHash;
      } else {
        newUrl = currentPath + '?lang=' + value + currentHash;
      }
      window.location.href = newUrl;
    });
  }
});

async function loadStatsData() {
  try {
    console.log('統計データの読み込みを開始...');

    // 各セクションのローディング表示を開始
    const sections = [
      'nando',
      'disease-overview',
      'links',
      'related-data',
      'genes',
      'bioresources',
    ];
    sections.forEach((sectionId) => {
      showSectionLoading(sectionId);
    });

    // 各APIを個別に呼び出してエラーハンドリング
    const apiResults = await Promise.allSettled([
      fetchNANDOData(),
      fetchBRCData(),
      fetchLinkData(),
      fetchLinkData2(),
      fetchLinkData4(),
    ]);

    // 各APIの結果を処理
    const nandoData =
      apiResults[0].status === 'fulfilled'
        ? apiResults[0].value
        : getDefaultNandoData();
    const brcData =
      apiResults[1].status === 'fulfilled'
        ? apiResults[1].value
        : getDefaultBRCData();
    const linkData =
      apiResults[2].status === 'fulfilled'
        ? apiResults[2].value
        : getDefaultLinkData();
    const linkData2 =
      apiResults[3].status === 'fulfilled'
        ? apiResults[3].value
        : getDefaultLinkData2();
    const linkData4 =
      apiResults[4].status === 'fulfilled'
        ? apiResults[4].value
        : getDefaultLinkData4();

    // 失敗したAPIに対応するセクションを非表示にする
    if (apiResults[0].status === 'rejected') {
      hideSection('nando');
    }
    if (apiResults[1].status === 'rejected') {
      hideSection('bioresources');
    }
    if (apiResults[2].status === 'rejected') {
      hideSection('links');
    }
    if (apiResults[3].status === 'rejected') {
      hideSection('disease-overview');
      hideSection('related-data');
      hideSection('genes');
    }
    if (apiResults[4].status === 'rejected') {
      // linkData4はrelated-dataの一部で使用されるため、関連セクションをチェック
      // 既にlinkData2が失敗している場合は既に非表示になっている
    }

    // エラーが発生したAPIをログ出力
    apiResults.forEach((result, index) => {
      const apiNames = ['NANDO_count', 'BRC', 'Link', 'Link2', 'Link4'];
      if (result.status === 'rejected') {
        console.warn(`${apiNames[index]} API エラー:`, result.reason);
      }
    });

    console.log('APIデータ取得成功:', {
      nandoData,
      brcData,
      linkData,
      linkData2,
      linkData4,
    });

    // 取得したデータを構造化されたJSON形式に変換
    const statsData = transformApiDataToStatsData(
      nandoData,
      brcData,
      linkData,
      linkData2,
      linkData4
    );

    console.log('変換された統計データ:', statsData);

    // 各テーブルの数値を更新
    updateAllTables(statsData);

    // 成功したセクションのみコンテンツを表示
    sections.forEach((sectionId) => {
      // セクションが非表示になっていない場合のみ表示
      const section = document
        .querySelector(`#${sectionId}-content`)
        ?.closest('.stats-section');
      if (section && section.style.display !== 'none') {
        showSectionContent(sectionId);
      }
    });

    console.log('統計データの読み込み完了');
  } catch (error) {
    console.error('統計データの読み込みに失敗しました:', error);
    console.error('エラーの詳細:', error.message);
    console.error('エラースタック:', error.stack);
    // エラーの場合は各セクションをエラー表示
    sections.forEach((sectionId) => {
      showSectionError(sectionId);
    });
  }
}

// APIデータを統計データ形式に変換する関数
function transformApiDataToStatsData(
  nandoData,
  brcData,
  linkData,
  linkData2,
  linkData4
) {
  try {
    return {
      // 難病統計
      diseaseStats: {
        shitei: {
          all: safeParseInt(nandoData.shitei_all?.['callret-0']),
          nanbyo_group: safeParseInt(nandoData.shitei_group?.['callret-0']),
          nanbyo_disease: safeParseInt(nandoData.shitei_disease?.['callret-0']),
          nanbyo_subtype: (function () {
            const all = safeParseInt(nandoData.shitei_all?.['callret-0']);
            const group = safeParseInt(nandoData.shitei_group?.['callret-0']);
            const disease = safeParseInt(
              nandoData.shitei_disease?.['callret-0']
            );
            if (all === '-' || group === '-' || disease === '-') return '-';
            return all - group - disease;
          })(),
        },
        shoman: {
          all: safeParseInt(nandoData.shoman_all?.['callret-0']),
          nanbyo_group: safeParseInt(nandoData.shoman_group?.['callret-0']),
          nanbyo_disease: safeParseInt(nandoData.shoman_disease?.['callret-0']),
          nanbyo_subtype: (function () {
            const all = safeParseInt(nandoData.shoman_all?.['callret-0']);
            const group = safeParseInt(nandoData.shoman_group?.['callret-0']);
            const disease = safeParseInt(
              nandoData.shoman_disease?.['callret-0']
            );
            if (all === '-' || group === '-' || disease === '-') return '-';
            return all - group - disease;
          })(),
        },
      },
      // 疾患概要
      diseaseOverview: {
        shitei: {
          definition: safeParseInt(linkData2.shitei_description?.desc),
          inheritance: safeParseInt(linkData2.shitei_inheritance?.inheritance),
          alternativeNames: safeParseInt(linkData2.shitei_altlabel?.alt),
        },
        shoman: {
          definition: safeParseInt(linkData2.shoman_description?.desc),
          inheritance: safeParseInt(linkData2.shoman_inheritance?.inheritance),
          alternativeNames: safeParseInt(linkData2.shoman_altlabel?.alt),
        },
      },
      // リンク
      links: {
        shitei: {
          monarchExact: safeParseInt(linkData.name2?.mondo),
          monarchClose: safeParseInt(linkData.name4?.mondo),
          orphanet: safeParseInt(linkData.name12?.mondo),
          medgen: safeParseInt(linkData.name10?.medgen),
          kegg: safeParseInt(linkData.name5?.kegg),
        },
        shoman: {
          monarchExact: safeParseInt(linkData.name1?.mondo),
          monarchClose: safeParseInt(linkData.name3?.mondo),
          orphanet: safeParseInt(linkData.name11?.mondo),
          medgen: safeParseInt(linkData.name9?.medgen),
          kegg: safeParseInt(linkData.name6?.kegg),
        },
      },
      // 疾患関連データ
      relatedData: {
        shitei: {
          glycanGenes: '-',
          geneticTests: safeParseInt(linkData2.shitei_genetest?.genetest),
          clinicalFeatures: safeParseInt(linkData2.shitei_hp?.hp),
          facialFeatures: safeParseInt(linkData4.shitei_gm?.GM || '0'),
          humanData: safeParseInt(linkData4.shitei_hum?.hum || '0'),
          chemicals: '-',
          literature: '-',
        },
        shoman: {
          glycanGenes: '-',
          geneticTests: safeParseInt(linkData2.shoman_genetest?.genetest),
          clinicalFeatures: safeParseInt(linkData2.shoman_hp?.hp),
          facialFeatures: safeParseInt(linkData4.shoman_gm?.GM || '0'),
          humanData: safeParseInt(linkData4.shoman_hum?.hum || '0'),
          chemicals: '-',
          literature: '-',
        },
      },
      // 疾患関連遺伝子
      genes: {
        shitei: {
          domestic: '-',
          international: safeParseInt(linkData2.shitei_gene?.gene),
        },
        shoman: {
          domestic: '-',
          international: safeParseInt(linkData2.shoman_gene?.gene),
        },
      },

      // バイオリソース
      bioresources: {
        shitei: {
          cells: safeParseInt(brcData.shitei_cell?.cell),
          mouse: safeParseInt(brcData.shitei_mouse?.mouse),
          dna: safeParseInt(brcData.shitei_DNA?.gene),
        },
        shoman: {
          cells: safeParseInt(brcData.shoman_cell?.cell),
          mouse: safeParseInt(brcData.shoman_mouse?.mouse),
          dna: safeParseInt(brcData.shoman_DNA?.gene),
        },
      },
      // 顔貌特徴と外部リンクの合計
      facial_features:
        safeParseInt(linkData4.shitei_gm?.GM || '0') +
        safeParseInt(linkData4.shoman_gm?.GM || '0'),
      external_links:
        safeParseInt(linkData.name8?.mondo || '0') +
        safeParseInt(linkData.name10?.medgen || '0') +
        safeParseInt(linkData.name5?.kegg || '0') +
        safeParseInt(linkData.name7?.mondo || '0') +
        safeParseInt(linkData.name9?.medgen || '0') +
        safeParseInt(linkData.name6?.kegg || '0'),
    };
  } catch (error) {
    console.error('データ変換中にエラーが発生しました:', error);
    throw error;
  }
}

// 全テーブルを更新する関数
function updateAllTables(statsData) {
  updateDiseaseStats(statsData.diseaseStats);
  updateDiseaseOverview(statsData.diseaseOverview);
  updateLinks(statsData.links);
  updateRelatedData(statsData.relatedData);
  updateGenes(statsData.genes);
  updateBioresources(statsData.bioresources);
}

// NANDO_count APIからデータを取得する関数
async function fetchNANDOData() {
  try {
    console.log('NANDO_count API呼び出し開始...');
    const response = await fetch(
      'http://localhost:8888/sparqlist/api/NANDO_count'
    );
    console.log(
      'NANDO_count API レスポンス:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      throw new Error(
        `NANDO_count API request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('NANDO_count API Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('NANDO_count API データ取得成功:', data);
    return data;
  } catch (error) {
    console.error('NANDO_count API エラー:', error);
    throw error;
  }
}

// BRC APIからデータを取得する関数
async function fetchBRCData() {
  try {
    console.log('BRC API呼び出し開始...');
    const response = await fetch(
      'http://localhost:8888/sparqlist/api/NANDO_link_count3_brc'
    );
    console.log('BRC API レスポンス:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(
        `BRC API request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('BRC API Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('BRC API データ取得成功:', data);
    return data;
  } catch (error) {
    console.error('BRC API エラー:', error);
    throw error;
  }
}

// NANDO_link_count APIからデータを取得する関数
async function fetchLinkData() {
  try {
    console.log('Link API呼び出し開始...');
    const response = await fetch(
      'http://localhost:8888/sparqlist/api/NANDO_link_count'
    );
    console.log('Link API レスポンス:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(
        `Link API request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('Link API Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('Link API データ取得成功:', data);
    return data;
  } catch (error) {
    console.error('Link API エラー:', error);
    throw error;
  }
}

// NANDO_link_count2 APIからデータを取得する関数
async function fetchLinkData2() {
  try {
    console.log('Link2 API呼び出し開始...');
    const response = await fetch(
      'http://localhost:8888/sparqlist/api/NANDO_link_count2'
    );
    console.log('Link2 API レスポンス:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(
        `Link2 API request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('Link2 API Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('Link2 API データ取得成功:', data);
    return data;
  } catch (error) {
    console.error('Link2 API エラー:', error);
    throw error;
  }
}

// NANDO_link_count4 APIからデータを取得する関数
async function fetchLinkData4() {
  try {
    console.log('Link4 API呼び出し開始...');
    const response = await fetch(
      'http://localhost:8888/sparqlist/api/NANDO_link_count4'
    );
    console.log('Link4 API レスポンス:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(
        `Link4 API request failed: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    console.log('Link4 API Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', contentType);
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error(`Expected JSON response but got ${contentType}`);
    }

    const data = await response.json();
    console.log('Link4 API データ取得成功:', data);
    return data;
  } catch (error) {
    console.error('Link4 API エラー:', error);
    throw error;
  }
}

// 各セクションのローディング状態を表示する関数
function showSectionLoading(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  const errorDiv = document.getElementById(`${sectionId}-error`);
  const contentDiv = document.getElementById(`${sectionId}-content`);

  if (loadingDiv) loadingDiv.style.display = 'block';
  if (errorDiv) errorDiv.style.display = 'none';
  if (contentDiv) contentDiv.style.display = 'none';
}

// 各セクションのコンテンツを表示する関数
function showSectionContent(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  const errorDiv = document.getElementById(`${sectionId}-error`);
  const contentDiv = document.getElementById(`${sectionId}-content`);

  if (loadingDiv) loadingDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'none';
  if (contentDiv) contentDiv.style.display = 'block';
}

// 各セクションのエラー状態を表示する関数
function showSectionError(sectionId) {
  const loadingDiv = document.getElementById(`${sectionId}-loading`);
  const errorDiv = document.getElementById(`${sectionId}-error`);
  const contentDiv = document.getElementById(`${sectionId}-content`);

  if (loadingDiv) loadingDiv.style.display = 'none';
  if (errorDiv) errorDiv.style.display = 'block';
  if (contentDiv) contentDiv.style.display = 'none';
}

// セクションを非表示にする関数
function hideSection(sectionId) {
  const section = document
    .querySelector(`#${sectionId}-content`)
    .closest('.stats-section');
  if (section) {
    section.style.display = 'none';
  }
}

// エラーメッセージを表示する関数（既存のテーブルセル用）
function showErrorMessage() {
  // 言語を取得
  const locale = document.querySelector('.language-select')?.value || 'en';
  const errorMessage =
    locale === 'ja' ? 'データの読み込みに失敗しました' : 'Failed to load data';

  // 全てのテーブルセルにエラーメッセージを表示
  const allCells = document.querySelectorAll(
    '[id$="-all"], [id$="-nanbyo-group"], [id$="-nanbyo-disease"], [id$="-nanbyo-subtype"], [id$="-definition"], [id$="-inheritance"], [id$="-alternative-names"], [id$="-monarch-exact"], [id$="-monarch-close"], [id$="-orphanet"], [id$="-medgen"], [id$="-kegg"], [id$="-genes"], [id$="-genetic-tests"], [id$="-clinical-features"], [id$="-facial-features"], [id$="-human-data"], [id$="-chemicals"], [id$="-literature"], [id$="-domestic-genes"], [id$="-international-genes"], [id$="-clinvar"], [id$="-mgend"], [id$="-cells"], [id$="-mouse"], [id$="-dna"]'
  );

  allCells.forEach((cell) => {
    cell.textContent = errorMessage;
    cell.style.color = '#dc3545'; // 赤色で表示
  });
}

function updateDiseaseStats(diseaseStats) {
  // 難病統計テーブル
  updateDiseaseStatsRow('shitei', diseaseStats.shitei);
  updateDiseaseStatsRow('shoman', diseaseStats.shoman);
}

function updateDiseaseStatsRow(category, data) {
  try {
    const fieldMapping = {
      all: 'all',
      'nanbyo-group': 'nanbyo_group',
      'nanbyo-disease': 'nanbyo_disease',
      'nanbyo-subtype': 'nanbyo_subtype',
    };

    Object.entries(fieldMapping).forEach(([field, dataKey]) => {
      const element = document.getElementById(`${category}-${field}`);
      if (!element) {
        console.error(`Element not found: ${category}-${field}`);
        return;
      }

      const value = data[dataKey];
      if (value === undefined) {
        console.error(`Data property not found: ${dataKey} in`, data);
        element.textContent = '-';
        return;
      }

      element.textContent = value === '-' ? '-' : value.toLocaleString();
    });

    console.log(`Disease stats updated for ${category}:`, data);
  } catch (error) {
    console.error(`Error updating disease stats for ${category}:`, error);
  }
}

function updateDiseaseOverview(diseaseOverview) {
  // 疾患概要テーブル
  updateDiseaseOverviewData(diseaseOverview);
}

function updateDiseaseOverviewData(diseaseOverview) {
  // 指定の疾患概要データを更新
  document.getElementById('shitei-definition').textContent =
    diseaseOverview.shitei.definition === '-'
      ? '-'
      : diseaseOverview.shitei.definition.toLocaleString();
  document.getElementById('shitei-inheritance').textContent =
    diseaseOverview.shitei.inheritance === '-'
      ? '-'
      : diseaseOverview.shitei.inheritance.toLocaleString();
  document.getElementById('shitei-alternative-names').textContent =
    diseaseOverview.shitei.alternativeNames === '-'
      ? '-'
      : diseaseOverview.shitei.alternativeNames.toLocaleString();

  // 小慢の疾患概要データを更新
  document.getElementById('shoman-definition').textContent =
    diseaseOverview.shoman.definition === '-'
      ? '-'
      : diseaseOverview.shoman.definition.toLocaleString();
  document.getElementById('shoman-inheritance').textContent =
    diseaseOverview.shoman.inheritance === '-'
      ? '-'
      : diseaseOverview.shoman.inheritance.toLocaleString();
  document.getElementById('shoman-alternative-names').textContent =
    diseaseOverview.shoman.alternativeNames === '-'
      ? '-'
      : diseaseOverview.shoman.alternativeNames.toLocaleString();
}

function updateLinks(links) {
  // リンクテーブル
  updateLinksData(links);
}

function updateLinksData(links) {
  // 指定のリンクデータを更新
  document.getElementById('shitei-monarch-exact').textContent =
    links.shitei.monarchExact === '-'
      ? '-'
      : links.shitei.monarchExact.toLocaleString();
  document.getElementById('shitei-monarch-close').textContent =
    links.shitei.monarchClose === '-'
      ? '-'
      : links.shitei.monarchClose.toLocaleString();
  document.getElementById('shitei-orphanet').textContent =
    links.shitei.orphanet === '-'
      ? '-'
      : links.shitei.orphanet.toLocaleString();
  document.getElementById('shitei-medgen').textContent =
    links.shitei.medgen === '-' ? '-' : links.shitei.medgen.toLocaleString();
  document.getElementById('shitei-kegg').textContent =
    links.shitei.kegg === '-' ? '-' : links.shitei.kegg.toLocaleString();

  // 小慢のリンクデータを更新
  document.getElementById('shoman-monarch-exact').textContent =
    links.shoman.monarchExact === '-'
      ? '-'
      : links.shoman.monarchExact.toLocaleString();
  document.getElementById('shoman-monarch-close').textContent =
    links.shoman.monarchClose === '-'
      ? '-'
      : links.shoman.monarchClose.toLocaleString();
  document.getElementById('shoman-orphanet').textContent =
    links.shoman.orphanet === '-'
      ? '-'
      : links.shoman.orphanet.toLocaleString();
  document.getElementById('shoman-medgen').textContent =
    links.shoman.medgen === '-' ? '-' : links.shoman.medgen.toLocaleString();
  document.getElementById('shoman-kegg').textContent =
    links.shoman.kegg === '-' ? '-' : links.shoman.kegg.toLocaleString();
}

function updateRelatedData(relatedData) {
  // 疾患関連データテーブル
  updateRelatedDataRow('shitei', relatedData.shitei);
  updateRelatedDataRow('shoman', relatedData.shoman);
}

function updateRelatedDataRow(category, data) {
  try {
    const fields = [
      'glycanGenes',
      'geneticTests',
      'clinicalFeatures',
      'facialFeatures',
      'humanData',
      'chemicals',
      'literature',
    ];

    fields.forEach((field) => {
      const elementId = `${category}-${field
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()}`;
      const element = document.getElementById(elementId);

      if (!element) {
        console.error(`Element not found: ${elementId}`);
        return;
      }

      const value = data[field];
      if (value === undefined) {
        console.error(`Data property not found: ${field} in`, data);
        element.textContent = '-';
        return;
      }

      element.textContent = value === '-' ? '-' : value.toLocaleString();
    });

    console.log(`Related data updated for ${category}:`, data);
  } catch (error) {
    console.error(`Error updating related data for ${category}:`, error);
  }
}

function updateGenes(genes) {
  // 疾患関連遺伝子テーブル
  updateGenesRow('shitei', genes.shitei);
  updateGenesRow('shoman', genes.shoman);
}

function updateGenesRow(category, data) {
  try {
    const domesticElement = document.getElementById(
      `${category}-domestic-genes`
    );
    const internationalElement = document.getElementById(
      `${category}-international-genes`
    );

    if (!domesticElement) {
      console.error(`Element not found: ${category}-domestic-genes`);
    } else {
      const domesticValue = data.domestic;
      domesticElement.textContent =
        domesticValue === '-' ? '-' : domesticValue.toLocaleString();
    }

    if (!internationalElement) {
      console.error(`Element not found: ${category}-international-genes`);
    } else {
      const internationalValue = data.international;
      internationalElement.textContent =
        internationalValue === '-' ? '-' : internationalValue.toLocaleString();
    }

    console.log(`Genes updated for ${category}:`, data);
  } catch (error) {
    console.error(`Error updating genes for ${category}:`, error);
  }
}

function updateBioresources(bioresources) {
  // バイオリソーステーブル
  updateBioresourcesRow('shitei', bioresources.shitei);
  updateBioresourcesRow('shoman', bioresources.shoman);
}

function updateBioresourcesRow(category, data) {
  try {
    const cellsElement = document.getElementById(`${category}-cells`);
    const mouseElement = document.getElementById(`${category}-mouse`);
    const dnaElement = document.getElementById(`${category}-dna`);

    if (!cellsElement) {
      console.error(`Element not found: ${category}-cells`);
      return;
    }
    if (!mouseElement) {
      console.error(`Element not found: ${category}-mouse`);
      return;
    }
    if (!dnaElement) {
      console.error(`Element not found: ${category}-dna`);
      return;
    }

    cellsElement.textContent =
      data.cells === '-' ? '-' : data.cells.toLocaleString();
    mouseElement.textContent =
      data.mouse === '-' ? '-' : data.mouse.toLocaleString();
    dnaElement.textContent = data.dna === '-' ? '-' : data.dna.toLocaleString();

    console.log(`Bioresources updated for ${category}:`, data);
  } catch (error) {
    console.error(`Error updating bioresources for ${category}:`, error);
  }
}

// 安全な数値変換関数
function safeParseInt(value) {
  if (value === null || value === undefined || value === '-') {
    return '-';
  }
  const parsed = parseInt(value);
  return isNaN(parsed) ? '-' : parsed;
}

// デフォルトデータ関数
function getDefaultNandoData() {
  console.log('NANDO_count API エラーのためデフォルトデータを使用');
  return {
    shitei_all: { 'callret-0': '0' },
    shitei_group: { 'callret-0': '0' },
    shitei_disease: { 'callret-0': '0' },
    shoman_all: { 'callret-0': '0' },
    shoman_group: { 'callret-0': '0' },
    shoman_disease: { 'callret-0': '0' },
  };
}

function getDefaultBRCData() {
  console.log('BRC API エラーのためデフォルトデータを使用');
  return {
    shitei_cell: { cell: '0' },
    shitei_mouse: { mouse: '0' },
    shitei_DNA: { gene: '0' },
    shoman_cell: { cell: '0' },
    shoman_mouse: { mouse: '0' },
    shoman_DNA: { gene: '0' },
  };
}

function getDefaultLinkData() {
  console.log('Link API エラーのためデフォルトデータを使用');
  return {
    name8: { mondo: '0' },
    name10: { medgen: '0' },
    name5: { kegg: '0' },
    name7: { mondo: '0' },
    name9: { medgen: '0' },
    name6: { kegg: '0' },
  };
}

function getDefaultLinkData2() {
  console.log('Link2 API エラーのためデフォルトデータを使用');
  return {
    shitei_inheritance: { inheritance: '0' },
    shoman_inheritance: { inheritance: '0' },
    shitei_description: { desc: '0' },
    shoman_description: { desc: '0' },
    shitei_genetest: { genetest: '0' },
    shoman_genetest: { genetest: '0' },
    shitei_hp: { hp: '0' },
    shoman_hp: { hp: '0' },
    shitei_gene: { gene: '0' },
    shoman_gene: { gene: '0' },
    shitei_mgened: { mgend: '0' },
    shoman_mgened: { mgend: '0' },
    shitei_altlabel: { alt: '0' },
    shoman_altlabel: { alt: '0' },
  };
}

function getDefaultLinkData4() {
  console.log('Link4 API エラーのためデフォルトデータを使用');
  return {
    shitei_gm: { GM: '0' },
    shoman_gm: { GM: '0' },
    shitei_hum: { hum: '0' },
    shoman_hum: { hum: '0' },
  };
}
