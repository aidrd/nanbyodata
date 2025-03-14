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

          // ポップアップウィンドウが完全に読み込まれた後に引用パネルの状態を同期
          state.popupWindow.addEventListener('load', () => {
            // 現在の引用情報を取得
            const referenceBody = document.querySelector('.reference-body');
            if (referenceBody) {
              // 引用情報パネルの状態を同期
              const isReferenceActive =
                elements.referencePanel.classList.contains('active');

              // 引用情報があれば、それを送信
              const citations = [];
              const citationItems =
                referenceBody.querySelectorAll('.citation-item');
              citationItems.forEach((item) => {
                const id = item.id;
                const title = item.querySelector('.citation-title').textContent;
                const text = item.querySelector('.citation-text').textContent;
                const linkElement = item.querySelector('.citation-title a');
                const url = linkElement ? linkElement.href : null;

                citations.push({ id, title, url, text });
              });

              if (citations.length > 0) {
                state.popupWindow.postMessage(
                  {
                    type: 'updateCitations',
                    citations: citations,
                    showPanel: isReferenceActive,
                  },
                  '*'
                );
              }
            }
          });
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

      // ローディングインジケーターを表示
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'message assistant loading';
      const loadingContent = document.createElement('div');
      loadingContent.className = 'message-content';
      loadingContent.textContent = '応答を生成中...';

      // アバターを追加
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'message-avatar';
      const avatarImg = document.createElement('img');
      avatarImg.src = '/static/img/roboto.png';
      avatarImg.alt = 'Robot Avatar';
      avatarImg.width = 24;
      avatarImg.height = 24;
      avatarImg.style.borderRadius = '50%';
      avatarDiv.appendChild(avatarImg);

      loadingDiv.appendChild(avatarDiv);
      loadingDiv.appendChild(loadingContent);
      elements.chatMessages.appendChild(loadingDiv);
      scrollManager.scrollToBottom();

      // APIリクエストを送信（実際の実装ではここをfetchに置き換え）
      messageManager
        .fetchChatResponse(message)
        .then((response) => {
          // ローディングメッセージを削除
          if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
          }

          // レスポンスからメッセージと引用情報を取得して表示
          if (response.message) {
            const messageDiv = messageManager.add(
              response.message,
              'assistant',
              response.citations
            );

            // 引用情報があれば引用パネルに表示
            if (response.citations && response.citations.length > 0) {
              messageManager.updateCitations(response.citations);
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching response:', error);
          // ローディングメッセージを削除
          if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
          }
          // エラーメッセージを表示
          messageManager.add(
            '申し訳ありません。応答の取得中にエラーが発生しました。もう一度お試しください。',
            'assistant'
          );
        });
    },

    // APIからレスポンスを取得する関数（実際の実装では実際のAPIエンドポイントを使用）
    fetchChatResponse: async (message) => {
      // 開発用のモックレスポンス
      // 実際の実装では、ここをfetchに置き換えてAPIからデータを取得
      return new Promise((resolve) => {
        setTimeout(() => {
          // モックレスポンスの例
          const mockResponses = [
            {
              message:
                '難病（指定難病）は、発病の機構が明らかでなく、治療方法が確立していない希少な疾病です。現在、国が指定する指定難病は338疾病あります。',
              citations: [
                {
                  id: 'citation-1',
                  title: '難病情報センター',
                  url: 'https://www.nanbyou.or.jp/',
                  text: '難病（指定難病）は、発病の機構が明らかでなく、治療方法が確立していない希少な疾病であって、当該疾病にかかることにより長期にわたり療養を必要とすることになるものをいいます。',
                },
              ],
            },
            {
              message:
                'ALSは筋萎縮性側索硬化症（Amyotrophic Lateral Sclerosis）の略称で、運動ニューロンが変性することにより筋肉の萎縮と筋力低下をきたす進行性の神経変性疾患です。',
              citations: [
                {
                  id: 'citation-2',
                  title: '日本ALS協会',
                  url: 'https://www.alsjapan.org/',
                  text: 'ALSは、運動ニューロンと呼ばれる、脳や脊髄にある神経細胞が徐々に死んでいくことで、全身の筋肉が動かせなくなる病気です。',
                },
                {
                  id: 'citation-3',
                  title: '厚生労働省 指定難病情報',
                  url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000084783.html',
                  text: '筋萎縮性側索硬化症は、上位運動ニューロンと下位運動ニューロンが選択的にかつ進行性に変性・消失していく原因不明の疾患である。',
                },
              ],
            },
          ];

          // ランダムにレスポンスを選択（実際の実装では、APIからの実際のレスポンスを使用）
          const randomResponse =
            mockResponses[Math.floor(Math.random() * mockResponses.length)];
          resolve(randomResponse);
        }, 1500); // 1.5秒の遅延でモックレスポンスを返す
      });
    },

    add: (content, sender, citations = null) => {
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

          // ポップアップウィンドウが開いている場合、引用パネルを同期
          if (state.popupWindow && !state.popupWindow.closed) {
            state.popupWindow.postMessage(
              {
                type: 'updateCitations',
                citations: citations,
                showPanel: true,
              },
              '*'
            );
          }
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

              // ポップアップウィンドウが開いている場合、引用パネルを同期
              if (state.popupWindow && !state.popupWindow.closed) {
                state.popupWindow.postMessage(
                  {
                    type: 'updateCitations',
                    citations: citations,
                    showPanel: true,
                  },
                  '*'
                );
              }
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
      scrollManager.scrollToBottom();

      // ポップアップウィンドウが開いている場合、メッセージを同期
      if (state.popupWindow && !state.popupWindow.closed) {
        state.popupWindow.postMessage(
          {
            type: 'newMessage',
            content: content,
            sender: sender,
            citations: citations,
          },
          '*'
        );
      }

      return messageDiv;
    },

    // 引用情報パネルを更新する関数
    updateCitations: (citations) => {
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

      // ポップアップウィンドウが開いている場合、引用情報を同期
      if (state.popupWindow && !state.popupWindow.closed) {
        state.popupWindow.postMessage(
          {
            type: 'updateCitations',
            citations: citations,
            showPanel: elements.referencePanel.classList.contains('active'),
          },
          '*'
        );
      }
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
          'こんにちは！何かお手伝いできることはありますか？';
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

        // ローディングインジケーターを表示
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading';
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content';
        loadingContent.textContent = '応答を生成中...';

        // アバターを追加
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = '/static/img/roboto.png';
        avatarImg.alt = 'Robot Avatar';
        avatarImg.width = 24;
        avatarImg.height = 24;
        avatarImg.style.borderRadius = '50%';
        avatarDiv.appendChild(avatarImg);

        loadingDiv.appendChild(avatarDiv);
        loadingDiv.appendChild(loadingContent);
        elements.chatMessages.appendChild(loadingDiv);
        scrollManager.scrollToBottom();

        // APIリクエストを送信
        messageManager
          .fetchChatResponse(event.data.content)
          .then((response) => {
            // ローディングメッセージを削除
            if (loadingDiv.parentNode) {
              loadingDiv.parentNode.removeChild(loadingDiv);
            }

            // レスポンスからメッセージと引用情報を取得して表示
            if (response.message) {
              const messageDiv = messageManager.add(
                response.message,
                'assistant',
                response.citations
              );

              // 引用情報があれば引用パネルに表示
              if (response.citations && response.citations.length > 0) {
                messageManager.updateCitations(response.citations);
              }
            }
          })
          .catch((error) => {
            console.error('Error fetching response:', error);
            // ローディングメッセージを削除
            if (loadingDiv.parentNode) {
              loadingDiv.parentNode.removeChild(loadingDiv);
            }
            // エラーメッセージを表示
            messageManager.add(
              '申し訳ありません。応答の取得中にエラーが発生しました。もう一度お試しください。',
              'assistant'
            );
          });
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
      } else if (event.data.type === 'resetFromPopup') {
        // ポップアップウィンドウからのリセット通知を処理
        // 確認ダイアログは表示せずに直接リセット処理を実行

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
