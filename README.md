# ✦ TarotPrompt · 塔罗占卜提示词生成器

> 一个纯前端、零依赖、开源免费的趣味心理反思小工具：完成 12 道自我状态问卷，抽取 3 张大阿卡纳命运之牌，一键生成可粘贴到任意大模型（ChatGPT / Claude / DeepSeek…）的占卜解读提示词。

![version](https://img.shields.io/badge/version-1.1.0-gold) ![platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-6d6488) ![license](https://img.shields.io/badge/license-MIT-blue) ![offline](https://img.shields.io/badge/offline-100%25%20local-purple)

**⚠️ 娱乐定位：本工具仅供心理反思与娱乐，不属于算命占卜，不预测未来，不构成任何人生决策建议。**

---

## ✨ 这是什么

TarotPrompt **不内置任何 AI，也不做任何解读推理**，它只做三件事：

1. **问卷**：引导用户完成 12 道自我状态单选题（每题 4 个选项，第 5 选项可自定义输入）；
2. **抽牌**：从 22 张大阿卡纳中**纯随机**抽取 3 张牌，每张牌独立 50% 概率正位 / 逆位；
3. **生成**：把「答题结果 + 三张牌的正逆位含义」拼接成一段结构完整、具备命运揭示氛围的提示词。

用户一键复制提示词，粘贴到任意外部大模型，即可获得贴合自身处境的温和解读。

**全程离线运行：不联网、不收集、不上传任何数据。**

---

## 🎴 占卜流程

```
欢迎页 → 12 道自我状态问卷
      → ① 长按收集 22 张卡牌（跟随光标/手指，堆叠层叠）
      → ② 洗牌三次
      → ③ 数字选号抽牌（点击 0-21 任意数字，纯仪式动画）
      → ④ 逐张手动翻牌
      → 结果页：一键生成并复制命运三牌解读提示词
```

- 三张牌在答题结束时由本地随机算法**一次确定**：第一张 = 过去，第二张 = 现在，第三张 = 未来；
- **数字选号只做动画，不改变抽牌结果**——点哪个数字，都不影响抽到什么牌；
- 结果页可一键复制完整提示词，或点击「重新测试」回到欢迎页。

---

## 🚀 v1.1.0 更新亮点

### ✦ 新增功能

- **全新塔罗画风美术**：22 张大阿卡纳全部替换为全新塔罗占卜画风卡牌；
- **完整仪式感动画流程**：长按收集 22 张卡牌（跟随光标/手指、堆叠层叠）→ 洗牌三次 → 数字选号抽牌 → 逐张手动翻牌；
- **AI 提示词模板生成器**：三张牌严格按「过去 / 现在 / 未来」顺序串联，整体文案具备命运揭示、塔罗占卜氛围感（角色设定 + 答题内容 + 牌面信息 + 6 条解读引导，600-800 字）；
- **答题第 5 选项**：「以上都不是，请输入」——点击激活输入框，仅点击【完成提交】才进入下一题；
- **【更多】面板（左上角 ☰）**：
  - ① 编辑题目与回答：修改题目与选项，保存后生效，可一键恢复默认；
  - ② 历史记录：本地最多 1000 条（超出自动丢弃最早记录），带时间戳，支持单条复制 / 删除、全部导出；
  - ③ 公共查看：已修复 Bug 清单 + 更新日志；
  - ④ 声音设置：背景音乐音量、音效音量、音乐 / 音效 / 震动开关，本地持久化，一键恢复默认；
- **全流程音效 + 震动反馈**：翻牌、洗牌、落牌、纸笺、背景音乐，安卓设备同步震动；
- **Pointer 事件兼容**：同时支持移动端触摸与 PC 鼠标操作。

### 🐛 修复的问题

- 修复 1.0.0 中抽牌动画与结果页偶发错位的问题；
- 修复移动端长按无法正常触发的问题（新增 Pointer 事件兼容触摸与鼠标）；
- 修复答题页快速连点时可能跳过题目的问题；
- 修复历史记录超过上限时未正确丢弃最早记录的问题；
- 修复部分浏览器中背景音乐无法自动播放、音量过大的问题。

> **兼容性承诺**：抽牌算法与 1.0.0 完全一致（Fisher-Yates + Math.random()，正逆位各 50%），未做任何改动——旧版本抽到的牌，在新版本中依然会抽到。

---

## 📱 双端版本

### 🌐 Web 版

- 纯静态站点，**双击 `index.html` 即可运行**，无构建、无依赖、无需服务器；
- 可一键部署到 GitHub Pages / Vercel 等任意静态托管平台；
- 完整目录：`web_TarotPrompt_1.1.0/`。

### 🤖 Android 版

- 将 Web 版以**原生 WebView 离线打包**方式移植为 Android App，打开即用、全程离线；
- 仅申请 **VIBRATE** 一个权限，**无网络权限**；
- 一键复制通过原生剪贴板桥 `AndroidBridge.copyText()` 实现，WebView 中稳定可靠；
- 系统返回键适配（先关弹窗 → 回到欢迎页 → 退到后台）、屏幕旋转不丢失问卷进度、沉浸式深色主题；
- 适配最低 **Android 7.0（minSdk 24）**，目标 Android 14（targetSdk 34）；
- 完整目录：`android_TaroPrompt_1.1.0/`（内含可直接安装的 APK）。

### 双端对比

| 项目 | Web 版 | Android 版 |
| --- | --- | --- |
| 运行载体 | 浏览器（任意设备） | 原生 WebView 离线加载，独立 App |
| 一键复制 | 浏览器剪贴板 | 原生剪贴板桥（更稳定） |
| 历史记录导出 | 下载 txt 文件 | 导出文本复制到剪贴板 |
| 震动反馈 | 支持的浏览器生效 | 原生 VIBRATE 权限，稳定生效 |
| 权限要求 | 无 | 仅 VIBRATE，无网络权限 |
| 离线可用 | ✅ | ✅（飞行模式可用） |

---

## 🧭 核心设计原则（全局红线）

**① 问卷与抽牌完全解耦（最高优先级）**

- 抽牌函数 `drawRandomCards(cardPool, 3)` 是**独立纯函数**，签名仅接收牌池与抽取数量；
- 函数内部**绝不接收、绝不读取、绝不引用**任何答题数据——问卷答案在物理上无法影响抽牌结果；
- 抽牌使用 Fisher–Yates 洗牌算法 + `Math.random()`，严格均等概率，无加权、无筛选、无条件判断；
- 答题数据只在最后一步作为「提示词内容」注入 `generatePrompt(userAnswers, drawnCards)`，与随机过程完全分离。

**② 不内置大模型**

- 项目仅生成可复制的 AI 提示词，不做任何解读推理；
- 最终解读由用户自行粘贴到外部大模型完成，本工具不收集、不上传任何数据。

**③ 公平与诚实**

- 数字选号是纯仪式动画，不改变随机结果；
- 卡牌正逆位各 50% 均等概率，无任何加权；
- 每次占卜的结果与答案、与操作顺序无关。

---

## 🛠 技术栈

| 端 | 技术 |
| --- | --- |
| Web | 原生 HTML + CSS + JavaScript（经典脚本，`window.TarotPrompt` 全局命名空间），零框架、零构建、零依赖 |
| Android | Kotlin + AndroidX（AppCompatActivity / activity-ktx / material），Gradle 8.7 + AGP 8.5.2，compileSdk / targetSdk 34，minSdk 24 |

- 网页资源：`assets/cards/`（22 张卡牌 PNG）、`assets/audio/`（翻牌 / 洗牌 / 落牌 / 纸笺 / 背景音乐）；
- Android 侧 `js/app.js`、`js/more.js`、`js/history.js` 额外包含原生桥、返回键与导出适配代码。

---

## 📂 目录结构

```
Project_TarotPrompt/
├── web_TarotPrompt_1.1.0/      # 🌐 Web 版 v1.1.0（纯静态，双击 index.html 即用）
│   ├── index.html              # 单页应用入口
│   ├── css/style.css           # 全局样式（深色中性风，响应式）
│   ├── js/
│   │   ├── cards.js            # 22 张大阿卡纳牌库（含正逆位含义、美术资源路径）
│   │   ├── quiz.js             # 12 道问卷题库（含第 5 选项自定义输入）
│   │   ├── draw.js             # 独立抽牌算法（纯函数，Fisher-Yates）
│   │   ├── prompt.js           # 提示词生成模板（过去/现在/未来串联）
│   │   ├── app.js              # 页面流程与交互控制
│   │   ├── history.js          # 历史记录（1000 条上限）
│   │   ├── settings.js         # 声音/震动设置（本地持久化）
│   │   └── more.js             # 【更多】弹窗（编辑/历史/公共查看/声音设置）
│   └── assets/
│       ├── cards/              # 22 张全新塔罗画风卡牌
│       └── audio/              # 全流程音效 + 背景音乐
│
├── android_TaroPrompt_1.1.0/   # 🤖 Android 版 v1.1.0（Kotlin + WebView 离线打包）
│   ├── app/src/main/           # MainActivity.kt（WebView 宿主 + 原生剪贴板桥）
│   ├── APK/                    # 可直接安装的 app-debug.apk / app-release.apk
│   ├── gradlew(.bat)           # Gradle Wrapper
│   └── README.md               # Android 版详细说明（构建/签名/安装）
│
├── android_TaroPrompt/         # 旧版 Android 工程（v1.0.0）
├── TarotPrompt_share/          # v1.0.0 网页共享版（含 LICENSE）
└── README.md                   # 本文件
```

---

## 🚀 快速开始

### Web 版

```bash
# 方式一：直接双击 web_TarotPrompt_1.1.0/index.html
# 方式二：本地静态服务器
python -m http.server 8080        # 或 npx serve .
```

部署到 GitHub Pages：仓库 Settings → Pages → Source 选择 `Deploy from a branch` → Branch 选 `main`、目录选 `/ (root)`，保存后访问 `https://<用户名>.github.io/<仓库名>/`。

### Android 版

```bash
# 方式一：直接安装
# 将 android_TaroPrompt_1.1.0/APK/app-release.apk 复制到手机点击安装
# （如提示「未知来源」，请在设置中允许）

# 方式二：源码构建（需要 JDK 17 + Android SDK）
cd android_TaroPrompt_1.1.0
gradlew.bat assembleRelease       # 产物：app/build/outputs/apk/release/app-release.apk
```

> 注意：`release-keystore.jks` 为随工程交付的演示签名密钥，仅用于本地发布构建；若需上架应用商店，请自行生成正式密钥（详见 `android_TaroPrompt_1.1.0/README.md`）。

---

## 🖼 截图

<!-- 待补充：欢迎页 / 问卷页 / 收集卡牌 / 翻牌页 / 结果页 / 更多面板 截图 -->

---

## 📜 版本历史

### v1.1.0（当前）— 2025

**新增**
- 全新塔罗画风 22 张大阿卡纳美术资源
- 完整仪式感动画流程：长按集牌 → 洗牌三次 → 数字选号 → 逐张翻牌
- AI 提示词模板生成器（过去 / 现在 / 未来 三牌串联，命运揭示氛围）
- 答题第 5 选项「以上都不是，请输入」
- 【更多】面板：编辑题目与回答 / 历史记录（1000 条）/ 公共查看 / 声音设置
- 全流程音效 + 安卓震动反馈 + 设置本地持久化
- Pointer 事件兼容触摸与鼠标
- **Android 版发布**：Kotlin + WebView 离线打包，仅 VIBRATE 权限，无网络权限

**修复**
- 抽牌动画与结果页偶发错位
- 移动端长按无法触发
- 答题快速连点跳过题目
- 历史记录超上限未正确丢弃
- 部分浏览器背景音乐自动播放 / 音量异常

### v1.0.0 — 2025

- 基础版：12 道问卷 + 随机抽取 3 张大阿卡纳 + 一键生成解读提示词
- 问卷与抽牌完全解耦的核心设计（Fisher-Yates，正逆位各 50%）

---

## ⚖️ 免责声明

- 本工具为**开源趣味心理反思玩具**，卡牌由本地随机算法生成，仅供娱乐与自我反思，**不属于算命占卜，不预测未来**；
- 解读内容由外部大模型生成，不代表任何事实或建议，**不构成任何人生决策建议**；
- 请理性看待随机结果，不要将任何牌面或解读与真实命运挂钩；
- 项目源码与美术资源仅用于学习交流。

---

## 📄 开源协议

本项目基于 [MIT License](TarotPrompt_share/LICENSE) 开源。

```text
MIT License

Copyright (c) 2025 TarotPrompt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*祝你好运 ✦ 愿每一次反思都更接近真实的自己。*
