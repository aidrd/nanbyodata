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

    // 各APIを個別に呼び出してエラーハンドリング
    const apiResults = await Promise.allSettled([
      fetchNANDOData(),
      fetchBRCData(),
      fetchLinkData(),
      fetchLinkData2(),
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

    // エラーが発生したAPIをログ出力
    apiResults.forEach((result, index) => {
      const apiNames = ['NANDO_count', 'BRC', 'Link', 'Link2'];
      if (result.status === 'rejected') {
        console.warn(`${apiNames[index]} API エラー:`, result.reason);
      }
    });

    console.log('APIデータ取得成功:', {
      nandoData,
      brcData,
      linkData,
      linkData2,
    });

    // 取得したデータを構造化されたJSON形式に変換
    const statsData = transformApiDataToStatsData(
      nandoData,
      brcData,
      linkData,
      linkData2
    );

    console.log('変換された統計データ:', statsData);

    // 各テーブルの数値を更新
    updateAllTables(statsData);

    console.log('統計データの読み込み完了');
  } catch (error) {
    console.error('統計データの読み込みに失敗しました:', error);
    console.error('エラーの詳細:', error.message);
    console.error('エラースタック:', error.stack);
    // エラーの場合はテーブルにエラーメッセージを表示
    showErrorMessage();
  }
}

// APIデータを統計データ形式に変換する関数
function transformApiDataToStatsData(nandoData, brcData, linkData, linkData2) {
  try {
    console.log('データ変換開始...');
    console.log('nandoData:', nandoData);
    console.log('linkData2:', linkData2);

    return {
      // 難病統計
      diseaseStats: {
        specified: {
          all: safeParseInt(nandoData.shitei_all?.['callret-0']),
          group: safeParseInt(nandoData.shitei_group?.['callret-0']),
          groupSubclass: safeParseInt(nandoData.name8?.['callret-0']),
          subtype: '-',
          summary: '-',
        },
        pediatric: {
          all: safeParseInt(nandoData.shoman_all?.['callret-0']),
          group: safeParseInt(nandoData.shoman_group?.['callret-0']),
          groupSubclass: safeParseInt(nandoData.name7?.['callret-0']),
          subtype: '-',
          summary: '-',
        },
      },
      // 疾患概要
      diseaseOverview: {
        inheritance: {
          specified: safeParseInt(linkData2.shitei_inheritance?.inheritance),
          pediatric: safeParseInt(linkData2.shoman_inheritance?.inheritance),
        },
        dataSources: {
          specified: {
            mhlw: {
              link: '-',
              definition: safeParseInt(linkData2.shitei_description?.desc),
            },
            orphanet: { link: '-', definition: '-' },
            monarch: {
              link: safeParseInt(linkData.name8?.mondo),
              definition: '-',
            },
            medgen: {
              link: safeParseInt(linkData.name10?.medgen),
              definition: '-',
            },
            kegg: { link: safeParseInt(linkData.name5?.kegg), definition: '-' },
          },
          pediatric: {
            mhlw: {
              link: '-',
              definition: safeParseInt(linkData2.shoman_description?.desc),
            },
            orphanet: { link: '-', definition: '-' },
            monarch: {
              link: safeParseInt(linkData.name7?.mondo),
              definition: '-',
            },
            medgen: {
              link: safeParseInt(linkData.name9?.medgen),
              definition: '-',
            },
            kegg: { link: safeParseInt(linkData.name6?.kegg), definition: '-' },
          },
        },
      },
      // 疾患関連データ
      relatedData: {
        specified: {
          glycanGenes: '-',
          geneticTests: safeParseInt(linkData2.shitei_genetest?.genetest),
          clinicalFeatures: safeParseInt(linkData2.shitei_hp?.hp),
          facialFeatures: '-',
          humanData: '-',
          chemicals: '-',
          literature: '-',
        },
        pediatric: {
          glycanGenes: '-',
          geneticTests: safeParseInt(linkData2.shoman_genetest?.genetest),
          clinicalFeatures: safeParseInt(linkData2.shoman_hp?.hp),
          facialFeatures: '-',
          humanData: '-',
          chemicals: '-',
          literature: '-',
        },
      },
      // 疾患関連遺伝子
      genes: {
        specified: {
          domestic: '-',
          international: safeParseInt(linkData2.shitei_gene?.gene),
        },
        pediatric: {
          domestic: '-',
          international: safeParseInt(linkData2.shoman_gene?.gene),
        },
      },
      // バリアント
      variants: {
        specified: {
          clinvar: '-',
          mgend: safeParseInt(linkData2.shitei_mgened?.mgend),
        },
        pediatric: {
          clinvar: '-',
          mgend: parseInt(linkData2.shoman_mgend.mgend),
        },
      },
      // バイオリソース
      bioresources: {
        specified: {
          cells: safeParseInt(brcData.shitei_cell?.cell),
          mouse: safeParseInt(brcData.shitei_mouse?.mouse),
          dna: safeParseInt(brcData.shitei_DNA?.gene),
        },
        pediatric: {
          cells: safeParseInt(brcData.shoman_cell?.cell),
          mouse: safeParseInt(brcData.shoman_mouse?.mouse),
          dna: safeParseInt(brcData.shoman_DNA?.gene),
        },
      },
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
  updateRelatedData(statsData.relatedData);
  updateGenes(statsData.genes);
  updateVariants(statsData.variants);
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

// エラーメッセージを表示する関数
function showErrorMessage() {
  // 言語を取得
  const locale = document.querySelector('.language-select')?.value || 'en';
  const errorMessage =
    locale === 'ja' ? 'データの読み込みに失敗しました' : 'Failed to load data';

  // 全てのテーブルセルにエラーメッセージを表示
  const allCells = document.querySelectorAll(
    '[id$="-all"], [id$="-group"], [id$="-group-subclass"], [id$="-subtype"], [id$="-summary"], [id$="-inheritance"], [id$="-link"], [id$="-definition"], [id$="-genes"], [id$="-genetic-tests"], [id$="-clinical-features"], [id$="-facial-features"], [id$="-human-data"], [id$="-chemicals"], [id$="-literature"], [id$="-domestic-genes"], [id$="-international-genes"], [id$="-clinvar"], [id$="-mgend"], [id$="-cells"], [id$="-mouse"], [id$="-dna"]'
  );

  allCells.forEach((cell) => {
    cell.textContent = errorMessage;
    cell.style.color = '#dc3545'; // 赤色で表示
  });
}

function updateDiseaseStats(diseaseStats) {
  // 難病統計テーブル
  updateDiseaseStatsRow('specified', diseaseStats.specified);
  updateDiseaseStatsRow('pediatric', diseaseStats.pediatric);
}

function updateDiseaseStatsRow(category, data) {
  try {
    const fieldMapping = {
      all: 'all',
      group: 'group',
      'group-subclass': 'groupSubclass',
      subtype: 'subtype',
      summary: 'summary',
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
  updateInheritanceData(diseaseOverview.inheritance);
  updateDataSourceData(diseaseOverview.dataSources);
}

function updateInheritanceData(inheritance) {
  document.getElementById('specified-inheritance').textContent =
    inheritance.specified.toLocaleString();
  document.getElementById('pediatric-inheritance').textContent =
    inheritance.pediatric.toLocaleString();
}

function updateDataSourceData(dataSources) {
  updateDataSourceRow('specified', dataSources.specified);
  updateDataSourceRow('pediatric', dataSources.pediatric);
}

function updateDataSourceRow(category, data) {
  const sources = ['mhlw', 'orphanet', 'monarch', 'medgen', 'kegg'];

  sources.forEach((source) => {
    document.getElementById(`${category}-${source}-link`).textContent =
      data[source].link;
    document.getElementById(`${category}-${source}-definition`).textContent =
      data[source].definition === '-'
        ? '-'
        : data[source].definition.toLocaleString();
  });
}

function updateRelatedData(relatedData) {
  // 疾患関連データテーブル
  updateRelatedDataRow('specified', relatedData.specified);
  updateRelatedDataRow('pediatric', relatedData.pediatric);
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
  updateGenesRow('specified', genes.specified);
  updateGenesRow('pediatric', genes.pediatric);
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

function updateVariants(variants) {
  // バリアントテーブル
  updateVariantsRow('specified', variants.specified);
  updateVariantsRow('pediatric', variants.pediatric);
}

function updateVariantsRow(category, data) {
  try {
    const clinvarElement = document.getElementById(`${category}-clinvar`);
    const mgendElement = document.getElementById(`${category}-mgend`);

    if (!clinvarElement) {
      console.error(`Element not found: ${category}-clinvar`);
    } else {
      const clinvarValue = data.clinvar;
      clinvarElement.textContent =
        clinvarValue === '-' ? '-' : clinvarValue.toLocaleString();
    }

    if (!mgendElement) {
      console.error(`Element not found: ${category}-mgend`);
    } else {
      const mgendValue = data.mgend;
      mgendElement.textContent =
        mgendValue === '-' ? '-' : mgendValue.toLocaleString();
    }

    console.log(`Variants updated for ${category}:`, data);
  } catch (error) {
    console.error(`Error updating variants for ${category}:`, error);
  }
}

function updateBioresources(bioresources) {
  // バイオリソーステーブル
  updateBioresourcesRow('specified', bioresources.specified);
  updateBioresourcesRow('pediatric', bioresources.pediatric);
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
    name8: { 'callret-0': '0' },
    shoman_all: { 'callret-0': '0' },
    shoman_group: { 'callret-0': '0' },
    name7: { 'callret-0': '0' },
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
  };
}
