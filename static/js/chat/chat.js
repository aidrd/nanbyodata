document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const elements = {
    chatButton: document.querySelector('.chat-button'),
    chatContainer: document.querySelector('.chat-container'),
    chatCloseButton: document.querySelector('.chat-close-button'),
    chatInput: document.querySelector('.chat-input'),
    chatSendButton: document.querySelector('.chat-send-button'),
    chatMessages: document.querySelector('.chat-messages'),
    chatBody: document.querySelector('.chat-body'),
  };

  // State management
  const state = {
    isComposing: false,
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
    },

    handleOutsideClick: (event) => {
      if (
        elements.chatContainer.classList.contains('active') &&
        !elements.chatContainer.contains(event.target) &&
        !elements.chatButton.contains(event.target)
      ) {
        chatUI.close();
      }
    },
  };

  // Scroll Management
  const scrollManager = {
    scrollToBottom: () => {
      if (!elements.chatBody) return;

      console.log('スクロール実行: 高さ=', elements.chatBody.scrollHeight);

      // chat-bodyをスクロール（chat-messagesではなく）
      elements.chatBody.scrollTop = elements.chatBody.scrollHeight;

      // 遅延スクロールで確実に最下部に移動
      [50, 150, 300].forEach((delay) => {
        setTimeout(() => {
          if (elements.chatBody) {
            elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
            console.log(
              `${delay}ms後のスクロール: 位置=${elements.chatBody.scrollTop}, 高さ=${elements.chatBody.scrollHeight}`
            );
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

        // Create an image element instead of SVG
        const avatarImg = document.createElement('img');
        avatarImg.src = '/static/img/roboto.png';
        avatarImg.alt = 'Robot Avatar';
        avatarImg.width = 24;
        avatarImg.height = 24;
        avatarImg.style.borderRadius = '50%'; // Optional: makes the image circular

        avatarDiv.appendChild(avatarImg);
        messageDiv.appendChild(avatarDiv);
      }

      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';

      // 改行を処理
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

  // Event Listeners
  function setupEventListeners() {
    // Chat window controls
    elements.chatButton.addEventListener('click', chatUI.open);
    elements.chatCloseButton.addEventListener('click', chatUI.close);
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
