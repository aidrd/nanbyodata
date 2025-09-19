export function makeSideNavigation() {
  const sideNavigation = document.getElementById('temp-side-navigation');

  const items = [
    'overview',
    'genes',
    'glycan-related-genes',
    'genetic-testing',
    'phenotypes',
    // TODO: 公開OKになったら表示
    // 'hum-data',
    'cell',
    'mouse',
    'dna',
    'clinvar',
    'mgend',
    'facial-features',
    'chemical-information',
    // TODO: 公開OKになったら表示
    // 'references',
  ];

  items.forEach((itemId) => {
    const link = sideNavigation.querySelector(`.nav-link.${itemId}`);
    if (!link) return;

    link.addEventListener('click', (event) => {
      if (link.classList.contains('-disabled')) {
        event.preventDefault();
        return;
      }

      const id = link.getAttribute('href').replace('#', '');
      switchingDisplayContents(id);
      document.getElementById('content').style.display = 'block';
    });
  });

  document.querySelectorAll('a[href="#bio-resource"]').forEach(function (aTag) {
    aTag.addEventListener('click', function (event) {
      if (this.classList.contains('-disabled')) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      const classList = this.classList[0];
      const selectName = 'bio-resource-' + classList;
      window.location.hash = selectName;
      const checkBox = document.getElementById(selectName);
      if (checkBox && !checkBox.checked) {
        checkBox.checked = true;
      }
    });
  });

  document.querySelectorAll('a[href="#variant"]').forEach(function (aTag) {
    aTag.addEventListener('click', function (event) {
      if (this.classList.contains('-disabled')) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      const classList = this.classList[0];
      const selectName = 'variant-' + classList;
      window.location.hash = selectName;
      const checkBox = document.getElementById(selectName);
      if (checkBox && !checkBox.checked) {
        checkBox.checked = true;
      }
    });
  });

  // processing when tabs are switched
  document
    .querySelectorAll('#bio-resource .tab-switch')
    .forEach(function (tabSwitch) {
      tabSwitch.addEventListener('change', function () {
        const selectedTabId = this.id.replace('bio-resource-', '');
        const tocItem = document.querySelector(
          '.bio-resource a.' + selectedTabId
        );
        document.querySelectorAll('a').forEach(function (item) {
          item.classList.remove('selected');
        });
        if (tocItem) {
          if (!tocItem.classList.contains('-disabled')) {
            tocItem.classList.add('selected');
            window.location.hash = this.id;
          }
        }
      });
    });

  document
    .querySelectorAll('#variant .tab-switch')
    .forEach(function (tabSwitch) {
      tabSwitch.addEventListener('change', function () {
        const selectedTabId = this.id.replace('variant-', '');
        const tocItem = document.querySelector('.variant a.' + selectedTabId);
        document.querySelectorAll('a').forEach(function (item) {
          item.classList.remove('selected');
        });
        if (tocItem) {
          if (!tocItem.classList.contains('-disabled')) {
            tocItem.classList.add('selected');
            window.location.hash = this.id;
          }
        }
      });
    });
}

export function switchingDisplayContents(selectedItemId) {
  const items = [
    '#overview',
    '#temp-disease-definition',
    // TODO: 公開OKになったら表示
    // '#references',
    '#causal-genes',
    '#glycan-related-genes',
    '#genetic-testing',
    '#phenotypes',
    '#bio-resource',
    '#variant',
  ];

  // まず、全てのコンテンツを非表示にする
  const allContentSections = [
    '#overview',
    '#genes',
    '#glycan-related-genes',
    '#genetic-testing',
    '#phenotypes',
    // TODO: 公開OKになったら表示
    // '#hum-data',
    '#bio-resource',
    '#variant',
    '#facial-features',
    // TODO: 公開OKになったら表示
    // '#references',
  ];

  // ローディングスピナーを追加
  const contentElement = document.getElementById('content');
  if (contentElement) {
    // 既存のローディングスピナーがあれば削除
    const existingSpinner = contentElement.querySelector('.loading-spinner');
    if (existingSpinner) {
      existingSpinner.remove();
    }

    // ローディングスピナーを追加
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'loading-spinner';
    contentElement.appendChild(loadingSpinner);
  }

  // Hide all elements
  allContentSections.forEach((selector) => toggleDisplay(selector));
  const currentItemEl = document.querySelector(`.${selectedItemId}`);
  if (!currentItemEl.classList.contains('-disabled')) {
    // まず、全てのコンテンツを非表示にする
    const allContentSections = [
      '#overview',
      '#causal-genes',
      '#glycan-related-genes',
      '#genetic-testing',
      '#phenotypes',
      '#bio-resource',
      '#variant',
      '#facial-features',
      '#chemical-information',
      // TODO: 公開OKになったら表示
      // '#references',
    ];

    allContentSections.forEach((selector) => {
      if (selector !== `#${selectedItemId}`) {
        toggleDisplay(selector, 'none');
      }
    });

    // Show selected items
    switch (selectedItemId) {
      case 'overview':
        toggleDisplay('#overview', 'block');
        ['.temp-wrapper', '#temp-disease-definition'].forEach((selector) => {
          toggleDisplay(selector, 'block');
        });
        break;
      case 'temp-disease-definition':
      // TODO: 公開OKになったら表示
      // case 'references':
      case 'genes':
      case 'glycan-related-genes':
      case 'genetic-testing':
      case 'phenotypes':
        prepareDataWrapper();
        toggleDisplay(`#${selectedItemId}`, 'block');
        break;
      // TODO: 公開OKになったら表示
      // case 'hum-data':
      // 以下必要か再確認（フロント側）
      //   prepareDataWrapper();
      //   toggleDisplay(`#${selectedItemId}`, 'block');
      //   break;
      case 'bio-resource':
      case 'bio-resource-cell':
      case 'bio-resource-mouse':
      case 'bio-resource-dna':
        prepareDataWrapper();
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        toggleDisplay('#bio-resource', 'block');
        let checkBoxBrc = document.getElementById(selectedItemId);
        if (checkBoxBrc) checkBoxBrc.checked = true;
        updateBioSelection('#bio-resource .tab-switch:checked');
        break;
      case 'variant':
      case 'variant-clinvar':
      case 'variant-mgend':
        prepareDataWrapper();
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        toggleDisplay('#variant', 'block');
        let checkBoxVariant = document.getElementById(selectedItemId);
        if (checkBoxVariant) checkBoxVariant.checked = true;
        updateVariantSelection('#variant .tab-switch:checked');
        break;
      case 'facial-features':
        prepareDataWrapper();
        toggleDisplay(`#${selectedItemId}`, 'block');
        break;
      case 'chemical-information':
        prepareDataWrapper();
        toggleDisplay(`#${selectedItemId}`, 'block');
        break;
      default:
        window.location.href = window.location.href.split('#')[0];
    }

    // コンテンツ表示後、ローディングスピナーを削除
    const spinner = document.querySelector('#content > .loading-spinner');
    if (spinner) {
      spinner.remove();
    }

    // コンテンツの可視性を戻す
    const contentElement = document.getElementById('content');
    if (contentElement) {
      const contentChildren = contentElement.children;
      for (let i = 0; i < contentChildren.length; i++) {
        contentChildren[i].style.visibility = 'visible';
      }
    }
  }
}

function toggleDisplay(selector, displayStyle = 'none') {
  const element = document.querySelector(selector);
  if (element) element.style.display = displayStyle;
}

function prepareDataWrapper() {
  const dataWrapper = document.getElementById('data-wrapper');
  const summary = document.querySelector('.summary-header');
  if (dataWrapper.firstChild !== summary) {
    dataWrapper.insertBefore(summary, dataWrapper.firstChild);
  }
}

function updateBioSelection(selector) {
  const checkedSwitch = document.querySelector(selector);
  if (checkedSwitch) {
    window.location.hash = checkedSwitch.id;
  }
}

function updateVariantSelection(selector) {
  const checkedSwitch = document.querySelector(selector);
  if (checkedSwitch) {
    window.location.hash = checkedSwitch.id;
  }
}
