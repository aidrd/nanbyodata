// ===============================
// 設定：API は外部、ページ遷移はローカル
// ===============================
const API_BASE = 'http://pubcasefinder.bits.cc'; // API のみ外部
const URL_GET_PANEL_UPSTREAM_HIERARCHY = `${API_BASE}/common_nanbyo_get_panel_hierarchy`;
const URL_GET_PANEL_DESCENDANT = `${API_BASE}/common_nanbyo_get_panel_descendant`;

// 画面状態（クエリで上書きされる想定）
let lang = 'ja';
let nando_id = 'NANDO:1200464';
// 現在選択中のノード（NANDO ID）を保持し、開閉時に再選択するために使用
let currentSelectedNandoId = null;
// スクロール位置を保存（選択時の自動スクロールを防ぐため）
let savedScrollLeft = 0;

// 特定ノードをクリックしても遷移しないためのスキップリスト
const SKIP_LIST = ['NANDO:0000001'];

// -------------------------------
// ツリーデータ整形・ソート
// -------------------------------
function _sort_treeview_data_by_nando_id(data) {
  data.sort((a, b) => a.nando_id.localeCompare(b.nando_id));
  data.forEach((node) => {
    if (node.children && node.children.length > 0) {
      _sort_treeview_data_by_nando_id(node.children);
    }
  });
}

function _create_treeview_data(json_data) {
  const ret_arr = [];
  for (const key in json_data) {
    const t = key.split('--');
    const obj = {
      isFirstTimeLoad: true,
      nando_id: t[0],
      num_child: t[1],
      name: t[2] && t[2].length > 0 ? t[2] : t[0],
      lang,
    };

    if (Number(t[1]) === 0) {
      obj.displayName = obj.name;
      obj.isParent = false;
      obj.open = false; // 葉ノードは展開不可
    } else {
      obj.displayName = `${obj.name} <span class="treeview-decendant-num treeview-descendant-num">(${obj.num_child})</span>`;
      obj.isParent = true;
    }

    if (typeof json_data[key] === 'object') {
      obj.open = true;
      obj.children = _create_treeview_data(json_data[key]);
    }
    ret_arr.push(obj);
  }
  return ret_arr;
}

// -------------------------------
// URLから現在の疾患IDを取得
// -------------------------------
function _getCurrentNandoIdFromUrl() {
  const urlObj = new URL(window.location.href);
  const q = urlObj.searchParams;
  const qNando = q.get('nando_id');
  if (qNando) {
    return qNando;
  }
  // パスから取得
  const path = urlObj.pathname;
  const idx = path.indexOf('NANDO:');
  if (idx !== -1) {
    return decodeURIComponent(path.slice(idx));
  }
  return null;
}

// -------------------------------
// 現在のURLに基づいてハイライトを適用
// title属性のIDとURLのIDが一致する要素に常にハイライトを適用
// -------------------------------
function _applyHighlightFromUrl() {
  const currentNandoId = _getCurrentNandoIdFromUrl();
  if (!currentNandoId) return;

  // スクロール位置を保存（自動スクロールを防ぐため）
  const container = $('.treeview-container');
  const savedScrollLeft = container.length > 0 ? container.scrollLeft() : 0;

  // ツリー内のすべての<a>要素を取得
  const allLinks = $('.treeview-container .ztree li a');

  // まずすべてのハイライトをクリア
  allLinks.removeClass('curSelectedNode');

  // title属性がURLのIDと一致する要素にハイライトを適用
  allLinks.each(function () {
    const $link = $(this);
    const titleId = $link.attr('title');
    if (titleId === currentNandoId) {
      $link.addClass('curSelectedNode');
    }
  });

  // zTreeの内部状態も更新（選択状態を保持、自動スクロールは無効化）
  if (zTreeObj) {
    const targetNode = zTreeObj.getNodesByParam(
      'nando_id',
      currentNandoId,
      null
    )[0];
    if (targetNode) {
      zTreeObj.cancelSelectedNode();
      zTreeObj.selectNode(targetNode, true, false); // 自動スクロールを無効化
      currentSelectedNandoId = currentNandoId;
    }
  }

  // スクロール位置を復元（自動スクロールを打ち消す）
  if (container.length > 0) {
    requestAnimationFrame(() => {
      container.scrollLeft(savedScrollLeft);
      // 次のフレームでも確実に復元
      requestAnimationFrame(() => {
        container.scrollLeft(savedScrollLeft);
      });
    });
  }
}

// -------------------------------
// ハイライト処理（初期化時）
// -------------------------------
function _highlight_upstream_treeview_startNode(zTree, nodes, targetId) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nando_id === targetId) {
      // 自動スクロールを無効化して選択（スクロール位置は変更しない）
      zTree.selectNode(nodes[i], true, false);
      currentSelectedNandoId = targetId; // 初期選択を記録

      // title属性でハイライトを適用
      setTimeout(() => {
        _applyHighlightFromUrl();
      }, 0);
    }
    if (nodes[i].isParent && nodes[i].children) {
      _highlight_upstream_treeview_startNode(
        zTree,
        nodes[i].children,
        targetId
      );
    }
  }
}

// -------------------------------
// クリック時：URLのみ更新（ページリロードなし）
// -------------------------------
function _onClick_handler(selectedId) {
  // 疾患ページのパスに選択IDを反映して遷移（言語とハッシュは維持/設定）
  const u = new URL(window.location.href);
  const currentHash = u.hash && u.hash.length > 0 ? u.hash : '#overview';
  const next = `${
    location.origin
  }/disease/${selectedId}?lang=${encodeURIComponent(lang)}${currentHash}`;
  window.location.href = next;
}

// -------------------------------
// ツリー初期化
// -------------------------------
let zTreeObj = null;

function init_ui_upstream_trace(startId, upstream_trace_data) {
  const treeview_data = _create_treeview_data(upstream_trace_data);
  _sort_treeview_data_by_nando_id(treeview_data);

  const setting = {
    view: {
      dblClickExpand: false,
      showIcon: false,
      nameIsHTML: true,
      showLine: false,
      selectedMulti: false,
      expandSpeed: 'fast', // アニメーション速度を設定（nullにするとアイコン更新が動作しない）
      addDiyDom: function (treeId, treeNode) {
        // カスタムDOM追加でより細かい制御
      },
    },
    async: {
      enable: true,
      type: 'get',
      // 子要素の遅延取得は API（外部）へ
      url: URL_GET_PANEL_DESCENDANT,
      autoParam: ['nando_id', 'lang'],
    },
    callback: {
      beforeClick: function (treeId, treeNode) {
        return true;
      },
      onClick: function (event, treeId, treeNode) {
        // 選択前にスクロール位置を保存
        const container = $('.treeview-container');
        if (container.length > 0) {
          savedScrollLeft = container.scrollLeft();
        }

        if (treeNode.isParent) {
          if (treeNode.isFirstTimeLoad) {
            zTreeObj.reAsyncChildNodes(treeNode, 'refresh');
            treeNode.isFirstTimeLoad = false;
          }

          // expandNodeを呼び出す（第4引数focus=falseで自動スクロールを無効化、第2引数は展開状態を反転）
          const isExpanded = treeNode.open;
          zTreeObj.expandNode(treeNode, !isExpanded, false, false); // focus=falseで自動スクロール無効化

          // 親ノードをクリックしても選択状態を維持（自動スクロールを無効化）
          zTreeObj.selectNode(treeNode, true, false);
          currentSelectedNandoId = treeNode.nando_id; // 現在選択を保持

          // スクロール位置を復元（自動スクロールを打ち消す）
          requestAnimationFrame(() => {
            if (container.length > 0) {
              container.scrollLeft(savedScrollLeft);
            }
            // 次のフレームでも確実に復元
            requestAnimationFrame(() => {
              if (container.length > 0) {
                container.scrollLeft(savedScrollLeft);
              }
            });
          });

          // 親ノードクリック時もURLを更新
          if (!SKIP_LIST.includes(treeNode.nando_id)) {
            _onClick_handler(treeNode.nando_id);
          }
          return;
        }
        if (!SKIP_LIST.includes(treeNode.nando_id)) {
          currentSelectedNandoId = treeNode.nando_id; // 遷移前に選択を記録

          // 選択前にスクロール位置を保存
          zTreeObj.selectNode(treeNode, true, false);

          // スクロール位置を復元（自動スクロールを打ち消す）
          requestAnimationFrame(() => {
            if (container.length > 0) {
              container.scrollLeft(savedScrollLeft);
            }
            // 次のフレームでも確実に復元
            requestAnimationFrame(() => {
              if (container.length > 0) {
                container.scrollLeft(savedScrollLeft);
              }
            });
          });

          _onClick_handler(treeNode.nando_id); // ★ローカル URL のまま遷移
        }
      },
      beforeExpand: function (treeId, treeNode) {
        if (treeNode.isFirstTimeLoad) {
          zTreeObj.removeChildNodes(treeNode);
          treeNode.isParent = true;
          zTreeObj.reAsyncChildNodes(treeNode, 'refresh');
        }
        return true;
      },
      onExpand: function (treeId, treeNode) {
        treeNode.isFirstTimeLoad = false;
        // 展開後も選択状態を維持（URLから取得したIDに基づいてハイライトを適用）
        setTimeout(function () {
          // URLから現在のIDを取得してハイライトを適用
          _applyHighlightFromUrl();

          // アイコンの状態を強制的に更新
          const button = $('#' + treeNode.tId + '_switch');
          if (button.length) {
            button.removeClass(
              'close close_docu close_ico_docu close_ico_close close_ico_open close_ico'
            );
            button.addClass(
              'open open_docu open_ico_docu open_ico_open open_ico_close open_ico'
            );
            // 強制的にCSSを適用
            button.css('content', '"▼"');
            button.attr('data-icon', 'open');
          }
          // コンテンツ幅に応じて自動調整（手動リサイズされていない場合のみ）
          adjustSidebarToContent();
        }, 50);
      },
      onCollapse: function (treeId, treeNode) {
        // 折りたたみ後も選択状態を維持（URLから取得したIDに基づいてハイライトを適用）
        setTimeout(function () {
          // URLから現在のIDを取得してハイライトを適用
          _applyHighlightFromUrl();

          // DOM更新後に再度適用（確実にハイライトを復元）
          setTimeout(() => {
            _applyHighlightFromUrl();
          }, 50);

          // さらに遅れて再度適用（動的に追加されるノードにも対応）
          setTimeout(() => {
            _applyHighlightFromUrl();
          }, 150);
        }, 50);

        // アイコンの状態を強制的に更新
        setTimeout(function () {
          const button = $('#' + treeNode.tId + '_switch');
          if (button.length) {
            button.removeClass(
              'open open_docu open_ico_docu open_ico_open open_ico_close open_ico'
            );
            button.addClass(
              'close close_docu close_ico_docu close_ico_close close_ico_open close_ico'
            );
            // 強制的にCSSを適用
            button.css('content', '"▶"');
            button.attr('data-icon', 'close');
          }
        }, 50);
      },
    },
    data: {
      key: {
        name: 'displayName',
        title: 'nando_id',
      },
      simpleData: {
        enable: false,
      },
    },
  };

  zTreeObj = $.fn.zTree.init($('#treeview'), setting, treeview_data);

  const nodes = zTreeObj.getNodes();
  _highlight_upstream_treeview_startNode(zTreeObj, nodes, startId);

  // 初期化後にハイライトを確実に適用（複数回実行）
  setTimeout(() => {
    _applyHighlightFromUrl();
  }, 100);

  setTimeout(() => {
    _applyHighlightFromUrl();
  }, 300);

  // MutationObserverでDOM変更を監視してハイライトを再適用（折りたたみ時のクラス削除に対応）
  // debounce用のタイマー
  let highlightTimer = null;

  const observer = new MutationObserver(function (mutations) {
    // curSelectedNodeクラスが削除された場合に再適用
    let needReapply = false;
    mutations.forEach(function (mutation) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        const target = mutation.target;
        if (target.tagName === 'A' && target.getAttribute('title')) {
          const titleId = target.getAttribute('title');
          const currentNandoId = _getCurrentNandoIdFromUrl();
          if (
            titleId === currentNandoId &&
            !target.classList.contains('curSelectedNode')
          ) {
            needReapply = true;
          }
        }
      }
      if (mutation.type === 'childList') {
        needReapply = true;
      }
    });
    if (needReapply) {
      // debounce: 100ms以内に複数回呼ばれても1回だけ実行
      if (highlightTimer) {
        clearTimeout(highlightTimer);
      }
      highlightTimer = setTimeout(() => {
        _applyHighlightFromUrl();
      }, 100);
    }
  });

  const treeviewContainer = document.querySelector('.treeview-container');
  if (treeviewContainer) {
    observer.observe(treeviewContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // アイコンクリックイベントを直接制御
  $('#treeview').on('click', 'span.button', function (e) {
    e.stopPropagation(); // イベントのバブリングのみ停止

    const treeId = $(this).closest('ul').attr('id');
    const treeNodeId = $(this).attr('id').replace('_switch', '');
    const treeNode = zTreeObj.getNodeByTId(treeNodeId);

    if (treeNode && treeNode.isParent) {
      if (treeNode.isFirstTimeLoad) {
        zTreeObj.reAsyncChildNodes(treeNode, 'refresh');
        treeNode.isFirstTimeLoad = false;
      }

      // 展開/折りたたみを実行（選択状態は変更しない、第4引数focus=falseで自動スクロールを無効化）
      const isExpanded = treeNode.open;
      zTreeObj.expandNode(treeNode, !isExpanded, false, false); // focus=falseで自動スクロール無効化

      // 展開/折りたたみ後にハイライトを再適用
      setTimeout(() => {
        _applyHighlightFromUrl();
      }, 100);
    }
  });
}

// -------------------------------
// 親要素の幅制限を考慮した動的調整
// -------------------------------
function adjustTreeviewWidth() {
  const container = $('.treeview-container');
  const sidebar = $('#sidebar');

  if (sidebar.length > 0) {
    // sidebarが開いているかどうかをチェック
    const isCollapsed = sidebar.hasClass('collapsed');

    if (!isCollapsed) {
      // 開いている時は100%を使用（親要素のセクション幅いっぱい）
      container.css('max-width', '100%');

      // コンテンツの最大幅に応じてサイドバーの幅を自動調整（開いた瞬間のみ）
      adjustSidebarToContent();
    } else {
      // 閉じている時は親要素の幅に基づいて調整
      const parent = container.parent();
      if (parent.length > 0) {
        const parentWidth = parent.width();
        const availableWidth = parentWidth - 20; // パディング分を考慮
        if (availableWidth > 0) {
          container.css('max-width', availableWidth + 'px');
        }
      }
    }
  }
}

// サイドバーの幅を固定幅に設定（SCSSで設定されている場合は調整不要）
// -------------------------------
function adjustSidebarToContent() {
  const sidebar = $('#sidebar');

  if (sidebar.length === 0) return;
  if (sidebar.hasClass('collapsed')) return;

  // 手動リサイズされている場合はスキップ
  if (window.sidebarManuallyResized) return;

  // SCSSで既に幅が設定されているため、JavaScriptでの設定は不要
  // 必要に応じてここで幅を調整することも可能だが、SCSSで設定する方がパフォーマンスが良い
  // フラグを立てる（これ以降は手動リサイズのみ）
  window.sidebarManuallyResized = true;
}

// -------------------------------
// 起動処理
// -------------------------------
$(document).ready(function () {
  // 親要素の幅制限を考慮した調整
  adjustTreeviewWidth();

  // ウィンドウリサイズ時も調整
  $(window).on('resize', adjustTreeviewWidth);

  // クエリから lang / nando_id を受け取り（存在すれば反映）。なければパスから NANDO ID を取得
  const urlObj = new URL(window.location.href);
  const q = urlObj.searchParams;
  lang =
    q.get('lang') === 'ja' || q.get('lang') === 'en' ? q.get('lang') : lang;
  const qNando = q.get('nando_id');
  if (qNando) {
    nando_id = qNando;
  } else {
    const path = urlObj.pathname;
    const idx = path.indexOf('NANDO:');
    if (idx !== -1) {
      nando_id = decodeURIComponent(path.slice(idx));
    }
  }

  if (lang !== 'ja') lang = 'en'; // 想定外は英語へフォールバック

  // 上流階層データを API（外部）から取得
  const url_str = `${URL_GET_PANEL_UPSTREAM_HIERARCHY}?nando_id=${encodeURIComponent(
    nando_id
  )}&lang=${encodeURIComponent(lang)}`;

  $.ajax({ url: url_str, type: 'GET', async: true, dataType: 'text' })
    .done(function (data) {
      try {
        const json_data = JSON.parse(data);
        init_ui_upstream_trace(nando_id, json_data);
      } catch (e) {
        console.error('JSON parse error', e, data);
        alert('サーバー応答の形式が不正です。');
      }
    })
    .fail(function () {
      console.log('AJAXに失敗しました。\nURL: ' + url_str);
    });
});
