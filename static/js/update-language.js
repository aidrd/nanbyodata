// update language
function updateLangValue() {
  const selectedValue = document.getElementById('language-select').value;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/get_selected_value', true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response.result);
      location.reload();
    }
  };

  xhr.send(JSON.stringify({ selected_value: selectedValue }));
}
