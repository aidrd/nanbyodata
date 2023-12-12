# Retrieve gene_test Data

## Parameters

* `nando_id` NANDO ID
  * default: 1200489 
  * example: 2200856

## Endpoint

https://pubcasefinder-rdf.dbcls.jp/sparql

## `result` 
```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dct:  <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX genetest: <http://nanbyodata.jp/ontology/genetest_>

SELECT DISTINCT
?hp ?label ?gene ?facility

WHERE {
 ?s  foaf:homepage ?hp.
 OPTIONAL{?s  rdfs:label    ?label.}
 OPTIONAL{?s  genetest:has_test ?gene.}
 OPTIONAL{?s  genetest:has_inspectionFacility ?facility.}
 ?s rdfs:seeAlso ?disease.
 FILTER (CONTAINS(STR(?disease), "{{nando_id}}"))
     }

```

## Output
```javascript
({result})=>{ 
  return result.results.bindings.map(data => {
    return Object.keys(data).reduce((obj, key) => {
      obj[key] = data[key].value;
      return obj;
    }, {});
  });
}
```
## Memo
written by Takatsuki
