# TarotPrompt · Android 版（v1.1.0）

> TarotPrompt 塔罗占卜提示词生成器的 Android 适配版：将纯前端 Web 应用（v1.1.0）以 **原生 WebView 离线打包** 方式移植为 Android App。
> 打开即用、无需联网、无需任何危险权限，问卷与抽牌逻辑、卡牌数据、美术资源与网页版完全一致。

**⚠️ 娱乐定位（与原版一致）：本工具仅供心理反思与娱乐，不属于算命占卜，不预测未来，不构成任何人生决策建议。**

---

## 一、这是什么

- 完整 1.1.0 占卜流程：12 道自我状态问卷（含第 5 选项自定义输入）→ 长按收集 22 张卡牌 → 洗牌三次 → 数字选号抽牌（纯仪式动画）→ 逐张翻牌 → 一键复制命运三牌解读提示词；
- 三张牌由本地随机算法一次确定（过去 / 现在 / 未来），数字选号不改变抽牌结果；
- 新增【更多】面板：编辑题目与回答、历史记录（1000 条上限）、公共查看、声音设置（音乐/音效/震动）；
- 全新塔罗画风卡牌 + 全流程音效 + 震动反馈；
- 本 App **不内置任何 AI**，只负责生成提示词；**不联网、不上传、不收集任何数据**；
- 卡牌图片、音效与逻辑全部打包在 APK 内，飞行模式也能完整使用。

## 二、与网页版的适配说明

| 项目 | 网页版 | Android 版适配 |
| --- | --- | --- |
| 运行载体 | 浏览器 | 原生 WebView 加载打包在 assets 中的离线网页 |
| 一键复制 | navigator.clipboard / execCommand | 新增 `AndroidBridge.copyText()` 原生剪贴板桥（app.js 结果页复制 + more.js 历史记录复制均走桥） |
| 历史记录导出 | Blob 下载 txt | Android 无下载界面，改为复制导出文本到剪贴板并 Toast 提示 |
| 系统返回键 | 浏览器前进/后退 | 先关闭「更多」弹窗 → 再回到欢迎页；欢迎页按返回键退到后台 |
| 震动反馈 | navigator.vibrate | Manifest 申请 VIBRATE 权限，WebView 中震动正常工作 |
| 联网/权限 | 无 | 仅 VIBRATE 一个权限，无网络权限 |
| 屏幕旋转 | 自动重排 | `configChanges` 接管，旋转不丢失问卷进度 |
| 状态栏 | 浏览器控件 | 沉浸式深色主题（`enableEdgeToEdge`），与网页 `#14121A` 背景一致 |

### 技术栈

- Kotlin + AndroidX（AppCompatActivity、activity-ktx、material）；
- Gradle 8.7 + Android Gradle Plugin 8.5.2，compileSdk/targetSdk 34，minSdk 24（Android 7.0 及以上）；
- 应用图标：深底金色四角星（自适应图标 + 传统 PNG 均提供）。

## 三、目录结构

```
android_TaroPrompt_1.1.0/
├── app/
│   ├── build.gradle              # 应用构建配置（含 release 签名，versionName 1.1.0）
│   └── src/main/
│       ├── AndroidManifest.xml   # 仅 VIBRATE 权限
│       ├── java/com/tarotprompt/app/MainActivity.kt   # WebView 宿主 + 原生桥
│       ├── res/                  # 主题、图标、布局
│       └── assets/               # ★ 网页版资源（index.html / css / js / assets/cards / assets/audio）
├── build.gradle / settings.gradle / gradle.properties
├── gradlew(.bat)                 # Gradle Wrapper（可离线用本机 Gradle 构建）
├── local.properties              # 本机 SDK 路径（换机器后按需修改）
├── release-keystore.jks          # release 签名密钥（演示用，见第五节）
└── README.md
```

> 网页资源目录 `app/src/main/assets/` 与源项目 `web_TarotPrompt_1.1.0/` 保持一致；
> `js/app.js`、`js/more.js`、`js/history.js` 额外加入了 Android 桥、返回键与导出适配代码。

## 四、构建与安装

### 方式一：Android Studio（推荐）

1. Android Studio（Hedgehog 或更新）→ Open → 选择本目录；
2. 等待 Gradle Sync 完成（首次需下载依赖）；
3. Run ▶ 到模拟器/真机，或 Build → Build App Bundle(s)/APK(s) → Build APK(s)；
4. 产物路径：`app/build/outputs/apk/debug/app-debug.apk` 或 `.../release/app-release.apk`。

### 方式二：命令行（需要 JDK 17 与 Android SDK）

```bash
# 设置环境（示例）
set JAVA_HOME=C:\path\to\jdk-17
set ANDROID_HOME=C:\path\to\android-sdk

# 构建 Debug 包
gradlew.bat assembleDebug
# 构建签名 Release 包
gradlew.bat assembleRelease
```

### 安装到手机

- 开启「开发者选项 → USB 调试」，连接手机后：`adb install app-debug.apk`；
- 或直接把 APK 复制到手机，点击安装（需允许「安装未知来源应用」）。

## 五、签名密钥说明

- `release-keystore.jks`：随工程交付的**演示密钥**（alias：`tarotprompt`，密码：`tarotprompt`），仅用于本地发布构建；
- 若需上架应用商店，请**自行生成正式密钥**并替换 `app/build.gradle` 中的 signingConfig。

## 六、如何更新网页内容

网页资源位于 `app/src/main/assets/`。更新方法：

1. 把新版网页的 `index.html`、`css/`、`js/`、`assets/` 覆盖到该目录（注意保留 `js/app.js`、`js/more.js`、`js/history.js` 中的 Android 桥代码）；
2. 重新构建 APK 即可。

## 七、免责声明与开源协议

- 本工具为开源趣味心理反思玩具，卡牌由本地随机算法生成，仅供娱乐与自我反思，**不属于算命占卜，不预测未来**；
- 解读内容由外部大模型生成，不构成任何人生决策建议；
- 源码与美术资源仅用于学习交流，遵循原项目 MIT License。

*祝你好运 ✦ 愿每一次反思都更接近真实的自己。*
