# 真实道场统计服务

生产环境采用同源的 PHP + SQLite 接口，不依赖第三方统计平台。

## 数据口径

- **道场在线**：最近 60 秒有访问或心跳的匿名设备数。
- **今日来客**：按“上海自然日 + 浏览器匿名设备 ID”去重的设备数。
- **功德积累**：服务端在同一设备 300ms 限流后记录的有效敲击次数。

不采集姓名、手机号、照片或烦恼签。未登录玩法只能统计匿名设备，不等同于严格的自然人用户数。

## 部署要求

- Nginx
- PHP 8.3 FPM
- PHP SQLite 扩展

Ubuntu 示例：

```bash
sudo apt-get update
sudo apt-get install -y nginx php-fpm php-sqlite3
sudo install -d -o www-data -g www-data -m 750 /var/lib/jingjing
```

将 `server/stats.php` 放到站点目录的 `api/stats.php`，并在 Nginx 的 HTTPS 虚拟主机中添加：

```nginx
location = /api/stats.php {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass unix:/run/php/php8.3-fpm.sock;
}
```

最后执行：

```bash
php -l /var/www/jingjing/api/stats.php
sudo nginx -t
sudo systemctl reload nginx
```

统计数据库为 `/var/lib/jingjing/stats.sqlite`，应保持为 `www-data` 可写，且不得放在网站根目录或提交到 Git。
