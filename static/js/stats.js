// Stats page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // 統計データを読み込んで表示
  loadStatsData();
});

async function loadStatsData() {
  try {
    // 複数のAPIから実際のデータを取得
    const [nandoData, brcData] = await Promise.all([
      fetchNANDOData(),
      fetchBRCData(),
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
        specified: 123,
        pediatric: 123,
      },
      dataSources: {
        specified: {
          mhlw: { link: '-', definition: 1234 },
          orphanet: { link: 140, definition: 532 },
          monarch: { link: 245, definition: 324 },
          medgen: { link: 345, definition: 453 },
          kegg: { link: 232, definition: 243 },
        },
        pediatric: {
          mhlw: { link: '-', definition: 1234 },
          orphanet: { link: 140, definition: 532 },
          monarch: { link: 245, definition: 324 },
          medgen: { link: 345, definition: 453 },
          kegg: { link: 232, definition: 243 },
        },
      },
      // 疾患関連データ
      relatedData: {
        specified: {
          glycanGenes: 394,
          geneticTests: 394,
          clinicalFeatures: 394,
          facialFeatures: 394,
          humanData: 394,
          chemicals: 394,
          literature: 394,
        },
        pediatric: {
          glycanGenes: 394,
          geneticTests: 394,
          clinicalFeatures: 394,
          facialFeatures: 394,
          humanData: 394,
          chemicals: 394,
          literature: 394,
        },
      },
      // 疾患関連遺伝子
      genes: {
        specified: {
          domestic: 394,
          international: 394,
        },
        pediatric: {
          domestic: 394,
          international: 394,
        },
      },
      // バリアント
      variants: {
        specified: {
          clinvar: 394,
          mgend: 394,
        },
        pediatric: {
          clinvar: 394,
          mgend: 394,
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
    // エラーの場合はサンプルデータを使用
    loadFallbackData();
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

// フォールバック用のサンプルデータ
function loadFallbackData() {
  const statsData = {
    // 難病統計
    specified: {
      all: 1133,
      group: 15,
      groupSubclass: 1117, // 指定難病サブクラスカウント
      subtype: '-', // 未確定のため非表示
      summary: '-', // 未確定のため非表示
    },
    pediatric: {
      all: 1842,
      group: 309,
      groupSubclass: 1532, // 小児慢性疾患サブクラスカウント
      subtype: '-', // 未確定のため非表示
      summary: '-', // 未確定のため非表示
    },
    // 疾患概要
    inheritance: {
      specified: 123,
      pediatric: 123,
    },
    dataSources: {
      specified: {
        mhlw: { link: '-', definition: 1234 },
        orphanet: { link: 140, definition: 532 },
        monarch: { link: 245, definition: 324 },
        medgen: { link: 345, definition: 453 },
        kegg: { link: 232, definition: 243 },
      },
      pediatric: {
        mhlw: { link: '-', definition: 1234 },
        orphanet: { link: 140, definition: 532 },
        monarch: { link: 245, definition: 324 },
        medgen: { link: 345, definition: 453 },
        kegg: { link: 232, definition: 243 },
      },
    },
    // 疾患関連データ
    relatedData: {
      specified: {
        glycanGenes: 394,
        geneticTests: 394,
        clinicalFeatures: 394,
        facialFeatures: 394,
        humanData: 394,
        chemicals: 394,
        literature: 394,
      },
      pediatric: {
        glycanGenes: 394,
        geneticTests: 394,
        clinicalFeatures: 394,
        facialFeatures: 394,
        humanData: 394,
        chemicals: 394,
        literature: 394,
      },
    },
    // 疾患関連遺伝子
    genes: {
      specified: {
        domestic: 394,
        international: 394,
      },
      pediatric: {
        domestic: 394,
        international: 394,
      },
    },
    // バリアント
    variants: {
      specified: {
        clinvar: 394,
        mgend: 394,
      },
      pediatric: {
        clinvar: 394,
        mgend: 394,
      },
    },
    // バイオリソース
    bioresources: {
      specified: {
        cells: parseInt(brcData.shitei_cell.cell),
        mouse: parseInt(brcData.shitei_mouse.mouse),
        dna: parseInt(brcData.shitei_DNA.gene),
      },
      pediatric: {
        cells: parseInt(brcData.shoman_cell.cell),
        mouse: parseInt(brcData.shoman_mouse.mouse),
        dna: parseInt(brcData.shoman_DNA.gene),
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
