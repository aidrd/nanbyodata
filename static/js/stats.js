// Stats page JavaScript
document.addEventListener('DOMContentLoaded', function () {
  // 統計データを読み込んで表示
  loadStatsData();
});

function loadStatsData() {
  // 実際のAPIエンドポイントからデータを取得する場合
  // 現在はサンプルデータを使用

  // サンプル統計データ（画像の内容に基づく）
  const statsData = {
    // 難病統計
    specified: {
      all: 1133,
      group: 150,
      groupSubclass: 348,
      subtype: 394,
      summary: 1117,
    },
    pediatric: {
      all: 1841,
      group: 308,
      groupSubclass: 858,
      subtype: 1532,
      summary: 978,
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
        cells: 1133,
        mouse: 348,
        dna: 394,
      },
      pediatric: {
        cells: 1841,
        mouse: 858,
        dna: 1532,
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

// 実際のAPIからデータを取得する関数（将来の実装用）
async function fetchStatsFromAPI() {
  try {
    // 実際のAPIエンドポイントに置き換える
    const response = await fetch('/api/stats');
    if (!response.ok) {
      throw new Error('API request failed');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch stats data:', error);
    // エラーの場合はサンプルデータを使用
    return null;
  }
}
