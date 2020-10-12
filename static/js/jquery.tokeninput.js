/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.6.0
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */

(function ($) {
  var windowNavigatorLanguage = (window.navigator.languages && window.navigator.languages[0]) ||
      window.navigator.language ||
      window.navigator.userLanguage ||
      window.navigator.browserLanguage;
  function isWindowNavigatorLanguageJa(){
    return windowNavigatorLanguage === "ja" || windowNavigatorLanguage.toLowerCase() === "ja-jp";
  }
  function getCurrentLanguage(){
    return isWindowNavigatorLanguageJa() ? 'ja' : 'en';
  }
  var hintText = "Type in patient's signs and symptoms";
  var number_of_hits = 'Number of hits [__NUMBER__]';
  if(isWindowNavigatorLanguageJa()){
      hintText = "疾患名を入力";
//      number_of_hits = 'ヒット件数 [__NUMBER__]';
      number_of_hits = 'ヒット件数&nbsp;&nbsp;&nbsp;指定難病(指定):[__DID_NUMBER__]&nbsp;&nbsp;&nbsp;小児慢性特定疾病(小慢):[__CCSD_NUMBER__]';
  }
  hintText = null;

//指定難病 Designated intractable disease
//小児慢性特定疾病 Childhood chronic specific diseases

// Default settings
var DEFAULT_SETTINGS = {
	// Search settings
    method: "GET",
    contentType: "json",
    queryParam: "q",
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: "name",
    jsonContainer: null,

	// Display settings
//    hintText: "Type in a search term",
    hintText: null,
    placeholder: hintText,
    noResultsText: "No results",
    searchingText: "Searching...",
    deleteText: "&times;",
    animateDropdown: true,

	// Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ",",
    preventDuplicates: false,
    zindex: 999,

	// Output settings
    tokenValue: "id",

	// Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,
    autoSelectFirstResult: false,

		language : {
			'ja' : {
				id : 'Id',

//				name : '疾患名',
//				definition : '疾患定義',
//				synonym : '同義語',

				name_ja : '疾患名(日)',
				name : '疾患名(英)',
				description_ja : '疾患定義(日)',
				description : '疾患定義(英)',
				synonym_ja : '同義語(日)',
				synonym : '同義語(英)',
				tooltip_title : ['name_ja','name','description_ja','description','synonym_ja','synonym'],

				did_abbr : '指定',
				ccsd_abbr : '小慢'
			},
			'en' : {
				id : 'Id',
				name : 'Name',
				description : 'Description',
				synonym : 'Synonym',
				tooltip_title : ['name','description','synonym'],
				did_abbr : '',
				ccsd_abbr : ''
			}
		},

	// Manipulation settings
    idPrefix: "token-input-",

	// Formatters
/*    resultsFormatter: function(item){ return "<li>" + item[this.propertyToSearch]+ "</li>" },*/
    resultsFormatter: function(item) {
      var id = item['id'].replace(/_ja$/g,'');
      var name = item['name'];
      var synonym = item['synonym'];
      var classes = this.classes ? this.classes : {};
      var language = this.language[getCurrentLanguage()];
      var abbr = '';
      if(item['id'].indexOf('NANDO:1')===0) abbr = language['did_abbr'];
      if(item['id'].indexOf('NANDO:2')===0) abbr = language['ccsd_abbr'];
      if(abbr.length) abbr = '['+abbr+']';

      var value = '<li class="'+classes['dropdownItemResult']+'">'+
                  '<span class="'+classes['dropdownItemWord']+' '+classes['dropdownItemInformation']+' glyphicon glyphicon-info-sign"></span>&nbsp;'+
                  '<span class="'+classes['dropdownItemWord']+' '+classes['dropdownItemAbbr']+'">' + (this.enableHTML ? abbr : _escapeHTML(abbr)) + '</span>&nbsp;'+
                  '<span class="'+classes['dropdownItemWord']+' token-input-token-id'+classes['dropdownItemResult']+'">' + (this.enableHTML ? id : _escapeHTML(id)) + '</span>&nbsp;'+
                  '<span class="'+classes['dropdownItemWord']+' '+classes['dropdownItemName']+'">' + (this.enableHTML ? name : _escapeHTML(name)) + '</span>';
      if(synonym instanceof Array){
        var str = this.zenhan(synonym.join(' | '));
        value += '&nbsp;<b>|</b>&nbsp;<span class="'+classes['dropdownItemWord']+' '+classes['dropdownItemSynonym']+'">' + (this.enableHTML ? str : _escapeHTML(str)) + '</span>';
      }
      value += '</li>';
      return value;
    },
    highlightTerm: function(value, term) {
      var enableHTML = this.enableHTML;
      var regexp_special_chars = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
      var zenhan = this.zenhan;
      zenhan(term.trim()).split(/[ 　]+/).forEach(function(term){
        value = zenhan(value).replace(
          new RegExp(
            "(?![^&;]+;)(?!<[^<>]*)(" + term.replace(regexp_special_chars, '\\$&') + ")(?![^<>]*>)(?![^&;]+;)",
            "gi"
          ), function(match, p1) {
            return "<b>" + (enableHTML ? p1 : _escapeHTML(p1)) + "</b>";
          }
        );
      });
//      console.log(value);
      return value;
    },

    zenhan: function(str){
      return $.type(str)==='string' ? str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s){ return String.fromCharCode(s.charCodeAt(0) - 65248); }) : "";
    },


    tokenFormatter: function(item) { return "<li><p>" + item[this.propertyToSearch] + "</p></li>" },

	// Callbacks
    onResult: null,
    onAdd: null,
    onDelete: null,
    onReady: null,
    onBeforeAdd: null,
    onShowDropdownItem: null
};

// Default classes to use when theming
var DEFAULT_CLASSES = {
    tokenList: "token-input-list",
    token: "token-input-token",
    tokenDelete: "token-input-delete-token",
    selectedToken: "token-input-selected-token",
    highlightedToken: "token-input-highlighted-token",
    dropdown: "token-input-dropdown",
    dropdownItem: "token-input-dropdown-item",
    dropdownItem2: "token-input-dropdown-item2",
    selectedDropdownItem: "token-input-selected-dropdown-item",
    inputToken: "token-input-input-token",
    dropdownNumberOfHits: "token-input-dropdown-number-of-hits",
    dropdownItemResult: "token-input-token-result",
    dropdownItemWord: "token-input-token-word",
    dropdownItemInformation: "token-input-token-information",
    dropdownItemId: "token-input-token-id",
    dropdownItemName: "token-input-token-name",
    dropdownItemSynonym: "token-input-token-synonym",

    dropdownItemResultTooltip: "popup-hierarchy-hpo-results-tooltip",
    dropdownItemResultTooltipTitle: "popup-hierarchy-hpo-results-tooltip-title",

    dropdownItemResultTooltipContentTable: "popup-hierarchy-hpo-content-table",
    dropdownItemResultTooltipContentTr: "popup-hierarchy-hpo-content-tr",
    dropdownItemResultTooltipContentTh: "popup-hierarchy-hpo-content-th",
    dropdownItemResultTooltipContentTd: "popup-hierarchy-hpo-content-td",
    dropdownItemResultTooltipContentTdColon: "popup-hierarchy-hpo-content-td-colon"
};

// Input box position "enum"
var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2
};

// Keys "enum"
var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NUMPAD_ENTER: 108,
    COMMA: 188
};

  var HTML_ESCAPES = {
    '&' : '&amp;',
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    "'" : '&#x27;',
    '/' : '&#x2F;'
  };

  var HTML_ESCAPE_CHARS = /[&<>"'\/]/g;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function _escapeHTML(text) {
    return coerceToString(text).replace(HTML_ESCAPE_CHARS, function(match) {
      return HTML_ESCAPES[match];
    });
  }

// Additional public (exposed) methods
var methods = {
    init: function(url_or_data_or_function, options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

        return this.each(function () {
            $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
        });
    },
    clear: function() {
        this.data("tokenInputObject").clear();
        return this;
    },
    add: function(item) {
        this.data("tokenInputObject").add(item);
        return this;
    },
    remove: function(item) {
        this.data("tokenInputObject").remove(item);
        return this;
    },
    get: function() {
    	return this.data("tokenInputObject").getTokens();
   	}
}

// Expose the .tokenInput function to jQuery as a plugin
$.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if(methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
        return methods.init.apply(this, arguments);
    }
};

// TokenList class for each input
$.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
        // Set the url to query against
        settings.url = url_or_data;

        // If the URL is a function, evaluate it here to do our initalization work
        var url = computeURL();

        // Make a smart guess about cross-domain if it wasn't explicitly specified
        if(settings.crossDomain === undefined) {
            if(url.indexOf("://") === -1) {
                settings.crossDomain = false;
            } else {
                settings.crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
            }
        }
    } else if(typeof(url_or_data) === "object") {
        // Set the local data to search through
        settings.local_data = url_or_data;
    }

    // Build class names
    if(settings.classes) {
        // Use custom class names
        settings.classes = $.extend({}, DEFAULT_CLASSES, settings.classes);
    } else if(settings.theme) {
        // Use theme-suffixed default class names
        settings.classes = {};
        $.each(DEFAULT_CLASSES, function(key, value) {
            settings.classes[key] = value + "-" + settings.theme;
        });
    } else {
        settings.classes = DEFAULT_CLASSES;
    }


    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\"  autocomplete=\"off\">")
        .css({
            outline: "none"
        })
        .attr("id", settings.idPrefix + input.id)
        .focus(function () {
            if (settings.tokenLimit === null || settings.tokenLimit !== token_count) {
                show_dropdown_hint();
            }
        })
        .blur(function () {
            hide_dropdown();
            $(this).val("");
        })
        .bind("keyup keydown blur update", resize_input)
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
//                case KEY.LEFT:
//                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(dropdown).find('li').first();
                            if(selected_dropdown_item){
                                dropdown_item = $(selected_dropdown_item).next();
                            }
                        } else {
                            dropdown_item = $(dropdown).find('li').last();
                            if (selected_dropdown_item) {
                                dropdown_item = $(selected_dropdown_item).prev();
                            }
                        }

//                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
//                        }
                        return false;
                    }
                    break;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();
//console.log($(this).val().length);
                    if(!$(this).val().length) {
                        if(selected_token) {
                            delete_token($(selected_token));
                            hidden_input.change();
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }
                        else {
                            hide_dropdown();
                        }

                        return false;
                    } else if($(this).val().length === 1) {
                        hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;

                case KEY.TAB:
                case KEY.ENTER:
                case KEY.NUMPAD_ENTER:
                case KEY.COMMA:
                  if(selected_dropdown_item) {
                    add_token($(selected_dropdown_item).data("tokeninput"));
                    hidden_input.change();
                    return false;
                  }
                  break;

                case KEY.ESCAPE:
                  hide_dropdown();
                  return true;

                default:
                    if(String.fromCharCode(event.which)) {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;
            }
        });

    // Keep reference for placeholder
    if (settings.placeholder) {
      input_box.attr("placeholder", settings.placeholder);
    }

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .val("")
                           .focus(function () {
                               input_box.focus();
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass(settings.classes.tokenList)
        .click(function (event) {
            var li = $(event.target).closest("li");
            if(li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                toggle_select_token(li);
            } else {
                // Deselect selected token
                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }

                // Focus input box
                input_box.focus();
            }
        })
        .mouseover(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.addClass(settings.classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.removeClass(settings.classes.highlightedToken);
            }
        })
        .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $("<li />")
        .addClass(settings.classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass(settings.classes.dropdown)
        .appendTo("body")
        .hide();

    // Magic element to help us resize the text input
    var input_resizer = $("<tester/>")
        .insertAfter(input_box)
        .css({
            position: "absolute",
            top: -9999,
            left: -9999,
            width: "auto",
            fontSize: input_box.css("fontSize"),
            fontFamily: input_box.css("fontFamily"),
            fontWeight: input_box.css("fontWeight"),
            letterSpacing: input_box.css("letterSpacing"),
            whiteSpace: "nowrap"
        });

    // Pre-populate list if items exist
    hidden_input.val("");
    var li_data = settings.prePopulate || hidden_input.data("pre");
    if(settings.processPrePopulate && $.isFunction(settings.onResult)) {
        li_data = settings.onResult.call(hidden_input, li_data);
    }
    if(li_data && li_data.length) {
        $.each(li_data, function (index, value) {
            insert_token(value);
            checkTokenLimit();
        });
    }

    // Initialization is done
    if($.isFunction(settings.onReady)) {
        settings.onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function() {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                delete_token($(this));
            }
        });
    }

    this.add = function(item) {
        add_token(item);
    }

    this.remove = function(item) {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                var currToken = $(this).data("tokeninput");
                var match = true;
                for (var prop in item) {
                    if (item[prop] !== currToken[prop]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    delete_token($(this));
                }
            }
        });
    }

    this.getTokens = function() {
   		return saved_tokens;
   	}

    //
    // Private functions
    //

    function escapeHTML(text) {
      return settings.enableHTML ? text : _escapeHTML(text);
    }

    function checkTokenLimit() {
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
            return;
        }
    }

    function resize_input() {
//        if(input_val === (input_val = input_box.val())) {return;}
        if(input_val === (input_val = input_box.val()) && input_val.length) {return;}

        // Enter new content into resizer and resize input accordingly
        var escaped = (settings.placeholder && input_val.length==0 ? settings.placeholder : input_val).replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        input_resizer.html(escaped);
        input_box.width(input_resizer.width() + 30);
        input_box.outerWidth(token_list.width());
    }
    resize_input();
    $(window).on('resize', resize_input);

    function is_printable_character(keycode) {
        return ((keycode >= 48 && keycode <= 90) ||     // 0-1a-z
                (keycode >= 96 && keycode <= 111) ||    // numpad 0-9 + - / * .
                (keycode >= 186 && keycode <= 192) ||   // ; = , - . / ^
                (keycode >= 219 && keycode <= 222));    // ( \ ) '
    }

    // Inner function to a token to the list
    function insert_token(item) {
        var this_token = settings.tokenFormatter(item);
        this_token = $(this_token)
          .addClass(settings.classes.token)
          .insertBefore(input_token);

        // The 'delete token' button
        $("<span>" + settings.deleteText + "</span>")
            .addClass(settings.classes.tokenDelete)
            .appendTo(this_token)
            .click(function () {
                delete_token($(this).parent());
                hidden_input.change();
                return false;
            });

        // Store data on the token
        var token_data = {"id": item.id};
        token_data[settings.propertyToSearch] = item[settings.propertyToSearch];
        $.data(this_token.get(0), "tokeninput", item);

        // Save this token for duplicate checking
        saved_tokens = saved_tokens.slice(0,selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
        selected_token_index++;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count += 1;

        // Check the token limit
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
        }

        return this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        if($.isFunction(settings.onBeforeAdd)) {
            if(settings.onBeforeAdd.call(hidden_input,item)===false) return;
        }
        var callback = settings.onAdd;

        // See if the token already exists and select it if we don't want duplicates
        if(token_count > 0 && settings.preventDuplicates) {
            var found_existing_token = null;
            token_list.children().each(function () {
                var existing_token = $(this);
                var existing_data = $.data(existing_token.get(0), "tokeninput");
                if(existing_data && existing_data.id === item.id) {
                    found_existing_token = existing_token;
                    return false;
                }
            });

            if(found_existing_token) {
                select_token(found_existing_token);
                input_token.insertAfter(found_existing_token);
                input_box.focus();
                return;
            }
        }

        // Insert the new tokens
        if(settings.tokenLimit == null || token_count < settings.tokenLimit) {
            insert_token(item);
            input_box.attr("placeholder", null);
            checkTokenLimit();
        }

        // Clear input box
        input_box.val("");

        // Don't show the help dropdown, they've got the idea
        hide_dropdown();

        // Execute the onAdd callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,item);
        }
    }

    // Select a token in the token list
    function select_token (token) {
        token.addClass(settings.classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val("");

        // Hide dropdown if it is visible (eg if we clicked to select token)
        hide_dropdown();
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass(settings.classes.selectedToken);
        selected_token = null;

        if(position === POSITION.BEFORE) {
            input_token.insertBefore(token);
            selected_token_index--;
        } else if(position === POSITION.AFTER) {
            input_token.insertAfter(token);
            selected_token_index++;
        } else {
            input_token.appendTo(token_list);
            selected_token_index = token_count;
        }

        // Show the input box and give it focus again
        input_box.focus();
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
        var previous_selected_token = selected_token;

        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }

        if(previous_selected_token === token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            select_token(token);
        }
    }

    // Delete a token from the token list
    function delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        var callback = settings.onDelete;

        var index = token.prevAll().length;
        if(index > selected_token_index) index--;

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        input_box.focus();

        // Remove this token from the saved list
        saved_tokens = saved_tokens.slice(0,index).concat(saved_tokens.slice(index+1));
        if (saved_tokens.length == 0) {
            input_box.attr("placeholder", settings.placeholder)
        }
        if(index < selected_token_index) selected_token_index--;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count -= 1;

        if(settings.tokenLimit !== null) {
            input_box
                .show()
                .val("")
                .focus();
        }

        // Execute the onDelete callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,token_data);
        }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
        var token_values = $.map(saved_tokens, function (el) {
            return el[settings.tokenValue];
        });
        hidden_input.val(token_values.join(settings.tokenDelimiter));

    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
        $(window).off('scroll resize', resize_dropdown);
        hideResultsTooltip();
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                width: $(token_list).outerWidth(),
                zindex: 999
            })
            .show();
        $(window).off('scroll resize', resize_dropdown);
        $(window).on('scroll resize', resize_dropdown);
        resize_dropdown();
    }

    function resize_dropdown() {
        var window_height = $(window).height() - (token_list.offset().top + token_list.outerHeight(true)) - 16 + $('html').get(0).scrollTop;
        if(window_height<0) window_height = 'auto';
        dropdown
            .css({
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                width: $(token_list).outerWidth(),
                'max-height': window_height
            });
    }

    function show_dropdown_searching () {
        if(settings.searchingText) {
            dropdown.html("<p>"+settings.searchingText+"</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if(settings.hintText) {
            dropdown.html("<p>"+settings.hintText+"</p>");
            show_dropdown();
        }
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeRegExp(term) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    }

    function find_value_and_highlight_term(template, value, term) {
			try{
//        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeRegExp(value) + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));

        var zenhan = settings.zenhan;
        return zenhan(template).replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + escapeRegExp( escapeHTML(zenhan(value)) ) + ")(?![^<>]*>)(?![^&;]+;)", "gi"), settings.highlightTerm(value, term));

      }catch(e){
				console.error(e);
				console.error('['+template+']['+value+']['+term+']');
			}
    }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    add_token($(event.target).closest("li").data("tokeninput"));
                    hidden_input.change();
                    return false;
                })
                .hide();

            var did_count = 0;
            var ccsd_count = 0;
            $.each(results, function(index, value) {
//                console.log(index, value);
                if(value['id'].indexOf('NANDO:1')===0) did_count++;
                if(value['id'].indexOf('NANDO:2')===0) ccsd_count++;
                var this_li = settings.resultsFormatter(value);

//                this_li = find_value_and_highlight_term(this_li ,value[settings.propertyToSearch], query);
                this_li = find_value_and_highlight_term(this_li ,value['id'].replace(/_ja$/g,''), query);
                this_li = find_value_and_highlight_term(this_li ,value['name'], query);
                this_li = find_value_and_highlight_term(this_li ,value['synonym'] instanceof Array ? value['synonym'].join(' | ') : '', query);

                this_li = $(this_li).appendTo(dropdown_ul);

                if(index % 2) {
                    this_li.addClass(settings.classes.dropdownItem);
                } else {
                    this_li.addClass(settings.classes.dropdownItem2);
                }

//                if(index === 0) {
                if(index === 0 && settings.autoSelectFirstResult) {
                    select_dropdown_item(this_li);
                }

                $.data(this_li.get(0), "tokeninput", value);
            });

            var callback = settings.onShowDropdownItem;
            if($.isFunction(callback)) {
                callback.call(dropdown,results.length,did_count,ccsd_count);
            }
            show_dropdown();

            if(settings.animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if(settings.noResultsText) {
                dropdown.html("<p>"+settings.noResultsText+"</p>");
                var callback = settings.onShowDropdownItem;
                if($.isFunction(callback)) {
                    callback.call(dropdown,0,0,0);
                }
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(settings.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass(settings.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function do_search() {
//        var query = input_box.val().toLowerCase();
        var query = input_box.val();

        if(query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }

//            if(query.length >= settings.minChars) {
            if(query.length >= settings.minChars && input_box.val().length) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
//                    console.log('run_search()',query,input_box.val().length);
                    if(input_box.val().length) {
                        run_search(query);
                    }else{
                        hide_dropdown();
                    }
                }, settings.searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if(settings.url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[settings.queryParam] = query;
                ajax_params.type = settings.method;
                ajax_params.dataType = settings.contentType;
                if(settings.crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                  if($.isFunction(settings.onResult)) {
                      results = settings.onResult.call(hidden_input, results);
                  }
                  cache.add(cache_key, settings.jsonContainer ? results[settings.jsonContainer] : results);

                  // only populate the dropdown if the results are associated with the active search query
//                  if(input_box.val().toLowerCase() === query) {
                  if(input_box.val().toLowerCase() === query.toLowerCase()) {
                      populate_dropdown(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
                  }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if(settings.local_data) {
                // Do the search through local data
                var results = $.grep(settings.local_data, function (row) {
                    return row[settings.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                if($.isFunction(settings.onResult)) {
                    results = settings.onResult.call(hidden_input, results);
                }
                cache.add(cache_key, results);
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url = settings.url;
        if(typeof settings.url == 'function') {
//            url = settings.url.call(this,type);
            url = settings.url.apply(this,arguments);
        }
        return url;
    }


		settings.onBeforeAdd = function(item){
//			console.log(item);
			var id = item['id'].replace(/_ja$/,'');
			var url = computeURL('link');
//			console.log(url+id);
			window.location.href = url+id;
			input_box.val("");
			hide_dropdown();
			return false;
		};
		settings.onShowDropdownItem = function(count,did_count,ccsd_count){
			var node = this;
			var $count_node = $('<div>').addClass(settings.classes.dropdownNumberOfHits).html(number_of_hits.replace('__NUMBER__', count).replace('__DID_NUMBER__', did_count).replace('__CCSD_NUMBER__', ccsd_count));
			if(node.get(0).firstElementChild){
				var $firstElementChild = $(node.get(0).firstElementChild);
				$count_node.insertBefore($firstElementChild);
				if(count==0) $firstElementChild.remove();
			}
			else{
				$count_node.appendTo(node);
			}
		};

		var runSearchOptions = {hasJA:isWindowNavigatorLanguageJa()};
		var resultsTooltip_timeoutID = null;
		var resultsTooltip_jqxhr;

		var $resultsTooltip = $('<div>')
			.addClass(settings.classes['dropdownItemResultTooltip'])
			.appendTo('body')
			.hide();

		var hideResultsTooltip = function(){
			if(resultsTooltip_jqxhr){
				resultsTooltip_jqxhr.abort();
				resultsTooltip_jqxhr = null;
			}
			if(resultsTooltip_timeoutID){
				clearTimeout(resultsTooltip_timeoutID);
				resultsTooltip_timeoutID = null;
			}
//			return;
			$resultsTooltip
				.hide()
				.empty();
		};

		var showResultsTooltip = function(token_data,node,results){
//			console.log('showResultsTooltip',node,results);
//			console.log($(node).offset(),$(node).position());

			if($.isPlainObject(results) && $.isArray(results.selfclass) && results.selfclass.length){
				var selfclass = results.selfclass[0];

				$resultsTooltip.empty();

				var $resultsTooltipTitle = $('<div>')
					.addClass(settings.classes['dropdownItemResultTooltipTitle'])
					.html(selfclass.id+'&nbsp;'+selfclass.name)
					.appendTo($resultsTooltip);

				var $resultsTooltipContent = $('<div>')
					.addClass(settings.classes['dropdownItemResultTooltipContentTable'])
					.appendTo($resultsTooltip);

				var language = settings.language[getCurrentLanguage()];

//				$.each(['id','name','english','definition','comment','synonym'], function(){
//				$.each(['name','english','definition','comment','synonym'], function(){
//				$.each(['name','english','definition','synonym'], function(){
//				$.each(['name','definition','synonym'], function(){
				$.each(language.tooltip_title, function(){
					var key = this;
//					var value = selfclass[key];
//					if(runSearchOptions.hasJA){
//						if($.type(selfclass[key+'_ja'])==='string') value = selfclass[key+'_ja'];
//						if(key=='english') value = selfclass['name'];
//					}else if(key=='english'){
//						return;
//					}
/*
					if(isWindowNavigatorLanguageJa()){	//ブラウザの言語設定が日本語の場合
						if((selfclass[key]==null || selfclass[key]==undefined) && $.type(selfclass[key+'_ja'])==='string' && selfclass[key+'_ja'].length) value = selfclass[key+'_ja'];

						//代表表現が日本語の場合
						if(token_data['id'].lastIndexOf('_ja')>=0){
							if(key=='name' && $.type(selfclass['name'])==='string' && selfclass['name'].length && $.type(selfclass[key+'_ja'])==='string') return;
							if(key=='english'){
								if(selfclass['name']==null || selfclass['name']==undefined) return;
								value = selfclass['name'];
							}
						}
						else{
							if(key=='name' || key=='definition' || key=='synonym'){
								if($.type(selfclass[key+'_ja'])==='string' && selfclass[key+'_ja'].length){
									value = selfclass[key+'_ja'];
								}
								else{
									if(selfclass[key]==null || selfclass[key]==undefined) return;
								}
							}
							if(key=='english') return;
						}
					}
					else if(token_data['id'].lastIndexOf('_ja')>=0){
						if(key=='english') return;
					}
					else if(key=='name' || key=='english'){
						return;
					}
*/
					var value = null;
//					if(token_data['id'].lastIndexOf('_ja')>=0){
//						if(($.type(selfclass[key+'_ja'])!=='string' && $.type(selfclass[key+'_ja'])!=='array') || selfclass[key+'_ja'].length==0) return;
//						value = selfclass[key+'_ja'];
//					}
//					else{
						if(($.type(selfclass[key])!=='string' && $.type(selfclass[key])!=='array') || selfclass[key].length==0) return;
						value = selfclass[key];
//					}
					if(value==null) return;

					var label = language[key.toLowerCase()] ? language[key.toLowerCase()] : key;
					var $contentTr = $('<div>')
														.addClass(settings.classes['dropdownItemResultTooltipContentTr'])
														.addClass(settings.classes['dropdownItemResultTooltipContentTr']+'-'+key.toLowerCase())
														.appendTo($resultsTooltipContent);
					$('<div>')
						.addClass(settings.classes['dropdownItemResultTooltipContentTh'])
						.addClass(settings.classes['dropdownItemResultTooltipContentTh']+'-'+key.toLowerCase()).text(label)
						.appendTo($contentTr);
					$('<div>')
						.addClass(settings.classes['dropdownItemResultTooltipContentTdColon'])
						.text(':')
						.appendTo($contentTr);
					var $value_td = $('<div>')
														.addClass(settings.classes['dropdownItemResultTooltipContentTd'])
														.addClass(settings.classes['dropdownItemResultTooltipContentTd']+'-'+key.toLowerCase())
														.appendTo($contentTr);
					if(key=='comment' && $.type(value)==='string'){
						$value_td.html(value.replace(/\\n/g,'<br />'));
					}
					else{
						$value_td.text(value);
					}
				});

				$resultsTooltip
					.css({'visibility':'hidden'})
					.show();

				var offset = $(node).offset();
				var node_height = $(node).outerHeight(true);
				var node_width = $(node).outerWidth(true);

				var top = offset.top;
//				console.log(top,$(document).children('html').get(0).scrollTop,$('nav.fh5co-nav').outerHeight(true));
				var content_top = $(document).children('html').get(0).scrollTop + $('nav.navbar').outerHeight(true);
				if(top < content_top){
					top = content_top;
				}
				top += 10;

				var left = offset.left + node_width/2;
				var width = node_width/2 - 10;

				$resultsTooltip
					.css({
						position: 'absolute',
						visibility: 'visible',
						top: top,
						left: left,
						width: width,
						'z-index': (1043>settings.zindex?1043:settings.zindex)+1
					})
					.show();
			}
			else{
				hideResultsTooltip();
			}

		};

		$.PopupRelationHPOResultsTooltip = function(node,token_data,options){

			hideResultsTooltip();

			if($.isEmptyObject(node) || $.isEmptyObject(token_data) || !$.isPlainObject(token_data)) return;

			options = options || {}
			if($.isEmptyObject(options['lang'])) options['lang'] = isWindowNavigatorLanguageJa() ? 'ja' : 'en';
			if($.isPlainObject(options)){
				if($.type(options['lang'])==='string'){
					options['hasJA'] = (options['lang'].toLowerCase()==='ja' || options['lang'].toLowerCase()==='jpn') ? true : false;
					delete options['lang'];
				}
			}
			runSearchOptions = $.extend(true, {}, runSearchOptions, options || {});


			var $node = $(node);
			var data_key = 'popup-hierarchy-hpo-tooltip-data';

//			if($.data(node,data_key)){
//				console.log($.data(node,data_key));
//				return;
//			}

			resultsTooltip_timeoutID = setTimeout(function(){
				if(resultsTooltip_timeoutID===null) return;
				resultsTooltip_timeoutID = null;

				var query = token_data.id;

				var url = computeURL('information');

				var cache_key = query + url;
				var cached_results = cache.get(cache_key);
//				cached_results = null;
				if(cached_results){
//					console.log('call showResultsTooltip()');
					showResultsTooltip(token_data,node,cached_results);
					if($.isFunction(runSearchOptions.callback)){
						runSearchOptions.callback.call(this, true);
					}
				}
				else{


					if(settings.url) {
						var ajax_params = {};
						ajax_params.data = {};
						if(url.indexOf("?") > -1) {
							var parts = url.split("?");
							ajax_params.url = parts[0];

							var param_array = parts[1].split("&");
							$.each(param_array, function (index, value) {
								var kv = value.split("=");
								ajax_params.data[kv[0]] = kv[1];
							});
						} else {
							ajax_params.url = url;
						}

						ajax_params.data[settings.queryParam] = query;
						ajax_params.type = settings.method;
						ajax_params.dataType = settings.contentType;
						if (settings.crossDomain) {
							ajax_params.dataType = "jsonp";
						}

						ajax_params.success = function(results) {

							if($.isEmptyObject(resultsTooltip_jqxhr)) return;

							cache.add(cache_key, settings.jsonContainer ? results[settings.jsonContainer] : results);

//							console.log('call showResultsTooltip()');
							showResultsTooltip(token_data,node,settings.jsonContainer ? results[settings.jsonContainer] : results);
							if($.isFunction(runSearchOptions.callback)){
								runSearchOptions.callback.call(this, true);
							}

							resultsTooltip_jqxhr = null;
						};

						ajax_params.error = function(XMLHttpRequest, textStatus, errorThrown) {

							if($.isEmptyObject(resultsTooltip_jqxhr)) return;

							console.warn(textStatus, errorThrown);
							if($.isFunction(runSearchOptions.callback)){
								runSearchOptions.callback.call(this, false);
							}

							resultsTooltip_jqxhr = null;
						};

						if($.isFunction(settings.onSend)){
							settings.onSend(ajax_params);
						}

						resultsTooltip_jqxhr = $.ajax(ajax_params);

					} else if(settings.local_data) {
						var results = $.grep(settings.local_data, function (row) {
							return row[settings.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
						});

						cache.add(cache_key, results);

//						console.log('call showResultsTooltip()');
						showResultsTooltip(token_data,node,results);
						if($.isFunction(runSearchOptions.callback)){
							runSearchOptions.callback.call(this, true);
						}
					}
				}


			},0);
		};

		$(document).on('mouseover', 'span.'+settings.classes['dropdownItemInformation'], function(e){
			var $item = $(this).closest('li');
			var token_data = $item.data('tokeninput');
			var $dropdown = $(this).closest('div.'+settings.classes['dropdown']);
			if($.isPlainObject(token_data) && $dropdown.length){
				$.PopupRelationHPOResultsTooltip($dropdown,token_data);
//				console.log(token_data);
			}
			e.stopPropagation();
			return false;
		});
		$(document).on('mouseout', 'span.'+settings.classes['dropdownItemInformation'], function(e){
			$.PopupRelationHPOResultsTooltip();
			e.stopPropagation();
			return false;
		});

};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};
}(jQuery));

(function (w) {
    var reRegExp = /[\\^$.*+?()[\]{}|]/g,
        reHasRegExp = new RegExp(reRegExp.source);

    function escapeRegExp(string) {
        return (string && reHasRegExp.test(string))
            ? string.replace(reRegExp, '\\$&')
            : string;
    }

    w.escapeRegExp = escapeRegExp;
})(window);
