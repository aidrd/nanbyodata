// dispaly: none until loading is finished
document.getElementById('content').style.display = 'none';
document.getElementById('sidebar').style.display = 'none';

// get NANDO ID
const pathname = window.location.pathname;
const nandoIndex = pathname.indexOf('NANDO:');
const nandoId = pathname.slice(nandoIndex + 6);

(async () => {
  const entryData = await fetch(
    'https://nanbyodata.jp/sparqlist/api/get_nando_entry_by_nando_id?nando_id=' +
      nandoId,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((res) => res.json());

  // summary header
  makeHeader(entryData);

  // external links
  makeExternalLinks(entryData);

  // alternative name
  makeAlternativeName(entryData);

  // inheritance uris
  makeInheritanceUris(entryData);

  // links list
  makeLinksList(entryData);

  // disease definition
  makeDiseaseDefinition(entryData);

  // properties
  makeProperties(entryData);

  // medical genetic testing info
  makeMedicalGeneticTestingInfo(entryData);

  // phenotype view
  makePhenotypeView(entryData);

  // specific bio resource
  makeSpecificBioResource(entryData);

  // variant
  makeVariant(entryData);

  selectedItem();
  switchingDisplayContents('temp-summary');
})();

function makeHeader(entryData) {
  const refNandoId = document.getElementById('temp-nando-id');
  refNandoId.textContent = nandoId;

  const refNandoLink = document.getElementById('temp-nando-link');
  refNandoLink.setAttribute(
    'href',
    refNandoLink.getAttribute('href') + nandoId
  );
  refNandoLink.textContent += nandoId;

  document
    .getElementById('temp-nando-copy')
    .addEventListener('click', async () => {
      const clipboardText = 'https://nanbyodata.jp/ontology/nando#' + nandoId;
      document.getElementById('temp-nando-copy').textContent = 'Copied!';
      await navigator.clipboard.writeText(clipboardText);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      document.getElementById('temp-nando-copy').textContent = 'Copy';
    });

  const labelJa = document.getElementById('temp-label-ja');
  labelJa.innerHTML =
    '<ruby>' +
    entryData.label_ja +
    '<rt>' +
    entryData.ruby +
    '</rt>' +
    '</ruby>';

  const labelEn = document.getElementById('temp-label-en');
  labelEn.textContent = entryData.label_en;

  const notificationNumber = document.getElementById(
    'temp-notification-number'
  );
  notificationNumber.textContent = entryData.notification_number;
  if (!entryData.notification_number) {
    notificationNumber.parentNode.remove();
    const tempDataSummary = document.getElementById('temp-summary');
    tempDataSummary.style.borderBottom = 'none';
  }
}

function makeExternalLinks(entryData) {
  const externalLinks = document.getElementById('temp-external-links');

  const items = [
    {
      url: entryData.mhlw?.url,
      element: externalLinks.querySelector('.linked-item.mhlw'),
      existing: !!entryData.mhlw,
    },
    {
      url: entryData.source,
      element: externalLinks.querySelector('.linked-item.source'),
      existing: !!entryData.source,
    },
    {
      url: entryData.nanbyou?.url,
      element: externalLinks.querySelector('.linked-item.nanbyou'),
      existing: !!entryData.nanbyou,
    },
    {
      url: entryData.shouman?.url,
      element: externalLinks.querySelector('.linked-item.shouman'),
      existing: !!entryData.shouman,
    },
  ];

  items.forEach((item) => {
    const { url, element } = item;
    if (url) {
      element.querySelector('a').setAttribute('href', url);
    } else {
      element.remove();
    }
  });

  const allFalse = items.every((item) => item.existing === false);
  if (allFalse) {
    document.getElementById('temp-data-summary').style.borderBottom = 'none';
  }
}

function makeAlternativeName(entryData) {
  const altLabelJa = document.querySelector('.alt-label-ja');
  const altLabelEn = document.querySelector('.alt-label-en');

  if (entryData.alt_label_ja) {
    entryData.alt_label_ja.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      altLabelJa.append(ddElement);
    });
  } else {
    altLabelJa.remove();
  }
  if (entryData.alt_label_en) {
    entryData.alt_label_en.forEach((item) => {
      const ddElement = document.createElement('dd');
      ddElement.textContent = item;
      altLabelEn.append(ddElement);
    });
  } else {
    altLabelEn.remove();
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

function appendLinks(data, container, prefix = '') {
  if (data && data.length) {
    data.forEach((item, index) => {
      const dd = document.createElement('dd');
      const a = createLinkElement(item.url || item.uri, prefix + item.id);
      dd.classList.add('linked-item');
      dd.append(a);
      container.append(dd);
      if (index < data.length - 1) {
        const space = document.createTextNode(' ');
        container.append(space);
      }
    });
  } else {
    container.remove();
  }
}

function makeInheritanceUris(entryData) {
  const inheritanceUris = document.querySelector('.inheritance-uri');
  if (entryData.inheritance_uris) {
    appendLinks(entryData.inheritance_uris, inheritanceUris);
  } else {
    inheritanceUris.remove();
  }
}

function makeLinksList(entryData) {
  const linksListProperties = document.querySelector('.properties');
  const omim = linksListProperties.querySelector('.omim');
  const orphanet = linksListProperties.querySelector('.orphanet');
  const medgen = linksListProperties.querySelector('.medgen');
  const mondos = linksListProperties.querySelector('.mondos');
  const kegg = linksListProperties.querySelector('.kegg');
  const urdbms = linksListProperties.querySelector('.urdbms');

  appendLinks(entryData.db_xrefs?.omim, omim);
  appendLinks(entryData.db_xrefs?.orphanet, orphanet, 'ORPHA:');

  if (entryData.medgen_id) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.medgen_uri, entryData.medgen_id);
    dd.classList.add('linked-item');
    dd.append(a);
    medgen.append(dd);
  } else {
    medgen.remove();
  }

  appendLinks(entryData.mondos, mondos);

  if (entryData.kegg) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.kegg.url, entryData.kegg.id);
    dd.classList.add('linked-item');
    dd.append(a);
    kegg.append(dd);
  } else {
    kegg.remove();
  }

  if (entryData.urdbms) {
    const dd = document.createElement('dd');
    const a = createLinkElement(entryData.urdbms.url, entryData.urdbms.id);
    dd.classList.add('linked-item');
    dd.append(a);
    urdbms.append(dd);
  } else {
    urdbms.remove();
  }
}

function makeProperties(entryData) {
  const causativeGene = document.getElementById('temp-causative-gene');
  const properties = causativeGene.querySelector('#temp-properties');
  const item = {
    existing: !!entryData.gene_uris,
    url: `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_gene_by_nando_id?nando_id=${entryData.nando_id}`,
    columns: '',
  };
  if (item.existing) {
    properties.innerHTML = `
      <togostanza-pagination-table
      data-url="${item.url}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;gene_symbol&quot;,&quot;label&quot;:&quot;Gene symbol&quot;,&quot;link&quot;:&quot;omim_url&quot;,&quot;target&quot;:&quot;_blank&quot;} ,   {&quot;id&quot;:&quot;ncbi_id&quot;,&quot;label&quot;:&quot;NCBI ID&quot;,&quot;link&quot;:&quot;ncbi_url&quot;,&quot;target&quot;:&quot;_blank&quot;} ,  {&quot;id&quot;:&quot;nando_label_e&quot;,&quot;label&quot;:&quot;NANDO Disease label&quot;,&quot;link&quot;:&quot;nando_ida&quot;,&quot;target&quot;:&quot;_blank&quot;}, {&quot;id&quot;:&quot;mondo_label&quot;,&quot;label&quot;:&quot;MONDO Disease label&quot;,&quot;link&quot;:&quot;mondo_url&quot;,&quot;target&quot;:&quot;_bkank&quot;} ]"
      ></togostanza-pagination-table>
      `;
  } else {
    causativeGene.remove();
  }
}

function makeDiseaseDefinition(entryData) {
  const diseaseDefinition = document.getElementById('temp-disease-definition');
  const tabWrap = diseaseDefinition.querySelector(
    '#temp-disease-definition .tab-wrap'
  );

  const items = [
    {
      class: 'mhlw',
      existing: !!entryData.description,
      desc: entryData.description,
      translate: false,
    },
    {
      class: 'monarch-initiative',
      existing: !!entryData.mondo_decs,
      desc: entryData.mondo_decs?.map((dec) => dec.id).join(' '),
      translate: true,
    },
    {
      class: 'medgen',
      existing: !!entryData.medgen_definition,
      desc: entryData.medgen_definition,
      translate: true,
    },
  ];

  if (items.every((item) => !item.existing)) {
    diseaseDefinition.remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`disease-${item.class}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      }

      const content = tabWrap.querySelector(`.${item.class}`);

      content.textContent = item.desc;
      currentTab = tabWrap.querySelector(`#disease-${item.class}`);
      if (currentTab && isFirstTab) {
        currentTab.checked = true;
        isFirstTab = false;
      }

      if (item.translate) {
        const translationLink = document.createElement('a');
        const translationUrl = `https://translate.google.co.jp/?hl=ja#en/ja/${item.desc}`;
        translationLink.setAttribute('href', translationUrl);
        translationLink.setAttribute('target', '_blank');
        translationLink.setAttribute('rel', 'noopener noreferrer');
        translationLink.innerHTML =
          '<span class="google-translate">&nbsp;&gt;&gt;&nbsp;翻訳 (Google)</span>';
        content.append(translationLink);
      }
    });
  }
}

function makeMedicalGeneticTestingInfo(entryData) {
  const medicalGeneticTestingInfo = document.getElementById(
    'temp-medical-genetic-testing-info'
  );
  const inspectionView =
    medicalGeneticTestingInfo.querySelector('.inspection-view');
  const item = {
    existing: !!entryData.genetesting,
    url: `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_gene_test?nando_id=${entryData.nando_id}`,
    columns:
      '[{&quot;id&quot;: &quot;label&quot;,&quot;label&quot;:&quot;検査名&quot;},{&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;URL&quot;,&quot;link&quot;:&quot;hp&quot;},{&quot;id&quot;:&quot;gene&quot;,&quot;label&quot;:&quot;遺伝子名&quot;},{&quot;id&quot;:&quot;facility&quot;,&quot;label&quot;:&quot;検査施設&quot;}]',
  };
  if (entryData.genetesting) {
    inspectionView.innerHTML = `
        <togostanza-pagination-table data-type="json"
          data-url="${item.url}"
          columns="${item.columns}"
          custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
          page-size-option="100"
          page-slider="true"
          fixed-columns="1">
        </togostanza-pagination-table>
      `;
  } else {
    medicalGeneticTestingInfo.remove();
  }
}

function makePhenotypeView(entryData) {
  const tempPhenotypeView = document.getElementById('temp-phenotype-view');
  const phenotypeView = tempPhenotypeView.querySelector('.phenotype');
  const item = {
    existing: entryData.phenotype_flg,
    url: `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_hpo_data_by_nando_id?nando_id=${entryData.nando_id}`,
    columns: '',
  };
  if (item.existing) {
    phenotypeView.innerHTML = `
      <togostanza-pagination-table
      data-url="${item.url}"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      data-type="json"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;hpo_label_ja&quot;,&quot;label&quot;:&quot;Symptom (JA)&quot;,&quot;link&quot;:&quot;omim_url&quot;,&quot;target&quot;:&quot;_blank&quot;} ,   {&quot;id&quot;:&quot;hpo_label_en&quot;,&quot;label&quot;:&quot;Symptom (EN)&quot;,&quot;link&quot;:&quot;ncbi_url&quot;,&quot;target&quot;:&quot;_blank&quot;} ,  {&quot;id&quot;:&quot;hpo_id&quot;,&quot;label&quot;:&quot;HPO ID&quot;,&quot;link&quot;:&quot;hpo_url&quot;,&quot;target&quot;:&quot;_blank&quot;}, {&quot;id&quot;:&quot;hpo_category_name_en&quot;,&quot;label&quot;:&quot;Symptom category (EN)&quot;,&quot;link&quot;:&quot;hpo_category&quot;,&quot;target&quot;:&quot;_bkank&quot;} ]"
      togostanza-custom_css_url=""
        ></togostanza-pagination-table>
        `;
  } else {
    tempPhenotypeView.remove();
  }
}

function makeSpecificBioResource(entryData) {
  const specificBioResource = document.getElementById(
    'temp-specific-bio-resource'
  );
  const tabWrap = specificBioResource.querySelector('.tab-wrap');
  const items = [
    {
      existing: !!entryData.cell,
      id: 'cell',
      url: `https://nanbyodata.jp/sparqlist/api/nanbyodata_get_riken_brc_cell_info_by_nando_id?nando_id=${entryData.nando_id}`,
      columns:
        '[{&quot;id&quot;: &quot;ID&quot;,&quot;label&quot;:&quot;RIKEN_BRC 細胞番号&quot;}, {&quot;id&quot;: &quot;Homepage&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;Homepage&quot;}, {&quot;id&quot;: &quot;Cell_name&quot;,&quot;label&quot;:&quot;細胞名&quot;}, {&quot;id&quot;: &quot;Description_e&quot;,&quot;label&quot;:&quot;細胞特性(英語)&quot;,&quot;escape&quot;:false},{&quot;id&quot;: &quot;Description_j&quot;,&quot;label&quot;:&quot;細胞特性(日本語)&quot;,&quot;escape&quot;:false}]',
    },
    {
      existing: !!entryData.mus,
      id: 'mus',
      url: `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_riken_brc_mouse_info_by_nando_id?nando_id=${entryData.nando_id}`,
      columns:
        '[{&quot;id&quot;: &quot;mouse_id&quot;,&quot;label&quot;:&quot;RIKEN_BRC No.&quot;}, {&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;hp&quot;}, {&quot;id&quot;:&quot;mouse_name&quot;,&quot;label&quot;:&quot;Strain name&quot;}, {&quot;id&quot;:&quot;description&quot;,&quot;label&quot;:&quot;Strain description&quot;}]',
    },
    {
      existing: !!entryData.dna,
      id: 'dna',
      url: `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_riken_brc_dna_info_by_nando_id?nando_id=${entryData.nando_id}`,
      columns:
        '[{&quot;id&quot;: &quot;gene_id&quot;,&quot;label&quot;:&quot;Catalog number&quot;}, {&quot;id&quot;:&quot;hp&quot;,&quot;label&quot;:&quot;Homepage&quot;,&quot;link&quot;:&quot;hp&quot;}, {&quot;id&quot;:&quot;gene_label&quot;,&quot;label&quot;:&quot;Name&quot;}, {&quot;id&quot;:&quot;ncbi_gene&quot;,&quot;label&quot;:&quot;NCBI Gene Link&quot;,&quot;link&quot;:&quot;ncbi_gene&quot;}]',
    },
  ];

  if (items.every((item) => !item.existing)) {
    specificBioResource.remove();
  } else {
    let isFirstTab = true;

    items.forEach((item) => {
      if (!item.existing) {
        const input = document.getElementById(`specific-brc-${item.id}`);
        const label = input.nextElementSibling;
        label.remove();
        input.remove();
      }

      const content = tabWrap.querySelector(`.${item.id}`);
      currentTab = tabWrap.querySelector(`#specific-brc-${item.id}`);
      if (currentTab && isFirstTab) {
        currentTab.checked = true;
        isFirstTab = false;
      }
      content.innerHTML = `
        <togostanza-pagination-table data-type="json"
          data-url="${item.url}"
          columns="${item.columns}"
          custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
          page-size-option="100"
          page-slider="fales">
        </togostanza-pagination-table>
      `;
    });
  }
}

function makeVariant(entryData) {
  const variant = document.getElementById('temp-variant');
  const properties = variant.querySelector('#temp-properties');
  const url = `https://pubcasefinder.dbcls.jp/sparqlist/api/nanbyodata_get_variant_by_nando_id?nando_id=${entryData.nando_id}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTPエラー! ステータスコード: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data) && data.length === 0) {
        variant.remove();
      } else {
        properties.innerHTML = `
      <togostanza-pagination-table
      data-url="${url}"
      data-type="json"
      custom-css-url="https://togostanza.github.io/togostanza-themes/contrib/nanbyodata.css"
      fixed-columns="1"
      page-size-option="100"
      page-slider="false"
      columns="[{&quot;id&quot;:&quot;tgv_id&quot;,&quot;label&quot;:&quot;TogoVar ID&quot;,&quot;link&quot;:&quot;tgv_link&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;rs_id&quot;,&quot;label&quot;:&quot;dbSNP ID&quot;,&quot;link&quot;:&quot;rs_id_link&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;position&quot;,&quot;label&quot;:&quot;position&quot;},{&quot;id&quot;:&quot;type&quot;,&quot;label&quot;:&quot;type&quot;},{&quot;id&quot;:&quot;Clinvar_id&quot;,&quot;label&quot;:&quot;Clinvar ID&quot;,&quot;link&quot;:&quot;Clinvar_link&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;title&quot;,&quot;label&quot;:&quot;title&quot;},{&quot;id&quot;:&quot;MedGen_id&quot;,&quot;label&quot;:&quot;MedGen ID&quot;,&quot;link&quot;:&quot;MedGen_link&quot;,&quot;target&quot;:&quot;_blank&quot;},{&quot;id&quot;:&quot;mondo_id&quot;,&quot;label&quot;:&quot;Mondo ID&quot;,&quot;link&quot;:&quot;mondo&quot;,&quot;target&quot;:&quot;_blank&quot;}]"
      ></togostanza-pagination-table>
      `;
      }
    })
    .then(() => {
      makeSideNavigation();
      // When loading finishes, display: block
      document.getElementById('content').style.display = 'block';
      document.getElementById('sidebar').style.display = 'block';
    })
    .catch((error) => {
      console.error('データが取得できません:', error);
    });
}

function makeSideNavigation() {
  // 疾患選択のセレクトボックスのスタイルを変更
  const selectTreeBox = document.querySelector(`select[name="${nandoId}"]`);
  if (selectTreeBox) {
    const parentTreeBox = selectTreeBox.parentNode;
    selectTreeBox.style.backgroundColor = 'rgba(22, 35, 78, 0.2)';
    selectTreeBox.style.color = '#13295a';
    parentTreeBox.style.backgroundColor = 'rgba(22, 35, 78, 0.2)';
  }

  const sideNavigation = document.getElementById('temp-side-navigation');
  const sideNavigationUl = sideNavigation.querySelector('ul');
  const items = [
    'temp-summary',
    'temp-causative-gene',
    'temp-medical-genetic-testing-info',
    'temp-phenotype-view',
    'temp-specific-bio-resource',
    'temp-variant',
  ];
  const lis = sideNavigationUl.querySelectorAll('li');
  lis.forEach((li) => {
    li.addEventListener('click', () => {
      const id = li.querySelector('a').getAttribute('href').replace('#', '');
      switchingDisplayContents(id);
    });
  });
  items.forEach((id) => {
    const liElement = document.getElementById(id);
    if (!liElement) {
      const liToRemove = document.querySelector(
        `[href="#${id}"]`
      ).parentElement;
      liToRemove.parentNode.removeChild(liToRemove);
    }
  });
}

function switchingDisplayContents(selectedItemId) {
  const items = [
    '#temp-summary',
    '#temp-disease-definition',
    '#temp-causative-gene',
    '#temp-medical-genetic-testing-info',
    '#temp-phenotype-view',
    '#temp-specific-bio-resource',
    '#temp-variant',
  ];

  // すべての要素を非表示にする
  items.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = 'none';
    }
  });

  // 選択されているアイテムを表示する
  if (selectedItemId === 'temp-summary') {
    const tempSummary = document.getElementById('temp-summary');
    tempSummary.style.display = 'block';
    document.getElementById('temp-aliases').style.display = 'block';
    document.querySelector('.temp-wrapper').style.display = 'block';
    const diseaseDefinition = document.getElementById(
      'temp-disease-definition'
    );
    if (diseaseDefinition) {
      diseaseDefinition.style.display = 'block';
    } else {
      tempSummary.style.display = 'none';
      document.querySelector('.selected').style.display = 'none';
    }
  } else {
    const dataWrapper = document.getElementById('data-wrapper');
    const summary = document.querySelector('.summary-header');
    dataWrapper.insertBefore(summary, dataWrapper.firstChild);
    document.querySelector(`#${selectedItemId}`).style.display = 'block';
  }
}

function selectedItem() {
  const links = document.querySelectorAll('#temp-side-navigation .nav-link');

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      links.forEach((link) => {
        link.classList.remove('selected');
      });

      link.classList.add('selected');
    });
  });
}
