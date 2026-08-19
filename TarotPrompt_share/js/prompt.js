(function () {
  "use strict";
/**
 * prompt.js — 提示词生成模板
 * generatePrompt(userAnswers, drawnCards) 将用户答题结果与抽到的卡牌
 * 拼接成完整、可直接复制到外部大模型使用的提示词字符串。
 * 本项目不内置任何大模型，解读由用户自行粘贴到外部 AI 完成。
 */

/** 正/逆位显示名 */
const ORIENTATION_TEXT = {
  true: "逆位",
  false: "正位"
};

/** 解读引导段落（模板固定内容） */
const GUIDANCE = [
  "请结合用户的真实处境与内心状态，对这三张牌进行解读，解读要求：",
  "1. 三张牌按顺序分别解读，最后做整体总结",
  "2. 不要说\"你一定会怎样\"、\"注定会怎样\"，改用\"你可以思考\"、\"这可能在提醒你\"、\"一个启发是\"等启发式表达",
  "3. 紧扣用户的具体困扰，不要说空泛的套话，给出贴合用户处境的思考角度",
  "4. 语气温和有力量，不恐吓、不制造焦虑，重点引导用户自我觉察",
  "5. 最后给出2-3个具体的、可落地的反思问题，帮助用户进一步梳理思路",
  "6. 整体字数控制在600-800字，分段落清晰呈现"
].join("\n");

/**
 * 生成完整提示词。
 * @param {Array<{id:number, question:string, option:{value:string, desc:string}}>} userAnswers 用户答案数组
 * @param {Array<{name:string, keywords:string[], coreMeaning:string, reversedKeywords:string[], reversedMeaning:string, isReversed:boolean}>} drawnCards 抽到的卡牌数组（含 isReversed）
 * @returns {string} 可直接复制的完整提示词
 */
function generatePrompt(userAnswers, drawnCards) {
  const role = "你现在是一位温和专业的塔罗心理反思引导师，本次解读仅供娱乐与自我反思使用，不属于算命预言，绝对不可以输出宿命论、注定发生、必然结果类表述。";

  // 逐题展示题目原文 + 选中选项描述
  const answerLines = userAnswers
    .map(
      (a) =>
        `${a.id}. ${a.question}\n   选择：${a.option.desc}`
    )
    .join("\n");
  const answerSection = `用户完成了12道自我状态问卷，以下是用户的真实状态与困扰：\n${answerLines}`;

  // 逐张展示牌名 + 正/逆位标识 + 关键词 + 核心含义
  const cardLines = drawnCards
    .map((card, idx) => {
      const orientation = ORIENTATION_TEXT[card.isReversed];
      const keywords = card.isReversed ? card.reversedKeywords : card.keywords;
      const meaning = card.isReversed ? card.reversedMeaning : card.coreMeaning;
      return `第${idx + 1}张 · ${card.name}（${orientation}）\n   关键词：${keywords.join("、")}\n   核心含义：${meaning}`;
    })
    .join("\n\n");
  const cardSection = `本次随机抽取了3张大阿卡纳塔罗牌，牌面信息如下：\n${cardLines}`;

  return [role, answerSection, cardSection, GUIDANCE].join("\n\n");
}
  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.generatePrompt = generatePrompt;
})();
