document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const elements = {
    chatButton: document.querySelector('.chat-button'),
    chatContainer: document.querySelector('.chat-container'),
    chatCloseButton: document.querySelector('.chat-close-button'),
    chatInput: document.querySelector('.chat-input'),
    chatSendButton: document.querySelector('.chat-send-button'),
    chatMessages: document.querySelector('.chat-messages'),
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
      scrollManager.toBottom();
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
    toBottom: () => {
      if (!elements.chatMessages) return;

      // First immediate scroll
      elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

      // Follow-up scrolls with increasing delays to handle rendering issues
      const delays = [10, 50, 150, 300];
      delays.forEach((delay) => {
        setTimeout(() => {
          elements.chatMessages.scrollTo({
            top: elements.chatMessages.scrollHeight,
            behavior: delay > 50 ? 'smooth' : 'auto',
          });
        }, delay);
      });
    },

    toElement: (element) => {
      if (!elements.chatMessages || !element) return;

      // Calculate position to make the element visible
      const messagesRect = elements.chatMessages.getBoundingClientRect();

      // First scroll immediately
      elements.chatMessages.scrollTop = element.offsetTop - 10;

      // Then smooth scroll with small delay for better UX
      setTimeout(() => {
        elements.chatMessages.scrollTo({
          top: element.offsetTop - 10,
          behavior: 'smooth',
        });
      }, 50);
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
        const messageElement = messageManager.add(response, 'assistant');
        scrollManager.toElement(messageElement);
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

      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = content;

      messageContent.appendChild(messageParagraph);
      messageDiv.appendChild(messageContent);
      elements.chatMessages.appendChild(messageDiv);

      scrollManager.toBottom();
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
  }

  // Setup mutation observer for dynamic content changes
  function setupMutationObserver() {
    const chatObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          scrollManager.toBottom();
          break;
        }
      }
    });

    chatObserver.observe(elements.chatMessages, {
      childList: true,
      subtree: true,
    });
  }

  // Initialize
  setupEventListeners();
  setupMutationObserver();

  // Add a small delay before initializing the chat to ensure DOM is fully ready
  setTimeout(() => {
    messageManager.initializeChat();
  }, 100);
});
