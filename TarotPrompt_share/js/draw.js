(function () {
  "use strict";
/**
 * draw.js — 独立抽牌算法（核心红线：与问卷完全解耦）
 *
 * drawRandomCards 是一个纯函数：
 *   - 仅接收 cardPool（牌池）与 count（抽取数量）两个参数；
 *   - 绝不接收、读取、引用任何答题数据，问卷答案无法以任何形式影响抽牌结果；
 *   - 严格均等概率随机，无加权、无筛选、无条件判断；
 *   - 不修改传入的牌池（返回新对象）。
 */

/**
 * 从牌池中随机抽取指定数量的不重复卡牌。
 * 每张牌抽取后独立生成 50% 概率的正/逆位标记（isReversed）。
 * 返回的每张牌为原卡牌数据的副本，并新增 isReversed 布尔字段。
 *
 * @param {Array<Object>} cardPool 卡牌牌池（如 cards.js 中的 cardPool）
 * @param {number} [count=3] 抽取数量，默认 3
 * @returns {Array<Object>} 抽取结果数组，元素为 { ...card, isReversed: boolean }
 * @throws {Error} 当 count 超过牌池长度或为非正整数时抛出错误
 */
function drawRandomCards(cardPool, count = 3) {
  if (!Array.isArray(cardPool) || cardPool.length === 0) {
    throw new Error("drawRandomCards: cardPool 必须是非空数组");
  }
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("drawRandomCards: count 必须为正整数");
  }
  if (count > cardPool.length) {
    throw new Error(`drawRandomCards: 抽取数量(count=${count})不能超过牌池大小(${cardPool.length})`);
  }

  // 洗牌：Fisher–Yates 算法，保证每个排列等概率
  const shuffled = cardPool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 取前 count 张，每张独立 50% 概率决定正/逆位
  return shuffled.slice(0, count).map((card) => ({
    ...card,
    isReversed: Math.random() < 0.5
  }));
}
  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.drawRandomCards = drawRandomCards;
})();
