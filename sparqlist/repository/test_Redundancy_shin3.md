# [PCF] Get OMIM data by OMIM ID
## a
*  b
*  c

## Parameters
* `omim_id`
  * default: 263750, 154400, 214800, 105650, 609945, 219000, 143095, 615162, 122470, 115470, 230400, 182280
  * example: 263750, 154400, 214800, 105650, 609945, 219000, 143095, 615162, 122470, 115470
  	613172,613174,609909,145250,146580,613177,613179,184850,205400,601195
* `rdf_portal`
  * default: https://integbio.jp/rdf/sparql  
* `mode`
	* example: en
## Endpoint

{{ rdf_portal }}

## `omim_id_list`
```javascript
({omim_id}) => {
  omim_id = 'mim:' + omim_id.replace(/[\s,]+/g," mim:")
  return omim_id;
}
```

## `result` 
```sparql
#268300 ?mondo rdfs:label ?disease_name . 문제 해결해야됨
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX ncit: <http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#>
PREFIX mim: <http://identifiers.org/mim/>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX sio: <http://semanticscience.org/resource/>
PREFIX nando: <http://nanbyodata.jp/ontology/nando#>

SELECT DISTINCT
str(?disease_name_en) as ?omim_disease_name_en
str(?disease_name_ja) as ?omim_disease_name_ja

str(?gene_ID) as ?ncbi_gene_id
str(?gene_symbol) as ?hgnc_gene_symbol

str(?inheritance_name_en) as ?inheritance_en
str(?inheritance_name_ja) as ?inheritance_ja

?omim_id
str(?mim_id) as ?omim_url

str(?mondo_ID) as ?mondo_id
str(?mondo) as ?mondo_url

str(?DBMS) as ?ur_dbms_url
str(?kegg) as ?kegg_url
str(?gene_reviews) as ?gene_reviews_url
str(?gtr) as ?gtr_url
str(?description) as ?description

count(?hpo) as ?count_hpo_id
WHERE {

  {{#if omim_id_list}}
	VALUES ?mim_id { {{omim_id_list}} }
  {{/if}}
    
    OPTIONAL { 
      ?mim_id nando:hasInheritance ?inheritance .
      ?inheritance rdfs:label ?inheritance_name_en .
      ?inheritance rdfs:label ?inheritance_name_ja .
      FILTER (lang(?inheritance_name_en) = "en")
      FILTER (lang(?inheritance_name_ja) = "ja")
    }
    
    OPTIONAL { ?mim_id rdfs:seeAlso ?DBMS  FILTER(CONTAINS(STR(?DBMS), "UR-DBMS")) }
    OPTIONAL { ?mim_id rdfs:seeAlso ?kegg  FILTER(CONTAINS(STR(?kegg), "kegg")) }
    OPTIONAL { ?mim_id rdfs:seeAlso ?gene_reviews  FILTER(CONTAINS(STR(?gene_reviews), "books")) }
    OPTIONAL { ?mim_id rdfs:seeAlso ?gtr  FILTER(CONTAINS(STR(?gtr), "gtr")) }
    
    #mondo id, disease name, description
    OPTIONAL { ?mim_id rdfs:label ?disease_name_ja FILTER (lang(?disease_name_ja) = "ja") }
    
    OPTIONAL { ?mim_id rdfs:seeAlso ?mondo . }
    
    ?mondo rdfs:label ?disease_name_en .    
    OPTIONAL { ?mondo <http://www.geneontology.org/formats/oboInOwl#id> ?mondo_ID . }
    OPTIONAL { ?mondo obo:IAO_0000115 ?description . }
      
    #gene id, gene symbol
    OPTIONAL {
    ?as sio:SIO_000628 ?mim_id ;
        sio:SIO_000628 ?gene .
    ?gene rdf:type ncit:C16612 ;
          dcterms:identifier ?gene_ID ;
          sio:SIO_000205 ?HGNC .
    ?HGNC rdfs:label ?gene_symbol .
    }

    OPTIONAL {
      ?an rdf:type oa:Annotation ;
          oa:hasTarget ?mim_id ;
          oa:hasBody ?hpo ;
          dcterms:source [dcterms:creator ?creator] .
    FILTER(?creator NOT IN("Database Center for Life Science"))
    }

    BIND (replace(str(?mim_id), 'http://identifiers.org/mim/', '') AS ?omim_id)
} order by ?mim_id
```

## Output

```javascript
({result})=>{ 
  
  var dic = {}
  var rows = result.results.bindings;

  var testArray = new Array();
  var test = {}
  var temp
  var t = 0;
  //test = new Object();
  for (let i = 0; i < rows.length; i++) {
    
    if (rows[i].omim_id.value in test)
    {
      if (rows[i].ncbi_gene_id) {
        temp = test[rows[i].omim_id.value].ncbi_gene_id.ncbi_gene_id.split(',');
        for(var j in temp)
        {
          if (rows[i].ncbi_gene_id.value === temp[j])
          {
            t = 1;
          }
        }
        if(!t)
        {
          temp = temp + "," + rows[i].ncbi_gene_id.value
          test[rows[i].omim_id.value].ncbi_gene_id = {ncbi_gene_id: temp}
          t = 0;
        }
        //test[rows[i].omim_id.value].ncbi_gene_id = {ncbi_gene_id: rows[i].ncbi_gene_id.value}
      }
    }
    else
    {
      if (rows[i].omim_id) { 
    	test[rows[i].omim_id.value] = {omim_id: rows[i].omim_id.value}
    }
    if (rows[i].omim_disease_name_en) { 
    	test[rows[i].omim_id.value].omim_disease_name_en = {omim_disease_name_en: rows[i].omim_disease_name_en.value}
    }
    if (rows[i].omim_disease_name_ja) { 
        test[rows[i].omim_id.value].omim_disease_name_ja = {omim_disease_name_ja: rows[i].omim_disease_name_ja.value}
    }
    if (rows[i].ncbi_gene_id) { 
        test[rows[i].omim_id.value].ncbi_gene_id = {ncbi_gene_id: rows[i].ncbi_gene_id.value}
    }
    }
    
  }
    
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].omim_id.value in dic)
    {
      if (rows[i].omim_disease_name_en) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_disease_name_en.value);
      }
      
      if (rows[i].omim_disease_name_ja) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_disease_name_ja.value);
      }
      
      if (rows[i].ncbi_gene_id) { 
        dic[rows[i].omim_id.value].add(rows[i].ncbi_gene_id.value);
      }
      
      if (rows[i].hgnc_gene_symbol) { 
        dic[rows[i].omim_id.value].add(rows[i].hgnc_gene_symbol.value);
      }
      
      if (rows[i].inheritance_en) { 
        dic[rows[i].omim_id.value].add(rows[i].inheritance_en.value);
      }
      
      if (rows[i].inheritance_ja) { 
        dic[rows[i].omim_id.value].add(rows[i].inheritance_ja.value);
      }
      
      if (rows[i].omim_url) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_url.value);
      }
      
      if (rows[i].mondo_id) { 
        dic[rows[i].omim_id.value].add(rows[i].mondo_id.value);
      }
      
      if (rows[i].mondo_url) { 
        dic[rows[i].omim_id.value].add(rows[i].mondo_url.value);
      }
      
      if (rows[i].ur_dbms_url) { 
        dic[rows[i].omim_id.value].add(rows[i].ur_dbms_url.value);
      }

      if(rows[i].kegg_url) {
        dic[rows[i].omim_id.value].add(rows[i].kegg_url.value);
      }

      if (rows[i].gene_reviews_url) { 
        dic[rows[i].omim_id.value].add(rows[i].gene_reviews_url.value);
      }
      
      if (rows[i].gtr_url) { 
        dic[rows[i].omim_id.value].add(rows[i].gtr_url.value);
      }
      
      if (rows[i].description) { 
        dic[rows[i].omim_id.value].add(rows[i].description.value);
      }
      
      if (rows[i].count_hpo_id) { 
        dic[rows[i].omim_id.value].add(rows[i].count_hpo_id.value);
      }
    }
    else
    {
      dic[rows[i].omim_id.value] = new Set();
      
      if (rows[i].omim_disease_name_en) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_disease_name_en.value);
      }
      
      if (rows[i].omim_disease_name_ja) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_disease_name_ja.value);
      }
      
      if (rows[i].ncbi_gene_id) { 
        dic[rows[i].omim_id.value].add(rows[i].ncbi_gene_id.value);
      }
      
      if (rows[i].hgnc_gene_symbol) { 
        dic[rows[i].omim_id.value].add(rows[i].hgnc_gene_symbol.value);
      }
      
      if (rows[i].inheritance_en) { 
        dic[rows[i].omim_id.value].add(rows[i].inheritance_en.value);
      }
      
      if (rows[i].inheritance_ja) { 
        dic[rows[i].omim_id.value].add(rows[i].inheritance_ja.value);
      }
      
      if (rows[i].omim_url) { 
        dic[rows[i].omim_id.value].add(rows[i].omim_url.value);
      }
      
      if (rows[i].mondo_id) { 
        dic[rows[i].omim_id.value].add(rows[i].mondo_id.value);
      }
      
      if (rows[i].mondo_url) { 
        dic[rows[i].omim_id.value].add(rows[i].mondo_url.value);
      }
      
      if (rows[i].ur_dbms_url) { 
        dic[rows[i].omim_id.value].add(rows[i].ur_dbms_url.value);
      }

      if(rows[i].kegg_url) {
        dic[rows[i].omim_id.value].add(rows[i].kegg_url.value);
      }

      if (rows[i].gene_reviews_url) { 
        dic[rows[i].omim_id.value].add(rows[i].gene_reviews_url.value);
      }
      
      if (rows[i].gtr_url) { 
        dic[rows[i].omim_id.value].add(rows[i].gtr_url.value);
      }
      
      if (rows[i].description) { 
        dic[rows[i].omim_id.value].add(rows[i].description.value);
      }
      
      if (rows[i].count_hpo_id) { 
        dic[rows[i].omim_id.value].add(rows[i].count_hpo_id.value);
      }
    };
  }

  for (let i = 0; i < rows.length; i++) {
    if(rows[i].omim_id.value in dic){
      dic[rows[i].omim_id.value] = Array.from(dic[rows[i].omim_id.value])
    }
  }

  return test
};



```