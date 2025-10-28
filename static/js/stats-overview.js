// 統計情報概要のデータ取得と表示
class StatsOverview {
  constructor() {
    this.apiEndpoint = 'NANDO_link_count2';
    this.timestamp = Date.now();
  }

  // 各APIを個別に取得して、取得できたものから順次表示
  async fetchStatsData() {
    const allData = {};

    // NANDO_count APIからNANDOデータを取得
    fetch(`/sparqlist/api/NANDO_count?timestamp=${this.timestamp}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((nandoData) => {
        if (nandoData) {
          allData.nandoData = nandoData;
          const shiteiAll = parseInt(nandoData.shitei_all?.['callret-0'] || 0);
          const shomanAll = parseInt(nandoData.shoman_all?.['callret-0'] || 0);
          const nandoTotal = shiteiAll + shomanAll;
          this.updateCard(
            'intractable_diseases',
            nandoTotal > 0 ? nandoTotal.toString() : '-'
          );
        }
      })
      .catch((error) => {
        console.error('NANDO_count API failed:', error);
        this.updateCard('intractable_diseases', 'N/A');
      });

    // NANDO_link_count2 APIから遺伝子・検査・臨床特徴データを取得
    fetch(`/sparqlist/api/NANDO_link_count2?timestamp=${this.timestamp}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((linkData2) => {
        if (linkData2) {
          allData.linkData2 = linkData2;

          // 疾患関連遺伝子
          const shiteiGenes = parseInt(linkData2.shitei_gene?.gene || 0);
          const shomanGenes = parseInt(linkData2.shoman_gene?.gene || 0);
          const totalGenes = shiteiGenes + shomanGenes;
          this.updateCard(
            'disease_genes',
            totalGenes > 0 ? totalGenes.toString() : '-'
          );

          // 診療用遺伝学的検査
          const shiteiTests = parseInt(
            linkData2.shitei_genetest?.genetest || 0
          );
          const shomanTests = parseInt(
            linkData2.shoman_genetest?.genetest || 0
          );
          const totalTests = shiteiTests + shomanTests;
          this.updateCard(
            'clinical_tests',
            totalTests > 0 ? totalTests.toString() : '-'
          );

          // 臨床的特徴
          const shiteiFeatures = parseInt(linkData2.shitei_hp?.hp || 0);
          const shomanFeatures = parseInt(linkData2.shoman_hp?.hp || 0);
          const totalFeatures = shiteiFeatures + shomanFeatures;
          this.updateCard(
            'clinical_features',
            totalFeatures > 0 ? totalFeatures.toString() : '-'
          );
        }
      })
      .catch((error) => {
        console.error('NANDO_link_count2 API failed:', error);
        this.updateCard('disease_genes', 'N/A');
        this.updateCard('clinical_tests', 'N/A');
        this.updateCard('clinical_features', 'N/A');
      });

    // NANDO_link_count3_brc APIからバイオリソースデータを取得
    fetch(`/sparqlist/api/NANDO_link_count3_brc?timestamp=${this.timestamp}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((brcData) => {
        if (brcData) {
          allData.brcData = brcData;
          const shiteiCells = parseInt(brcData.shitei_cell?.cell || 0);
          const shomanCells = parseInt(brcData.shoman_cell?.cell || 0);
          const shiteiMice = parseInt(brcData.shitei_mouse?.mouse || 0);
          const shomanMice = parseInt(brcData.shoman_mouse?.mouse || 0);
          const shiteiDna = parseInt(brcData.shitei_DNA?.gene || 0);
          const shomanDna = parseInt(brcData.shoman_DNA?.gene || 0);
          const total =
            shiteiCells +
            shomanCells +
            shiteiMice +
            shomanMice +
            shiteiDna +
            shomanDna;
          this.updateCard('bioresources', total > 0 ? total.toString() : '-');
        }
      })
      .catch((error) => {
        console.error('NANDO_link_count3_brc API failed:', error);
        this.updateCard('bioresources', 'N/A');
      });

    // NANDO_link_count4 APIから顔貌特徴データを取得
    fetch(`/sparqlist/api/NANDO_link_count4?timestamp=${this.timestamp}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((linkData4) => {
        if (linkData4) {
          allData.linkData4 = linkData4;
          const shiteiFacial = parseInt(linkData4.shitei_gm?.GM || 0);
          const shomanFacial = parseInt(linkData4.shoman_gm?.GM || 0);
          const totalFacial = shiteiFacial + shomanFacial;
          this.updateCard(
            'facial_features',
            totalFacial > 0 ? totalFacial.toString() : '-'
          );
        }
      })
      .catch((error) => {
        console.error('NANDO_link_count4 API failed:', error);
        this.updateCard('facial_features', 'N/A');
      });

    // 糖鎖関連遺伝子は常に'-'
    this.updateCard('glycan_genes', '-');

    // 外部リンクは常に'-'（または必要に応じてAPIから取得）
    this.updateCard('external_links', '-');

    return allData;
  }

  // 個別のカードを更新するヘルパーメソッド
  updateCard(apiName, value) {
    const element = document.querySelector(`[data-api="${apiName}"]`);
    if (element) {
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
      element.textContent = this.formatNumber(value);
    }
  }

  // 数値をカンマ区切りでフォーマット
  formatNumber(num) {
    if (num === '-' || num === null || num === undefined || num === 'N/A') {
      return num;
    }
    return parseInt(num).toLocaleString();
  }

  // ローディング状態を表示
  showLoading() {
    const loadingElements = document.querySelectorAll('[data-api]');
    loadingElements.forEach((element) => {
      // 既存のspinnerがあれば削除
      const existingSpinner = element.querySelector('.loading-spinner');
      if (existingSpinner) {
        existingSpinner.remove();
      }

      // 新しいspinnerを追加
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner -stats';
      element.appendChild(spinner);
    });
  }

  // エラー状態を表示
  showError() {
    const errorElements = document.querySelectorAll('[data-api]');
    errorElements.forEach((element) => {
      // spinnerを削除してエラーメッセージを表示
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
      element.textContent = 'N/A';
    });
  }

  // 初期化
  async init() {
    // ローディング状態を表示
    this.showLoading();

    try {
      // データを取得（各APIが完了次第、個別に表示される）
      await this.fetchStatsData();
    } catch (error) {
      console.error('Error initializing stats overview:', error);
      this.showError();
    }
  }
}

// ページ読み込み時に統計情報を初期化
document.addEventListener('DOMContentLoaded', () => {
  const statsOverview = new StatsOverview();
  statsOverview.init();
});

export { StatsOverview };
