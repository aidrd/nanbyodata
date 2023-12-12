# [PCF] Get ORPHA GENE data by NCBI GENE ID
## Endpoint
https://integbio.jp/rdf/sparql

## `result` 
```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX nando: <http://nanbyodata.jp/ontology/nando#>
PREFIX sio: <http://semanticscience.org/resource/>
PREFIX ncit: <http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#>
PREFIX ncbigene: <http://identifiers.org/ncbigene/>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT DISTINCT
?hgnc_id ?hgnc_gene_symbol
WHERE{
  ?as rdf:type sio:SIO_000983 ;
      dcterms:source <http://www.orphadata.org/data/xml/en_product6.xml> ;
      sio:SIO_000628 ?ncbi_gene_uri ;
      sio:SIO_000628 ?orpha_uri .
  ?orpha_uri rdf:type ncit:C7057 .
  ?ncbi_gene_uri rdf:type ncit:C16612 ;
                 sio:SIO_000205 ?hgnc_uri .
  ?hgnc_uri rdfs:label ?hgnc_gene_symbol .
  BIND (replace(str(?hgnc_uri), 'https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/HGNC:', '') AS ?hgnc_id)
} order by ?hgnc_id
```