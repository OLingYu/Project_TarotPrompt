(function () {
  "use strict";
/**
 * settings.js — 声音与震动设置（背景音乐 / 音效 / 震动），全部本地持久化
 * 默认值：背景音乐音量偏小（0.25），音效音量 0.8，音乐/音效/震动全部开启
 */

var SETTINGS_KEY = "tp11_settings";
var DEFAULT_SETTINGS = {
  bgmVolume: 0.25,   // 背景音乐默认音量偏小，作为背景烘托
  sfxVolume: 0.8,    // 音效音量
  musicOn: true,     // 音乐开关
  sfxOn: true,       // 音效开关
  vibrateOn: true    // 震动开关
};

var AUDIO_BASE = "assets/audio/";

var settings = loadSettings();

// 背景音乐：循环播放，音量受控
var bgmAudio = new Audio(AUDIO_BASE + "TarotPrompt_music_one.mp3");
bgmAudio.loop = true;
bgmAudio.preload = "auto";
applyBgm();

function loadSettings() {
  var s = {};
  try {
    var raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) s = JSON.parse(raw) || {};
  } catch (e) { s = {}; }
  var out = {};
  for (var k in DEFAULT_SETTINGS) {
    out[k] = (typeof s[k] === "number" || typeof s[k] === "boolean") ? s[k] : DEFAULT_SETTINGS[k];
  }
  return out;
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
}

function applyBgm() {
  bgmAudio.volume = settings.bgmVolume;
  if (settings.musicOn) {
    var p = bgmAudio.play();
    if (p && p.catch) p.catch(function () { /* 自动播放策略限制，首次交互后重试 */ });
  } else {
    bgmAudio.pause();
  }
}

/** 播放音效（name 为 audio 目录下的文件名） */
function playSfx(name) {
  if (!settings.sfxOn) return;
  try {
    var a = new Audio(AUDIO_BASE + name);
    a.volume = settings.sfxVolume;
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  } catch (e) {}
}

/** 震动反馈（安卓设备支持；桌面端自动忽略） */
function vibrate(pattern) {
  if (!settings.vibrateOn) return;
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

/** 首次用户交互后启动背景音乐 */
function startBgm() {
  if (settings.musicOn) {
    var p = bgmAudio.play();
    if (p && p.catch) p.catch(function () {});
  }
}

function getSettings() { return settings; }

function setSettings(next) {
  settings = next;
  saveSettings();
  applyBgm();
}

function resetSettings() {
  settings = {};
  for (var k in DEFAULT_SETTINGS) settings[k] = DEFAULT_SETTINGS[k];
  saveSettings();
  applyBgm();
  return settings;
}

/** 首次用户手势后自动启动背景音乐（浏览器自动播放策略） */
var gestureBound = false;
function bindFirstGesture() {
  if (gestureBound) return;
  gestureBound = true;
  function start() {
    if (settings.musicOn) {
      var p = bgmAudio.play();
      if (p && p.catch) p.catch(function () {});
    }
    document.removeEventListener("pointerdown", start);
    document.removeEventListener("click", start);
  }
  document.addEventListener("pointerdown", start);
  document.addEventListener("click", start);
}
bindFirstGesture();

  window.TarotPrompt = window.TarotPrompt || {};
  window.TarotPrompt.playSfx = playSfx;
  window.TarotPrompt.vibrate = vibrate;
  window.TarotPrompt.startBgm = startBgm;
  window.TarotPrompt.getSettings = getSettings;
  window.TarotPrompt.setSettings = setSettings;
  window.TarotPrompt.resetSettings = resetSettings;
  window.TarotPrompt.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
})();