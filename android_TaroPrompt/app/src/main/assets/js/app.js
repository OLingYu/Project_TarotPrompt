/**
 * app.js — 页面流程与交互控制（经典脚本，依赖 window.TarotPrompt 命名空间）
 * 单页应用：欢迎页 → 答题页 → 抽牌动画页 → 结果页
 * 关键原则：答题数据与抽牌完全解耦 —— 抽牌仅调用 drawRandomCards(cardPool, 3)，
 * 作答内容只用于最终提示词拼接，绝不参与抽牌。
 */

(function () {
  "use strict";

  // 从全局命名空间读取数据与函数（由 cards.js / quiz.js / draw.js / prompt.js 依次注入）
  var NS = window.TarotPrompt;
  var cardPool = NS.cardPool;
  var quizQuestions = NS.quizQuestions;
  var drawRandomCards = NS.drawRandomCards;
  var generatePrompt = NS.generatePrompt;

  var TOTAL = quizQuestions.length; // 12 题

  /* ---------- 状态 ---------- */
  var state = {
    step: 0,     // 当前题号（0 起）
    answers: [], // [{ id, question, option }]
    drawn: []    // 抽牌结果
  };

  /* ---------- DOM 引用 ---------- */
  function $(sel) { return document.querySelector(sel); }
  var views = {
    welcome: $("#view-welcome"),
    quiz: $("#view-quiz"),
    draw: $("#view-draw"),
    result: $("#view-result")
  };
  var progressText = $("#progress-text");
  var progressFill = $("#progress-fill");
  var questionText = $("#question-text");
  var optionsBox = $("#options");
  var deckBox = $("#cards-deck");
  var cardsResult = $("#cards-result");
  var promptArea = $("#prompt-area");
  var toast = $("#toast");

  /* ---------- 视图切换 ---------- */
  function showView(name) {
    Object.keys(views).forEach(function (key) {
      views[key].classList.toggle("hidden", key !== name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Android 返回键（由原生层调用） ---------- */
  // 返回 true 表示已消费（回到欢迎页），返回 false 表示当前已在欢迎页、交由原生退到后台
  window.TarotPrompt.handleAndroidBack = function () {
    var current = null;
    Object.keys(views).forEach(function (key) {
      if (!views[key].classList.contains("hidden")) current = key;
    });
    if (current === "welcome") return false;
    state.step = 0;
    state.answers = [];
    state.drawn = [];
    progressFill.style.width = "0%";
    showView("welcome");
    return true;
  };

  /* ---------- 欢迎页 ---------- */
  $("#btn-start").addEventListener("click", function () {
    startQuiz();
  });

  /* ---------- 答题流程 ---------- */
  function startQuiz() {
    state.step = 0;
    state.answers = [];
    showView("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    var q = quizQuestions[state.step];
    progressText.textContent = (state.step + 1) + " / " + TOTAL;
    progressFill.style.width = (((state.step + 1) / TOTAL) * 100) + "%";
    questionText.textContent = q.question;

    optionsBox.innerHTML = "";
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
  }

  function handlePick(q, opt, btn) {
    // 防止连点重复记录
    if (btn.classList.contains("selected")) return;
    btn.classList.add("selected");
    optionsBox.querySelectorAll(".option-card").forEach(function (b) {
      if (b !== btn) b.classList.add("dimmed");
    });

    state.answers.push({ id: q.id, question: q.question, option: opt });

    // 短暂停留展示选中反馈后进入下一题 / 抽牌
    setTimeout(function () {
      if (state.step < TOTAL - 1) {
        state.step += 1;
        renderQuestion();
      } else {
        startDraw();
      }
    }, 350);
  }

  /* ---------- 抽牌动画 ---------- */
  function startDraw() {
    // 唯一一次调用抽牌函数：仅传牌池与数量，与 answers 完全无关
    state.drawn = drawRandomCards(cardPool, 3);
    showView("draw");
    renderDeckAnimation();
  }

  function renderDeckAnimation() {
    deckBox.innerHTML = "";
    var cardEls = state.drawn.map(function () {
      var holder = document.createElement("div");
      holder.className = "flip-card";

      var inner = document.createElement("div");
      inner.className = "flip-inner";

      var back = document.createElement("div");
      back.className = "flip-face flip-back";
      back.innerHTML = '<span class="card-back-mark">\u2726</span>';

      var front = document.createElement("div");
      front.className = "flip-face flip-front";

      var img = document.createElement("img");
      img.alt = "";

      var nameTag = document.createElement("span");
      nameTag.className = "flip-name";
      var orientTag = document.createElement("span");
      orientTag.className = "flip-orient";

      front.appendChild(img);
      front.appendChild(nameTag);
      front.appendChild(orientTag);
      inner.appendChild(back);
      inner.appendChild(front);
      holder.appendChild(inner);
      deckBox.appendChild(holder);
      return { holder: holder, inner: inner, img: img, nameTag: nameTag, orientTag: orientTag };
    });

    // 依次翻开 3 张牌（每张间隔约 650ms，总时长约 2.5s）
    cardEls.forEach(function (item, i) {
      setTimeout(function () {
        item.holder.classList.add("flipping");
        item.inner.classList.add("flipped");
        var card = state.drawn[i];
        item.img.src = card.image;
        item.img.alt = card.name;
        item.nameTag.textContent = card.name;
        item.orientTag.textContent = card.isReversed ? "逆位" : "正位";
        item.orientTag.classList.toggle("reversed", card.isReversed);
      }, 300 + i * 650);
    });

    // 动画结束后进入结果页
    setTimeout(function () {
      renderResult();
    }, 300 + cardEls.length * 650 + 500);
  }

  /* ---------- 结果页 ---------- */
  function renderResult() {
    showView("result");
    renderResultCards();
    promptArea.value = generatePrompt(state.answers, state.drawn);
  }

  function renderResultCards() {
    cardsResult.innerHTML = "";
    state.drawn.forEach(function (card, idx) {
      var el = document.createElement("div");
      el.className = "result-card";
      el.innerHTML =
        '<img class="card-img" src="' + card.image + '" alt="' + card.name + '" loading="lazy">' +
        '<div class="card-meta">' +
          '<span class="card-order">第 ' + (idx + 1) + ' 张</span>' +
          '<span class="card-name">' + card.name + '</span>' +
          '<span class="card-orient' + (card.isReversed ? " reversed" : "") + '">' + (card.isReversed ? "逆位" : "正位") + '</span>' +
          '<span class="card-keywords">' + (card.isReversed ? card.reversedKeywords : card.keywords).join(" · ") + '</span>' +
        '</div>';
      cardsResult.appendChild(el);
    });
  }

  /* ---------- 一键复制 ---------- */
  $("#btn-copy").addEventListener("click", function () {
    var text = promptArea.value;

    // Android WebView 环境：优先调用原生剪贴板桥（navigator.clipboard/execCommand 在 WebView 中不可靠）
    if (window.AndroidBridge && typeof window.AndroidBridge.copyText === "function") {
      var copied = false;
      try { copied = window.AndroidBridge.copyText(text); } catch (e) { copied = false; }
      showToast(copied ? "已复制到剪贴板" : "复制失败，请手动长按选择复制");
      return;
    }

    var ok = false;
    function fallbackCopy() {
      promptArea.focus();
      promptArea.select();
      promptArea.setSelectionRange(0, text.length);
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("已复制到剪贴板");
      }, function () {
        fallbackCopy();
        showToast(ok ? "已复制到剪贴板" : "复制失败，请手动长按选择复制");
      });
    } else {
      fallbackCopy();
      showToast(ok ? "已复制到剪贴板" : "复制失败，请手动长按选择复制");
    }
  });

  /* ---------- 重新测试 ---------- */
  $("#btn-restart").addEventListener("click", function () {
    state.step = 0;
    state.answers = [];
    state.drawn = [];
    progressFill.style.width = "0%";
    showView("welcome");
  });

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

  /* ---------- 初始化 ---------- */
  showView("welcome");
})();
