import { navToggle } from './utils/navigation.js';
import { focusInput } from './utils/focusInput.js';
import { setLangChange } from './utils/setLangChange.js';
import {
  drawDesignatedIntractableDiseaseColumnsTable,
  drawPediatricChronicSpecificDiseaseColumnsTable,
} from './epidemiology/epidemiology.js';
import { smartBox } from './utils/smart_box.js';

navToggle();
focusInput();
setLangChange();
if (window.location.pathname === '/epidemiology') {
  drawDesignatedIntractableDiseaseColumnsTable();
  drawPediatricChronicSpecificDiseaseColumnsTable();
}

// smart box
if (window.location.pathname === '/') {
  smartBox('NANDO', '/ontology/current_release/nando.tsv', {
    api_url: '',
    max_results: 100,
  });

  document.addEventListener('selectedLabel', function (event) {
    const labelInfo = event.detail.labelInfo;
    window.location.href = `${location.origin}/disease/${labelInfo.id}`;
  });

  // ニュースセクションの初期状態を設定
  const newsWrapperEl = document.querySelector('.news-summary > .news-wrapper');
  if (newsWrapperEl) {
    // moreボタンを作成
    const moreButtonEl = document.createElement('button');
    moreButtonEl.className = 'more';
    moreButtonEl.textContent = 'more';
    moreButtonEl.style.display = 'none';
    newsWrapperEl.appendChild(moreButtonEl);

    // キャッシュの確認
    const currentLang = document.documentElement.lang === 'en' ? 'en' : 'ja';
    const branch =
      window.location.hostname === 'nanbyodata.jp' ? 'master' : 'dev';
    const CACHE_KEY = `news_info_${currentLang}_${branch}`;
    const CACHE_TIMESTAMP_KEY = `news_info_timestamp_${currentLang}_${branch}`;
    const CACHE_DURATION_MS = 30 * 60 * 1000;

    const now = new Date().getTime();
    const lastFetchTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const hasValidCache =
      lastFetchTime && now - lastFetchTime < CACHE_DURATION_MS;

    // キャッシュが無効な場合のみローディングスピナーを表示
    if (!hasValidCache) {
      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = 'loading-spinner news-loading';
      newsWrapperEl.appendChild(loadingSpinner);
    } else {
      moreButtonEl.style.display = 'block'; // キャッシュがある場合はmoreボタンを表示
    }

    // loadNewsListの完了を待ってからmore buttonのイベントリスナーを設定
    loadNewsList().then(() => {
      // ローディングスピナーを削除
      const spinner = newsWrapperEl.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }

      // moreボタンを表示
      moreButtonEl.style.display = 'block';

      // News open/close function
      const moreListEl = newsWrapperEl.querySelector('.logdata > .more-list');

      if (moreListEl) {
        moreButtonEl.addEventListener('click', () => {
          const isOpen = moreButtonEl.classList.toggle('open');
          moreButtonEl.textContent = isOpen ? 'close' : 'more';
          moreListEl.classList.toggle('open');
        });
      }
    });
  }
}

async function loadNewsList() {
  const currentLang = document.documentElement.lang === 'en' ? 'en' : 'ja';

  // GitHub API のエンドポイント
  const branch =
    window.location.hostname === 'nanbyodata.jp' ? 'master' : 'dev';
  const GITHUB_API_URL = `https://api.github.com/repos/aidrd/nanbyodata/contents/posts/${currentLang}?ref=${branch}`;

  // キャッシュ設定
  const CACHE_KEY = `news_info_${currentLang}_${branch}`;
  const CACHE_TIMESTAMP_KEY = `news_info_timestamp_${currentLang}_${branch}`;
  const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 分

  const now = new Date().getTime();
  const lastFetchTime = localStorage.getItem(CACHE_TIMESTAMP_KEY);

  // キャッシュがあり、30分以内ならAPIを叩かずキャッシュを使用
  if (lastFetchTime && now - lastFetchTime < CACHE_DURATION_MS) {
    console.log('Using cached news_info');
    const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cachedData) {
      renderNewsList(cachedData);
      return;
    }
  }

  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error('GitHub API request failed');
    const files = await response.json(); // ディレクトリ内のファイルリスト

    const newsData = {};

    for (const file of files) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        // ファイル名から日付を取得 (例: "2024-11-25-post1.md" → "2024.11.25")
        const datePart = file.name.split('-post')[0].replace(/-/g, '.');
        const filePath = file.name.replace('.md', '');

        // 記事のタイトルを取得
        const fileResponse = await fetch(file.download_url);
        if (!fileResponse.ok) continue;
        const mdText = await fileResponse.text();
        const metadata = extractFrontMatter(mdText);

        // 'title' のクォートを削除
        const extractedTitle = metadata.title
          ? metadata.title.replace(/^['"](.*)['"]$/, '$1')
          : '(No Title)';

        newsData[filePath] = {
          date: datePart,
          title: extractedTitle,
          path: `news?post=${filePath}`,
        };
      }
    }

    // データをキャッシュ
    localStorage.setItem(CACHE_KEY, JSON.stringify(newsData));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());

    renderNewsList(newsData);
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

// **ニュース一覧を HTML に挿入**
function renderNewsList(newsData) {
  const newsContainer = document.querySelector('.logdata');
  if (!newsContainer) return;

  let html = '';
  let counter = 0;

  Object.entries(newsData)
    .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))
    .forEach(([filePath, info]) => {
      counter++;
      if (counter <= 5) {
        html += `
        <dl>
          <dt><time datetime="${info.date}">${info.date}</time></dt>
          <dd><a href="${info.path}">${info.title}</a></dd>
        </dl>`;
      } else {
        if (counter === 6) html += `<div class="more-list">`;
        html += `
        <dl>
          <dt><time datetime="${info.date}">${info.date}</time></dt>
          <dd><a href="${info.path}">${info.title}</a></dd>
        </dl>`;
        if (counter === Object.keys(newsData).length) html += `</div>`;
      }
    });

  newsContainer.innerHTML = html;
}

// **Markdownのメタデータを取得**
function extractFrontMatter(mdText) {
  const frontMatterPattern = /^---\n([\s\S]+?)\n---/;
  const match = mdText.match(frontMatterPattern);
  if (!match) return {};

  const lines = match[1].split('\n');
  const frontMatter = {};

  lines.forEach((line) => {
    const [key, ...values] = line.split(': ');
    if (key && values.length) {
      frontMatter[key.trim()] = values.join(': ').trim();
    }
  });

  return frontMatter;
}
