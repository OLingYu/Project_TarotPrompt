(function () {
  "use strict";
/**
 * quiz.js — 12 道自我状态问卷题库（用户提供的题库，同时作为「恢复默认」的原始题库）
 * 每题 4 个选项，每个选项包含 value(标识) 与 desc(语义描述)，
 * desc 将直接注入生成的提示词。本文件仅提供静态数据。
 */

const DEFAULT_QUESTIONS = [
  {
    id: 1,
    question: "你当下的整体生活状态更接近？",
    options: [
      { value: "A", desc: "处于人生转折点，对未来感到迷茫，暂时找不到清晰的方向" },
      { value: "B", desc: "生活稳定平顺，但有些平淡枯燥，想要做出改变却缺少动力" },
      { value: "C", desc: "正在为某个目标全力推进，节奏紧凑压力不小，但方向很明确" },
      { value: "D", desc: "刚经历一段低谷或变故，正在慢慢调整状态、恢复节奏" }
    ]
  },
  {
    id: 2,
    question: "最近这段时间，占据你主导的情绪是？",
    options: [
      { value: "A", desc: "焦虑与内耗，反复纠结同一件事，很难下定决心" },
      { value: "B", desc: "孤独感，觉得身边人很难真正理解自己的想法" },
      { value: "C", desc: "挫败感，付出的努力没有得到预期的回报" },
      { value: "D", desc: "麻木与倦怠，对很多事情都提不起兴趣，提不起精神" }
    ]
  },
  {
    id: 3,
    question: "你此刻最想获得指引的领域是？",
    options: [
      { value: "A", desc: "事业与学业，关心发展前景、选择与机会" },
      { value: "B", desc: "感情与关系，包括亲密关系、人际相处的困惑" },
      { value: "C", desc: "自我成长，想更了解自己，突破内心的局限" },
      { value: "D", desc: "现实生活，被日常琐事、物质与现实问题困扰" }
    ]
  },
  {
    id: 4,
    question: "你目前的人际相处状态是？",
    options: [
      { value: "A", desc: "社交消耗感很强，更想独处，不想应付人际关系" },
      { value: "B", desc: "渴望深度连接，但很难遇到真正同频的人" },
      { value: "C", desc: "正处在一段关系的矛盾或拉扯中，感到疲惫" },
      { value: "D", desc: "人际圈平稳固定，没有太多波动，也没太多惊喜" }
    ]
  },
  {
    id: 5,
    question: "面对生活里的变化，你的通常态度是？",
    options: [
      { value: "A", desc: "渴望突破现状，但害怕风险，不敢轻易迈出第一步" },
      { value: "B", desc: "偏爱稳定和熟悉，不喜欢突发的变动" },
      { value: "C", desc: "常常是被动推着走，很少主动主导变化" },
      { value: "D", desc: "喜欢尝试新事物，愿意主动做出改变和调整" }
    ]
  },
  {
    id: 6,
    question: "你内心深处最迫切的期待是？",
    options: [
      { value: "A", desc: "获得清晰的方向感，不再迷茫摇摆" },
      { value: "B", desc: "被理解、被接纳，拥有一段舒服的关系" },
      { value: "C", desc: "实现一个具体的目标，获得成就感与认可" },
      { value: "D", desc: "内心变得平静松弛，不再焦虑内耗" }
    ]
  },
  {
    id: 7,
    question: "你觉得目前阻碍你前进的最大原因是？",
    options: [
      { value: "A", desc: "行动力不足，容易拖延，想法多落地少" },
      { value: "B", desc: "外界环境与现实条件的限制，身不由己" },
      { value: "C", desc: "自我怀疑与否定，不相信自己能做到" },
      { value: "D", desc: "看不清真正的问题，找不到发力点" }
    ]
  },
  {
    id: 8,
    question: "遇到需要决断的事情时，你的习惯是？",
    options: [
      { value: "A", desc: "先理性分析利弊，再做稳妥的决定" },
      { value: "B", desc: "跟着直觉和内心感受走，不想太算计" },
      { value: "C", desc: "习惯先考虑别人的感受，容易妥协" },
      { value: "D", desc: "容易纠结犹豫，常常要拖到最后" }
    ]
  },
  {
    id: 9,
    question: "你最近的压力主要来源于哪里？",
    options: [
      { value: "A", desc: "对未来的不确定性，担心自己选错题" },
      { value: "B", desc: "身边人的期待与眼光，怕让别人失望" },
      { value: "C", desc: "现实物质与生存层面的实际压力" },
      { value: "D", desc: "对自己的高要求，总觉得做得还不够" }
    ]
  },
  {
    id: 10,
    question: "你对自己的整体认知更偏向？",
    options: [
      { value: "A", desc: "常常觉得自己不够好，习惯自我否定" },
      { value: "B", desc: "清楚自己的优势与边界，自我接纳度比较高" },
      { value: "C", desc: "时常看不清真实的自己，不知道自己想要什么" },
      { value: "D", desc: "很在意外界评价，容易被别人的看法影响" }
    ]
  },
  {
    id: 11,
    question: "你现在最想摆脱的状态是？",
    options: [
      { value: "A", desc: "反复内耗的精神拉扯，想太多做太少" },
      { value: "B", desc: "一成不变的枯燥循环，看不到生活的新鲜感" },
      { value: "C", desc: "不被看见、不被重视的委屈感" },
      { value: "D", desc: "失控的生活节奏，忙乱又没有收获" }
    ]
  },
  {
    id: 12,
    question: "接下来这段时间，你更想把精力放在？",
    options: [
      { value: "A", desc: "长远的人生规划与方向选择上" },
      { value: "B", desc: "当下的日常感受，照顾好自己的情绪" },
      { value: "C", desc: "具体目标的落地执行，拿到实际结果" },
      { value: "D", desc: "经营重要的人际关系，收获情感支持" }
    ]
  }
];
  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.quizQuestions = DEFAULT_QUESTIONS;
})();
