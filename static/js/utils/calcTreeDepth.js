export function calcTreeLength(data) {
  // IDからデータを検索するための辞書を作成
  const dataMap = Object.fromEntries(data.map((item) => [item.id, item]));

  // 各項目の深さを計算
  const getDepth = (id, visited = new Set()) => {
    if (!dataMap[id] || !dataMap[id].parent || visited.has(id)) return 1;
    visited.add(id);
    return 1 + getDepth(dataMap[id].parent, visited);
  };

  // 最大階層と階層ごとのアイテム数を計算
  let maxDepth = 0;
  const depthCounts = {};

  data.forEach((item) => {
    const depth = getDepth(item.id);
    maxDepth = Math.max(maxDepth, depth);
    depthCounts[depth] = (depthCounts[depth] || 0) + 1;
  });

  // 階層ごとの最大長さを取得
  const maxLength = Math.max(...Object.values(depthCounts));

  return { maxDepth, maxLength };
}
