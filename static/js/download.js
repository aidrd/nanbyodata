export const downloadDatasets = (nandoId, datasets) => {
  function prepareDataToDownload(format, datasets) {
    if (format === 'json') {
      return prepareJsonData();
    } else if (format === 'txt') {
      // テキスト形式でデータを準備
      return datasets
        .map(
          ({ name, data }) =>
            `--- ${name} ---\n${JSON.stringify(data, null, 2)}`
        )
        .join('\n\n');
    }
    return '';
  }

  function prepareJsonData() {
    const categoryMappings = {
      Overview: [],
      'Causal Genes': [],
      'Genetic Testing': [],
      Phenotypes: [],
      'Bio Resource': ['Cell', 'Mouse', 'DNA'],
      Variant: ['Clinvar'],
    };
    // 初期jsonData作成
    const jsonData = Object.fromEntries(
      Object.keys(categoryMappings).map((category) => [category, {}])
    );
    //カテゴリーに分類
    datasets.forEach(({ name, data }) => {
      const category = Object.keys(categoryMappings).find((category) =>
        categoryMappings[category].includes(name)
      );
      if (category) {
        jsonData[category][name] = data;
      } else {
        jsonData[name] = data;
      }
    });
    return JSON.stringify(jsonData, null, 2);
  }

  function downloadFile(data, type, filename) {
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document
    .getElementById('downloadForm')
    .addEventListener('submit', function (e) {
      e.preventDefault();
      const format = new FormData(this).get('format');
      const dataToDownload = prepareDataToDownload(format, datasets);

      // データをダウンロード用ファイルとしてユーザーに提供
      const mimeType = format === 'json' ? 'application/json' : 'text/plain';

      downloadFile(dataToDownload, mimeType, `NANDO_ID_${nandoId}.${format}`);
    });
};
