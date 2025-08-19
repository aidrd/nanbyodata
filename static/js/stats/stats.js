// Render stats tables on stats.html based on 4 APIs
// - NANDO_count
// - NANDO_link_count
// - NANDO_link_count2
// - NANDO_link_count3_brc

import {
  linkMondoColumns,
  linkKeggColumns,
  linkMedgenColumns,
  diseaseOverviewCompareColumns,
  diseaseOverviewCompareColumnsEn,
  diseaseAxisColumns,
  diseaseAxisColumnsEn,
} from '../utils/statsColumns.js';

const API_BASE = 'https://dev-nanbyodata.dbcls.jp/sparqlist/api';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch: ${path}`);
  return res.json();
}

function createPaginationTable({ mount, url, columns, extraAttrs = {} }) {
  const table = document.createElement('togostanza-pagination-table');
  // ページ側のデフォルト設定を適用（columns以外）
  const defaultsEl = document.getElementById('stanza-default-config');
  let defaults = null;
  try {
    defaults = defaultsEl ? JSON.parse(defaultsEl.textContent) : null;
  } catch (e) {}
  table.setAttribute('data-url', url);
  table.setAttribute('data-type', 'json');
  table.setAttribute('data-unavailable_message', 'No data found.');
  if (defaults?.customCssUrl)
    table.setAttribute('custom-css-url', defaults.customCssUrl);
  table.setAttribute(
    'fixed-columns',
    extraAttrs['fixed-columns'] ?? defaults?.fixedColumns ?? '1'
  );
  table.setAttribute(
    'padding',
    extraAttrs.padding ?? defaults?.padding ?? '0px'
  );
  table.setAttribute(
    'page-size-option',
    extraAttrs['page-size-option'] ?? defaults?.pageSizeOption ?? '10,20,50,100'
  );
  table.setAttribute(
    'page-slider',
    extraAttrs['page-slider'] ?? defaults?.pageSlider ?? 'true'
  );
  table.setAttribute(
    'togostanza-menu-placement',
    extraAttrs['togostanza-menu-placement'] ?? defaults?.menuPlacement ?? 'none'
  );
  table.setAttribute('columns', JSON.stringify(columns));
  Object.entries(extraAttrs).forEach(([k, v]) => table.setAttribute(k, v));
  mount.innerHTML = '';
  mount.appendChild(table);
}

function makeRowsFromObject(obj, mapping) {
  // mapping: { keyInObj: { label: '表示名', pick: 'nando'|'mondo'|... } }
  const rows = [];
  for (const [key, conf] of Object.entries(mapping)) {
    const rec = obj[key] || {};
    const row = {
      label: conf.label,
      count: Number(rec[conf.pick] || rec['callret-0'] || 0),
    };
    rows.push(row);
  }
  return rows;
}

// Blob URL 管理
const __statsBlobUrls = [];
function buildInlineDataUrl(rows) {
  // metastanza/pagination-table は配列JSON/オブジェクトJSONのどちらも対応
  const blob = new Blob([JSON.stringify(rows)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  __statsBlobUrls.push(url);
  return url;
}

async function renderNandoCount() {
  const data = await fetchJson('NANDO_count');
  // 行=shitei/shoman, 列=All/Group/Subtype/Disease
  const rows = [
    {
      category: '指定難病',
      all: Number(data.shitei_all?.['callret-0'] || 0),
      group: Number(data.shitei_group?.['callret-0'] || 0),
      subtype: Number(data.name8?.['callret-0'] || 0), // name8 = shitei subclass
      disease: Number(data.shitei_disease?.['callret-0'] || 0),
    },
    {
      category: '小児慢性',
      all: Number(data.shoman_all?.['callret-0'] || 0),
      group: Number(data.shoman_group?.['callret-0'] || 0),
      subtype: Number(data.name7?.['callret-0'] || 0), // name7 = shoman subclass
      disease: Number(data.shoman_disease?.['callret-0'] || 0),
    },
  ];
  const currentLang = document.querySelector('.language-select')?.value;
  createPaginationTable({
    mount: document.querySelector('#stats-disease'),
    url: buildInlineDataUrl(rows),
    columns: currentLang === 'en' ? diseaseAxisColumnsEn : diseaseAxisColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });
}

async function renderNandoLinkCount() {
  const data = await fetchJson('NANDO_link_count');
  // 外部側の件数を抽出（nando/callret-0 以外の最初のキーを採用）
  const extVal = (obj = {}) => {
    for (const [k, v] of Object.entries(obj)) {
      if (k !== 'nando' && k !== 'callret-0') return Number(v || 0);
    }
    return 0;
  };

  const currentLang = document.querySelector('.language-select')?.value;
  const rows = [
    {
      category: 'MONDO exact',
      shitei: extVal(data.name2),
      shoman: extVal(data.name1),
    },
    {
      category: 'MONDO close',
      shitei: extVal(data.name4),
      shoman: extVal(data.name3),
    },
    {
      category: 'KEGG',
      shitei: extVal(data.name5),
      shoman: extVal(data.name6),
    },
    {
      category: 'OMIM',
      shitei: extVal(data.name8),
      shoman: extVal(data.name7),
    },
    {
      category: 'MedGen',
      shitei: extVal(data.name10),
      shoman: extVal(data.name9),
    },
    {
      category: 'ORDO',
      shitei: extVal(data.name12),
      shoman: extVal(data.name11),
    },
  ];

  // Orphanet (ORDO)
  const orphanetRows = [rows.find((r) => r.category === 'ORDO')];
  const mountOrphanet = document.querySelector('#stats-link-orphanet');
  mountOrphanet.innerHTML = '';
  createPaginationTable({
    mount: mountOrphanet,
    url: buildInlineDataUrl(orphanetRows),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });

  // Monarch (MONDO)
  const monarchRows = rows.filter((r) => r.category.startsWith('MONDO'));
  const mountMonarch = document.querySelector('#stats-link-monarch');
  mountMonarch.innerHTML = '';
  createPaginationTable({
    mount: mountMonarch,
    url: buildInlineDataUrl(monarchRows),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });

  // MedGen
  const medgenRows = [rows.find((r) => r.category === 'MedGen')];
  const mountMedgen = document.querySelector('#stats-link-medgen');
  mountMedgen.innerHTML = '';
  createPaginationTable({
    mount: mountMedgen,
    url: buildInlineDataUrl(medgenRows),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });

  // KEGG
  const keggRows = [rows.find((r) => r.category === 'KEGG')];
  const mountKegg = document.querySelector('#stats-link-kegg');
  mountKegg.innerHTML = '';
  createPaginationTable({
    mount: mountKegg,
    url: buildInlineDataUrl(keggRows),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });
}

async function renderNandoLinkCount2() {
  const data = await fetchJson('NANDO_link_count2');
  const currentLang = document.querySelector('.language-select')?.value;

  // 疾患原因遺伝子: 1表（行=Gene, 列=shitei/shoman）
  {
    const labelGene = 'Gene';
    const rows = [
      {
        category: labelGene,
        shitei: Number(data.shitei_gene?.gene || 0),
        shoman: Number(data.shoman_gene?.gene || 0),
      },
    ];
    const mount = document.querySelector('#stats-causal-genes');
    createPaginationTable({
      mount,
      url: buildInlineDataUrl(rows),
      columns:
        currentLang === 'en'
          ? diseaseOverviewCompareColumnsEn
          : diseaseOverviewCompareColumns,
      extraAttrs: { 'fixed-columns': '0' },
    });
  }

  // 臨床的特徴: 1表（行=HPO, 列=shitei/shoman）
  {
    const rows = [
      {
        category: 'HPO',
        shitei: Number(data.shitei_hp?.hp || 0),
        shoman: Number(data.shoman_hp?.hp || 0),
      },
    ];
    const mount = document.querySelector('#stats-phenotypes');
    createPaginationTable({
      mount,
      url: buildInlineDataUrl(rows),
      columns:
        currentLang === 'en'
          ? diseaseOverviewCompareColumnsEn
          : diseaseOverviewCompareColumns,
      extraAttrs: { 'fixed-columns': '0' },
    });
  }

  // 診療用遺伝学的検査: 1表（行=Genetic test, 列=shitei/shoman）
  {
    const rows = [
      {
        category: 'Genetic test',
        shitei: Number(data.shitei_genetest?.genetest || 0),
        shoman: Number(data.shoman_genetest?.genetest || 0),
      },
    ];
    const mount = document.querySelector('#stats-genetic-testing');
    createPaginationTable({
      mount,
      url: buildInlineDataUrl(rows),
      columns:
        currentLang === 'en'
          ? diseaseOverviewCompareColumnsEn
          : diseaseOverviewCompareColumns,
      extraAttrs: { 'fixed-columns': '0' },
    });
  }

  // 疾患定義: 1表（行= Overview/Definition, Synonyms, Inheritance; 列=shitei/shoman）
  {
    const currentLang = document.querySelector('.language-select')?.value;
    const labelDef = currentLang === 'en' ? 'Overview/Definition' : '概要/定義';
    const labelAlt = currentLang === 'en' ? 'Synonyms' : '別名';
    const labelInh = currentLang === 'en' ? 'Inheritance' : '遺伝形式';
    const rows = [
      {
        category: labelDef,
        shitei: Number(data.shitei_description?.desc || 0),
        shoman: Number(data.shoman_description?.desc || 0),
      },
      {
        category: labelAlt,
        shitei: Number(data.shitei_altlabel?.alt || 0),
        shoman: Number(data.shoman_altlabel?.alt || 0),
      },
      {
        category: labelInh,
        shitei: Number(data.shitei_inheritance?.inheritance || 0),
        shoman: Number(data.shoman_inheritance?.inheritance || 0),
      },
    ];
    const mount = document.querySelector('#stats-def-mhlw');
    createPaginationTable({
      mount,
      url: buildInlineDataUrl(rows),
      columns:
        currentLang === 'en'
          ? diseaseOverviewCompareColumnsEn
          : diseaseOverviewCompareColumns,
      extraAttrs: { 'fixed-columns': '0' },
    });
  }
}

async function renderNandoLinkCount3Brc() {
  const data = await fetchJson('NANDO_link_count3_brc');
  // バイオリソース: Cell / Mouse / DNA で表を分割（各表は列=shitei/shomanの比較）
  const currentLang = document.querySelector('.language-select')?.value;
  const labelCell = currentLang === 'en' ? 'Cell' : '細胞';
  const labelMouse = currentLang === 'en' ? 'Mouse' : 'マウス';
  const labelDna = 'DNA';

  // Cell
  createPaginationTable({
    mount: document.querySelector('#stats-cell'),
    url: buildInlineDataUrl([
      {
        category: labelCell,
        shitei: Number(data.shitei_cell?.cell || 0),
        shoman: Number(data.shoman_cell?.cell || 0),
      },
    ]),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });

  // Mouse
  createPaginationTable({
    mount: document.querySelector('#stats-mouse'),
    url: buildInlineDataUrl([
      {
        category: labelMouse,
        shitei: Number(data.shitei_mouse?.mouse || 0),
        shoman: Number(data.shoman_mouse?.mouse || 0),
      },
    ]),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });

  // DNA
  createPaginationTable({
    mount: document.querySelector('#stats-dna'),
    url: buildInlineDataUrl([
      {
        category: labelDna,
        shitei: Number(data.shitei_DNA?.gene || 0),
        shoman: Number(data.shoman_DNA?.gene || 0),
      },
    ]),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });
}

// Variants (MGeND) from NANDO_link_count2
async function renderVariantsMgend() {
  const data = await fetchJson('NANDO_link_count2');
  const currentLang = document.querySelector('.language-select')?.value;
  const rows = [
    {
      category: 'MGeND',
      shitei: Number(data.shitei_mgened?.mgend || 0),
      shoman: Number(data.shoman_mgend?.mgend || 0),
    },
  ];
  const mount = document.querySelector('#stats-variant-mgend');
  if (!mount) return;
  createPaginationTable({
    mount,
    url: buildInlineDataUrl(rows),
    columns:
      currentLang === 'en'
        ? diseaseOverviewCompareColumnsEn
        : diseaseOverviewCompareColumns,
    extraAttrs: { 'fixed-columns': '0' },
  });
}

async function init() {
  try {
    await Promise.all([
      renderNandoCount(),
      renderNandoLinkCount(),
      renderNandoLinkCount2(),
      renderNandoLinkCount3Brc(),
      renderVariantsMgend(),
    ]);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', init);

// ページ離脱時にBlob URLを解放
window.addEventListener('beforeunload', () => {
  __statsBlobUrls.forEach((u) => URL.revokeObjectURL(u));
});
