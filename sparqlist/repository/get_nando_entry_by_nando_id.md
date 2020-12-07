# Retrieve NANDO class by the given NANDO ID

Show a NANDO (Nanbyo Ontology) class

## Parameters

* `nando_id` NANDO ID
  * default: 1200004
  * examples: 1200009, 2200865

## Endpoint

http://ep.dbcls.jp/sparql71tmp

## `nando2mondo` get mondo_id correspoinding to nando_id

```sparql
PREFIX : <http://nanbyodata.jp/ontology/nando#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX oboInOwl: <http://www.geneontology.org/formats/oboInOwl#>

SELECT *
FROM <http://nando/>
WHERE {
  ?nando a owl:Class ;
         dcterms:identifier "{{nando_id}}"^^xsd:string .
  OPTIONAL {
    ?nando skos:closeMatch ?mondo .
    ?mondo oboInOwl:id ?mondo_id
  }
}
```

## `mondo_uri` get mondo uri

```javascript
({
  json({nando2mondo}) {
    let rows = nando2mondo.results.bindings;
    let mondo_uris = [];
    
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].mondo) {
        mondo_uris.push(rows[i].mondo.value);
      } else {
        mondo_uris.push("NA");
      }
    }
    return mondo_uris[0]
  }
})
```

## Endpoint

https://togovar.biosciencedbc.jp/sparql

## `medgen` retrieve information from medgen

```sparql
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix prov: <http://www.w3.org/ns/prov#>
prefix pav: <http://purl.org/pav/>
prefix medgen: <http://www.ncbi.nlm.nih.gov/medgen/>
prefix mo: <http://med2rdf/ontology/medgen#>
prefix ispref: <http://med2rdf/ontology/medgen/ispref#>
prefix sty: <http://purl.bioontology.org/ontology/STY/>
prefix omim: <http://purl.bioontology.org/ontology/OMIM/>
prefix obo: <http://purl.obolibrary.org/obo/>
prefix mesh: <http://id.nlm.nih.gov/mesh/>
prefix ordo: <http://www.orpha.net/ORDO/>
prefix nci: <http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#>
prefix dct: <http://purl.org/dc/terms/>
prefix pubmedid: <http://identifiers.org/pubmed/>
prefix pubmed: <http://rdf.ncbi.nlm.nih.gov/pubmed/>

SELECT DISTINCT ?medgen ?concept ?concept_id ?concept_name ?definition (GROUP_CONCAT(?label, ":") AS ?labels) 
FROM <http://togovar.biosciencedbc.jp/medgen>
WHERE {
  ?medgen rdfs:seeAlso ?concept .
  ?concept a mo:ConceptID .
  ?concept dct:identifier ?concept_id .
  ?concept rdfs:label ?concept_name .
  ?concept rdfs:seeAlso <{{mondo_uri}}> .
  ?concept skos:definition ?definition .
  ?concept mo:mgconso ?mgconso .
  ?mgconso rdfs:label ?label .
  ?mgconso dct:source ?source
  FILTER(?source = mo:GTR)
} 
GROUP BY ?medgen ?concept ?definition ?concept_id ?concept_name
LIMIT 100

```

## Endpoint

http://ep.dbcls.jp/sparql71tmp

## `result` retrieve a NANDO class

```sparql
PREFIX : <http://nanbyodata.jp/ontology/nando#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX oboInOwl: <http://www.geneontology.org/formats/oboInOwl#>
PREFIX mondo: <http://purl.obolibrary.org/obo/mondo#>

SELECT DISTINCT ?nando ?nando_id ?label_ja ?label_en ?alt_label_ja ?alt_label_en ?notification_number 
                ?source ?description ?mondo ?mondo_id ?site ?db_xref
FROM <http://nando/>
WHERE {
  ?nando a owl:Class ;
    dcterms:identifier "{{nando_id}}"^^xsd:string .
  OPTIONAL {
    ?nando rdfs:label ?label_ja
    FILTER(LANG(?label_ja) = 'ja')
  }
  OPTIONAL {
    ?nando rdfs:label ?label_en
    FILTER(LANG(?label_en) = 'en')
  }
  OPTIONAL {
    ?nando skos:altLabel ?alt_label_en
    FILTER(LANG(?alt_label_en) = 'en')
  }
  OPTIONAL {
    ?nando skos:altLabel ?alt_label_ja
    FILTER(LANG(?alt_label_ja) = 'ja')
  }
  OPTIONAL {
    ?nando dcterms:source ?source 
  }
  OPTIONAL {
    ?nando :hasNotificationNumber ?notification_number
  }
  OPTIONAL {
    ?nando dcterms:description ?description  
  }
  OPTIONAL {
    ?nando skos:closeMatch ?mondo .
    ?mondo oboInOwl:id ?mondo_id .
    ?mondo mondo:exactMatch ?db_xref
  }
  OPTIONAL {
    ?nando rdfs:seeAlso ?site
  }
  BIND({{nando_id}} AS ?nando_id)
}
```

## Output

```javascript
({
  json({result, medgen}) {
    let rows = result.results.bindings;
    let medgen_rows = medgen.results.bindings;
    let data = {};
    let mondo_ids = [];
    let db_xrefs = [];
    let orpha_ids = [];
    let omim_ids = [];
    
    for (let i = 0; i < rows.length ;i++) {
      if (rows[i].nando_id) {
        data.nando_id = rows[i].nando_id.value;
      };
      if (rows[i].label_en) {
        data.label_en = rows[i].label_en.value;
      };
      if (rows[i].label_ja) {   
        data.label_ja = rows[i].label_ja.value;
      };
      if (rows[i].alt_label_en) {
        if (data.alt_label_en) {
          if (!data.alt_label_en.includes(rows[i].alt_label_en.value)) {
            data.alt_label_en.push(rows[i].alt_label_en.value);
          }
        } else {
          data.alt_label_en = [rows[i].alt_label_en.value];
        }
      };
      if (rows[i].alt_label_ja) {
        if (data.alt_label_ja) {
          if (!data.alt_label_ja.includes(rows[i].alt_label_ja.value)) {
            data.alt_label_ja.push(rows[i].alt_label_ja.value);
          }
        } else {
          data.alt_label_ja = [rows[i].alt_label_ja.value];
        }
      };
      if (rows[i].notification_number) {
        data.notification_number = rows[i].notification_number.value;
      };
      if (rows[i].description) {
        data.description = rows[i].description.value;
      };
      if (rows[i].source) {
        data.source = rows[i].source.value;
      };
      if (rows[i].site) {
        switch (true) {
          case /nanbyou/.test(rows[i].site.value):
            data.nanbyou = {id: rows[i].site.value.split("/").slice(-1)[0],
                            url: rows[i].site.value};
            break;
          case /mhlw/.test(rows[i].site.value):
            data.mhlw = {id: rows[i].site.value.split("/").slice(-1)[0],
                             url: rows[i].site.value};
            break;
          case /shouman/.test(rows[i].site.value):
            data.shouman = {id: rows[i].site.value.split("/").slice(-2)[0],
                            url: rows[i].site.value};
            break;
          case /kegg/.test(rows[i].site.value):
            data.kegg = {id: rows[i].site.value.split("/").slice(-2)[0],
                            url: rows[i].site.value};
            break;
          case /UR-DBMS/.test(rows[i].site.value):
            data.urdbms = {id: rows[i].site.value.split("/").slice(-2)[0],
                            url: rows[i].site.value};
            break;
        }
      }
      if (rows[i].mondo) {
        if (data.mondos) {
          if (!mondo_ids.includes(rows[i].mondo_id.value)) {
            data.mondos.push({url: rows[i].mondo.value, id: rows[i].mondo_id.value});
            mondo_ids.push(rows[i].mondo_id.value);
          }
        } else {
          data.mondos = [];
          data.mondos.push({url: rows[i].mondo.value, id: rows[i].mondo_id.value});
          mondo_ids.push(rows[i].mondo_id.value);
        }
        if (rows[i].db_xref) {
          db_xref_uri = rows[i].db_xref.value ;
          if (data.db_xrefs) {
            if (db_xref_uri.match(/Orphanet_/)) {
              if (!orpha_ids.includes(db_xref_uri)) {
                data.db_xrefs.orphanet.push({url: db_xref_uri, id: db_xref_uri.split("/").slice(-1)[0].replace('Orphanet_','')});
                orpha_ids.push(db_xref_uri) ;
              }
            } else if (db_xref_uri.match(/omim_/)) {
              if (!omim_ids.includes(db_xref_uri)) {
                data.db_xrefs.omim.push({url: db_xref_uri, id: db_xref_uri.split("/").slice(-1)[0]});
                omim_ids.push(db_xref_uri);
              }
            }
          } else {
            data.db_xrefs = {orphanet: [], omim: []};
            if (db_xref_uri.match(/Orphanet_/)) {
              data.db_xrefs.orphanet.push({url: db_xref_uri, id: db_xref_uri.split("/").slice(-1)[0].replace('Orphanet_','')});
              orpha_ids.push(db_xref_uri);
            } else if (db_xref_uri.match(/omim/)) {
              data.db_xrefs.omim.push({url: db_xref_uri, id: db_xref_uri.split("/").slice(-1)[0]});
              omim_ids.push(db_xref_uri);
            }
          }
        }
      }
    }
    
    let medgen_data = [];
    
    if (medgen_rows.length > 0) {
      for (let i = 0; i < medgen_rows.length; i++ ) {
        medgen_data.push({medgen: medgen_rows[i].medgen.value});
        medgen_data[i].medgen_id = medgen_rows[i].medgen.value.split("/").slice(-1)[0];
        medgen_data[i].concept = medgen_rows[i].concept.value;
        medgen_data[i].concept_id = medgen_rows[i].concept_id.value;
        medgen_data[i].concept_name = medgen_rows[i].concept_name.value;
        medgen_data[i].definition = medgen_rows[i].definition.value;
        medgen_data[i].labels = Array.from(new Set(medgen_rows[i].labels.value.split(":")));
        if (medgen_data[i].labels.indexOf(medgen_rows[i].concept_name.value) != -1) {
          medgen_data[i].labels.splice(medgen_data[i].labels.indexOf(medgen_rows[i].concept_name.value), 1);
        }
      }
      if (data.alt_label_en) {
        for (let i = 0; i < medgen_data[0].labels.length; i++) {
          if (!data.alt_label_en.includes(medgen_data[0].labels[i])) {
            data.alt_label_en.push(medgen_data[0].labels[i]);
          }
        }
      } else {
        data.alt_label_en = [];
        for (let i = 0; i < medgen_data[0].labels.length; i++) {
          data.alt_label_en.push(medgen_data[0].labels[i]);
        }
      }

      data.medgen_id = medgen_data[0].medgen_id;
      data.medgen_uri = medgen_data[0].medgen;
      data.concept = medgen_data[0].concept;
      data.concept_name = medgen_data[0].concept_name;
      data.concept_id = medgen_data[0].concept_id;
      data.medgen_definition = medgen_data[0].definition;
    }
    
    return data;
  }
})
```