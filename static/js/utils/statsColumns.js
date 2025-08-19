// Stats page column definitions

/**
 * 汎用: ラベルと数値1列の単純な集計に使う
 * id: label, count
 */
export const simpleCountColumns = [
  { id: 'label', label: '項目' },
  { id: 'count', label: '件数', type: 'number', align: 'right' },
];

/**
 * NANDO と対象データセットの対になるカウント表示に使う
 * id: category, nando, target
 */
export const nandoTargetPairColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'TARGET', type: 'number', align: 'right' },
];

/**
 * Bioresource 用（Cell/Mouse/DNA などに共通）
 * id: category, nando, resource
 */
export const bioResourceColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'resource', label: 'Resource', type: 'number', align: 'right' },
];

// Section-specific presets (labels only差替え)
export const genePairColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'Gene', type: 'number', align: 'right' },
];

export const hpoPairColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'HPO', type: 'number', align: 'right' },
];

export const genetestPairColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'Genetic test', type: 'number', align: 'right' },
];

export const definitionsPairColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'Count', type: 'number', align: 'right' },
];

export const bioResourceCellColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'resource', label: 'Cell', type: 'number', align: 'right' },
];

export const bioResourceMouseColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'resource', label: 'Mouse', type: 'number', align: 'right' },
];

export const bioResourceDnaColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'resource', label: 'DNA', type: 'number', align: 'right' },
];

export const linkMondoColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'MONDO', type: 'number', align: 'right' },
];

export const linkKeggColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'KEGG', type: 'number', align: 'right' },
];

export const linkMedgenColumns = [
  { id: 'category', label: '区分' },
  { id: 'nando', label: 'NANDO', type: 'number', align: 'right' },
  { id: 'target', label: 'MedGen', type: 'number', align: 'right' },
];

// 難病（指定難病/小児慢性）クロス集計
export const diseaseOverviewColumns = [
  { id: 'category', label: '区分' },
  { id: 'all', label: '全体', type: 'number', align: 'right' },
  { id: 'group', label: '疾患群', type: 'number', align: 'right' },
  { id: 'disease', label: '個別疾患', type: 'number', align: 'right' },
];

// 難病 比較（列に shitei/shoman）
export const diseaseOverviewCompareColumns = [
  { id: 'category', label: '項目' },
  {
    id: 'shitei',
    label: '指定難病',
    type: 'number',
    align: 'right',
  },
  {
    id: 'shoman',
    label: '小児慢性',
    type: 'number',
    align: 'right',
  },
];

export const diseaseOverviewCompareColumnsEn = [
  { id: 'category', label: 'Item' },
  {
    id: 'shitei',
    label: 'shitei',
    type: 'number',
    align: 'right',
  },
  {
    id: 'shoman',
    label: 'shoman',
    type: 'number',
    align: 'right',
  },
];

// 難病（行=指定難病/小児慢性, 列=All/Group/Subtype/Disease）
export const diseaseAxisColumns = [
  { id: 'category', label: '対象' },
  { id: 'all', label: '全体', type: 'number', align: 'right' },
  { id: 'group', label: '疾患群', type: 'number', align: 'right' },
  { id: 'subtype', label: '下位疾患', type: 'number', align: 'right' },
  { id: 'disease', label: '個別疾患', type: 'number', align: 'right' },
];

// EN: Rows = shitei/shoman, Cols = All/Group/Disease/Subclass (order per request)
export const diseaseAxisColumnsEn = [
  { id: 'category', label: 'Type' },
  { id: 'all', label: 'All', type: 'number', align: 'right' },
  { id: 'group', label: 'Group', type: 'number', align: 'right' },
  { id: 'disease', label: 'Disease', type: 'number', align: 'right' },
  { id: 'subtype', label: 'Subclass', type: 'number', align: 'right' },
];
