# 真实道场统计接入

前端不再生成模拟数字。`stats-config.js` 配置为空时，道场数据保持为 `0`；部署统计服务并填入地址后，会展示真实的匿名设备统计。

## 部署步骤

1. 新建 Supabase 项目，在 SQL Editor 执行 `supabase/migrations/20260804_quiet_stats.sql`。
2. 在 Edge Function Secrets 设置 `ALLOWED_ORIGIN`，值为正式网页域名，例如 `https://quiet.example.com`。本地双击 HTML 调试时可暂不设置；正式环境必须设置。
3. 部署函数：`supabase functions deploy quiet-stats --no-verify-jwt`。
4. 将 `stats-config.js` 的 `endpoint` 改为：

   ```js
   endpoint: "https://<你的项目引用>.supabase.co/functions/v1/quiet-stats",
   ```

5. 上传静态网页后，打开两个不同浏览器窗口验证：在线人数应变化；同一浏览器刷新不重复计入今日来客；敲击一次后累计功德增加 1（300ms 内的重复请求会被服务端忽略）。

## 指标口径

- **道场在线**：最近 60 秒有页面心跳的匿名设备数。
- **今日来客**：按“上海自然日 + 匿名设备 ID”去重的设备数。
- **功德积累**：服务端通过 300ms 单设备限流后的有效敲击次数。

不采集姓名、手机号、照片或烦恼签；上传图片继续只留在当前浏览器会话。未登录玩法只能统计匿名设备，不能严格识别自然人。
