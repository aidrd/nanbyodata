Stanza(function(stanza, params) {

  let formBody = [];

  for (let key in params) {
    if(params[key]) formBody.push(key + "=" + encodeURIComponent(params[key]));
  }

  let options = {
    method: "POST",
    mode:  "cors",
    body: formBody.join("&"),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  let apiUrl = "https://nanbyodata.jp/sparqlist/api/";
  let apiName = "get_nando_entry_by_nando_id";
  let q = fetch(apiUrl + apiName, options).then(res => res.json());

  q.then(function(json) {

    json.alt_label_ja_string = (json.alt_label_ja != null) ? json.alt_label_ja.join("; ") : json.alt_label_ja;
    json.alt_label_en_string = (json.alt_label_en != null) ? json.alt_label_en.join("; ") : json.alt_label_en;
    console.log(json);

    stanza.render({
      template: "stanza.html",
      parameters: {
        result: json 
      }
    });
  });
});
