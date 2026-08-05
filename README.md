# 我想静静

> 轻触一下木鱼，给自己几分钟安静。

「我想静静」是一个零框架、低干扰的数字禅房。它不追求游戏化的奖励或社交打扰；打开页面后，只需跟随自己的节奏，轻轻敲一下木鱼。

![HTML](https://img.shields.io/badge/HTML-CSS-JavaScript-D78B47?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-8E8A84?style=flat-square)

## 在线试玩

- 试玩地址：[jingjing.chaogeapi.online](https://jingjing.chaogeapi.online)
- 开源仓库：[github.com/lizhicaho/jingjing](https://github.com/lizhicaho/jingjing)（欢迎 Star）

## 产品体验

- 木鱼是页面唯一主角：鼠标、触屏、`Space` 或 `Enter` 都可以轻触敲击。
- 每日进度保存在当前浏览器；达到 108 声时完成当日静心。
- 支持木鱼、蛙鸣、风铃三种轻量音效；不依赖在线音频服务。
- 手机端为整屏沉浸画布，PC 端保持居中、留白与克制的视觉节奏。
- 「更多」收纳照片木鱼、烦恼签、静心印记、静心道场与设置，避免打断首页的安静感。
- 可把本地照片临时融合至木鱼；照片不上传、不持久化。
- 烦恼签与静心印记只保留在本地，帮助记录而非制造打卡压力。

## 静心道场

生产环境可显示匿名的道场陪伴数据：此刻静心者、来过的静心者与木鱼回响数。

- 统计仅使用匿名浏览器设备 ID，不需要登录。
- 不采集姓名、手机号、照片、烦恼签或其他身份信息。
- 本地直接打开 `index.html` 时，统计数据会显示为 `0`，但敲击、进度与本地记录均可正常使用。

统计口径及 PHP + SQLite 部署方式见 [统计服务部署说明](README-统计服务.md)。

## 快速开始

项目没有构建步骤或运行依赖。克隆后可直接打开 `index.html`；若需本地 HTTP 预览：

```bash
python3 -m http.server 8080
```

然后访问 [http://localhost:8080](http://localhost:8080)。

## 项目结构

```text
.
├── assets/                         # 站点图标与本地音效素材
├── index.html                      # 首页与更多功能面板
├── style.css                       # 基础视觉与交互样式
├── v2-layout.css                   # 数字禅房响应式布局
├── game.js                         # 敲击、音效、进度、记录与统计调用
├── stats-config.js                 # 同源统计接口配置
├── server/stats.php                # PHP + SQLite 匿名统计接口
├── privacy.html                    # 隐私政策
├── terms.html                      # 服务条款
├── accessibility.html              # 无障碍声明
├── changelog.html                  # 更新日志
└── deploy/                         # Nginx 部署配置示例
```

## 隐私与安全

- 默认玩法仅使用浏览器 `localStorage` 存储当天进度与静心印记。
- 图片仅在当前浏览器会话使用；烦恼签不会上传。
- 统计数据库、服务器配置、证书私钥、密码和 Token 均不得进入仓库。
- 线上站点的隐私政策、服务条款与无障碍声明可从「更多 → 设置」查看。

## 开源许可与素材

项目代码以 [MIT License](LICENSE) 发布。

`assets/single-frog-croak.oga` 为 **Single Frog Croak**，作者 Audiodata，使用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可；详细署名见 [NOTICE](NOTICE)。

## 参与贡献

欢迎通过 [Issues](https://github.com/lizhicaho/jingjing/issues) 反馈建议或提交 Pull Request。请先阅读 [贡献指南](CONTRIBUTING.md) 与 [安全策略](SECURITY.md)。
