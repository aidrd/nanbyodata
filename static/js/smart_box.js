/**
 * Suggests keywords based on input from a specified text box.
 *
 * @param {string} input_box_id - The ID of the input box element.
 * @param {string} data_path - The path to the TSV file containing keyword data.
 * @param {Object} [options={}] - An options object to specify additional settings.
 * @param {string} [options.api_url=''] - The URL of the API to fetch additional keyword suggestions (optional).
 * @param {boolean} [options.includeNoMatch=false] - Whether to include a selection field for the keyword itself in the suggestion box (optional).
 */
export function smartBox(input_box_id, data_path, options = {}) {
  if (!input_box_id) {
    console.error('Error in smartBox: Input box id is required.');
    return;
  }

  if (!data_path) {
    console.error('Error in smartBox: TSV file path is required.');
    return;
  }

  const { api_url = '', includeNoMatch = false } = options;

  let diseases = [];
  let selectedIndex = -1;
  let currentKeywords = [];
  let originalInputValue = '';
  let isComposing = false;
  const inputElement = document.getElementById(input_box_id);
  let suggestBoxContainer = document.getElementById(
    `${input_box_id}_suggestBox`
  );
  let localResults = [];
  let apiResults = [];
  if (!suggestBoxContainer) {
    suggestBoxContainer = createSuggestBoxContainer(inputElement);
  }

  init();

  /**
   * Initializes the keyword suggestion feature by attaching event listeners and fetching the TSV data.
   */
  function init() {
    if (!inputElement.hasAttribute('data-event-attached')) {
      addEventListeners();
      fetchTSVData();
      inputElement.setAttribute('data-event-attached', 'true');
    }
  }

  /**
   * Adds event listeners to the input element for handling user input, keyboard navigation, and clicks outside the suggestion box.
   */
  function addEventListeners() {
    let isEnterKeyForConversion = false;
    let lastKeyWasEnter = false;

    inputElement.addEventListener(
      'input',
      debounce((event) => {
        if (!isComposing && !isEnterKeyForConversion) {
          handleInput(event);
        }
      }, 300)
    );

    inputElement.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        handleKeyboardNavigation(event);
      } else if (
        event.key === 'Enter' &&
        !isComposing &&
        !isEnterKeyForConversion
      ) {
        event.preventDefault();
        if (suggestBoxContainer.style.display === 'block') {
          const items =
            suggestBoxContainer.querySelectorAll('.suggestion-item');
          if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].click();
          }
        }
      } else if (event.key === ' ') {
        clearSuggestBox();
      }

      if (event.key === 'Enter') {
        lastKeyWasEnter = true;
      }
    });

    inputElement.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        lastKeyWasEnter = false;
      }
    });

    inputElement.addEventListener('compositionstart', () => {
      isComposing = true;
      isEnterKeyForConversion = true;
    });

    inputElement.addEventListener('compositionend', () => {
      isComposing = false;
      setTimeout(() => {
        isEnterKeyForConversion = false;
        if (
          inputElement.value.trim() !== '' &&
          !isFullWidthNumeric(inputElement.value) &&
          !lastKeyWasEnter
        ) {
          handleInput();
        }
      }, 200);
    });

    inputElement.addEventListener('focus', handleFocus);
    document.addEventListener('click', handleClickOutside);
  }

  /**
   * Checks if the input string contains only full-width numeric characters.
   * @param {string} value - The input value to check.
   * @returns {boolean} - True if the input contains only full-width numeric characters, false otherwise.
   */
  function isFullWidthNumeric(value) {
    const fullWidthNumericPattern = /^[０-９]+$/;
    return fullWidthNumericPattern.test(value);
  }

  /**
   * Handles focus events on the input element to re-trigger the search if the input is not empty.
   */
  function handleFocus(event) {
    if (event.target.value.trim().length > 0) {
      handleInput(event);
    }
  }

  /**
   * Creates a debounced function that delays the execution of the input function until after a specified wait time has elapsed.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The number of milliseconds to delay.
   * @returns {Function} - The debounced function.
   */
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Fetches the TSV data from the specified path and parses it into an array of keyword objects.
   */
  function fetchTSVData() {
    fetch(data_path)
      .then((response) => response.text())
      .then((tsvData) => {
        diseases = parseTSVData(tsvData);
      })
      .catch((error) => {
        console.error('Failed to load TSV data:', error);
        diseases = [];
      });
  }

  /**
   * Creates and returns the suggestion box container element.
   * @param {HTMLElement} inputElement - The input element to attach the suggestion box container to.
   * @returns {HTMLElement} - The created suggestion box container.
   */
  function createSuggestBoxContainer(inputElement) {
    const container = document.createElement('ul');
    container.classList.add('suggest-box');
    inputElement.parentNode.insertBefore(container, inputElement.nextSibling);
    return container;
  }

  /**
   * Clears the suggestion box and hides it.
   */
  function clearSuggestBox() {
    suggestBoxContainer.innerHTML = '';
    suggestBoxContainer.style.display = 'none';
    inputElement.classList.remove('suggest-box-open');
    document.removeEventListener('click', handleClickOutside);
  }

  /**
   * Handles input events from the input element, normalizes the input value, and displays keyword suggestions.
   * @param {Event} event - The input event.
   */
  function handleInput(event) {
    if (isComposing) return;

    const lang = document.documentElement.lang;
    originalInputValue = event ? event.target.value : inputElement.value;
    const searchValue = normalizeString(originalInputValue.trim());

    if (searchValue.length < 2) {
      clearSuggestBox();
      return;
    }

    const isNumericInput = /^\d+$/.test(searchValue);

    currentKeywords = searchValue
      .split(/\s+/)
      .filter((keyword) => keyword !== '');

    if (isNumericInput) {
      localResults = searchInLocalData(diseases, currentKeywords, true);

      if (localResults.length === 0 && api_url) {
        fetchFromAPI(searchValue).then((results) => {
          if (results.length === 0 && includeNoMatch) {
            displayResults([], true, true);
          } else {
            apiResults = results;
            displayResults(results, true, true);
          }
        });
      } else {
        displayResults(localResults, false, true);
      }
    } else {
      localResults = searchInLocalData(diseases, currentKeywords);

      if (localResults.length === 0 && api_url) {
        fetchFromAPI(searchValue).then((results) => {
          if (results.length === 0 && includeNoMatch) {
            displayResults([], true);
          } else {
            apiResults = results;
            displayResults(results, true);
          }
        });
      } else {
        displayResults(localResults);
      }
    }
  }

  /**
   * Displays keyword suggestions in the suggestion box.
   * @param {Array} results - The list of keyword suggestions.
   * @param {boolean} [fromAPI=false] - Whether the results are from an API call.
   */
  function displayResults(results, fromAPI = false, onlyNumeric = false) {
    let hitCount = fromAPI ? 0 : results.length;
    let suggestionsHtml = '';
    const lang = document.documentElement.lang;
    let isEng = isEnglish(currentKeywords.join(' '));
    if (onlyNumeric) {
      isEng = lang === 'en' ? true : false;
    }

    if (includeNoMatch) {
      suggestionsHtml += createKeywordSuggestion();
    }

    const hitCountText = createHitCountText(fromAPI, hitCount);

    suggestionsHtml += `<div class="hit-count">${hitCountText}</div>`;

    suggestionsHtml += results
      .map((disease, index) =>
        createSuggestionItem(disease, index, isEng, suggestionsHtml)
      )
      .join('');

    suggestBoxContainer.innerHTML = suggestionsHtml;
    suggestBoxContainer.style.display = 'block';
    inputElement.classList.add('suggest-box-open');
    selectedIndex = results.length > 0 ? 0 : includeNoMatch ? 0 : -1;

    attachListeners();
    updateSelection(selectedIndex);
    document.addEventListener('click', handleClickOutside);
  }

  /**
   * Creates the HTML for a keyword suggestion item.
   * @returns {string} - The HTML string for the keyword suggestion item.
   */
  function createKeywordSuggestion() {
    const lang = document.documentElement.lang;
    const keyword = currentKeywords.join(' ');
    const displayText =
      lang === 'ja'
        ? `"${keyword}"をテキスト入力（IDなし）`
        : `Text input "${keyword}" (no ID)`;

    return `
    <li class="suggestion-item -keyword" data-id="noMatch">
      <div class="label-container">
        <span class="main-name">${displayText}</span>
      </div>
    </li>`;
  }

  /**
   * Creates the HTML for a suggestion item.
   * @param {Object} disease - The disease object containing keyword data.
   * @param {number} index - The index of the suggestion item.
   * @param {boolean} isEng - Whether the input language is English.
   * @param {string} suggestionsHtml - The current HTML string for the suggestions.
   * @returns {string} - The HTML string for the suggestion item.
   */
  function createSuggestionItem(disease, index, isEng, suggestionsHtml) {
    const mainLabel = isEng ? disease.label_en : disease.label_ja;
    const synonyms = isEng ? disease.synonym_en : disease.synonym_ja;
    const highlightedID = highlightMatch(disease.id, currentKeywords);
    const highlightedLabel = highlightMatch(mainLabel, currentKeywords);
    const highlightedSynonyms = synonyms
      ? highlightMatch(synonyms, currentKeywords)
      : '';

    const matchedSynonyms = highlightedSynonyms
      .split('|')
      .filter((synonym) =>
        currentKeywords.some((keyword) =>
          normalizeString(synonym).includes(keyword)
        )
      );

    return `
    <li class="suggestion-item ${
      index === 0 && !suggestionsHtml ? '-selected' : ''
    }" data-id="${disease.id}">
      <span class="label-id">${highlightedID}</span>
      <div class="label-container">
        <span class="main-name">${highlightedLabel}</span>
        ${
          matchedSynonyms.length > 0
            ? `<span class="synonyms">| ${matchedSynonyms.join(' | ')}</span>`
            : ''
        }
      </div>
    </li>`;
  }

  /**
   * Creates the HTML for the hit count text.
   * @param {boolean} fromAPI - Whether the results are from an API call.
   * @param {number} hitCount - The number of hits.
   * @returns {string} - The HTML string for the hit count text.
   */
  function createHitCountText(fromAPI, hitCount) {
    const lang = document.documentElement.lang;
    return fromAPI
      ? lang === 'ja'
        ? `ヒット件数 [0] <span class="suggestion-hint">もしかして:</span>`
        : `Number of hits [0] <span class="suggestion-hint">Did you mean:</span>`
      : lang === 'ja'
      ? `ヒット件数 [${hitCount}]`
      : `Number of hits [${hitCount}]`;
  }

  /**
   * Highlights matching keywords in the text.
   * @param {string} text - The text to highlight matches in.
   * @param {Array} keywords - The list of keywords to highlight.
   * @returns {string} - The text with highlighted matches.
   */
  function highlightMatch(text, keywords) {
    const allWidthKeywords = keywords.flatMap((keyword) => {
      const fullwidthKeyword = keyword.replace(/[0-9]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
      });
      return [keyword, fullwidthKeyword];
    });

    const filteredKeywords = allWidthKeywords.filter((kw) => kw.trim() !== '');

    const allWidthRegex = new RegExp(
      `(${filteredKeywords
        .map((keyword) => keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
        .join('|')})`,
      'gi'
    );

    const splitRegex = /(<[^>]+>|[^<]+)/g;
    const parts = text.split(splitRegex);

    const highlightedParts = parts.map((part) => {
      if (!part.startsWith('<')) {
        part = part.replace(allWidthRegex, '<span class="highlight">$&</span>');
        return part;
      }
      return part;
    });

    return highlightedParts.join('');
  }

  /**
   * Handles keyboard navigation within the suggestion box.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  function handleKeyboardNavigation(event) {
    if (isComposing) return;

    const items = suggestBoxContainer.querySelectorAll('.suggestion-item');
    let newIndex = selectedIndex;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
    } else if (event.key === 'Enter' && selectedIndex >= 0) {
      items[selectedIndex]?.click();
    }

    if (newIndex !== selectedIndex) {
      updateSelection(newIndex);
    }
  }

  /**
   * Updates the selected suggestion item based on the new index.
   * @param {number} newIndex - The new index of the selected suggestion item.
   */
  function updateSelection(newIndex) {
    const items = suggestBoxContainer.querySelectorAll('.suggestion-item');
    selectedIndex = newIndex;
    items.forEach((item, index) => {
      item.classList.toggle('-selected', index === selectedIndex);
      if (index === selectedIndex) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  /**
   * Attaches event listeners to the suggestion items for handling mouse hover and click events.
   */
  function attachListeners() {
    const items = suggestBoxContainer.querySelectorAll('.suggestion-item');
    items.forEach((item, index) => {
      item.removeEventListener('mouseover', handleHover);
      item.addEventListener('mouseover', handleHover);
      item.removeEventListener('click', handleClick);
      item.addEventListener('click', handleClick);

      function handleHover() {
        updateSelection(index);
      }
      function handleClick() {
        const isNoMatch = item.getAttribute('data-id') === 'noMatch';
        let labelInfo;
        if (isNoMatch) {
          labelInfo = {
            id: '',
            label_en: '',
            label_ja: '',
            keyword: originalInputValue,
          };
        } else {
          const itemId = item.getAttribute('data-id');
          const diseaseInfo =
            localResults.length === 0
              ? apiResults.find((disease) => disease.id === itemId)
              : diseases.find((disease) => disease.id === itemId);

          const { synonym_en, synonym_ja, ...restDiseaseInfo } = diseaseInfo;

          labelInfo = {
            ...restDiseaseInfo,
            keyword: originalInputValue,
          };
        }

        const customEvent = new CustomEvent('selectedLabel', {
          detail: { inputBoxId: input_box_id, labelInfo: labelInfo },
        });
        document.dispatchEvent(customEvent);
        clearSuggestBox();
      }
    });
  }

  /**
   * Parses the TSV data into an array of keyword objects.
   * @param {string} tsvData - The TSV data string.
   * @returns {Array} - The array of parsed keyword objects.
   */
  function parseTSVData(tsvData) {
    return Papa.parse(tsvData, {
      columns: true,
      delimiter: '\t',
      header: true,
    }).data;
  }

  /**
   * Normalizes the input string by converting it to NFKC form and lowercasing it.
   * @param {string} str - The string to normalize.
   * @returns {string} - The normalized string.
   */
  function normalizeString(str) {
    return str.normalize('NFKC').toLowerCase();
  }

  /**
   * Determines whether the input string should be treated as English based on the content and the language setting.
   * @param {string} str - The input string.
   * @returns {boolean} - True if the input string should be treated as English, otherwise false.
   */
  function isEnglish(str) {
    const lang = document.documentElement.lang;
    const isNumericOnly = /^\d+(\s+\d+)*$/.test(str);

    if (isNumericOnly) {
      return lang === 'en';
    }

    const englishPattern = /^[A-Za-z0-9\s:]+$/;
    return englishPattern.test(normalizeString(str));
  }

  /**
   * Searches for matching keywords in the local data based on the input keywords.
   * @param {Array} diseases - The array of keyword objects.
   * @param {Array} keywords - The array of input keywords.
   * @returns {Array} - The array of matching keyword objects.
   */
  function searchInLocalData(diseases, keywords, onlyNumeric = false) {
    const lang = document.documentElement.lang;
    let isEng = isEnglish(keywords.join(' '));
    if (onlyNumeric) {
      isEng = lang === 'en' ? true : false;
    }
    return diseases.filter((disease) => {
      return keywords.every((keyword) => {
        const lowerKeyword = normalizeString(keyword);
        if (isEng) {
          return (
            (disease.id &&
              normalizeString(disease.id).includes(lowerKeyword)) ||
            (disease.label_en &&
              normalizeString(disease.label_en).includes(lowerKeyword)) ||
            (disease.synonym_en &&
              normalizeString(disease.synonym_en).includes(lowerKeyword))
          );
        } else {
          return (
            (disease.id &&
              normalizeString(disease.id).includes(lowerKeyword)) ||
            (disease.label_ja &&
              normalizeString(disease.label_ja).includes(lowerKeyword)) ||
            (disease.synonym_ja &&
              normalizeString(disease.synonym_ja).includes(lowerKeyword))
          );
        }
      });
    });
  }

  /**
   * Fetches keyword suggestions from the API based on the input value.
   * @param {string} searchValue - The input value to search for.
   * @returns {Promise<Array>} - A promise that resolves to an array of keyword objects.
   */
  function fetchFromAPI(searchValue) {
    const url = `${api_url}${encodeURIComponent(searchValue)}`;
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error fetching from API:', error);
        return [];
      });
  }

  /**
   * Handles clicks outside the suggestion box to hide it.
   * @param {MouseEvent} event - The click event.
   */
  function handleClickOutside(event) {
    if (
      suggestBoxContainer.style.display === 'block' &&
      !suggestBoxContainer.contains(event.target) &&
      !inputElement.contains(event.target)
    ) {
      clearSuggestBox();
    }
  }
}
