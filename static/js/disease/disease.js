import { navToggle } from '../utils/navigation.js';
import { focusInput } from '../utils/focusInput.js';
import { popup } from '../utils/popup.js';
import { breadcrumb } from './breadcrumb.js';
import { downloadDatasets } from './download.js';
import { makeHeader } from './overview/makeHeader.js';
import { makeLinkedList } from './overview/makeLinkedList.js';
import { makeExternalLinks } from './overview/makeExternalLinks.js';
import { makeAlternativeName } from './overview/makeAlternativeName.js';
import { makeInheritanceUris } from './overview/makeInheritanceUris.js';
import { makeNumOfPatients } from './overview/makeNumOfPatients.js';
import { makeSubClass } from './overview/makeSubclass.js';
import { checkSummaryData } from './overview/checkSummaryData.js';
import { makeDiseaseDefinition } from './overview/makeDiseaseDefinition.js';
import { updateOverviewDisplay } from './overview/updateOverviewDisplay.js';

import {
  makeCausalGene,
  makeGeneticTesting,
  makePhenotypes,
  makeCell,
  makeMouse,
  makeDNA,
  makeClinvar,
  makeMgend,
} from './diseaseContent.js';
import { switchingDisplayContents } from './diseaseSideNavigation.js';
import { setLangChange } from '../utils/setLangChange.js';
import { smartBox } from '../utils/smart_box.js';

// get NANDO ID
const pathname = window.location.pathname;
const nandoIndex = pathname.indexOf('NANDO:');
const nandoId = pathname.slice(nandoIndex + 6);

// for cache busting
const timestamp = Date.now();

// external functions
navToggle();
focusInput();
popup();
breadcrumb(nandoId);
setLangChange();

const datasets = [
  { name: 'Overview', data: null },
  { name: 'Synonyms', data: null },
  { name: 'Modes of Inheritance', data: null },
  { name: 'OMIM', data: null },
  { name: 'Orphanet', data: null },
  { name: 'Monarch Initiative', data: null },
  // TODO: temporary value
  { name: 'MedGen', data: [] },
  // TODO: temporary value
  { name: 'KEGG Disease', data: [] },
  { name: 'Descriptions', data: null },
  {
    name: 'Number of Specific Medical Expenses Beneficiary Certificate Holders',
    data: null,
  },
  { name: 'Sub-classes', data: null },
  { name: 'Causal Genes', data: null },
  { name: 'Genetic Testing', data: null },
  { name: 'Phenotypes', data: null },
  { name: 'Cell', data: null },
  { name: 'Mouse', data: null },
  { name: 'DNA', data: null },
  { name: 'Clinvar', data: null },
  { name: 'MGeND', data: null },
];

(async () => {
  try {
    const hash = window.location.hash.replace('#', '');
    async function fetchData(apiEndpoint) {
      const url = `/sparqlist/api/${apiEndpoint}?nando_id=${nandoId}&timestamp=${timestamp}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
      }
    }

    // Overview
    // リンク一覧のデータ
    // TODO: change api endpoint to get all links
    await Promise.all([
      fetchData('nanbyodata_get_link_omim_by_nando_id'),
      fetchData('nanbyodata_get_link_orphanet_by_nando_id'),
      fetchData('nanbyodata_get_link_mondo_by_nando_id'),
      // TODO: temporary comment out
      // fetchData('test-nando-medgen'),
      // fetchData('test-nando-kegg'),
    ])
      .then(([omimData, orphanetData, monarchData]) => {
        // TODO: change to [omimData, orphanetData, monarchData, medgenData, keggData]
        const linkedListData = {
          omim: omimData,
          orphanet: orphanetData,
          'monarch-initiative': monarchData,
          //TODO: temporary value
          medgen: [],
          //TODO: temporary value
          'kegg-disease': [],
        };
        makeLinkedList(linkedListData, nandoId);
        datasets.find((d) => d.name === 'OMIM').data = omimData;
        datasets.find((d) => d.name === 'Orphanet').data = orphanetData;
        datasets.find((d) => d.name === 'Monarch Initiative').data =
          monarchData;
        //TODO: temporary comment out
        // datasets.find((d) => d.name === 'MedGen').data = medgenData;
        // datasets.find((d) => d.name === 'KEGG Disease').data = keggData;
        checkAndLogDatasets();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // 特定医療費受給者証所持者数のデータ
    fetchData('nanbyodata_get_stats_on_patient_number_by_nando_id')
      .then((response) => {
        const numOfPatientsData = response;
        makeNumOfPatients(numOfPatientsData);
        datasets.find(
          (d) =>
            d.name ===
            'Number of Specific Medical Expenses Beneficiary Certificate Holders'
        ).data = numOfPatientsData;
        checkAndLogDatasets();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // 下位疾患データ
    fetchData('nanbyodata_get_sub_class_by_nando_id')
      .then((response) => {
        const subClassData = response;
        makeSubClass(subClassData);
        datasets.find((d) => d.name === 'Sub-classes').data = subClassData;
        checkAndLogDatasets();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // get Overview data
    fetchData('nanbyodata_get_overview_by_nando_id').then((entryData) => {
      if (entryData) {
        makeHeader(entryData);
        makeExternalLinks(entryData);
        makeAlternativeName(entryData);
        makeInheritanceUris(entryData);
        checkSummaryData(entryData);
        makeDiseaseDefinition(entryData);
        updateOverviewDisplay();

        // remove unnecessary overview data
        const {
          alt_label_en,
          alt_label_ja,
          inheritance_uris,
          kegg,
          mondos,
          db_xrefs,
          medgen_id,
          medgen_uri,
          urdbms,
          description,
          mondo_decs,
          medgen_definition,
          ...filteredOverviewData
        } = entryData;

        datasets.find((d) => d.name === 'Overview').data = filteredOverviewData;

        // 遺伝形式ダウンロードデータの用意
        const inheritanceUrisData = Object.fromEntries(
          Object.entries({ inheritance_uris }).filter(([_, v]) => v != null)
        );

        const inheritanceUrisDataset = datasets.find(
          (d) => d.name === 'Modes of Inheritance'
        );
        if (Object.keys(inheritanceUrisData).length > 0) {
          inheritanceUrisDataset.data = inheritanceUrisData;
        } else {
          inheritanceUrisDataset.data = {};
        }

        // 別疾患名ダウンロードデータの用意
        const synonymsData = Object.fromEntries(
          Object.entries({ alt_label_en, alt_label_ja }).filter(
            ([_, v]) => v != null
          )
        );

        const synonymsDataset = datasets.find((d) => d.name === 'Synonyms');
        if (Object.keys(synonymsData).length > 0) {
          synonymsDataset.data = synonymsData;
        } else {
          synonymsDataset.data = {};
        }

        // 疾患定義ダウンロードデータの用意
        const definitionData = Object.fromEntries(
          Object.entries({ description, mondo_decs, medgen_definition }).filter(
            ([_, v]) => v != null
          )
        );

        const definitionDataset = datasets.find(
          (d) => d.name === 'Descriptions'
        );
        if (Object.keys(definitionData).length > 0) {
          definitionDataset.data = definitionData;
        } else {
          definitionDataset.data = {};
        }

        checkAndLogDatasets();

        if (hash) {
          trySwitchingContent(hash);
        } else {
          switchingDisplayContents('overview');
          const overviewEl = document.querySelector('.nav-link.overview');
          overviewEl.classList.add('selected');
          overviewEl.style.cursor = 'pointer';
          document.getElementById('content').style.display = 'block';
        }
      }
    });

    // get Causal Genes data
    fetchData('nanbyodata_get_causal_gene_by_nando_id').then(
      (causalGeneData) => {
        makeCausalGene(causalGeneData);
        datasets.find((d) => d.name === 'Causal Genes').data = causalGeneData;
        checkAndLogDatasets();
      }
    );

    // get Genetic Testing data
    fetchData('nanbyodata_get_genetic_test_by_nando_id').then(
      (geneticTestingData) => {
        makeGeneticTesting(geneticTestingData);
        datasets.find((d) => d.name === 'Genetic Testing').data =
          geneticTestingData;
        checkAndLogDatasets();
      }
    );

    // get Phenotypes data
    fetchData('nanbyodata_get_hpo_data_by_nando_id').then((phenotypesData) => {
      makePhenotypes(phenotypesData);
      datasets.find((d) => d.name === 'Phenotypes').data = phenotypesData;
      checkAndLogDatasets();
    });

    // get Cell data
    fetchData('nanbyodata_get_riken_brc_cell_info_by_nando_id').then(
      (cellData) => {
        makeCell(cellData);
        datasets.find((d) => d.name === 'Cell').data = cellData;
        checkAndLogDatasets();
      }
    );

    // get Mouse data
    fetchData('nanbyodata_get_riken_brc_mouse_info_by_nando_id').then(
      (mouseData) => {
        makeMouse(mouseData);
        datasets.find((d) => d.name === 'Mouse').data = mouseData;
        checkAndLogDatasets();
      }
    );

    // get DNA data
    fetchData('nanbyodata_get_riken_brc_dna_info_by_nando_id').then(
      (dnaData) => {
        makeDNA(dnaData);
        datasets.find((d) => d.name === 'DNA').data = dnaData;
        checkAndLogDatasets();
      }
    );

    // get Clinvar data
    fetchData('nanbyodata_get_clinvar_variant_by_nando_id').then(
      (clinvarData) => {
        makeClinvar(clinvarData);
        datasets.find((d) => d.name === 'Clinvar').data = clinvarData;
        checkAndLogDatasets();
      }
    );

    // get MGenD data
    fetchData('nanbyodata_get_mgend_variant_by_nando_id').then((mgendData) => {
      makeMgend(mgendData);
      datasets.find((d) => d.name === 'MGeND').data = mgendData;
      checkAndLogDatasets();
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();

function checkAndLogDatasets() {
  if (datasets.every((dataset) => dataset.data !== null)) {
    downloadDatasets(nandoId, datasets);
    document.querySelector(
      '.summary-download > .open-popup-btn'
    ).disabled = false;
  }
}

function trySwitchingContent(hash, retries = 0) {
  const maxRetries = 10;
  let found = false;

  const items = [
    'overview',
    'causal-genes',
    'genetic-testing',
    'phenotypes',
    'bio-resource-cell',
    'bio-resource-mouse',
    'bio-resource-dna',
    'variant-clinvar',
    'variant-mgend',
  ];

  if (!items.includes(hash)) {
    window.location.hash = '';
    window.location.reload();
    return;
  }

  let modifiedHash = hash;
  switch (hash) {
    case 'bio-resource-cell':
    case 'bio-resource-mouse':
    case 'bio-resource-dna':
      modifiedHash = hash.substring('bio-resource-'.length);
      break;
    case 'variant-clinvar':
    case 'variant-mgend':
      modifiedHash = hash.substring('variant-'.length);
      break;
  }

  const element = document.querySelector(`.${modifiedHash}`);
  if (element && !element.classList.contains('-disabled')) found = true;

  const alreadySelected = document.querySelector('.nav-link.selected');

  if (found && (!alreadySelected || alreadySelected === element)) {
    element.classList.add('selected');
    switchingDisplayContents(hash);
    document.getElementById('content').style.display = 'block';
  } else if (!found && retries < maxRetries) {
    console.error('No hash item found, retrying...');
    setTimeout(() => {
      trySwitchingContent(hash, retries + 1);
    }, 3000);
  } else {
    if (alreadySelected) {
      return;
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  }
}

// smart box
smartBox('NANDO', '/static/tsv/NANDO_20241121.tsv', {
  api_url: '',
  max_results: 100,
});
document.addEventListener('selectedLabel', function (event) {
  const labelInfo = event.detail.labelInfo;
  window.location.href = `${location.origin}/disease/${labelInfo.id}`;
});
