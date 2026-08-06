# 我想静静

> 轻触一下木鱼，给自己几分钟安静。

「我想静静」是一个零框架、低干扰的数字禅房。它不追求游戏化的奖励或社交打扰；打开页面后，只需跟随自己的节奏，轻轻敲一下木鱼。

![HTML](https://img.shields.io/badge/HTML-CSS-JavaScript-D78B47?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-8E8A84?style=flat-square)

## 在线试玩

- 试玩地址：[jingjing.chaogeapi.online](https://jingjing.chaogeapi.online)
- 开源仓库：[github.com/lizhicaho/jingjing](https://github.com/lizhicaho/jingjing)（欢迎 Star）

## 产品体验

- 木鱼是页面唯一主角：轻触木鱼、页面留白、鼠标、触屏、`Space` 或 `Enter` 都可以敲击；设置、抽屉和链接不会误触发。
- 采用内置 SVG 绘制半写实木鱼、木纹、坐垫与木槌；敲击时有木槌落下、木鱼回弹与光圈回响。
- 首页以 AI 生成的禅意背景图营造沉浸氛围，作为弱化的视觉背景，不干扰木鱼主体和可读性。
- 每日进度保存在当前浏览器；达到 108 声时完成当日静心。
- 支持木鱼、蛙鸣、风铃三种轻量音效；不依赖在线音频服务。
- 首次点击或按键会主动解锁浏览器音频上下文，改善 Safari、微信内置浏览器等环境的首次无声问题。
- 移动端可在设置中开启「摇禅」：授权动作传感器后，摇晃手机即可敲击，且会按摇晃强度动态控制触发频率。
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

## 交互验证

发布前建议在桌面端、Safari 和微信内置浏览器中确认：

- 木鱼、页面留白、触屏、键盘敲击均只增加 1 声；「更多」、GitHub、输入框和设置不会误触发。
- 刷新后当天进度、声音和「摇禅」开关仍保持；跨天后今日进度自动重置。
- 打开「更多」后，关闭按钮与点击遮罩均可返回首页；移动端不会双击缩放或横向滑动。
- iOS 用户需在点击「摇禅」时授权动作与方向访问；未授权时不影响其他玩法。

## 部署与缓存

生产环境使用 Nginx 静态站点与同源统计接口。示例见 `deploy/nginx-jingjing.chaogeapi.online.conf`。

- `index.html` 和其他 HTML 响应必须设置 `Cache-Control: no-cache, no-store, must-revalidate`，避免微信等内置浏览器长期持有旧入口页。
- CSS、JS、音效和图片可缓存 7 天；每次发布样式或脚本时，需要同步更新 `index.html` 中对应资源的 `?v=` 版本号。
- 修改 Nginx 配置后须先执行 `nginx -t`，通过后再 `systemctl reload nginx`；不要直接重启或覆盖证书文件。

## 项目结构

```text
.
├── assets/                         # 站点图标、音效与禅意背景素材
├── index.html                      # 首页与更多功能面板
├── style.css                       # 木鱼模型、木槌与基础视觉样式
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

`assets/buddha-bg.jpg` 为项目维护者提供的 AI 生成背景素材，使用范围与说明见 [NOTICE](NOTICE)。

## 参与贡献

欢迎通过 [Issues](https://github.com/lizhicaho/jingjing/issues) 反馈建议或提交 Pull Request。请先阅读 [贡献指南](CONTRIBUTING.md) 与 [安全策略](SECURITY.md)。
