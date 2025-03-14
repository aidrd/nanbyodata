document.addEventListener('DOMContentLoaded', function () {
  const opener = window.opener;
  const elements = {
    chatInput: document.querySelector('.chat-input'),
    chatSendButton: document.querySelector('.chat-send-button'),
    chatMessages: document.querySelector('.chat-messages'),
    chatBody: document.querySelector('.chat-body'),
    chatCloseButton: document.querySelector('.chat-close-button'),
    chatClearButton: document.querySelector('.chat-clear-button'),
    chatContainer: document.querySelector('.chat-container'),
    referencePanel: document.querySelector('.chat-reference-panel'),
    referenceToggle: document.querySelector('.reference-toggle'),
    referenceClose: document.querySelector('.reference-close'),
  };

  // State management
  const state = {
    isComposing: false,
  };

  // Reference Panel Management
  const referenceUI = {
    toggle: () => {
      // スクロール位置を記憶
      const scrollTop = elements.chatMessages.scrollTop;

      elements.referencePanel.classList.toggle('active');
      adjustMessagesLayout();

      // スクロール位置を復元
      setTimeout(() => {
        elements.chatMessages.scrollTop = scrollTop;
      }, 50);
    },
    close: () => {
      // スクロール位置を記憶
      const scrollTop = elements.chatMessages.scrollTop;

      elements.referencePanel.classList.remove('active');
      adjustMessagesLayout();

      // スクロール位置を復元
      setTimeout(() => {
        elements.chatMessages.scrollTop = scrollTop;
      }, 50);
    },
  };

  // メッセージエリアのレイアウトを調整する関数
  function adjustMessagesLayout() {
    if (elements.referencePanel.classList.contains('active')) {
      elements.chatMessages.style.paddingRight = '310px';
    } else {
      elements.chatMessages.style.paddingRight = '';
    }
    scrollToBottom();
  }

  // ウィンドウのロード時に初期レイアウトを調整
  window.addEventListener('load', function () {
    // 初期状態でのレイアウト調整
    adjustMessagesLayout();
  });

  // ウィンドウのリサイズ時にもレイアウトを調整
  window.addEventListener('resize', function () {
    adjustMessagesLayout();
  });

  // メッセージ同期用のイベントリスナー
  window.addEventListener('message', function (event) {
    if (event.data.type === 'newMessage') {
      addMessage(event.data.content, event.data.sender, event.data.citations);
    } else if (event.data.type === 'syncMessages') {
      // メッセージ履歴を同期
      elements.chatMessages.innerHTML = event.data.messages;
      scrollToBottom();
    } else if (event.data.type === 'updateCitations') {
      // 引用情報を更新
      console.log('Received citations:', event.data.citations);
      updateCitations(event.data.citations);

      // 引用パネルの表示状態を設定
      if (event.data.showPanel && elements.referencePanel) {
        elements.referencePanel.classList.add('active');
      } else if (elements.referencePanel && event.data.showPanel === false) {
        elements.referencePanel.classList.remove('active');
      }

      // メッセージエリアのレイアウトを調整
      adjustMessagesLayout();
    } else if (event.data.action === 'resetChat') {
      resetChat();
    }
  });

  // 初期メッセージ履歴の要求
  if (opener) {
    opener.postMessage({ type: 'requestMessages' }, '*');
  }

  function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  }

  function addMessage(content, sender, citations = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    // Add avatar for assistant messages
    if (sender === 'assistant') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'message-avatar';

      const avatarImg = document.createElement('img');
      avatarImg.src = '/static/img/roboto.png';
      avatarImg.alt = 'Robot Avatar';
      avatarImg.width = 24;
      avatarImg.height = 24;
      avatarImg.style.borderRadius = '50%';

      avatarDiv.appendChild(avatarImg);
      messageDiv.appendChild(avatarDiv);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (index > 0) {
        messageContent.appendChild(document.createElement('br'));
      }
      messageContent.appendChild(document.createTextNode(line));
    });

    // 引用情報がある場合、引用タグを追加
    if (citations && citations.length > 0 && sender === 'assistant') {
      const citationsContainer = document.createElement('div');
      citationsContainer.className = 'citations-container';

      // 引用情報の概要タグ（クリックすると引用パネルを開く）
      const citationSummaryTag = document.createElement('div');
      citationSummaryTag.className = 'citation-summary-tag';
      citationSummaryTag.innerHTML = `<i class="fas fa-quote-left"></i> 引用情報あり (${citations.length})`;
      citationSummaryTag.addEventListener('click', () => {
        // 引用パネルを開く
        elements.referencePanel.classList.add('active');
        // 引用情報にスクロール
        const referenceBody = document.querySelector('.reference-body');
        if (referenceBody) {
          referenceBody.scrollTop = 0;
        }
        // メッセージエリアのレイアウトを調整
        adjustMessagesLayout();
      });

      // 個別の引用タグ（クリックするとリンク先に飛ぶ）
      const citationTagsContainer = document.createElement('div');
      citationTagsContainer.className = 'citation-tags';

      citations.forEach((citation, index) => {
        if (citation.url) {
          const citationTag = document.createElement('a');
          citationTag.className = 'citation-tag';
          citationTag.href = citation.url;
          citationTag.target = '_blank';
          citationTag.innerHTML = `${citation.title}`;
          citationTag.title = `${citation.title} - ${citation.text.substring(
            0,
            50
          )}...`;
          citationTagsContainer.appendChild(citationTag);
        } else {
          const citationTag = document.createElement('div');
          citationTag.className = 'citation-tag no-link';
          citationTag.innerHTML = `<i class="fas fa-quote-left"></i> ${citation.title}`;
          citationTag.title = `${citation.title} - ${citation.text.substring(
            0,
            50
          )}...`;
          citationTag.addEventListener('click', () => {
            // 引用パネルを開き、特定の引用情報にスクロール
            elements.referencePanel.classList.add('active');
            const referenceBody = document.querySelector('.reference-body');
            if (referenceBody) {
              const citationElement = document.getElementById(citation.id);
              if (citationElement) {
                citationElement.scrollIntoView({ behavior: 'smooth' });
              }
            }
            // メッセージエリアのレイアウトを調整
            adjustMessagesLayout();
          });
          citationTagsContainer.appendChild(citationTag);
        }
      });

      citationsContainer.appendChild(citationSummaryTag);
      citationsContainer.appendChild(citationTagsContainer);
      messageContent.appendChild(document.createElement('br'));
      messageContent.appendChild(citationsContainer);
    }

    messageDiv.appendChild(messageContent);
    elements.chatMessages.appendChild(messageDiv);

    // メッセージ追加後に最下部にスクロール
    scrollToBottom();

    return messageDiv;
  }

  // 引用情報パネルを更新する関数
  function updateCitations(citations) {
    const referenceBody = document.querySelector('.reference-body');
    if (!referenceBody) return;

    // 既存の引用情報をクリア
    referenceBody.innerHTML = '';

    // 引用情報がない場合
    if (!citations || citations.length === 0) {
      const noCitationsMsg = document.createElement('p');
      noCitationsMsg.className = 'no-citations';
      noCitationsMsg.textContent = '引用情報はありません。';
      referenceBody.appendChild(noCitationsMsg);
      return;
    }

    // 引用情報を表示
    citations.forEach((citation) => {
      const citationDiv = document.createElement('div');
      citationDiv.className = 'citation-item';
      citationDiv.id = citation.id;

      const titleElement = document.createElement('h5');
      titleElement.className = 'citation-title';

      if (citation.url) {
        const linkElement = document.createElement('a');
        linkElement.href = citation.url;
        linkElement.target = '_blank';
        linkElement.textContent = citation.title;
        titleElement.appendChild(linkElement);
      } else {
        titleElement.textContent = citation.title;
      }

      const textElement = document.createElement('p');
      textElement.className = 'citation-text';
      textElement.textContent = citation.text;

      citationDiv.appendChild(titleElement);
      citationDiv.appendChild(textElement);
      referenceBody.appendChild(citationDiv);
    });
  }

  function sendMessage() {
    const message = elements.chatInput.value.trim();
    if (!message) return;

    // メッセージを親ウィンドウに送信
    if (opener) {
      opener.postMessage(
        {
          type: 'sendMessage',
          content: message,
        },
        '*'
      );
    }

    elements.chatInput.value = '';
  }

  function resetChat() {
    // 確認ダイアログを表示
    if (!confirm('新規チャットを開始しますか？現在の会話内容は失われます。')) {
      return; // キャンセルされた場合は何もしない
    }

    // 最初のアシスタントメッセージを保持し、他のメッセージをすべて削除
    const firstAssistantMessage =
      elements.chatMessages.querySelector('.message.assistant');

    // すべてのメッセージを削除
    while (elements.chatMessages.firstChild) {
      elements.chatMessages.removeChild(elements.chatMessages.firstChild);
    }

    // 最初のアシスタントメッセージを再追加
    if (firstAssistantMessage) {
      elements.chatMessages.appendChild(firstAssistantMessage.cloneNode(true));
    }

    // 引用情報パネルをクリア
    const referenceBody = document.querySelector('.reference-body');
    if (referenceBody) {
      referenceBody.innerHTML = '';
    }

    // 引用パネルを閉じる
    elements.referencePanel.classList.remove('active');
    adjustMessagesLayout();

    // 入力フィールドをクリア
    elements.chatInput.value = '';

    // メインウィンドウにリセット通知を送信
    if (opener) {
      opener.postMessage({ type: 'resetFromPopup' }, '*');
    }
  }

  // イベントリスナーの設定
  function setupEventListeners() {
    // Reference panel controls
    if (elements.referenceToggle) {
      elements.referenceToggle.addEventListener('click', referenceUI.toggle);
    }
    if (elements.referenceClose) {
      elements.referenceClose.addEventListener('click', referenceUI.close);
    }

    // Message sending
    elements.chatSendButton.addEventListener('click', sendMessage);

    // 新規作成ボタン
    if (elements.chatClearButton) {
      elements.chatClearButton.addEventListener('click', resetChat);
    }

    // IME入力の状態管理
    elements.chatInput.addEventListener('compositionstart', () => {
      state.isComposing = true;
    });

    elements.chatInput.addEventListener('compositionend', () => {
      state.isComposing = false;
    });

    elements.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !state.isComposing) {
        e.preventDefault();
        sendMessage();
      }
    });

    elements.chatCloseButton.addEventListener('click', () => {
      window.close();
    });
  }

  // Initialize
  setupEventListeners();
  elements.chatContainer.classList.add('active');

  // 引用パネルの初期状態を確認し、必要に応じて初期化
  if (elements.referencePanel) {
    // 引用パネルが閉じた状態であることを確認
    elements.referencePanel.classList.remove('active');
    adjustMessagesLayout();
  }

  // 初期化時に横スクロールを防止
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
});
