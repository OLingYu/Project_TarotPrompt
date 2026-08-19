(function () {
  "use strict";
/**
 * cards.js — 22 张大阿卡纳牌库数据（标准韦特塔罗顺序）
 * 每张牌包含：id / name / keywords(正位关键词) / coreMeaning(正位核心含义)
 *            reversedKeywords(逆位关键词) / reversedMeaning(逆位核心含义) / image(美术资源路径)
 * 本文件仅提供静态数据，不含任何逻辑。
 */

const majorArcana = [
  {
    id: 1,
    name: "愚人",
    keywords: ["新的开始", "冒险", "自由", "纯真"],
    coreMeaning: "一个崭新的开始正在向你招手，勇敢迈出第一步，保持开放与信任。",
    reversedKeywords: ["冲动", "鲁莽", "犹豫", "逃避责任"],
    reversedMeaning: "提醒你三思而后行，避免因一时冲动或过度谨慎而错失良机。",
    image: "assets/cards/The_Fool.png"
  },
  {
    id: 2,
    name: "魔术师",
    keywords: ["意志", "创造力", "行动", "资源整合"],
    coreMeaning: "你拥有实现目标所需的全部资源与能力，此刻正是运用智慧与行动力去创造的时机。",
    reversedKeywords: ["停滞", "拖延", "空想", "误用才华"],
    reversedMeaning: "可能陷入空想或自我怀疑，需要把想法落地，重新聚焦真正重要的目标。",
    image: "assets/cards/The_Magician.png"
  },
  {
    id: 3,
    name: "女祭司",
    keywords: ["直觉", "内在智慧", "潜意识", "静观"],
    coreMeaning: "答案就在你的内心深处，静下来倾听直觉的声音，先观察再行动。",
    reversedKeywords: ["忽视直觉", "表面化", "秘密", "心神不宁"],
    reversedMeaning: "你可能忽略了内心的信号，或对某些信息视而不见，试着回到安静中与自己连接。",
    image: "assets/cards/The_High_Priestess.png"
  },
  {
    id: 4,
    name: "女皇",
    keywords: ["丰饶", "滋养", "创造力", "母性关怀"],
    coreMeaning: "你正处于丰盛与滋养的阶段，学会接纳与照顾自己，让成长自然发生。",
    reversedKeywords: ["依赖", "停滞", "忽视自我照顾", "创造受阻"],
    reversedMeaning: "可能过度付出而忽略了自己，或创造力受阻，需要重新滋养内在。",
    image: "assets/cards/The_Empress.png"
  },
  {
    id: 5,
    name: "皇帝",
    keywords: ["秩序", "权威", "稳定", "掌控"],
    coreMeaning: "以理性与秩序来管理生活，建立边界与结构，你将获得掌控感。",
    reversedKeywords: ["固执", "专断", "失控", "缺乏结构"],
    reversedMeaning: "过度的控制或僵化反而让你疲惫，学会灵活与适当放权。",
    image: "assets/cards/The_Emperor.png"
  },
  {
    id: 6,
    name: "教皇",
    keywords: ["传统", "信念", "导师", "精神指引"],
    coreMeaning: "你正从经验、传统或可靠的指引中获得启发，遵循你认同的价值观前行。",
    reversedKeywords: ["叛逆", "质疑传统", "教条", "固执己见"],
    reversedMeaning: "你可能在质疑旧有的规则与信念，找到属于你自己的答案很重要。",
    image: "assets/cards/The_Hierophant.png"
  },
  {
    id: 7,
    name: "恋人",
    keywords: ["爱", "联结", "选择", "和谐"],
    coreMeaning: "关系与内心的共鸣被点亮，也提醒你在重要选择前忠于自己的心。",
    reversedKeywords: ["失衡", "分歧", "价值冲突", "犹豫"],
    reversedMeaning: "可能面临关系或价值观上的拉扯，先厘清自己真正想要什么。",
    image: "assets/cards/The_Lovers.png"
  },
  {
    id: 8,
    name: "战车",
    keywords: ["意志", "决心", "胜利", "前进"],
    coreMeaning: "凭借坚定的意志与自律，你能驾驭前进的方向，赢得突破。",
    reversedKeywords: ["失控", "方向不明", "受阻", "拖延"],
    reversedMeaning: "内在的拉扯消耗着你的能量，需要先统一目标再出发。",
    image: "assets/cards/The_Chariot.png"
  },
  {
    id: 9,
    name: "力量",
    keywords: ["勇气", "温柔", "耐心", "内在力量"],
    coreMeaning: "真正的力量来自温柔与耐心，以柔克刚，相信自己能驯服内心的波动。",
    reversedKeywords: ["自我怀疑", "疲惫", "压抑情绪", "缺乏勇气"],
    reversedMeaning: "你可能在硬撑，试着接纳自己的脆弱，把力量用在对的地方。",
    image: "assets/cards/Strength.png"
  },
  {
    id: 10,
    name: "隐士",
    keywords: ["内省", "独处", "寻找真理", "指引"],
    coreMeaning: "此刻适合退一步，独自思考与沉淀，答案会从内心浮现。",
    reversedKeywords: ["孤立", "逃避", "封闭", "停滞不前"],
    reversedMeaning: "独处变成了封闭，或你回避了需要面对的问题，试着带着问题向外迈一步。",
    image: "assets/cards/The_Hermit.png"
  },
  {
    id: 11,
    name: "命运之轮",
    keywords: ["转折", "机遇", "循环", "运势流转"],
    coreMeaning: "命运之轮正在转动，变化中藏着机遇，顺势而为，相信转机。",
    reversedKeywords: ["不顺", "抗拒变化", "循环停滞", "时运未至"],
    reversedMeaning: "你可能正处在低谷或抗拒改变，记住境况终会流转，调整心态以待转机。",
    image: "assets/cards/Wheel_of_Fortune.png"
  },
  {
    id: 12,
    name: "正义",
    keywords: ["公正", "平衡", "因果", "理性决断"],
    coreMeaning: "以公正与理性衡量事物，坦诚面对，你会得到应有的平衡。",
    reversedKeywords: ["失衡", "不公", "逃避责任", "犹豫不决"],
    reversedMeaning: "可能有不公或失衡的感受，先诚实地面对自己，再做决定。",
    image: "assets/cards/Justice.png"
  },
  {
    id: 13,
    name: "倒吊人",
    keywords: ["换位思考", "牺牲", "暂停", "新的视角"],
    coreMeaning: "暂时的停顿是为了让你换个角度看问题，放下执念，会有新的领悟。",
    reversedKeywords: ["无谓牺牲", "拖延", "固执", "不愿放手"],
    reversedMeaning: "你可能在无效的等待或牺牲中消耗自己，需要主动打破僵局。",
    image: "assets/cards/The_Hanged_Man.png"
  },
  {
    id: 14,
    name: "死神",
    keywords: ["结束", "蜕变", "放下", "新生"],
    coreMeaning: "一个阶段正在结束，为新的可能腾出空间，蜕变之后的你会更轻盈。",
    reversedKeywords: ["抗拒结束", "停滞", "执念", "恐惧变化"],
    reversedMeaning: "抗拒改变只会让过程更漫长，试着接受结束也是开始的一部分。",
    image: "assets/cards/Death.png"
  },
  {
    id: 15,
    name: "节制",
    keywords: ["平衡", "调和", "耐心", "适度"],
    coreMeaning: "学习在两端之间找到平衡，慢下来调和节奏，一切会趋于和谐。",
    reversedKeywords: ["失衡", "过度", "急躁", "失和"],
    reversedMeaning: "你可能在某个方面过度用力，试着调整节奏，回到适度。",
    image: "assets/cards/Temperance.png"
  },
  {
    id: 16,
    name: "恶魔",
    keywords: ["束缚", "欲望", "执念", "觉察"],
    coreMeaning: "你正被某种执念或习惯束缚，看见它、承认它，是挣脱的第一步。",
    reversedKeywords: ["挣脱束缚", "觉醒", "找回自由", "戒除执念"],
    reversedMeaning: "你正在从束缚中醒来，勇敢切断旧模式，自由就在前面。",
    image: "assets/cards/The_Devil.png"
  },
  {
    id: 17,
    name: "塔",
    keywords: ["剧变", "崩塌", "真相", "重建"],
    coreMeaning: "旧的结构正在崩塌，过程虽然震动，却为你清出了重建的余地。",
    reversedKeywords: ["危机延迟", "逃避真相", "重建缓慢", "侥幸心理"],
    reversedMeaning: "你可能在回避必要的改变，拖延只会让问题积累，不如主动拆解。",
    image: "assets/cards/The_Tower.png"
  },
  {
    id: 18,
    name: "星星",
    keywords: ["希望", "疗愈", "灵感", "宁静"],
    coreMeaning: "黑暗过后星光浮现，怀抱希望，相信疗愈与新的可能性正在发生。",
    reversedKeywords: ["失望", "信心受挫", "灵感枯竭", "自我怀疑"],
    reversedMeaning: "暂时看不见希望不代表没有希望，先照顾好自己，星光会重新亮起。",
    image: "assets/cards/The_Star.png"
  },
  {
    id: 19,
    name: "月亮",
    keywords: ["潜意识", "不安", "迷雾", "直觉"],
    coreMeaning: "眼前的道路有些朦胧，焦虑与幻想交织，慢下来，让直觉为你引路。",
    reversedKeywords: ["迷雾渐散", "看清真相", "情绪平复", "疑虑消退"],
    reversedMeaning: "混乱正在澄清，之前看不清的事情会逐渐明朗。",
    image: "assets/cards/The_Moon.png"
  },
  {
    id: 20,
    name: "太阳",
    keywords: ["喜悦", "成功", "活力", "明朗"],
    coreMeaning: "阳光正好，热情与自信回归，你的努力正迎来明朗的回报。",
    reversedKeywords: ["暂时阴霾", "乐观不足", "热情减退", "状态起伏"],
    reversedMeaning: "也许只是暂时的阴天，允许自己休息，再重新感受光与热。",
    image: "assets/cards/The_Sun.png"
  },
  {
    id: 21,
    name: "审判",
    keywords: ["觉醒", "重生", "评估", "召唤"],
    coreMeaning: "一次深刻的自我评估与觉醒时刻，回应内心的召唤，放下过去重新出发。",
    reversedKeywords: ["自我怀疑", "逃避评判", "拒绝改变", "留恋过去"],
    reversedMeaning: "你可能在回避对自己的评估或迟迟不肯放下，试着诚实面对再向前。",
    image: "assets/cards/Judgement.png"
  },
  {
    id: 22,
    name: "世界",
    keywords: ["圆满", "完成", "整合", "达成"],
    coreMeaning: "一个循环即将圆满落幕，你已完成整合，准备好迎接新的篇章。",
    reversedKeywords: ["未完成", "缺少收尾", "停滞", "功亏一篑"],
    reversedMeaning: "还差最后一步没有收尾，检查遗漏，把未尽之事补完。",
    image: "assets/cards/The_World.png"
  }
];

/** 抽牌牌池：与问卷完全解耦，仅作为抽牌函数的输入数据 */
const cardPool = majorArcana;
  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.majorArcana = majorArcana;
  window.TarotPrompt.cardPool = cardPool;
})();
