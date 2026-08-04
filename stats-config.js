/*
 * 生产环境使用同源轻量统计接口；接口只接收匿名设备 ID 和动作类型。
 * 不要在前端文件放入密码、数据库连接串或其他私钥。
 */
window.QUIET_STATS_CONFIG = {
  endpoint: "/api/stats.php",
};
