(function () {
  "use strict";
/**
 * history.js — 提示词历史记录（本地存储）
 * 约束：最多 1000 条，超过上限自动丢弃最早记录；
 * 每条记录带时间戳；支持单条删除、单条一键复制、全部导出。
 */

var HISTORY_KEY = "tp11_history";
var MAX_RECORDS = 1000;

function loadHistory() {
  try {
    var raw = localStorage.getItem(HISTORY_KEY);
    var list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) { return []; }
}

function saveHistory(list) {
  // 超出上限丢弃最早记录
  if (list.length > MAX_RECORDS) list = list.slice(list.length - MAX_RECORDS);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch (e) {}
}

/** 新增一条记录 { ts, time, cards, prompt } */
function addHistoryRecord(record) {
  var list = loadHistory();
  list.push(record);
  saveHistory(list);
  return list;
}

function deleteHistoryRecord(ts) {
  var list = loadHistory().filter(function (r) { return r.ts !== ts; });
  saveHistory(list);
  return list;
}

function clearHistory() {
  saveHistory([]);
}

/** 导出全部记录为 txt 文件下载 */
function exportHistory() {
  var list = loadHistory();
  if (!list.length) return false;
  var lines = list.map(function (r, i) {
    return "【记录 " + (i + 1) + " · " + r.time + "】\n牌面：" + r.cards + "\n提示词：\n" + r.prompt;
  });
  var text = "TarotPrompt v1.1.0 历史记录导出（共 " + list.length + " 条）\n\n" + lines.join("\n\n----------------------\n\n");
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "TarotPrompt_history_" + Date.now() + ".txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  return true;
}

  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.loadHistory = loadHistory;
  window.TarotPrompt.addHistoryRecord = addHistoryRecord;
  window.TarotPrompt.deleteHistoryRecord = deleteHistoryRecord;
  window.TarotPrompt.clearHistory = clearHistory;
  window.TarotPrompt.exportHistory = exportHistory;
  window.TarotPrompt.HISTORY_MAX = MAX_RECORDS;
})();
