// Stats page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // 統計データを読み込んで表示
  loadStatsData();
});

async function loadStatsData() {
  try {
    // 複数のAPIから実際のデータを取得
    const [nandoData, brcData, linkData, linkData2] = await Promise.all([
      fetchNANDOData(),
      fetchBRCData(),
      fetchLinkData(),
      fetchLinkData2(),
    ]);

    // 取得したデータをstatsData形式に変換
    const statsData = {
      // 難病統計
      specified: {
        all: parseInt(nandoData.shitei_all['callret-0']),
        group: parseInt(nandoData.shitei_group['callret-0']),
        groupSubclass: parseInt(nandoData.name8['callret-0']), // 指定難病サブクラスカウント
        subtype: '-', // 未確定のため非表示
        summary: '-', // 未確定のため非表示
      },
      pediatric: {
        all: parseInt(nandoData.shoman_all['callret-0']),
        group: parseInt(nandoData.shoman_group['callret-0']),
        groupSubclass: parseInt(nandoData.name7['callret-0']), // 小児慢性疾患サブクラスカウント
        subtype: '-', // 未確定のため非表示
        summary: '-', // 未確定のため非表示
      },
      // 疾患概要
      inheritance: {
        specified: parseInt(linkData2.shitei_inheritance.inheritance),
        pediatric: parseInt(linkData2.shoman_inheritance.inheritance),
      },
      dataSources: {
        specified: {
          mhlw: {
            link: '-',
            definition: parseInt(linkData2.shitei_description.desc),
          }, // MHLW定義数
          orphanet: { link: '-', definition: '-' }, // 後回し
          monarch: { link: parseInt(linkData.name8.mondo), definition: '-' }, // shitei mondo close count
          medgen: { link: parseInt(linkData.name10.medgen), definition: '-' }, // shitei medgen count
          kegg: { link: parseInt(linkData.name5.kegg), definition: '-' }, // shitei kegg count
        },
        pediatric: {
          mhlw: {
            link: '-',
            definition: parseInt(linkData2.shoman_description.desc),
          }, // MHLW定義数
          orphanet: { link: '-', definition: '-' }, // 後回し
          monarch: { link: parseInt(linkData.name7.mondo), definition: '-' }, // shoman mondo close count
          medgen: { link: parseInt(linkData.name9.medgen), definition: '-' }, // shoman medgen count
          kegg: { link: parseInt(linkData.name6.kegg), definition: '-' }, // shoman kegg count
        },
      },
      // 疾患関連データ
      relatedData: {
        specified: {
          glycanGenes: '-', // まだない
          geneticTests: parseInt(linkData2.shitei_genetest.genetest),
          clinicalFeatures: parseInt(linkData2.shitei_hp.hp),
          facialFeatures: '-', // まだない
          humanData: '-', // まだない
          chemicals: '-', // まだない
          literature: '-', // まだない
        },
        pediatric: {
          glycanGenes: '-', // まだない
          geneticTests: parseInt(linkData2.shoman_genetest.genetest),
          clinicalFeatures: parseInt(linkData2.shoman_hp.hp),
          facialFeatures: '-', // まだない
          humanData: '-', // まだない
          chemicals: '-', // まだない
          literature: '-', // まだない
        },
      },
      // 疾患関連遺伝子
      genes: {
        specified: {
          domestic: parseInt(linkData2.shitei_gene.gene),
          international: '-', // まだない
        },
        pediatric: {
          domestic: parseInt(linkData2.shoman_gene.gene),
          international: '-', // まだない
        },
      },
      // バリアント
      variants: {
        specified: {
          clinvar: '-', // まだない
          mgend: parseInt(linkData2.shitei_mgened.mgend),
        },
        pediatric: {
          clinvar: '-', // まだない
          mgend: parseInt(linkData2.shoman_mgend.mgend),
        },
      },
      // バイオリソース
      bioresources: {
        specified: {
          cells: 2483, // shitei_cell.cell
          mouse: 238, // shitei_mouse.mouse
          dna: 5651, // shitei_DNA.gene
        },
        pediatric: {
          cells: 1635, // shoman_cell.cell
          mouse: 300, // shoman_mouse.mouse
          dna: 6070, // shoman_DNA.gene
        },
      },
    };

    // 各テーブルの数値を更新
    updateDiseaseStats(statsData);
    updateDiseaseOverview(statsData);
    updateRelatedData(statsData);
    updateGenes(statsData);
    updateVariants(statsData);
    updateBioresources(statsData);
  } catch (error) {
    console.error('統計データの読み込みに失敗しました:', error);
    // エラーの場合はテーブルにエラーメッセージを表示
    showErrorMessage();
  }
}

// NANDO_count APIからデータを取得する関数
async function fetchNANDOData() {
  const response = await fetch(
    'http://localhost:8888/sparqlist/api/NANDO_count'
  );
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', contentType);
    console.error('Response text:', text.substring(0, 200) + '...');
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}

// BRC APIからデータを取得する関数
async function fetchBRCData() {
  const response = await fetch(
    'http://localhost:8888/sparqlist/api/NANDO_link_count3_brc'
  );
  if (!response.ok) {
    throw new Error(`BRC API request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', contentType);
    console.error('Response text:', text.substring(0, 200) + '...');
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}

// NANDO_link_count APIからデータを取得する関数
async function fetchLinkData() {
  const response = await fetch(
    'http://localhost:8888/sparqlist/api/NANDO_link_count'
  );
  if (!response.ok) {
    throw new Error(`Link API request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', contentType);
    console.error('Response text:', text.substring(0, 200) + '...');
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}

// NANDO_link_count2 APIからデータを取得する関数
async function fetchLinkData2() {
  const response = await fetch(
    'http://localhost:8888/sparqlist/api/NANDO_link_count2'
  );
  if (!response.ok) {
    throw new Error(`Link2 API request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON but got:', contentType);
    console.error('Response text:', text.substring(0, 200) + '...');
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return await response.json();
}

// エラーメッセージを表示する関数
function showErrorMessage() {
  const errorMessage = 'データの読み込みに失敗しました';

  // 全てのテーブルセルにエラーメッセージを表示
  const allCells = document.querySelectorAll(
    '[id$="-all"], [id$="-group"], [id$="-group-subclass"], [id$="-subtype"], [id$="-summary"], [id$="-inheritance"], [id$="-link"], [id$="-definition"], [id$="-genes"], [id$="-genetic-tests"], [id$="-clinical-features"], [id$="-facial-features"], [id$="-human-data"], [id$="-chemicals"], [id$="-literature"], [id$="-domestic-genes"], [id$="-international-genes"], [id$="-clinvar"], [id$="-mgend"], [id$="-cells"], [id$="-mouse"], [id$="-dna"]'
  );

  allCells.forEach((cell) => {
    cell.textContent = errorMessage;
    cell.style.color = '#dc3545'; // 赤色で表示
  });
}

function updateDiseaseStats(data) {
  // 難病統計テーブル
  document.getElementById('specified-all').textContent =
    data.specified.all.toLocaleString();
  document.getElementById('specified-group').textContent =
    data.specified.group.toLocaleString();
  document.getElementById('specified-group-subclass').textContent =
    data.specified.groupSubclass.toLocaleString();
  document.getElementById('specified-subtype').textContent =
    data.specified.subtype.toLocaleString();
  document.getElementById('specified-summary').textContent =
    data.specified.summary.toLocaleString();

  document.getElementById('pediatric-all').textContent =
    data.pediatric.all.toLocaleString();
  document.getElementById('pediatric-group').textContent =
    data.pediatric.group.toLocaleString();
  document.getElementById('pediatric-group-subclass').textContent =
    data.pediatric.groupSubclass.toLocaleString();
  document.getElementById('pediatric-subtype').textContent =
    data.pediatric.subtype.toLocaleString();
  document.getElementById('pediatric-summary').textContent =
    data.pediatric.summary.toLocaleString();
}

function updateDiseaseOverview(data) {
  // 疾患概要テーブル
  document.getElementById('specified-inheritance').textContent =
    data.inheritance.specified.toLocaleString();
  document.getElementById('pediatric-inheritance').textContent =
    data.inheritance.pediatric.toLocaleString();

  // 指定難病のデータソース
  document.getElementById('specified-mhlw-link').textContent =
    data.dataSources.specified.mhlw.link;
  document.getElementById('specified-mhlw-definition').textContent =
    data.dataSources.specified.mhlw.definition.toLocaleString();
  document.getElementById('specified-orphanet-link').textContent =
    data.dataSources.specified.orphanet.link.toLocaleString();
  document.getElementById('specified-orphanet-definition').textContent =
    data.dataSources.specified.orphanet.definition.toLocaleString();
  document.getElementById('specified-monarch-link').textContent =
    data.dataSources.specified.monarch.link.toLocaleString();
  document.getElementById('specified-monarch-definition').textContent =
    data.dataSources.specified.monarch.definition.toLocaleString();
  document.getElementById('specified-medgen-link').textContent =
    data.dataSources.specified.medgen.link.toLocaleString();
  document.getElementById('specified-medgen-definition').textContent =
    data.dataSources.specified.medgen.definition.toLocaleString();
  document.getElementById('specified-kegg-link').textContent =
    data.dataSources.specified.kegg.link.toLocaleString();
  document.getElementById('specified-kegg-definition').textContent =
    data.dataSources.specified.kegg.definition.toLocaleString();

  // 小慢のデータソース
  document.getElementById('pediatric-mhlw-link').textContent =
    data.dataSources.pediatric.mhlw.link;
  document.getElementById('pediatric-mhlw-definition').textContent =
    data.dataSources.pediatric.mhlw.definition.toLocaleString();
  document.getElementById('pediatric-orphanet-link').textContent =
    data.dataSources.pediatric.orphanet.link.toLocaleString();
  document.getElementById('pediatric-orphanet-definition').textContent =
    data.dataSources.pediatric.orphanet.definition.toLocaleString();
  document.getElementById('pediatric-monarch-link').textContent =
    data.dataSources.pediatric.monarch.link.toLocaleString();
  document.getElementById('pediatric-monarch-definition').textContent =
    data.dataSources.pediatric.monarch.definition.toLocaleString();
  document.getElementById('pediatric-medgen-link').textContent =
    data.dataSources.pediatric.medgen.link.toLocaleString();
  document.getElementById('pediatric-medgen-definition').textContent =
    data.dataSources.pediatric.medgen.definition.toLocaleString();
  document.getElementById('pediatric-kegg-link').textContent =
    data.dataSources.pediatric.kegg.link.toLocaleString();
  document.getElementById('pediatric-kegg-definition').textContent =
    data.dataSources.pediatric.kegg.definition.toLocaleString();
}

function updateRelatedData(data) {
  // 疾患関連データテーブル
  document.getElementById('specified-glycan-genes').textContent =
    data.relatedData.specified.glycanGenes.toLocaleString();
  document.getElementById('specified-genetic-tests').textContent =
    data.relatedData.specified.geneticTests.toLocaleString();
  document.getElementById('specified-clinical-features').textContent =
    data.relatedData.specified.clinicalFeatures.toLocaleString();
  document.getElementById('specified-facial-features').textContent =
    data.relatedData.specified.facialFeatures.toLocaleString();
  document.getElementById('specified-human-data').textContent =
    data.relatedData.specified.humanData.toLocaleString();
  document.getElementById('specified-chemicals').textContent =
    data.relatedData.specified.chemicals.toLocaleString();
  document.getElementById('specified-literature').textContent =
    data.relatedData.specified.literature.toLocaleString();

  document.getElementById('pediatric-glycan-genes').textContent =
    data.relatedData.pediatric.glycanGenes.toLocaleString();
  document.getElementById('pediatric-genetic-tests').textContent =
    data.relatedData.pediatric.geneticTests.toLocaleString();
  document.getElementById('pediatric-clinical-features').textContent =
    data.relatedData.pediatric.clinicalFeatures.toLocaleString();
  document.getElementById('pediatric-facial-features').textContent =
    data.relatedData.pediatric.facialFeatures.toLocaleString();
  document.getElementById('pediatric-human-data').textContent =
    data.relatedData.pediatric.humanData.toLocaleString();
  document.getElementById('pediatric-chemicals').textContent =
    data.relatedData.pediatric.chemicals.toLocaleString();
  document.getElementById('pediatric-literature').textContent =
    data.relatedData.pediatric.literature.toLocaleString();
}

function updateGenes(data) {
  // 疾患関連遺伝子テーブル
  document.getElementById('specified-domestic-genes').textContent =
    data.genes.specified.domestic.toLocaleString();
  document.getElementById('specified-international-genes').textContent =
    data.genes.specified.international.toLocaleString();
  document.getElementById('pediatric-domestic-genes').textContent =
    data.genes.pediatric.domestic.toLocaleString();
  document.getElementById('pediatric-international-genes').textContent =
    data.genes.pediatric.international.toLocaleString();
}

function updateVariants(data) {
  // バリアントテーブル
  document.getElementById('specified-clinvar').textContent =
    data.variants.specified.clinvar.toLocaleString();
  document.getElementById('specified-mgend').textContent =
    data.variants.specified.mgend.toLocaleString();
  document.getElementById('pediatric-clinvar').textContent =
    data.variants.pediatric.clinvar.toLocaleString();
  document.getElementById('pediatric-mgend').textContent =
    data.variants.pediatric.mgend.toLocaleString();
}

function updateBioresources(data) {
  // バイオリソーステーブル
  document.getElementById('specified-cells').textContent =
    data.bioresources.specified.cells.toLocaleString();
  document.getElementById('specified-mouse').textContent =
    data.bioresources.specified.mouse.toLocaleString();
  document.getElementById('specified-dna').textContent =
    data.bioresources.specified.dna.toLocaleString();
  document.getElementById('pediatric-cells').textContent =
    data.bioresources.pediatric.cells.toLocaleString();
  document.getElementById('pediatric-mouse').textContent =
    data.bioresources.pediatric.mouse.toLocaleString();
  document.getElementById('pediatric-dna').textContent =
    data.bioresources.pediatric.dna.toLocaleString();
}
