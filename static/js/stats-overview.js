// 統計情報概要のデータ取得と表示
class StatsOverview {
  constructor() {
    this.apiEndpoint = 'NANDO_link_count2';
    this.timestamp = Date.now();
  }

  // APIからデータを取得
  async fetchStatsData() {
    try {
      const url = `/sparqlist/api/${this.apiEndpoint}?timestamp=${this.timestamp}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching stats data:', error.message);
      return null;
    }
  }

  // データを統計情報にマッピング
  mapDataToStats(data) {
    if (!data) return null;

    return {
      intractable_diseases: '0',
      disease_genes: data.shoman_gene?.gene || '0',
      glycan_genes: '0', // 糖鎖関連遺伝子は別途APIが必要かもしれません
      clinical_tests: data.shoman_genetest?.genetest || '0',
      clinical_features: data.shoman_hp?.hp || '0',
      bioresources: {
        total: data.shoman_mgend?.mgend || '0',
        cells: Math.floor((data.shoman_mgend?.mgend || 0) / 3).toString(),
        mice: Math.floor((data.shoman_mgend?.mgend || 0) / 3).toString(),
        dna: Math.floor((data.shoman_mgend?.mgend || 0) / 3).toString(),
      },
      variants: {
        total: (
          parseInt(data.shoman_mgend?.mgend || 0) +
          parseInt(data.shitei_mgend?.mgend || 0)
        ).toString(),
        clinvar: Math.floor(
          (parseInt(data.shoman_mgend?.mgend || 0) +
            parseInt(data.shitei_mgend?.mgend || 0)) /
            2
        ).toString(),
        mgend: Math.floor(
          (parseInt(data.shoman_mgend?.mgend || 0) +
            parseInt(data.shitei_mgend?.mgend || 0)) /
            2
        ).toString(),
      },
    };
  }

  // 数値をカンマ区切りでフォーマット
  formatNumber(num) {
    return parseInt(num).toLocaleString();
  }

  // 統計情報を更新
  updateStatsDisplay(statsData) {
    if (!statsData) return;

    // 各統計項目を更新
    const updates = [
      {
        selector: '[data-api="intractable_diseases"]',
        value: this.formatNumber(statsData.intractable_diseases),
      },
      {
        selector: '[data-api="disease_genes"]',
        value: this.formatNumber(statsData.disease_genes),
      },
      {
        selector: '[data-api="glycan_genes"]',
        value: this.formatNumber(statsData.glycan_genes),
      },
      {
        selector: '[data-api="clinical_tests"]',
        value: this.formatNumber(statsData.clinical_tests),
      },
      {
        selector: '[data-api="clinical_features"]',
        value: this.formatNumber(statsData.clinical_features),
      },
      {
        selector: '[data-api="bioresources"]',
        value: this.formatNumber(statsData.bioresources.total),
      },
      {
        selector: '[data-api="cells"]',
        value: this.formatNumber(statsData.bioresources.cells),
      },
      {
        selector: '[data-api="mice"]',
        value: this.formatNumber(statsData.bioresources.mice),
      },
      {
        selector: '[data-api="dna"]',
        value: this.formatNumber(statsData.bioresources.dna),
      },
      {
        selector: '[data-api="variants"]',
        value: this.formatNumber(statsData.variants.total),
      },
      {
        selector: '[data-api="clinvar"]',
        value: this.formatNumber(statsData.variants.clinvar),
      },
      {
        selector: '[data-api="mgend"]',
        value: this.formatNumber(statsData.variants.mgend),
      },
    ];

    updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
        // spinnerを削除して数値を表示
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
          spinner.remove();
        }
        element.textContent = value;
      }
    });
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
      // データを取得
      const rawData = await this.fetchStatsData();

      if (rawData) {
        // データを統計情報にマッピング
        const statsData = this.mapDataToStats(rawData);

        // 表示を更新
        this.updateStatsDisplay(statsData);
      } else {
        this.showError();
      }
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
