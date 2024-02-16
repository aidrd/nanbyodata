export const tree = () => {
  document.addEventListener('DOMContentLoaded', (event) => {
    // select-optionがクリックされたときに実行
    document.querySelectorAll('.select-option').forEach((item) => {
      item.addEventListener('click', (event) => {
        // 同じwrapper内のcontentの表示状態を切り替える
        const contentDiv = item.nextElementSibling; // select-optionの直後に来るcontentを取得
        if (contentDiv.style.display === 'block') {
          contentDiv.style.display = 'none';
        } else {
          contentDiv.style.display = 'block';
        }
        event.stopPropagation(); // ドキュメントレベルのイベントへの伝播を停止
      });
    });

    // ドキュメント全体でクリックイベントを監視し、contentの表示を制御
    document.addEventListener('click', (event) => {
      if (!event.target.matches('.select-option')) {
        document.querySelectorAll('.content').forEach((content) => {
          content.style.display = 'none'; // select-option以外がクリックされたらcontentを非表示に
        });
      }
    });
  });
};
