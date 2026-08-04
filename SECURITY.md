# 安全策略

请不要在公开 Issue 中提交密钥、访问令牌、数据库连接串、个人照片或其他敏感数据。

若发现安全问题，请通过仓库维护者的 GitHub 联系方式私下说明影响范围、复现步骤和建议修复方向。我们会确认问题并尽快处理。

统计服务部署时必须遵守：

- `SUPABASE_SERVICE_ROLE_KEY` 只允许保存在 Edge Function 的服务端环境变量中；
- `stats-config.js` 只能填写公开函数地址；
- 正式环境设置 `ALLOWED_ORIGIN`，限制允许调用统计接口的网站来源；
- 保持数据库表和函数对 `anon` / `authenticated` 角色无直接访问权限。
