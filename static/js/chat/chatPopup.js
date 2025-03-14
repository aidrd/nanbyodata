document.addEventListener('DOMContentLoaded', function () {
  const opener = window.opener;
  const elements = {
    chatInput: document.querySelector('.chat-input'),
    chatSendButton: document.querySelector('.chat-send-button'),
    chatMessages: document.querySelector('.chat-messages'),
    chatBody: document.querySelector('.chat-body'),
    chatCloseButton: document.querySelector('.chat-close-button'),
    chatContainer: document.querySelector('.chat-container'),
  };

  // 常に表示状態にする
  elements.chatContainer.classList.add('active');

  // State management
  const state = {
    isComposing: false,
  };

  // メッセージ同期用のイベントリスナー
  window.addEventListener('message', function (event) {
    if (event.data.type === 'newMessage') {
      addMessage(event.data.content, event.data.sender);
    } else if (event.data.type === 'syncMessages') {
      // メッセージ履歴を同期
      elements.chatMessages.innerHTML = event.data.messages;
      scrollToBottom();
    }
  });

  // 初期メッセージ履歴の要求
  if (opener) {
    opener.postMessage({ type: 'requestMessages' }, '*');
  }

  function scrollToBottom() {
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
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

  // イベントリスナーの設定
  elements.chatSendButton.addEventListener('click', sendMessage);

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
});
