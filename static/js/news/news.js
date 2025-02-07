document.addEventListener('DOMContentLoaded', () => {
  const currentLang = document.querySelector('.language-select').value;
  const params = new URLSearchParams(window.location.search);
  const postFilename = params.get('post');

  if (!postFilename) return;

  // "nanbyodata.jp" なら master、それ以外は dev
  const branch =
    window.location.hostname === 'nanbyodata.jp' ? 'master' : 'dev';

  // GitHubから取得するURL
  const GITHUB_RAW_URL = `https://raw.githubusercontent.com/aidrd/nanbyodata/refs/heads/${branch}/posts/${currentLang}/${postFilename}.md`;

  fetch(GITHUB_RAW_URL)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch post: ${res.status} ${res.statusText}`
        );
      }
      return res.text();
    })
    .then((mdText) => {
      // YAML Front Matter を解析
      const metadata = extractFrontMatter(mdText);

      // 'title' のクォートを削除
      const extractedTitle = metadata.title
        ? metadata.title.replace(/^['"](.*)['"]$/, '$1')
        : '(No Title)';

      // ファイル名から日付を取得 (例: "2024-11-25-post1" → "2024.11.25")
      const datePart = postFilename.split('-post')[0].replace(/-/g, '.');

      // Markdown 本文のみを抽出 (Front Matter 部分を削除)
      const mdContent = mdText.replace(/^---\n[\s\S]+?\n---/, '').trim();

      // Markdown → HTML変換
      const html = marked.parse(mdContent);

      document.querySelector('.news-title').textContent = extractedTitle;
      document.querySelector('.post-date').textContent = datePart;
      document.querySelector('.post-content').innerHTML = html;
    })
    .catch((err) => {
      console.error('Error loading Markdown:', err);
      document.querySelector('.news-title').textContent = 'Error';
      document.querySelector('.post-date').textContent = '';
      document.querySelector('.post-content').textContent =
        'Could not load content.';
    });
});

function extractFrontMatter(mdText) {
  // YAML Front Matter のパターンを定義
  const frontMatterPattern = /^---\n([\s\S]+?)\n---/;
  const match = mdText.match(frontMatterPattern);

  if (!match) return {}; // YAMLブロックがなければ空オブジェクトを返す

  // 各行を解析
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
