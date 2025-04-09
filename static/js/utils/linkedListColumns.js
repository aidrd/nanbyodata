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
      { label: 'Mondo Label (JA)', content: 'mondo_label_ja2' },
      { label: 'Mondo Label (EN)', content: 'mondo_label_en2' },
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
      { label: 'Mondo Label (JA)', content: 'mondo_label_ja2' },
      { label: 'Mondo Label (EN)', content: 'mondo_label_en2' },
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
        label: 'Mondo ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'Mondo Label (JA)', content: 'mondo_label_ja' },
      { label: 'Mondo Label (EN)', content: 'mondo_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'mondo_label_ja', 'mondo_label_en', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen CID',
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
      { label: 'Mondo Label (JA)', content: 'mondo_label_ja2' },
      { label: 'Label (EN)', content: 'medgen_label' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: [
      'displayid',
      'parent',
      'mondo_label_ja2',
      'medgen_label',
      'property',
    ],
  },
  {
    class: 'kegg',
    labels: [
      {
        label: 'KEGG ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'kegg_url',
      },
      { label: 'KEGG Label (JA)', content: 'kegg_label_ja' },
      { label: 'KEGG Label (EN)', content: 'kegg_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'kegg_label_ja', 'kegg_label_en', 'property'],
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
      { label: 'Mondo Label (EN)', content: 'mondo_label_en2' },
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
      { label: 'Mondo Label (EN)', content: 'mondo_label_en2' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'parent', 'mondo_label_en2', 'property'],
  },
  {
    class: 'monarch-initiative',
    labels: [
      {
        label: 'Mondo ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'Mondo Label (EN)', content: 'mondo_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'mondo_label_en', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen CID',
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
      { label: 'Label (EN)', content: 'medgen_label' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'parent', 'medgen_label', 'property'],
  },
  {
    class: 'kegg',
    labels: [
      {
        label: 'KEGG ID',
        content: 'displayid',
        type: 'url',
        hrefKey: 'kegg_url',
      },
      { label: 'KEGG Label (EN)', content: 'kegg_label_en' },
      { label: 'Match Type', content: 'property' },
    ],
    keys: ['displayid', 'kegg_label_en', 'property'],
  },
];
