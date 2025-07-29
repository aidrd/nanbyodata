export function makeReferenceGenes(entryData, retryCount = 0) {
  // データの有効性を先にチェック
  const hasValidData =
    (Array.isArray(entryData) && entryData.length > 0) ||
    (entryData?.reference_genes && entryData.reference_genes.length > 0);

  const referenceGene = document.querySelector('.reference-gene');
  const referenceGeneSubTitle = document.querySelector(
    '.sub-title.-reference-gene'
  );
  // リファレンス遺伝子のセクションを直接取得
  const overviewSection = referenceGeneSubTitle?.closest('.overview-section');

  // DOM要素が見つからない場合でデータがある場合、少し待ってリトライ（最大5回）
  if (!referenceGene && hasValidData && retryCount < 5) {
    setTimeout(() => {
      makeReferenceGenes(entryData, retryCount + 1);
    }, 200);
    return;
  }

  // データがない場合は何もしない
  if (!hasValidData) {
    return;
  }

  // DOM要素が見つからない場合
  if (!referenceGene) {
    console.error(
      'Cannot process: referenceGene element not found after retries'
    );
    return;
  }

  // entryDataが配列の場合（test_reference_geneからのデータ）
  if (Array.isArray(entryData) && entryData.length > 0) {
    appendLinks(entryData, referenceGene);
  }
  // entryDataがオブジェクトでreference_genesプロパティを持つ場合（overviewからのデータ）
  else if (entryData?.reference_genes && entryData.reference_genes.length > 0) {
    appendLinks(entryData.reference_genes, referenceGene);
  }
}

function createLinkElement(url, text) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = text;
  return a;
}

function appendLinks(data, container) {
  if (!container) {
    console.error('Container element not found');
    return;
  }

  if (data && data.length) {
    // コンテナをクリア
    container.innerHTML = '';

    data.forEach((item, index) => {
      const dd = document.createElement('dd');
      const currentLang =
        document.querySelector('.language-select')?.value || 'ja';
      let a;

      // 新しいデータ構造（test_reference_geneからのデータ）の場合
      if (item.label && item.gene) {
        // labelのみを表示テキストとして使用（遺伝形式と同じようにシンプルに）
        a = createLinkElement(item.gene, item.label);

        // gene_nameがある場合はツールチップとして追加
        if (item.gene_name) {
          a.title = item.gene_name;
        }
      }
      // 既存のデータ構造（overviewからのデータ）の場合
      else if (item.id || item.id_en) {
        if (currentLang === 'en' && item.id_en) {
          a = createLinkElement(item.url || item.uri, item.id_en);
        } else {
          a = createLinkElement(item.url || item.uri, item.id);
        }
      }
      // データが不完全な場合はスキップ
      else {
        return;
      }

      dd.classList.add('linked-item');
      dd.append(a);
      container.append(dd);

      // 最後の要素以外にはスペースを追加（遺伝形式と同じスタイル）
      if (index < data.length - 1) {
        const space = document.createTextNode(' ');
        container.append(space);
      }
    });
  }
}
