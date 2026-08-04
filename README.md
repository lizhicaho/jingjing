# 我想静静

> 我想静静，不想理你。

一个轻量、无框架的敲木鱼静心小游戏。点击木鱼，或按 `Space` / `Enter`，给自己留一点安静。

手机端采用全屏游戏画布：主玩法固定在一屏内，“更多玩法”以底部抽屉打开，不打断敲击节奏。

![技术栈](https://img.shields.io/badge/HTML-CSS-JavaScript-b4502f?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-5c8f69?style=flat-square)

## 在线试玩

- 试玩地址：[https://jingjing.chaogeapi.online](https://jingjing.chaogeapi.online)
- 开源仓库：[github.com/lizhicaho/jingjing](https://github.com/lizhicaho/jingjing)（欢迎 Star）

## 特性

- 零构建、零框架、无第三方脚本或资源依赖，双击 `index.html` 即可游玩
- 鼠标、触屏、空格键和回车键操作；桌面双栏布局、手机全屏单栏布局
- 木鱼、蛙鸣、风铃三种音效；浏览器本地生成音效，不依赖音频服务
- 当日功德、本地连续天数、108 声静心目标、节奏连击与小成就
- 可临时将本地照片贴在木鱼上；图片不会上传或持久化
- 写下烦恼签，完成 108 声后触发“已放下”仪式
- 本地生成并保存静心记录卡
- 根据本机时间自动切换昼夜视觉主题
- 生产环境提供匿名“道场在线 / 今日来客 / 功德积累”实时数据；本地直接打开不影响核心玩法

## 手机端体验

- 页面固定为完整游戏画布，避免浏览器 WebView 高度差异造成卡片留白
- 禁止横向拖动和缩放，木鱼区域保持稳定、易点击
- “更多玩法”为右下角轻量入口；展开后仅抽屉内容可滚动
- 进度条下方展示匿名道场数据，不采集个人身份、照片或烦恼签

## 快速开始

克隆仓库后直接打开 `index.html`，或在项目目录运行任意静态服务器：

```bash
python3 -m http.server 8080
```

再访问 `http://localhost:8080`。

## 道场数据

部署到本仓库提供的 Nginx + PHP-FPM 环境后，进度条下方“道场数据”会通过同源接口实时更新；直接双击本地 `index.html` 时，统计数据保持为 `0`。

生产统计使用匿名设备 ID 去重：

- 道场在线：最近 60 秒仍有心跳的匿名设备数
- 今日来客：上海自然日内去重后的匿名设备数
- 功德积累：服务端限流后记录的有效敲击次数

统计数据保存在服务器 SQLite 文件中；部署步骤见 [统计服务部署说明](README-统计服务.md)。任何密码、数据库连接串或私钥都不能写入前端文件。

## 项目结构

```text
.
├── assets/                         # 本地音效素材
├── index.html                      # 页面结构
├── style.css                       # 页面样式与动画
├── game.js                         # 本地玩法与统计服务调用
├── stats-config.js                 # 同源统计接口配置
├── server/stats.php                # PHP + SQLite 统计接口
└── deploy/                         # Nginx 部署配置
```

## 隐私

- 默认玩法只使用浏览器 `localStorage` 保存本地进度。
- 照片和烦恼签不上传；照片只在当前浏览器会话中存在。
- 启用统计服务后，服务端只保存匿名设备 ID、时间和累计计数，不收集姓名、手机号、照片或烦恼签。

## 开源许可与素材

项目代码以 [MIT License](LICENSE) 发布。

`assets/single-frog-croak.oga` 为 **Single Frog Croak**，作者 Audiodata，使用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可；详细署名与适用范围见 [NOTICE](NOTICE)。

## 参与贡献

欢迎提交 Issue 和 Pull Request。提交前请阅读 [贡献指南](CONTRIBUTING.md) 与 [安全策略](SECURITY.md)。
