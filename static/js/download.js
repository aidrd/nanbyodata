export const downloadDatasets = (nandoId, datasets) => {
  function prepareDataToDownload(format, datasets) {
    if (format === 'json') {
      // JSON形式でデータを準備
      const jsonData = datasets.reduce(
        (acc, { name, data }) => ({ ...acc, [name]: data }),
        {}
      );
      return JSON.stringify(jsonData, null, 2);
    } else if (format === 'text') {
      // テキスト形式でデータを準備
      return datasets
        .map(({ name, data }) => `--- ${name} ---\n${JSON.stringify(data, null, 2)}`)
        .join('\n\n');
    }
    return '';
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

  document.getElementById('downloadForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const format = new FormData(this).get('format');
    const dataToDownload = prepareDataToDownload(format, datasets);

    // データをダウンロード用ファイルとしてユーザーに提供
    const mimeType = format === 'json' ? 'application/json' : 'text/plain';
    downloadFile(dataToDownload, mimeType, `NANDO_ID_${nandoId}.${format}`);
  });
}