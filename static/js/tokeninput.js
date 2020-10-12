(function ($) {
	$(document).ready(function () {
		var tokeninput = $('<div>')
			.attr({'id':'tokeninput'})
			.insertAfter($('header>div.container>div.intro-text>h1.display-4'))
		;
		tokeninput.tokenInput(function(){
			var type = arguments[0];
			if(type=='information'){
				return "https://nanbyodata.jp/information.cgi";
			}
			else if(type=='link'){
				return "https://nanbyodata.jp/disease/";
			}
			else{
				return "https://nanbyodata.jp/tokeninput.cgi";
			}
		},{theme:'facebook',placeholder:"疾患名を入力"});
	});
}(jQuery));
