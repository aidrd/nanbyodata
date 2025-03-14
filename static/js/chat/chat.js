document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const elements = {
    chatButton: document.querySelector('.chat-button'),
    chatContainer: document.querySelector('.chat-container'),
    chatCloseButton: document.querySelector('.chat-close-button'),
    chatExpandButton: document.querySelector('.chat-expand-button'),
    chatPopupButton: document.querySelector('.chat-popup-button'),
    chatClearButton: document.querySelector('.chat-clear-button'),
    chatInput: document.querySelector('.chat-input'),
    chatSendButton: document.querySelector('.chat-send-button'),
    chatMessages: document.querySelector('.chat-messages'),
    chatBody: document.querySelector('.chat-body'),
    chatOverlay: document.createElement('div'),
    referencePanel: document.querySelector('.chat-reference-panel'),
    referenceToggle: document.querySelector('.reference-toggle'),
    referenceClose: document.querySelector('.reference-close'),
  };

  // オーバーレイの初期化
  elements.chatOverlay.className = 'chat-overlay';
  document.body.appendChild(elements.chatOverlay);

  // State management
  const state = {
    isComposing: false,
    isExpanded: false,
    popupWindow: null,
  };

  // Chat UI Management
  const chatUI = {
    open: () => {
      elements.chatContainer.classList.add('active');
      elements.chatInput.focus();
      // チャットを開いたときに最下部にスクロール
      setTimeout(() => scrollManager.scrollToBottom(), 100);
    },

    close: () => {
      elements.chatContainer.classList.remove('active');
      elements.chatOverlay.classList.remove('active');
      if (state.isExpanded) {
        state.isExpanded = false;
        elements.chatContainer.classList.remove('expanded');
        elements.chatExpandButton.innerHTML =
          '<i class="fas fa-expand-arrows-alt"></i>';
        elements.chatExpandButton.title = '拡大表示';
      }
      if (state.popupWindow && !state.popupWindow.closed) {
        state.popupWindow.close();
      }
    },

    resetChat: () => {
      // 確認ダイアログを表示
      if (
        !confirm('新規チャットを開始しますか？現在の会話内容は失われます。')
      ) {
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
        elements.chatMessages.appendChild(
          firstAssistantMessage.cloneNode(true)
        );
      }

      // 引用情報パネルをクリア
      const referenceBody = document.querySelector('.reference-body');
      if (referenceBody) {
        referenceBody.innerHTML = '';
      }

      // 引用パネルを閉じる
      elements.referencePanel.classList.remove('active');

      // 入力フィールドをクリア
      elements.chatInput.value = '';

      // ポップアップウィンドウが開いている場合、そのメッセージもクリア
      if (state.popupWindow && !state.popupWindow.closed) {
        state.popupWindow.postMessage({ action: 'resetChat' }, '*');
      }
    },

    toggleExpand: () => {
      state.isExpanded = !state.isExpanded;
      elements.chatContainer.classList.toggle('expanded');
      elements.chatOverlay.classList.toggle('active');
      elements.chatExpandButton.innerHTML = state.isExpanded
        ? '<i class="fas fa-compress-arrows-alt"></i>'
        : '<i class="fas fa-expand-arrows-alt"></i>';
      elements.chatExpandButton.title = state.isExpanded
        ? '縮小表示'
        : '拡大表示';
      scrollManager.scrollToBottom();
    },

    togglePopup: () => {
      if (!state.popupWindow || state.popupWindow.closed) {
        // 新しいウィンドウを開く
        const width = 1000; // より大きな幅に変更
        const height = 800; // より大きな高さに変更
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        state.popupWindow = window.open(
          '/chat_window',
          'chat_window',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes`
        );

        if (state.popupWindow) {
          // 元のチャットを非表示にする
          elements.chatContainer.classList.remove('active');
          // 拡大表示状態を解除
          if (state.isExpanded) {
            state.isExpanded = false;
            elements.chatContainer.classList.remove('expanded');
            elements.chatExpandButton.innerHTML =
              '<i class="fas fa-expand-arrows-alt"></i>';
            elements.chatExpandButton.title = '拡大表示';
          }
          // オーバーレイを非表示
          elements.chatOverlay.classList.remove('active');
        }
      } else {
        // 既存のウィンドウにフォーカスを当てる
        state.popupWindow.focus();
      }
    },

    handleOutsideClick: (event) => {
      if (
        elements.chatContainer.classList.contains('active') &&
        !elements.chatContainer.contains(event.target) &&
        !elements.chatButton.contains(event.target)
      ) {
        // オーバーレイクリック時は完全に閉じる
        if (event.target === elements.chatOverlay) {
          chatUI.close();
        } else if (!state.isExpanded) {
          // 拡大表示でない場合のみ、通常の外側クリックで閉じる
          chatUI.close();
        }
      }
    },
  };

  // Scroll Management
  const scrollManager = {
    scrollToBottom: () => {
      if (!elements.chatMessages) return;

      // chat-messagesをスクロール（chat-bodyではなく）
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

      // 遅延スクロールで確実に最下部に移動
      [50, 150, 300].forEach((delay) => {
        setTimeout(() => {
          if (elements.chatMessages) {
            elements.chatMessages.scrollTop =
              elements.chatMessages.scrollHeight;
          }
        }, delay);
      });
    },
  };

  // Message Management
  const messageManager = {
    send: () => {
      const message = elements.chatInput.value.trim();
      if (!message) return;

      // Add user message
      messageManager.add(message, 'user');
      elements.chatInput.value = '';

      // Simulate response (replace with actual API call in production)
      setTimeout(() => {
        const response =
          'Thank you for your message. This is a placeholder response. In a production environment, this would be connected to an AI or support service.';
        messageManager.add(response, 'assistant');
      }, 1000);
    },

    add: (content, sender) => {
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

      messageDiv.appendChild(messageContent);
      elements.chatMessages.appendChild(messageDiv);

      // メッセージ追加後に最下部にスクロール
      scrollManager.scrollToBottom();

      // ポップアップウィンドウが開いている場合、メッセージを同期
      if (state.popupWindow && !state.popupWindow.closed) {
        state.popupWindow.postMessage(
          {
            type: 'newMessage',
            content: content,
            sender: sender,
          },
          '*'
        );
      }

      return messageDiv;
    },

    // Update initialization with specific welcome message
    initializeChat: () => {
      // Check if there are already any assistant messages (from HTML template)
      const hasAssistantMessage =
        elements.chatMessages &&
        Array.from(elements.chatMessages.querySelectorAll('.message.assistant'))
          .length > 0;

      // Only add welcome message if there are no assistant messages yet
      if (elements.chatMessages && !hasAssistantMessage) {
        const welcomeMessage =
          'こんにちは！NanbyoDataについて何かお手伝いできることはありますか？\n\nHello! How can I help you with NanbyoData?';
        messageManager.add(welcomeMessage, 'assistant');
      }
    },
  };

  // Reference Panel Management
  const referenceUI = {
    toggle: () => {
      // スクロール位置を記憶
      const scrollTop = elements.chatMessages.scrollTop;

      elements.referencePanel.classList.toggle('active');
      // 引用パネルの状態に応じてメッセージエリアのスタイルを調整
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
      // 引用パネルを閉じたときにメッセージエリアのスタイルを元に戻す
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
      // 引用パネルが表示されているときは、メッセージエリアの右側にパディングを追加
      elements.chatMessages.style.paddingRight = '310px';
    } else {
      // 引用パネルが非表示のときは、パディングをリセット
      elements.chatMessages.style.paddingRight = '';
    }
    // レイアウト変更後にスクロール位置を調整
    scrollManager.scrollToBottom();
  }

  // Event Listeners
  function setupEventListeners() {
    // Chat window controls
    elements.chatButton.addEventListener('click', chatUI.open);
    elements.chatCloseButton.addEventListener('click', chatUI.close);
    elements.chatExpandButton.addEventListener('click', chatUI.toggleExpand);
    elements.chatPopupButton.addEventListener('click', chatUI.togglePopup);
    elements.chatClearButton.addEventListener('click', chatUI.resetChat);
    document.addEventListener('click', chatUI.handleOutsideClick);

    // Message sending
    elements.chatSendButton.addEventListener('click', messageManager.send);

    // Input handling
    elements.chatInput.addEventListener('compositionstart', () => {
      state.isComposing = true;
    });

    elements.chatInput.addEventListener('compositionend', () => {
      state.isComposing = false;
    });

    elements.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !state.isComposing) {
        e.preventDefault();
        messageManager.send();
      }
    });

    // ウィンドウのリサイズ時にもスクロール位置を調整
    window.addEventListener('resize', () => {
      if (elements.chatContainer.classList.contains('active')) {
        scrollManager.scrollToBottom();
      }
    });

    // ESCキーでポップアップモードを解除
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isPopup) {
        chatUI.togglePopup();
      }
    });

    // ポップアップウィンドウからのメッセージを処理
    window.addEventListener('message', (event) => {
      if (event.data.type === 'sendMessage') {
        // ユーザーメッセージを追加
        messageManager.add(event.data.content, 'user');

        // AIの応答をシミュレート
        setTimeout(() => {
          const response =
            'Thank you for your message. This is a placeholder response. In a production environment, this would be connected to an AI or support service.';
          messageManager.add(response, 'assistant');
        }, 1000);
      } else if (event.data.type === 'requestMessages') {
        // メッセージ履歴を同期
        if (state.popupWindow && !state.popupWindow.closed) {
          state.popupWindow.postMessage(
            {
              type: 'syncMessages',
              messages: elements.chatMessages.innerHTML,
            },
            '*'
          );
        }
      }
    });

    // Reference panel controls
    if (elements.referenceToggle) {
      elements.referenceToggle.addEventListener('click', referenceUI.toggle);
    }
    if (elements.referenceClose) {
      elements.referenceClose.addEventListener('click', referenceUI.close);
    }
  }

  // Initialize
  setupEventListeners();

  // Add a small delay before initializing the chat to ensure DOM is fully ready
  setTimeout(() => {
    messageManager.initializeChat();
    // 初期化後に最下部にスクロール
    scrollManager.scrollToBottom();
  }, 100);
});
