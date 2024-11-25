// Overview LinkedItems
export const linkedListJaColumns = [
  {
    class: 'omim',
    labels: [
      {
        label: 'OMIM ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondolink',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: [
      'displayid',
      'parent',
      'mondo_label_ja2',
      'mondo_label_en2',
      'property',
    ],
  },
  {
    class: 'orphanet',
    labels: [
      {
        label: 'Orphanet ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondolinki',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: [
      'displayid',
      'parent',
      'mondo_label_ja2',
      'mondo_label_en2',
      'property',
    ],
  },
  {
    class: 'monarch-initiative',
    labels: [
      {
        label: 'MONDO ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'mondo_label_ja', 'mondo_label_en', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen UID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'MedGen CID',
        content: 'displayid2',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondolink',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
      { label: 'Label (EN)', content: 'medgen_label' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: [
      'displayid',
      'displayid2',
      'parent',
      'mondo_label_ja2',
      'medgen_label',
      'property',
    ],
  },
  {
    class: 'kegg-disease',
    labels: [
      {
        label: 'KEGG Disease ID',
        content: 'kegg_disease_id',
        type: 'url',
        hrefKey: 'kegg_url',
      },
      { label: 'Disease Name', content: 'disease_name' },
      { label: 'Pathway', content: 'pathway' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['kegg_disease_id', 'disease_name', 'pathway', 'property'],
  },
];

export const linkedListEnColumns = [
  {
    class: 'omim',
    labels: [
      {
        label: 'OMIM ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'parent', 'mondo_label_en2', 'property'],
  },
  {
    class: 'orphanet',
    labels: [
      {
        label: 'Orphanet ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondolinki',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'parent', 'mondo_label_en2', 'property'],
  },
  {
    class: 'monarch-initiative',
    labels: [
      {
        label: 'MONDO ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'mondo_label_en', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen UID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'MedGen CID',
        content: 'displayid2',
        type: 'url',
        hrefKey: 'original_disease',
      },
      {
        label: 'Bridge ID',
        content: 'parent',
        type: 'url',
        hrefKey: 'mondolink',
      },
      { label: 'Label (EN)', content: 'medgen_label' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'displayid2', 'parent', 'medgen_label', 'property'],
  },
  {
    class: 'kegg-disease',
    labels: [
      {
        label: 'KEGG Disease ID',
        content: 'kegg_disease_id',
        type: 'url',
        hrefKey: 'kegg_url',
      },
      { label: 'Disease Name', content: 'disease_name' },
      { label: 'Pathway', content: 'pathway' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['kegg_disease_id', 'disease_name', 'pathway', 'property'],
  },
];
