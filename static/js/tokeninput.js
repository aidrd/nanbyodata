(function ($) {
	$(document).ready(function () {
		console.log('ready()');
		var tokeninput = $('<div>')
			.attr({'id':'tokeninput'})
			.prependTo($('header > div.intro-text'))
		;
		tokeninput.tokenInput(function(){
			var type = arguments[0];
			if(type=='information'){
//				return "https://nanbyodata.jp/information.cgi";
				return "./information.cgi";
			}
			else if(type=='link'){
				return "https://nanbyodata.jp/disease/";
			}
			else{
//				return "https://nanbyodata.jp/tokeninput.cgi";
				return "./tokeninput.cgi";
			}
		},{
			theme:'facebook',
//			placeholder:"疾患名を入力"
		});


		$('#token-input-tokeninput')
			.keyup(function() {
				console.log('keyup',$(this).val());
				if ($(this).val()) {
					$('.token-input-list-facebook').css('border-radius', '24px 24px 0 0');
				} else {
					$('.token-input-list-facebook').css('border-radius', '30px');
				}
			})
			.blur(function() {
				console.log('blur',$(this).val());
				$('.token-input-list-facebook').css('border-radius', '30px');
			})
		;
		console.log($('#token-input-tokeninput').length);

	});


}(jQuery));
/*
$(function() {
    $('#token-input-tokeninput').keyup(function() {
	if ($(this).val()) {
	    $('.token-input-list-facebook').css('border-radius', '24px 24px 0 0');
	    } else {
		$('.token-input-list-facebook').css('border-radius', '30px');
		}
	});
    $('#token-input-tokeninput').blur(function() {
	$('.token-input-list-facebook').css('border-radius', '30px');
	});
});
*/