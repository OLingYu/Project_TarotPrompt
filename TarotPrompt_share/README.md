# TarotPrompt · 塔罗反思提示词生成器

> 一个纯前端、开源的趣味心理反思小玩具：完成 12 道自我状态问卷，随机抽取 3 张大阿卡纳，一键生成可粘贴到任意大模型的解读提示词。

**⚠️ 娱乐定位：本工具仅供心理反思与娱乐，不属于算命占卜，不预测未来，不构成任何人生决策建议。**

---

## 一、项目介绍与核心玩法

### 这是什么？

TarotPrompt 不内置任何 AI，也不做任何解读推理。它只做三件事：

1. **问卷**：引导用户完成 12 道自我状态单选题（每题 4 个选项）；
2. **抽牌**：从 22 张大阿卡纳中**纯随机**抽取 3 张牌，每张牌独立 50% 概率正位/逆位；
3. **生成**：把「答题结果 + 三张牌的正逆位含义」拼接成一段结构完整的提示词。

用户一键复制提示词，粘贴到任意外部大模型（ChatGPT / Claude / DeepSeek 等），即可获得贴合自身处境的温和解读。

### 核心玩法流程

```
欢迎页 → 12 道单选题 → 抽牌动画（3 张依次翻开）→ 结果页（卡牌展示 + 提示词复制）
```

- 逐题展示，点击选项自动进入下一题，顶部实时显示进度「X / 12」；
- 三张牌不重复，正逆位完全随机；
- 结果页可一键复制完整提示词，或点击「重新测试」回到欢迎页。

---

## 二、本地运行与部署

### 本地运行

项目为纯静态站点，无任何构建步骤、无任何依赖。

**最简单的方式：直接双击打开 `index.html` 即可运行**（已使用经典脚本加载，无需服务器）。

如需使用本地静态服务器（推荐，效果一致）：

```bash
# 方式一：Python
python -m http.server 8080

# 方式二：Node.js（npx）
npx serve .

# 方式三：VS Code Live Server 插件
```

然后浏览器访问 http://localhost:8080 。

> 说明：项目为纯静态站点，所有逻辑均在浏览器本地运行，不收集、不上传任何数据。

### 部署到 GitHub Pages

1. 将整个项目推送到 GitHub 仓库；
2. 仓库 Settings → Pages → Build and deployment → Source 选择「Deploy from a branch」；
3. Branch 选择 `main`，目录选择 `/ (root)`，保存后等待部署完成；
4. 访问 `https://<用户名>.github.io/<仓库名>/` 即可。

### 部署到 Vercel

1. 将项目推送到 GitHub 仓库；
2. 在 Vercel 中 Import 该仓库；
3. Framework Preset 选择「Other」，Build Command 留空，Output Directory 保持默认根目录；
4. 部署完成后即可访问。

---

## 三、技术架构与核心设计原则

### 目录结构

```
tarot-prompt/
├── index.html          # 单页应用入口
├── README.md           # 项目说明文档
├── css/
│   └── style.css       # 全局样式（深色中性风，响应式）
├── js/
│   ├── cards.js        # 22 张大阿卡纳牌库数据（含正逆位含义、美术资源路径）
│   ├── quiz.js         # 12 道问卷题库数据（每题 4 选项，含语义描述）
│   ├── draw.js         # 独立抽牌算法（纯函数，零耦合，挂载到 TarotPrompt.drawRandomCards）
│   ├── prompt.js       # 提示词生成模板（挂载到 TarotPrompt.generatePrompt）
│   └── app.js          # 页面流程与交互控制（欢迎→答题→抽牌→结果）
└── assets/
    └── cards/          # 22 张卡牌美术资源（PNG）
```

### 技术栈

- 原生 HTML + CSS + JavaScript（经典脚本，通过 `window.TarotPrompt` 全局命名空间组织模块），零依赖、零框架、零构建；
- 无后端、无服务端、无数据上传、无外部接口调用，所有逻辑在浏览器本地运行；
- 可整站部署到 GitHub Pages / Vercel 等任意静态托管平台。

### 核心设计原则

**问卷与抽牌完全解耦（最高优先级红线）**

- 抽牌函数 `drawRandomCards(cardPool, count = 3)` 是**独立纯函数**，签名仅接收牌池与抽取数量；
- 函数内部**绝不接收、绝不读取、绝不引用**任何答题数据——问卷答案在物理上无法影响抽牌结果；
- 抽牌使用 Fisher–Yates 洗牌算法 + `Math.random()`，严格均等概率，无加权、无筛选、无条件判断；
- 答题数据只在最后一步作为「提示词内容」注入 `generatePrompt(userAnswers, drawnCards)`，与随机过程完全分离。

**不内置大模型**

- 项目仅生成可复制的 AI 提示词，不做任何解读推理；
- 最终解读由用户自行粘贴到外部大模型完成，本工具不收集、不上传任何数据。

---

## 四、免责声明

- 本工具为**开源趣味心理反思玩具**，卡牌由本地随机算法生成，仅供娱乐与自我反思，**不属于算命占卜，不预测未来**；
- 解读内容由外部大模型生成，不代表任何事实或建议，**不构成任何人生决策建议**；
- 请理性看待随机结果，不要将任何牌面或解读与真实命运挂钩；
- 项目源码与美术资源仅用于学习交流。

---

## 五、开源协议

本项目基于 [MIT License](LICENSE) 开源。

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