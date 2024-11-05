import {
  linkedListJaColumns,
  linkedListEnColumns,
} from '../utils/linkedListColumns.js';
import {
  causalGeneColumns,
  geneticTestingColumns,
  phenotypesJaColumns,
  phenotypesEnColumns,
  bioResourceCellColumns,
  bioResourceMouseColumns,
  bioResourceDnaColumns,
  variantClinvarColumns,
  variantMgendColumns,
} from '../utils/stanzaColumns.js';

export const downloadDatasets = (nandoId, datasets) => {
  // TODO: remove console.log
  console.log(datasets);
  function prepareDataToDownload(format) {
    if (format === 'json') {
      return JSON.stringify(prepareJsonData(), null, 2);
    } else if (format === 'txt') {
      return prepareTxtData();
    }
    return '';
  }

  function prepareDatasets() {
    const convertedDatasets = Object.values(datasets).map(({ name, data }) => {
      switch (name) {
        case 'Overview':
          return { name, data };
        case 'Synonyms':
          return { name, data };
        case 'OMIM':
          return {
            name,
            data: reconstructLinkedListData(linkedListJaColumns, 'omim', data),
          };
        case 'Orphanet':
          return {
            name,
            data: reconstructLinkedListData(
              linkedListJaColumns,
              'orphanet',
              data
            ),
          };
        case 'Monarch Initiative':
          return {
            name,
            data: reconstructLinkedListData(
              linkedListJaColumns,
              'monarch-initiative',
              data
            ),
          };
        case 'MedGen':
          return {
            name,
            data: reconstructLinkedListData(
              linkedListJaColumns,
              'medgen',
              data
            ),
          };
        case 'KEGG Disease':
          return {
            name,
            data: reconstructLinkedListData(
              linkedListJaColumns,
              'kegg-disease',
              data
            ),
          };
        case 'Disease Definition':
          return { name, data };
        case 'Causal Genes':
          return { name, data: reconstructionData(causalGeneColumns, data) };
        case 'Genetic Testing':
          return {
            name,
            data: reconstructionData(geneticTestingColumns, data),
          };
        case 'Phenotypes':
          const currentLang = document.querySelector('.language-select').value;
          const currentColumns =
            currentLang === 'ja' ? phenotypesJaColumns : phenotypesEnColumns;
          return { name, data: reconstructionData(currentColumns, data) };
        case 'Cell':
          return {
            name,
            data: reconstructionData(bioResourceCellColumns, data),
          };
        case 'Mouse':
          return {
            name,
            data: reconstructionData(bioResourceMouseColumns, data),
          };
        case 'DNA':
          return {
            name,
            data: reconstructionData(bioResourceDnaColumns, data),
          };
        case 'Clinvar':
          return {
            name,
            data: reconstructionData(variantClinvarColumns, data),
          };
        case 'MGeND':
          return {
            name,
            data: reconstructionData(variantMgendColumns, data),
          };
      }
    });
    console.log(convertedDatasets);

    return convertedDatasets;
  }

  function reconstructionData(columns, data) {
    return data.map((d) => {
      const reducedData = {};
      for (const [currentKey, currentValue] of Object.entries(d)) {
        const column = columns.find((column) => column.id === currentKey);
        if (column) {
          reducedData[column.label] = currentValue;
        }
      }
      const orderedData = {};
      for (const column of columns) {
        orderedData[column.label] = reducedData[column.label];
      }
      return orderedData;
    });
  }

  // Processing of linkedList only
  function reconstructLinkedListData(columnsArray, className, data) {
    const columns = columnsArray.find((col) => col.class === className);

    if (!columns) {
      console.error(`Class "${className}" not found in columns array.`);
      return [];
    }

    return data
      .filter((d) => d.displayid)
      .map((d) => {
        const reducedData = {};

        for (const [key, value] of Object.entries(d)) {
          const column = columns.labels.find((label) => label.content === key);

          if (column) {
            if (column.label === 'Link Type') {
              const matchType = value.split('#')[1];
              reducedData[column.label] =
                matchType === 'closeMatch'
                  ? 'Close Match'
                  : matchType === 'exactMatch'
                  ? 'Exact Match'
                  : value;
            } else {
              reducedData[column.label] = value;
            }
          }
        }

        const orderedData = {};
        for (const column of columns.labels) {
          orderedData[column.label] = reducedData[column.label] || '';
        }

        return orderedData;
      });
  }

  function prepareJsonData() {
    const categoryMappings = {
      Overview: [],
      // TODO: fix below contents
      Synonyms: [],
      'Overview/List of links': [
        'OMIM',
        'Orphanet',
        'Monarch Initiative',
        'MedGen',
        'KEGG Disease',
      ],
      'Disease Definition': [],
      // Overview/Patient Statistics:[],
      // Overview/Subclass:[],
      'Causal Genes': [],
      'Genetic Testing': [],
      Phenotypes: [],
      'Bio Resource': ['Cell', 'Mouse', 'DNA'],
      Variant: ['Clinvar', 'MGeND'],
    };
    // 初期jsonData作成
    const jsonData = Object.fromEntries(
      Object.keys(categoryMappings).map((category) => [category, {}])
    );
    //カテゴリーに分類
    prepareDatasets().forEach(({ name, data }) => {
      const category = Object.keys(categoryMappings).find((category) =>
        categoryMappings[category].includes(name)
      );
      if (category) {
        jsonData[category][name] = data;
      } else {
        jsonData[name] = data;
      }
    });
    return jsonData;
  }

  function prepareTxtData() {
    const jsonData = prepareJsonData();
    let txtData = '';

    Object.entries(jsonData).forEach(([categoryName, categoryData]) => {
      switch (categoryName) {
        case 'Overview':
          txtData += `-- ${categoryName} --\n`;
          processObject(categoryData, '');
          txtData += '\n';
          break;

        case 'Synonyms':
        case 'Disease Definition':
          txtData += `-- Overview/${categoryName} --\n`;
          processObject(categoryData, '');
          txtData += '\n';
          break;

        default:
          processCategory(categoryName, categoryData);
          break;
      }
    });

    return txtData;

    function processObject(obj, prefix) {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (typeof value[0] === 'object') {
            processArray(value, `${prefix}${key}/`);
          } else {
            processArray(value, `${prefix}${key} - `);
          }
        } else if (typeof value === 'object') {
          processObject(value, `${prefix}${key}/`);
        } else {
          txtData += `${prefix}${key} - ${value}\n`;
        }
      });
    }

    function processArray(arr, prefix) {
      arr.forEach((item) => {
        if (typeof item === 'object') {
          processObject(item, prefix);
        } else {
          txtData += `${prefix}${item}\n`;
        }
      });
    }

    function processCategory(categoryName, categoryData) {
      if (Array.isArray(categoryData)) {
        txtData += `-- ${categoryName} --\n`;
        if (categoryData.length > 0) {
          const keysTxt = Object.keys(categoryData[0]).join('\t') + '\n';
          const valuesTxt = categoryData
            .map((item) => Object.values(item).join('\t'))
            .join('\n');
          txtData += keysTxt + valuesTxt + '\n';
        }
        txtData += '\n';
      } else {
        Object.entries(categoryData).forEach(([key, value]) => {
          txtData += `-- ${categoryName}/${key} --\n`;
          if (value.length > 0) {
            const keysTxt = Object.keys(value[0]).join('\t') + '\n';
            const valuesTxt = value
              .map((item) => Object.values(item).join('\t'))
              .join('\n');
            txtData += keysTxt + valuesTxt + '\n';
          }

          if (key !== 'Clinvar') {
            txtData += '\n';
          }
        });
      }
    }
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
      const dataToDownload = prepareDataToDownload(format);

      // データをダウンロード用ファイルとしてユーザーに提供
      const mimeType = format === 'json' ? 'application/json' : 'text/plain';

      downloadFile(dataToDownload, mimeType, `NANDO_ID_${nandoId}.${format}`);
    });
};
