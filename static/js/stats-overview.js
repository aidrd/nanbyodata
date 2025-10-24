// 統計情報概要のデータ取得と表示
class StatsOverview {
  constructor() {
    this.apiEndpoint = 'NANDO_link_count2';
    this.timestamp = Date.now();
  }

  // APIからデータを取得
  async fetchStatsData() {
    try {
      // 複数のAPIを並列で呼び出し（Promise.allSettledを使用）
      const apiResults = await Promise.allSettled([
        fetch(
          `/sparqlist/api/${this.apiEndpoint}?timestamp=${this.timestamp}`
        ).then((res) => (res.ok ? res.json() : null)),
        fetch(
          `/sparqlist/api/NANDO_link_count?timestamp=${this.timestamp}`
        ).then((res) => (res.ok ? res.json() : null)),
        fetch(
          `/sparqlist/api/NANDO_link_count3_brc?timestamp=${this.timestamp}`
        ).then((res) => (res.ok ? res.json() : null)),
        fetch(`/sparqlist/api/NANDO_count?timestamp=${this.timestamp}`).then(
          (res) => (res.ok ? res.json() : null)
        ),
        fetch(
          `/sparqlist/api/NANDO_link_count4?timestamp=${this.timestamp}`
        ).then((res) => (res.ok ? res.json() : null)),
      ]);

      // 各APIの結果を処理
      const linkData2 =
        apiResults[0].status === 'fulfilled' ? apiResults[0].value : null;
      const linkData =
        apiResults[1].status === 'fulfilled' ? apiResults[1].value : null;
      const brcData =
        apiResults[2].status === 'fulfilled' ? apiResults[2].value : null;
      const nandoData =
        apiResults[3].status === 'fulfilled' ? apiResults[3].value : null;
      const linkData4 =
        apiResults[4].status === 'fulfilled' ? apiResults[4].value : null;

      // 失敗したAPIをログ出力
      apiResults.forEach((result, index) => {
        const apiNames = ['Link2', 'Link', 'BRC', 'NANDO_count', 'Link4'];
        if (result.status === 'rejected') {
          console.error(`${apiNames[index]} API failed:`, result.reason);
        }
      });

      // データをマージ
      return {
        ...linkData2,
        ...linkData,
        ...brcData,
        ...nandoData,
        ...linkData4,
        // APIの成功/失敗状態を追加
        apiStatus: {
          linkData2: apiResults[0].status,
          linkData: apiResults[1].status,
          brcData: apiResults[2].status,
          nandoData: apiResults[3].status,
          linkData4: apiResults[4].status,
        },
      };
    } catch (error) {
      console.error('Error fetching stats data:', error.message);
      return null;
    }
  }

  // データを統計情報にマッピング
  mapDataToStats(data) {
    if (!data) return null;

    // バイオリソースの合計を計算
    const shiteiCells = parseInt(data.shitei_cell?.cell || 0);
    const shomanCells = parseInt(data.shoman_cell?.cell || 0);
    const shiteiMice = parseInt(data.shitei_mouse?.mouse || 0);
    const shomanMice = parseInt(data.shoman_mouse?.mouse || 0);
    const shiteiDna = parseInt(data.shitei_DNA?.gene || 0);
    const shomanDna = parseInt(data.shoman_DNA?.gene || 0);

    // NANDOの合計を計算
    const shiteiAll = parseInt(data.shitei_all?.['callret-0'] || 0);
    const shomanAll = parseInt(data.shoman_all?.['callret-0'] || 0);
    const nandoTotal = shiteiAll + shomanAll;

    // 疾患関連遺伝子の合計を計算
    const shiteiGenes = parseInt(data.shitei_gene?.gene || 0);
    const shomanGenes = parseInt(data.shoman_gene?.gene || 0);
    const totalGenes = shiteiGenes + shomanGenes;

    // 臨床検査の合計を計算
    const shiteiTests = parseInt(data.shitei_genetest?.genetest || 0);
    const shomanTests = parseInt(data.shoman_genetest?.genetest || 0);
    const totalTests = shiteiTests + shomanTests;

    // 臨床的特徴の合計を計算
    const shiteiFeatures = parseInt(data.shitei_hp?.hp || 0);
    const shomanFeatures = parseInt(data.shoman_hp?.hp || 0);
    const totalFeatures = shiteiFeatures + shomanFeatures;

    return {
      intractable_diseases: nandoTotal > 0 ? nandoTotal.toString() : '-',
      disease_genes: totalGenes > 0 ? totalGenes.toString() : '-',
      glycan_genes: '-',
      clinical_tests: totalTests > 0 ? totalTests.toString() : '-',
      clinical_features: totalFeatures > 0 ? totalFeatures.toString() : '-',
      bioresources: {
        total: (() => {
          const total =
            shiteiCells +
            shomanCells +
            shiteiMice +
            shomanMice +
            shiteiDna +
            shomanDna;
          return total > 0 ? total.toString() : '-';
        })(),
        cells: (() => {
          const total = shiteiCells + shomanCells;
          return total > 0 ? total.toString() : '-';
        })(),
        mice: (() => {
          const total = shiteiMice + shomanMice;
          return total > 0 ? total.toString() : '-';
        })(),
        dna: (() => {
          const total = shiteiDna + shomanDna;
          return total > 0 ? total.toString() : '-';
        })(),
      },
      variants: {
        total: (() => {
          const total =
            parseInt(data.shoman_mgend?.mgend || 0) +
            parseInt(data.shitei_mgend?.mgend || 0);
          return total > 0 ? total.toString() : '-';
        })(),
        clinvar: (() => {
          const total =
            parseInt(data.shoman_mgend?.mgend || 0) +
            parseInt(data.shitei_mgend?.mgend || 0);
          return total > 0 ? Math.floor(total / 2).toString() : '-';
        })(),
        mgend: (() => {
          const total =
            parseInt(data.shoman_mgend?.mgend || 0) +
            parseInt(data.shitei_mgend?.mgend || 0);
          return total > 0 ? Math.floor(total / 2).toString() : '-';
        })(),
      },
      facial_features: (() => {
        const shiteiFacial = parseInt(data.shitei_gm?.GM || 0);
        const shomanFacial = parseInt(data.shoman_gm?.GM || 0);
        const totalFacial = shiteiFacial + shomanFacial;
        return totalFacial > 0 ? totalFacial.toString() : '-';
      })(),
      external_links: (() => {
        const total = '-';
      })(),
    };
  }

  // 数値をカンマ区切りでフォーマット
  formatNumber(num) {
    if (num === '-' || num === null || num === undefined) {
      return '-';
    }
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
      {
        selector: '[data-api="facial_features"]',
        value: this.formatNumber(statsData.facial_features),
      },
      {
        selector: '[data-api="external_links"]',
        value: this.formatNumber(statsData.external_links),
      },
    ];

    updates.forEach(({ selector, value }) => {
      const element = document.querySelector(selector);
      if (element) {
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
