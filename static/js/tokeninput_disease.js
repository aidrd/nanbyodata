(function ($) {
  $(document).ready(function () {
    var tokeninput = $('<div>')
      .attr({ id: 'tokeninput' })
      //.insertAfter($('#kv-wrap>#mj_head>#container_head>#intro-text_head>#search_head>#blank_head'))
      .insertAfter($('#intro-text_head>#search_head>#blank_head'));
    tokeninput.tokenInput(
      function () {
        var type = arguments[0];
        if (type == 'information') {
          return '/information.cgi';
        } else if (type == 'link') {
          return '/disease/';
        } else {
          return '/tokeninput.cgi';
        }
      },
      { theme: 'facebook', placeholder: '難病名を入力' }
    );
  });
})(jQuery);

$(function () {
  $('#token-input-tokeninput').keyup(function () {
    if ($(this).val()) {
      $('.token-input-list-facebook').css('border-radius', '24px 24px 0 0');
    } else {
      $('.token-input-list-facebook').css('border-radius', '30px');
    }
  });
  $('#token-input-tokeninput').blur(function () {
    $('.token-input-list-facebook').css('border-radius', '30px');
  });
});
