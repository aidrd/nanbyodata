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

  // メッセージ同期用のイベントリスナー
  window.addEventListener('message', function (event) {
    if (event.data.type === 'newMessage') {
      addMessage(event.data.content, event.data.sender);
    } else if (event.data.type === 'syncMessages') {
      // メッセージ履歴を同期
      elements.chatMessages.innerHTML = event.data.messages;
      scrollToBottom();
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

  function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    if (sender === 'assistant') {
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'message-avatar';
      const avatarImg = document.createElement('img');
      avatarImg.src = '/static/img/roboto.png';
      avatarImg.alt = 'Robot Avatar';
      avatarDiv.appendChild(avatarImg);
      messageDiv.appendChild(avatarDiv);
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    content.split('\n').forEach((line, index) => {
      if (index > 0) messageContent.appendChild(document.createElement('br'));
      messageContent.appendChild(document.createTextNode(line));
    });

    messageDiv.appendChild(messageContent);
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
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

  // 初期化時に横スクロールを防止
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';

  // ウィンドウサイズ変更時にもスクロール位置を調整
  window.addEventListener('resize', () => {
    scrollToBottom();
  });
});
