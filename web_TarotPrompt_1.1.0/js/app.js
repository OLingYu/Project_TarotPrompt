(function () {
  "use strict";
/**
 * app.js — v1.1.0 页面流程与交互控制
 * 欢迎页 → 12 道问卷（含第5选项自定义输入）→ 长按吸收收集卡牌（堆叠跟随鼠标）
 *      → 洗牌三次（每轮需点击）→ 数字选号抽牌（纯动画）→ 逐张手动翻牌 → 结果页
 *
 * ★ 核心红线（全局强制约束）：
 *   1. 抽牌结果在答题结束、进入卡牌流程时，用原始算法 drawRandomCards(cardPool, 3)
 *      调用一次即已确定（第一张=过去，第二张=现在，第三张=未来）；
 *   2. 数字选号（0-21）只做视觉动画，【完全不改变】抽卡随机结果——
 *      用户点击哪个数字，不会影响抽到什么牌；
 *   3. 自定义输入选项：必须点击【完成提交】才进入下一题，编辑文字本身不跳转。
 */

var NS = window.TarotPrompt;
var cardPool = NS.cardPool;
var drawRandomCards = NS.drawRandomCards;
var generatePrompt = NS.generatePrompt;

var PRESS_SFX = "soft_film_key.wav"; // 按下音效
var TOTAL_QUESTIONS = 12;
var POSITIONS = ["过去", "现在", "未来"];

/* ---------- 状态 ---------- */
var state = {
  step: 0,        // 当前题号（0 起）
  answers: [],    // [{ id, question, option }]
  drawn: [],      // 抽牌结果（3 张，顺序=过去/现在/未来）
  pickedCount: 0, // 已点选数字次数
  flipCount: 0,   // 已翻牌张数
  resultShown: false
};

/* ---------- DOM ---------- */
function $(sel) { return document.querySelector(sel); }

var views = {
  welcome: $("#view-welcome"),
  quiz: $("#view-quiz"),
  collect: $("#view-collect"),
  shuffle: $("#view-shuffle"),
  pick: $("#view-pick"),
  flip: $("#view-flip"),
  result: $("#view-result")
};
var progressText = $("#progress-text");
var progressFill = $("#progress-fill");
var questionText = $("#question-text");
var optionsBox = $("#options");
var promptArea = $("#prompt-area");
var toast = $("#toast");

function showView(name) {
  Object.keys(views).forEach(function (key) {
    views[key].classList.toggle("hidden", key !== name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Toast ---------- */
var toastTimer = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 1800);
}
NS.showToast = showToast;

/* ---------- 欢迎页 ---------- */
$("#btn-start").addEventListener("click", function () {
  NS.startBgm();
  NS.playSfx(PRESS_SFX);
  NS.vibrate(15);
  startQuiz();
});

/* ==================== 答题流程 ==================== */
function startQuiz() {
  state.step = 0;
  state.answers = [];
  state.pickedCount = 0;
  state.flipCount = 0;
  state.resultShown = false;
  showView("quiz");
  renderQuestion();
}

function renderQuestion() {
  var questions = NS.getQuestions(); // 支持用户自定义（更多→编辑题目与回答）
  var q = questions[state.step];
  TOTAL_QUESTIONS = questions.length;

  progressText.textContent = (state.step + 1) + " / " + TOTAL_QUESTIONS;
  progressFill.style.width = (((state.step + 1) / TOTAL_QUESTIONS) * 100) + "%";
  questionText.textContent = q.question;

  optionsBox.innerHTML = "";

  // 原有 4 个选项：点击直接进入下一题
  q.options.forEach(function (opt) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-card";
    btn.dataset.value = opt.value;
    btn.textContent = opt.desc;
    btn.addEventListener("click", function () {
      handlePick(q, opt, btn);
    });
    optionsBox.appendChild(btn);
  });

  // 第 5 选项：以上都不是，请输入（仅点击【完成提交】才进入下一题）
  var customWrap = document.createElement("div");
  customWrap.className = "option-custom";

  var toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "option-card option-custom-toggle";
  toggleBtn.textContent = "以上都不是，请输入";

  var inputRow = document.createElement("div");
  inputRow.className = "option-custom-input hidden";

  var field = document.createElement("input");
  field.type = "text";
  field.maxLength = 60;
  field.placeholder = "请输入你的真实想法…";

  var submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "btn-submit";
  submitBtn.textContent = "完成提交";

  inputRow.appendChild(field);
  inputRow.appendChild(submitBtn);
  customWrap.appendChild(toggleBtn);
  customWrap.appendChild(inputRow);
  optionsBox.appendChild(customWrap);

  // 点击“以上都不是，请输入”区域：激活输入框编辑文字（不跳转）
  toggleBtn.addEventListener("click", function () {
    NS.playSfx(PRESS_SFX);
    NS.vibrate(10);
    toggleBtn.classList.add("selected");
    inputRow.classList.remove("hidden");
    field.focus();
  });

  // 只有点击【完成提交】才进入下一题
  submitBtn.addEventListener("click", function () {
    var text = field.value.trim();
    if (!text) {
      showToast("请先输入你的想法，再点击完成提交");
      field.focus();
      return;
    }
    NS.playSfx(PRESS_SFX);
    NS.vibrate(15);
    state.answers.push({
      id: q.id,
      question: q.question,
      option: { value: "E", desc: "以上都不是，我的回答是：" + text }
    });
    advanceStep();
  });

  // 回车等同于点击完成提交
  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitBtn.click();
    }
  });
}

function handlePick(q, opt, btn) {
  if (btn.classList.contains("selected")) return; // 防连点
  btn.classList.add("selected");
  optionsBox.querySelectorAll(".option-card").forEach(function (b) {
    if (b !== btn) b.classList.add("dimmed");
  });
  NS.playSfx(PRESS_SFX);
  NS.vibrate(15);

  state.answers.push({ id: q.id, question: q.question, option: opt });

  setTimeout(function () {
    advanceStep();
  }, 300);
}

function advanceStep() {
  var questions = NS.getQuestions();
  if (state.step < questions.length - 1) {
    state.step += 1;
    renderQuestion();
  } else {
    beginCardFlow();
  }
}

/* ==================== 卡牌流程入口 ==================== */
function beginCardFlow() {
  // ★ 唯一一次调用原始抽牌算法：三张牌在此时已确定（过去/现在/未来）
  //   之后所有环节（收集、洗牌、数字选号、翻牌）均为视觉仪式动画
  state.drawn = drawRandomCards(cardPool, 3);
  startCollect();
}

/* ==================== ① 长按吸收收集卡牌（堆叠跟随鼠标） ==================== */
var collectState = {
  cards: [],       // 卡牌 DOM 引用
  taken: 0,        // 已收集数量
  absorbing: false,// 是否处于吸收模式（长按激活后）
  holdTimer: null,
  absorbTimer: null,
  pointerId: null,
  stackX: 0,
  stackY: 0,
  finished: false
};

function startCollect() {
  showView("collect");
  collectState.cards = [];
  collectState.taken = 0;
  collectState.absorbing = false;
  collectState.finished = false;
  clearTimeout(collectState.holdTimer);
  clearInterval(collectState.absorbTimer);

  var grid = $("#collect-grid");
  grid.innerHTML = "";
  for (var i = 0; i < cardPool.length; i++) {
    var el = document.createElement("div");
    el.className = "collect-card";
    el.dataset.index = i;
    el.innerHTML = '<div class="cc-back"><span class="cc-star">✦</span></div>';
    grid.appendChild(el);
    collectState.cards.push({ el: el, taken: false });
  }

  var stack = $("#collect-stack");
  stack.innerHTML = "";
  stack.style.display = "";
  stack.style.opacity = "1";

  $("#collect-hint").textContent = "长按并保持，卡牌将被吸收到鼠标/手指位置…";
  $("#collect-progress").textContent = "已收集 0 / 22";
}

function onCollectDown(e) {
  if (collectState.finished) return;
  collectState.pointerId = e.pointerId;
  // 指针捕获：鼠标/手指移出卡牌区域后仍持续跟踪，确保卡牌始终被吸收到鼠标当前位置
  try { collectView.setPointerCapture(e.pointerId); } catch (err) {}
  moveStack(e.clientX, e.clientY);

  clearTimeout(collectState.holdTimer);
  collectState.holdTimer = setTimeout(function () {
    collectState.absorbing = true;
    $("#collect-stack").classList.add("absorbing");
    NS.playSfx(PRESS_SFX);
    NS.vibrate(12);
    $("#collect-hint").textContent = "吸收中… 保持长按，卡牌自动飞入手中";
    absorbNext();
    collectState.absorbTimer = setInterval(absorbNext, 120);
  }, 350); // 长按约 350ms 激活
}

function onCollectMove(e) {
  if (collectState.finished) return;
  if (e.pointerId !== collectState.pointerId) return;
  // 收集跟随鼠标：堆叠始终跟随光标/手指位置
  moveStack(e.clientX, e.clientY);
}

function onCollectUp() {
  clearTimeout(collectState.holdTimer);
  clearInterval(collectState.absorbTimer);
  collectState.absorbing = false;
  $("#collect-stack").classList.remove("absorbing");
  if (collectState.taken >= cardPool.length && !collectState.finished) {
    finishCollect();
  }
}

function moveStack(x, y) {
  collectState.stackX = x;
  collectState.stackY = y;
  var stack = $("#collect-stack");
  stack.style.left = x + "px";
  stack.style.top = y + "px";
}

/** 长按吸收：每 150ms 自动吸收离光标最近的一张，无需逐一拾取 */
function absorbNext() {
  if (collectState.finished || collectState.taken >= cardPool.length) return;
  var best = null;
  var bestDist = Infinity;
  collectState.cards.forEach(function (c) {
    if (c.taken) return;
    var r = c.el.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var d = (cx - collectState.stackX) * (cx - collectState.stackX) + (cy - collectState.stackY) * (cy - collectState.stackY);
    if (d < bestDist) { bestDist = d; best = c; }
  });
  if (best) takeCard(best);
}

function takeCard(card) {
  card.taken = true;
  card.el.classList.add("taken");

  var r = card.el.getBoundingClientRect();
  var sx = r.left + r.width / 2;
  var sy = r.top + r.height / 2;
  // 目标始终 = 鼠标/手指当前位置（吸收那一刻的最新位置）
  var tx = collectState.stackX;
  var ty = collectState.stackY;

  // 飞行到鼠标处的堆叠（跟随光标，具备层叠效果）
  var fly = document.createElement("div");
  fly.className = "collect-fly";
  fly.innerHTML = '<span class="cc-star">✦</span>';
  fly.style.left = sx + "px";
  fly.style.top = sy + "px";
  document.body.appendChild(fly);

  var rot = (Math.random() - 0.5) * 30;
  fly.animate([
    { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
    { transform: "translate(-50%,-50%) translate(" + (tx - sx) + "px," + (ty - sy) + "px) scale(0.55) rotate(" + rot + "deg)", opacity: 1 }
  ], { duration: 220, easing: "ease-in" }).onfinish = function () {
    fly.remove();
    card.el.style.visibility = "hidden";
    addStackCard();
  };
}

function addStackCard() {
  collectState.taken++;
  var stack = $("#collect-stack");
  var mini = document.createElement("div");
  mini.className = "stack-card";
  // 层叠偏移：每张略有错位，形成堆叠效果
  var off = collectState.taken % 5;
  var rot = (off - 2) * 3;
  var dx = (off - 2) * 4;
  var dy = (off - 2) * 2;
  mini.style.transform = "translate(-50%,-50%) translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";
  mini.innerHTML = '<span class="cc-star">✦</span>';
  stack.appendChild(mini);
  NS.playSfx("paper_slip.wav");
  NS.vibrate(6);

  $("#collect-progress").textContent = "已收集 " + collectState.taken + " / 22";

  if (collectState.taken >= cardPool.length) {
    finishCollect();
  }
}

function finishCollect() {
  if (collectState.finished) return;
  collectState.finished = true;
  collectState.absorbing = false;
  clearTimeout(collectState.holdTimer);
  clearInterval(collectState.absorbTimer);
  $("#collect-stack").classList.remove("absorbing");
  NS.playSfx("card_stack_drop.wav");
  NS.vibrate([30, 40, 30]);

  // 收集完成：提示洗牌
  $("#collect-hint").textContent = "22 张卡牌已全部收集 ✦ 即将开始洗牌…";
  $("#collect-progress").textContent = "已收集 22 / 22 ✓";

  setTimeout(function () {
    startShuffle();
  }, 900);
}

/* ==================== ② 洗牌（三次，每轮需用户点击） ==================== */
var shuffleRound = 0;

function startShuffle() {
  showView("shuffle");
  // 收集堆叠只属于收集页：进入洗牌页后隐藏，避免残留
  var stackEl = $("#collect-stack");
  if (stackEl) {
    stackEl.style.display = "none";
    stackEl.innerHTML = "";
  }
  var queue = $("#shuffle-queue");
  queue.innerHTML = "";
  for (var i = 0; i < cardPool.length; i++) {
    var el = document.createElement("div");
    el.className = "shuffle-card";
    el.innerHTML = '<span class="cc-star">✦</span>';
    queue.appendChild(el);
  }
  shuffleRound = 1;
  renderShuffleRound();
}

function renderShuffleRound() {
  var btn = $("#shuffle-btn");
  if (shuffleRound > 3) {
    btn.classList.add("hidden");
    $("#shuffle-round").textContent = "洗牌完成 ✦ 即将抽牌…";
    setTimeout(function () { startPick(); }, 600);
    return;
  }
  $("#shuffle-round").textContent = "第 " + shuffleRound + " 次洗牌";
  btn.textContent = "点击开始第 " + shuffleRound + " 次洗牌";
  btn.classList.remove("hidden");
}

function doShuffleRound() {
  NS.playSfx("card_shuffle.wav");
  NS.vibrate([25, 35, 25]);

  var queue = $("#shuffle-queue");
  var cards = Array.prototype.slice.call(queue.children);

  // 动画：多张卡牌背面抽出放到队列最前方
  var pullCount = 2 + shuffleRound; // 第1轮2张、第2轮3张、第3轮4张
  var pulled = cards.slice(cards.length - pullCount);

  pulled.forEach(function (el, idx) {
    el.style.zIndex = 10;
    el.animate([
      { transform: "translateY(0) rotate(0deg)", opacity: 1 },
      { transform: "translateY(-90px) rotate(" + (idx % 2 ? 14 : -14) + "deg) scale(1.08)", opacity: 1, offset: 0.6 },
      { transform: "translateY(0) rotate(0deg) scale(1)", opacity: 1 }
    ], { duration: 620, easing: "ease-in-out" });
  });

  // 逻辑上：抽出的卡放到队列最前方
  setTimeout(function () {
    pulled.forEach(function (el) {
      queue.insertBefore(el, queue.firstChild);
    });
  }, 620);

  shuffleRound++;
  setTimeout(function () { renderShuffleRound(); }, 980);
}

$("#shuffle-btn").addEventListener("click", function () {
  if (shuffleRound < 1 || shuffleRound > 3) return;
  NS.playSfx(PRESS_SFX);
  NS.vibrate(10);
  this.classList.add("hidden");
  doShuffleRound();
});

/* ==================== ③ 数字选号抽牌（纯动画） ==================== */
function startPick() {
  showView("pick");
  state.pickedCount = 0;

  // 视觉牌扇（22 张背面）
  var deck = $("#pick-deck");
  deck.innerHTML = "";
  for (var i = 0; i < cardPool.length; i++) {
    var el = document.createElement("div");
    el.className = "pick-deck-card";
    el.innerHTML = '<span class="cc-star">✦</span>';
    el.style.transform = "rotate(" + ((i - 10.5) * 2.2) + "deg)";
    deck.appendChild(el);
  }

  // 三个卡位（过去/现在/未来）
  var slots = $("#pick-slots");
  slots.innerHTML = "";
  for (var j = 0; j < 3; j++) {
    var s = document.createElement("div");
    s.className = "pick-slot";
    s.dataset.pos = POSITIONS[j];
    s.innerHTML = '<div class="ps-back"><span class="ps-star">✦</span></div><div class="ps-label">' + POSITIONS[j] + '</div>';
    slots.appendChild(s);
  }

  // 可点击数字 0,1,2…21
  var nums = $("#pick-numbers");
  nums.innerHTML = "";
  for (var n = 0; n < cardPool.length; n++) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pick-num";
    b.textContent = n;
    b.dataset.num = n;
    b.addEventListener("click", function () {
      onPickNumber(this);
    });
    nums.appendChild(b);
  }

  $("#pick-hint").textContent = "点击下方数字，抽取第一张命运之牌";
}

function onPickNumber(btn) {
  if (state.pickedCount >= 3) return;
  // ★ 数字点击仅做视觉动画：state.drawn 在答题结束时已由原始算法确定，
  //   点击哪个数字完全不改变抽卡随机结果。
  btn.classList.add("used");
  NS.playSfx(PRESS_SFX);
  NS.vibrate(15);

  var slot = $("#pick-slots").children[state.pickedCount];
  var deckRect = $("#pick-deck").getBoundingClientRect();
  var slotRect = slot.querySelector(".ps-back").getBoundingClientRect();

  var fly = document.createElement("div");
  fly.className = "pick-fly";
  fly.innerHTML = '<span class="ps-star">✦</span>';
  var sx = deckRect.left + deckRect.width / 2;
  var sy = deckRect.top + deckRect.height / 2;
  var tx = slotRect.left + slotRect.width / 2;
  var ty = slotRect.top + slotRect.height / 2;
  var dx = tx - sx;
  var dy = ty - sy;
  fly.style.left = sx + "px";
  fly.style.top = sy + "px";
  document.body.appendChild(fly);

  // 弧线飞行：始终保留 -50%,-50% 居中偏移，落点精确对准卡位中心
  var rot = (Math.random() - 0.5) * 40;
  fly.animate([
    { transform: "translate(-50%,-50%) translate(0px,0px) rotate(0deg) scale(1)", opacity: 1 },
    { transform: "translate(-50%,-50%) translate(" + (dx * 0.5) + "px," + (dy * 0.5 - 55) + "px) rotate(" + (rot * 0.5) + "deg) scale(0.94)", opacity: 1, offset: 0.5 },
    { transform: "translate(-50%,-50%) translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg) scale(1)", opacity: 1 }
  ], { duration: 600, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }).onfinish = function () {
    fly.remove();
    slot.classList.add("filled");
  };

  state.pickedCount++;
  if (state.pickedCount < 3) {
    $("#pick-hint").textContent = "点击下方数字，抽取第" + (state.pickedCount + 1) + "张命运之牌";
  } else {
    $("#pick-hint").textContent = "三张命运之牌已落定 ✦ 即将翻开…";
    setTimeout(function () { startFlip(); }, 900);
  }
}

/* ==================== ④ 逐张翻牌 ==================== */
function startFlip() {
  showView("flip");
  state.flipCount = 0;

  var row = $("#flip-row");
  row.innerHTML = "";
  for (var i = 0; i < 3; i++) {
    var card = state.drawn[i];
    var holder = document.createElement("div");
    holder.className = "flip-card";
    holder.dataset.index = i;
    holder.innerHTML =
      '<div class="flip-inner">' +
        '<div class="flip-face flip-back"><span class="fb-star">✦</span></div>' +
        '<div class="flip-face flip-front">' +
          '<img alt="">' +
          '<span class="flip-name"></span>' +
          '<span class="flip-orient"></span>' +
        '</div>' +
      '</div>' +
      '<div class="flip-label">' + POSITIONS[i] + '</div>';
    holder.addEventListener("click", function () {
      onFlipCard(this);
    });
    row.appendChild(holder);
  }

  $("#flip-hint").textContent = "点击第一张牌，翻开命运的篇章";
  $("#flip-page-hint").classList.add("hidden");
}

function onFlipCard(holder) {
  var idx = Number(holder.dataset.index);
  // 必须按顺序手动点击：点完第一张才能点第二张，点完第二张才能点第三张
  if (idx !== state.flipCount) {
    showToast("请按顺序依次翻开卡牌");
    return;
  }
  NS.playSfx("card_flip.wav");
  NS.vibrate(40);

  var card = state.drawn[idx];
  var inner = holder.querySelector(".flip-inner");
  holder.classList.add("flipping");

  var img = holder.querySelector("img");
  img.src = card.image;
  img.alt = card.name;
  holder.querySelector(".flip-name").textContent = card.name;
  var orientTag = holder.querySelector(".flip-orient");
  orientTag.textContent = card.isReversed ? "逆位" : "正位";
  orientTag.classList.toggle("reversed", card.isReversed);

  state.flipCount++;
  if (state.flipCount < 3) {
    $("#flip-hint").textContent = "点击第" + (state.flipCount + 1) + "张牌";
  } else {
    $("#flip-hint").textContent = "三张命运之牌已全部揭示";
    $("#flip-page-hint").classList.remove("hidden");
  }
}

/* ⑤ 翻牌全部完成后：再次点击页面 → 结果页
   翻完第三张后需用户【再点击一次页面】才跳转，避免翻牌点击直接触发跳转 */
var flipJumpAt = 0;
$("#view-flip").addEventListener("click", function (e) {
  if (state.flipCount >= 3 && !state.resultShown) {
    var now = Date.now();
    if (e.target.closest(".flip-card")) {
      // 刚翻完第三张的那次点击不触发跳转，需再点页面任意处
      flipJumpAt = now + 800;
      return;
    }
    if (now < flipJumpAt) return;
    state.resultShown = true;
    goResult();
  }
});

/* ==================== 结果页（展示&获取提示词） ==================== */
function goResult() {
  showView("result");
  renderResultCards();
  promptArea.value = generatePrompt(state.answers, state.drawn);

  // 自动存入历史记录（带时间戳，上限 1000 条）
  var now = new Date();
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  var timeStr = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
                " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  var cardsStr = state.drawn.map(function (c, i) {
    return POSITIONS[i] + "·" + c.name + (c.isReversed ? "（逆位）" : "（正位）");
  }).join("、");
  NS.addHistoryRecord({
    ts: now.getTime(),
    time: timeStr,
    cards: cardsStr,
    prompt: promptArea.value
  });

  NS.playSfx("card_stack_drop.wav");
  NS.vibrate([30, 40, 30]);
}

function renderResultCards() {
  var box = $("#cards-result");
  box.innerHTML = "";
  state.drawn.forEach(function (card, idx) {
    var el = document.createElement("div");
    el.className = "result-card";
    el.innerHTML =
      '<img class="card-img" src="' + card.image + '" alt="' + card.name + '" loading="lazy">' +
      '<div class="card-meta">' +
        '<span class="card-order">' + POSITIONS[idx] + '</span>' +
        '<span class="card-name">' + card.name + '</span>' +
        '<span class="card-orient' + (card.isReversed ? " reversed" : "") + '">' + (card.isReversed ? "逆位" : "正位") + '</span>' +
        '<span class="card-keywords">' + (card.isReversed ? card.reversedKeywords : card.keywords).join(" · ") + '</span>' +
      '</div>';
    box.appendChild(el);
  });
}

/* ---------- 一键复制 ---------- */
$("#btn-copy").addEventListener("click", function () {
  var text = promptArea.value;
  var ok = false;
  function fallbackCopy() {
    promptArea.focus();
    promptArea.select();
    promptArea.setSelectionRange(0, text.length);
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () {
      showToast("提示词已复制到剪贴板");
    }, function () {
      fallbackCopy();
      showToast(ok ? "提示词已复制到剪贴板" : "复制失败，请手动长按选择复制");
    });
  } else {
    fallbackCopy();
    showToast(ok ? "提示词已复制到剪贴板" : "复制失败，请手动长按选择复制");
  }
  NS.playSfx(PRESS_SFX);
  NS.vibrate(10);
});

/* ---------- 重新占卜 ---------- */
$("#btn-restart").addEventListener("click", function () {
  NS.playSfx(PRESS_SFX);
  NS.vibrate(10);
  state.step = 0;
  state.answers = [];
  state.drawn = [];
  state.pickedCount = 0;
  state.flipCount = 0;
  state.resultShown = false;
  progressFill.style.width = "0%";
  showView("welcome");
});

/* ---------- 收集页事件（Pointer 事件兼容鼠标与触摸） ---------- */
var collectView = $("#view-collect");
collectView.addEventListener("pointerdown", onCollectDown);
collectView.addEventListener("pointermove", onCollectMove);
collectView.addEventListener("pointerup", onCollectUp);
collectView.addEventListener("pointercancel", onCollectUp);
collectView.addEventListener("touchmove", function (e) {
  if (collectState.absorbing && e.cancelable) e.preventDefault();
}, { passive: false });

/* ---------- 初始化 ---------- */
showView("welcome");
})();