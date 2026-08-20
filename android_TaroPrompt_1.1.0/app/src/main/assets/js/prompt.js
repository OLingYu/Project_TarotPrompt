(function () {
  "use strict";
/**
 * prompt.js — v1.1.0 提示词生成模板
 * 三张牌固定顺序：第一张=过去，第二张=现在，第三张=未来；
 * 自动串联三张卡牌信息生成解读提示词，整体文案具有命运揭示、塔罗占卜氛围感。
 */

/** 正/逆位显示名 */
const ORIENTATION_TEXT = {
  true: "逆位",
  false: "正位"
};

/** 牌阵位置：严格顺序 过去 / 现在 / 未来 */
const SPREAD_POSITIONS = ["过去", "现在", "未来"];

/** 解读引导段落（模板固定内容） */
const GUIDANCE = [
  "请以塔罗占卜师的视角，结合用户的真实处境与内心状态，对这三张牌进行解读，解读要求：",
  "1. 严格按「过去 → 现在 → 未来」的顺序依次解读三张牌，并将三张牌串联成一条命运的线索，揭示过去如何塑造现在、现在如何通往未来",
  "2. 表达要有命运揭示感与占卜仪式感，但不要说「你一定会怎样」「注定会怎样」，改用「这可能在提醒你」「一个启示是」「不妨思考」等启发式表达",
  "3. 紧扣用户的具体困扰与作答内容，不要说空泛的套话，给出贴合用户处境的思考角度",
  "4. 语气温和而有力量，不恐吓、不制造焦虑，重点引导用户自我觉察",
  "5. 最后给出2-3个具体的、可落地的反思问题，帮助用户进一步梳理思路",
  "6. 整体字数控制在600-800字，分段落清晰呈现"
].join("\n");

/**
 * 生成完整提示词。
 * @param {Array<{id:number, question:string, option:{value:string, desc:string}}>} userAnswers 用户答案数组
 * @param {Array<{name:string, keywords:string[], coreMeaning:string, reversedKeywords:string[], reversedMeaning:string, isReversed:boolean}>} drawnCards 抽到的卡牌数组（含 isReversed），顺序即 过去/现在/未来
 * @returns {string} 可直接复制的完整提示词
 */
function generatePrompt(userAnswers, drawnCards) {
  const role = "你是一位通晓命运轨迹的塔罗占卜师，目光深邃而温柔。今夜，命运的帷幕为你拉开，请以富有仪式感与揭示感的语言，为求问者解读三张命运之牌。本次解读仅供娱乐与自我反思使用，不属于算命预言，绝对不可以输出宿命论、注定发生、必然结果类表述。";

  // 逐题展示题目原文 + 选中选项描述
  const answerLines = userAnswers
    .map(
      (a) =>
        a.id + ". " + a.question + "\n   选择：" + a.option.desc
    )
    .join("\n");
  const answerSection = "求问者完成了12道自我状态问卷，这些回答如同命运的线索，是解读的重要依据：\n" + answerLines;

  // 逐张展示牌名 + 牌阵位置 + 正/逆位 + 关键词 + 核心含义（严格 过去/现在/未来）
  const cardLines = drawnCards
    .map((card, idx) => {
      const position = SPREAD_POSITIONS[idx] || ("第" + (idx + 1) + "张");
      const orientation = ORIENTATION_TEXT[card.isReversed];
      const keywords = card.isReversed ? card.reversedKeywords : card.keywords;
      const meaning = card.isReversed ? card.reversedMeaning : card.coreMeaning;
      return "第" + (idx + 1) + "张 · " + position + "：" + card.name + "（" + orientation + "）\n   关键词：" + keywords.join("、") + "\n   核心含义：" + meaning;
    })
    .join("\n\n");
  const cardSection = "本次随机抽取了3张大阿卡纳塔罗牌，牌阵顺序严格对应「过去 · 现在 · 未来」，牌面信息如下：\n" + cardLines;

  return [role, answerSection, cardSection, GUIDANCE].join("\n\n");
}
  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.generatePrompt = generatePrompt;
})();
