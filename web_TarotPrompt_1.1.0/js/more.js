(function () {
  "use strict";
/**
 * more.js — 开始页左上角【更多】按钮弹窗，包含 4 个功能：
 *  ① 编辑题目与回答：修改题目、回答；保存；恢复默认一键还原全部原始题目
 *  ② 查看历史记录：最多 1000 条带时间戳；单条删除 / 一键复制 / 全部导出
 *  ③ 公共查看：已修复 bug 清单、新增功能更新日志
 *  ④ 声音设置：背景音乐音量、音效音量、音乐/音效/震动开关、恢复默认
 */

var QUIZ_KEY = "tp11_quiz";
var OPTION_LETTERS = ["A", "B", "C", "D"];
var PRESS_SFX = "soft_film_key.wav"; // 按下音效

function getQuestions() {
  // 优先使用用户自定义题目（本地持久化），否则用原始默认题库
  try {
    var raw = localStorage.getItem(QUIZ_KEY);
    if (raw) {
      var qs = JSON.parse(raw);
      if (Array.isArray(qs) && qs.length) return qs;
    }
  } catch (e) {}
  return window.TarotPrompt.quizQuestions;
}

function saveQuestions(qs) {
  try { localStorage.setItem(QUIZ_KEY, JSON.stringify(qs)); } catch (e) {}
}

function restoreDefaultQuestions() {
  try { localStorage.removeItem(QUIZ_KEY); } catch (e) {}
}

/* ---------------- 弹窗控制 ---------------- */
var overlay = document.getElementById("modal-more");
var closeBtn = document.getElementById("modal-close");
var tabBtns = Array.prototype.slice.call(document.querySelectorAll(".modal-tab"));
var panes = {
  edit: document.getElementById("pane-edit"),
  history: document.getElementById("pane-history"),
  public: document.getElementById("pane-public"),
  sound: document.getElementById("pane-sound")
};

function openModal() {
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  switchTab("edit");
}

function closeModal() {
  overlay.classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("btn-more").addEventListener("click", function () {
  window.TarotPrompt.playSfx(PRESS_SFX);
  window.TarotPrompt.vibrate(12);
  openModal();
});

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", function (e) {
  if (e.target === overlay) closeModal();
});

tabBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    window.TarotPrompt.playSfx(PRESS_SFX);
    switchTab(btn.getAttribute("data-tab"));
  });
});

function switchTab(name) {
  tabBtns.forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-tab") === name);
  });
  for (var k in panes) {
    panes[k].classList.toggle("hidden", k !== name);
  }
  if (name === "edit") renderEdit();
  if (name === "history") renderHistory();
  if (name === "public") renderPublic();
  if (name === "sound") renderSound();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------------- ① 编辑题目与回答 ---------------- */
function renderEdit() {
  var qs = getQuestions();
  var html = '<div class="edit-toolbar">' +
    '<button type="button" class="btn-secondary btn-small" id="edit-save">保存</button>' +
    '<button type="button" class="btn-ghost btn-small" id="edit-restore">恢复默认</button>' +
    '</div>' +
    '<p class="edit-tip">修改题目与回答后点击「保存」；点击「恢复默认」一键还原全部原始题目。</p>';

  qs.forEach(function (q, qi) {
    html += '<div class="edit-item" data-qi="' + qi + '">';
    html += '<div class="edit-row"><span class="edit-tag">Q' + (qi + 1) + '</span>' +
            '<input class="edit-q" data-qi="' + qi + '" value="' + escapeHtml(q.question) + '"></div>';
    q.options.forEach(function (opt, oi) {
      html += '<div class="edit-row"><span class="edit-tag">' + OPTION_LETTERS[oi] + '</span>' +
              '<input class="edit-opt" data-qi="' + qi + '" data-oi="' + oi + '" value="' + escapeHtml(opt.desc) + '"></div>';
    });
    html += '</div>';
  });

  panes.edit.innerHTML = html;

  document.getElementById("edit-save").addEventListener("click", function () {
    var items = Array.prototype.slice.call(panes.edit.querySelectorAll(".edit-item"));
    var out = [];
    var invalid = false;
    items.forEach(function (item) {
      var qText = item.querySelector(".edit-q").value.trim();
      var opts = [];
      item.querySelectorAll(".edit-opt").forEach(function (inp) {
        var v = inp.value.trim();
        if (v) opts.push({ value: OPTION_LETTERS[opts.length], desc: v });
      });
      if (!qText || opts.length === 0) { invalid = true; return; }
      out.push({ id: out.length + 1, question: qText, options: opts });
    });
    if (invalid) {
      window.TarotPrompt.showToast("题目或选项不能为空，请补全后再保存");
      return;
    }
    saveQuestions(out);
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.vibrate(15);
    window.TarotPrompt.showToast("题目与回答已保存");
  });

  document.getElementById("edit-restore").addEventListener("click", function () {
    restoreDefaultQuestions();
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.vibrate(15);
    window.TarotPrompt.showToast("已恢复全部原始题目");
    renderEdit();
  });
}

/* ---------------- ② 查看历史记录 ---------------- */
function renderHistory() {
  var list = window.TarotPrompt.loadHistory();
  var html = '<div class="edit-toolbar">' +
    '<button type="button" class="btn-secondary btn-small" id="hist-export">导出全部</button>' +
    '<button type="button" class="btn-ghost btn-small" id="hist-clear">清空记录</button>' +
    '</div>' +
    '<p class="edit-tip">本地最多存储 ' + window.TarotPrompt.HISTORY_MAX + ' 条提示词，超出自动丢弃最早记录；每条带时间戳。</p>';

  if (!list.length) {
    html += '<p class="hist-empty">暂无历史记录，完成一次占卜后会自动保存。</p>';
  } else {
    html += '<div class="hist-list">';
    // 倒序：最新在前
    for (var i = list.length - 1; i >= 0; i--) {
      var r = list[i];
      html += '<div class="hist-item" data-ts="' + r.ts + '">' +
        '<div class="hist-head"><span class="hist-time">' + escapeHtml(r.time) + '</span>' +
        '<span class="hist-cards">' + escapeHtml(r.cards) + '</span></div>' +
        '<div class="hist-actions">' +
        '<button type="button" class="btn-ghost btn-mini hist-copy">一键复制</button>' +
        '<button type="button" class="btn-ghost btn-mini hist-del">删除</button>' +
        '</div></div>';
    }
    html += '</div>';
  }

  panes.history.innerHTML = html;

  var expBtn = document.getElementById("hist-export");
  if (expBtn) expBtn.addEventListener("click", function () {
    var ok = window.TarotPrompt.exportHistory();
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.showToast(ok ? "已导出全部历史记录" : "暂无记录可导出");
  });

  var clearBtn = document.getElementById("hist-clear");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    window.TarotPrompt.clearHistory();
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.showToast("已清空全部历史记录");
    renderHistory();
  });

  panes.history.querySelectorAll(".hist-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".hist-item");
      var ts = Number(item.getAttribute("data-ts"));
      var rec = null;
      for (var j = list.length - 1; j >= 0; j--) {
        if (list[j].ts === ts) { rec = list[j]; break; }
      }
      if (!rec) return;
      copyText(rec.prompt);
    });
  });

  panes.history.querySelectorAll(".hist-del").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".hist-item");
      var ts = Number(item.getAttribute("data-ts"));
      window.TarotPrompt.deleteHistoryRecord(ts);
      window.TarotPrompt.playSfx(PRESS_SFX);
      window.TarotPrompt.showToast("已删除该条记录");
      renderHistory();
    });
  });
}

function copyText(text) {
  var ok = false;
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(function () {
      window.TarotPrompt.showToast("提示词已复制");
    }, function () {
      fallback();
      window.TarotPrompt.showToast(ok ? "提示词已复制" : "复制失败，请手动长按选择复制");
    });
  } else {
    fallback();
    window.TarotPrompt.showToast(ok ? "提示词已复制" : "复制失败，请手动长按选择复制");
  }
}

/* ---------------- ③ 公共查看 ---------------- */
function renderPublic() {
  panes.public.innerHTML =
    '<div class="pub-section">' +
      '<h3 class="pub-title">✦ 已修复 Bug 清单（v1.1.0）</h3>' +
      '<ul class="pub-list">' +
        '<li>修复 1.0.0 中抽牌动画与结果页偶发错位的问题</li>' +
        '<li>修复移动端长按无法正常触发的问题（新增 Pointer 事件兼容触摸与鼠标）</li>' +
        '<li>修复答题页快速连点时可能跳过题目的问题</li>' +
        '<li>修复历史记录超过上限时未正确丢弃最早记录的问题</li>' +
        '<li>修复部分浏览器中背景音乐无法自动播放、音量过大的问题</li>' +
      '</ul>' +
    '</div>' +
    '<div class="pub-section">' +
      '<h3 class="pub-title">✦ 新增功能更新日志（v1.1.0）</h3>' +
      '<ul class="pub-list">' +
        '<li>全部美术资源替换为全新塔罗占卜画风（22 张大阿卡纳）</li>' +
        '<li>新增 AI 提示词模板生成器：三张牌严格按「过去 / 现在 / 未来」顺序串联，整体文案具备命运揭示、塔罗占卜氛围感</li>' +
        '<li>新增完整交互动画流程：长按收集 22 张卡牌（跟随光标/手指、堆叠层叠）→ 洗牌三次 → 数字选号抽牌（纯动画，不改随机结果）→ 逐张手动翻牌 → 点击进入结果页</li>' +
        '<li>答题新增第 5 选项「以上都不是，请输入」：点击激活输入框，仅点击「完成提交」才进入下一题</li>' +
        '<li>新增【更多】弹窗：编辑题目与回答（保存/恢复默认）、历史记录（1000 条上限/删除/复制/导出）、公共查看、声音设置</li>' +
        '<li>全流程音效 + 安卓设备震动反馈 + 本地持久化设置与恢复默认</li>' +
      '</ul>' +
    '</div>';
}

/* ---------------- ④ 声音设置 ---------------- */
function renderSound() {
  var s = window.TarotPrompt.getSettings();
  var bgmPct = Math.round(s.bgmVolume * 100);
  var sfxPct = Math.round(s.sfxVolume * 100);

  panes.sound.innerHTML =
    '<div class="sound-row">' +
      '<label class="sound-label" for="snd-bgm">背景音乐音量</label>' +
      '<input type="range" class="sound-range" id="snd-bgm" min="0" max="100" value="' + bgmPct + '">' +
      '<span class="sound-val" id="snd-bgm-val">' + bgmPct + '%</span>' +
    '</div>' +
    '<div class="sound-row">' +
      '<label class="sound-label" for="snd-sfx">音效音量</label>' +
      '<input type="range" class="sound-range" id="snd-sfx" min="0" max="100" value="' + sfxPct + '">' +
      '<span class="sound-val" id="snd-sfx-val">' + sfxPct + '%</span>' +
    '</div>' +
    '<div class="sound-row">' +
      '<span class="sound-label">背景音乐</span>' +
      '<button type="button" class="switch' + (s.musicOn ? " on" : "") + '" id="snd-music" role="switch" aria-checked="' + (s.musicOn ? "true" : "false") + '">' +
        '<span class="switch-knob"></span><span class="switch-text">' + (s.musicOn ? "开" : "关") + '</span>' +
      '</button>' +
    '</div>' +
    '<div class="sound-row">' +
      '<span class="sound-label">音效</span>' +
      '<button type="button" class="switch' + (s.sfxOn ? " on" : "") + '" id="snd-sfx-on" role="switch" aria-checked="' + (s.sfxOn ? "true" : "false") + '">' +
        '<span class="switch-knob"></span><span class="switch-text">' + (s.sfxOn ? "开" : "关") + '</span>' +
      '</button>' +
    '</div>' +
    '<div class="sound-row">' +
      '<span class="sound-label">震动</span>' +
      '<button type="button" class="switch' + (s.vibrateOn ? " on" : "") + '" id="snd-vib" role="switch" aria-checked="' + (s.vibrateOn ? "true" : "false") + '">' +
        '<span class="switch-knob"></span><span class="switch-text">' + (s.vibrateOn ? "开" : "关") + '</span>' +
      '</button>' +
    '</div>' +
    '<div class="sound-row">' +
      '<button type="button" class="btn-secondary btn-small" id="snd-reset">恢复默认</button>' +
      '<span class="sound-val" style="text-align:left; min-width:0; color:#6d6488; font-size:12px;">重置全部声音与震动配置</span>' +
    '</div>';

  var bgmRange = document.getElementById("snd-bgm");
  bgmRange.addEventListener("input", function () {
    var s2 = window.TarotPrompt.getSettings();
    s2.bgmVolume = Number(bgmRange.value) / 100;
    window.TarotPrompt.setSettings(s2);
    document.getElementById("snd-bgm-val").textContent = bgmRange.value + "%";
  });

  var sfxRange = document.getElementById("snd-sfx");
  sfxRange.addEventListener("input", function () {
    var s2 = window.TarotPrompt.getSettings();
    s2.sfxVolume = Number(sfxRange.value) / 100;
    window.TarotPrompt.setSettings(s2);
    document.getElementById("snd-sfx-val").textContent = sfxRange.value + "%";
  });

  bindSwitch("snd-music", "musicOn");
  bindSwitch("snd-sfx-on", "sfxOn");
  bindSwitch("snd-vib", "vibrateOn");

  document.getElementById("snd-reset").addEventListener("click", function () {
    window.TarotPrompt.resetSettings();
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.showToast("已恢复默认声音与震动配置");
    renderSound();
  });
}

function bindSwitch(id, key) {
  var btn = document.getElementById(id);
  btn.addEventListener("click", function () {
    var s = window.TarotPrompt.getSettings();
    s[key] = !s[key];
    window.TarotPrompt.setSettings(s);
    renderSwitch(btn, s[key]);
    window.TarotPrompt.playSfx(PRESS_SFX);
    window.TarotPrompt.vibrate(15);
  });
}

/** 渲染开关状态：开启=金色+旋钮右移+显示“开”；关闭=暗色+旋钮左移+显示“关” */
function renderSwitch(btn, on) {
  btn.classList.toggle("on", on);
  btn.setAttribute("aria-checked", on ? "true" : "false");
  var textEl = btn.querySelector(".switch-text");
  if (textEl) textEl.textContent = on ? "开" : "关";
}

  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.getQuestions = getQuestions;
  window.TarotPrompt.saveQuestions = saveQuestions;
  window.TarotPrompt.restoreDefaultQuestions = restoreDefaultQuestions;
})();