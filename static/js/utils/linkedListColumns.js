// Overview LinkedItems
export const linkedListJaColumns = [
  {
    class: 'omim',
    labels: [
      {
        label: 'OMIM ID',
        content: 'id',
        type: 'url',
        hrefKey: 'original_disease',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_ja2', 'mondo_label_en2', 'parent', 'property'],
  },
  {
    class: 'orphanet',
    labels: [
      {
        label: 'Orphanet ID',
        content: 'id',
        type: 'url',
        hrefKey: 'original_disease',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja2' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_ja2', 'mondo_label_en2', 'parent', 'property'],
  },
  {
    class: 'monarch-initiative',
    labels: [
      {
        label: 'MONDO ID',
        content: 'id',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'MONDO Label (JA)', content: 'mondo_label_ja' },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_ja', 'mondo_label_en', 'parent', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen ID',
        content: 'medgen_id',
        type: 'url',
        hrefKey: 'medgen_url',
      },
      { label: 'Name', content: 'name' },
      { label: 'Disorder', content: 'disorder' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['medgen_id', 'name', 'disorder', 'property'],
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
      { label: 'Link Type', content: 'property' },
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
        content: 'id',
        type: 'url',
        hrefKey: 'original_disease',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_en2', 'parent', 'property'],
  },
  {
    class: 'orphanet',
    labels: [
      {
        label: 'Orphanet ID',
        content: 'id',
        type: 'url',
        hrefKey: 'original_disease',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en2' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_en2', 'parent', 'property'],
  },
  {
    class: 'monarch-initiative',
    labels: [
      {
        label: 'MONDO ID',
        content: 'id',
        type: 'url',
        hrefKey: 'mondo_url',
      },
      { label: 'MONDO Label (EN)', content: 'mondo_label_en' },
      { label: 'Parent', content: 'parent' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['id', 'mondo_label_en', 'parent', 'property'],
  },
  {
    class: 'medgen',
    labels: [
      {
        label: 'MedGen ID',
        content: 'medgen_id',
        type: 'url',
        hrefKey: 'medgen_url',
      },
      { label: 'Name', content: 'name' },
      { label: 'Disorder', content: 'disorder' },
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['medgen_id', 'name', 'disorder', 'property'],
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
      { label: 'Link Type', content: 'property' },
    ],
    keys: ['kegg_disease_id', 'disease_name', 'pathway', 'property'],
  },
];
