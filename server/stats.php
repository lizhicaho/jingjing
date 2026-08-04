<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reply(['error' => 'method_not_allowed'], 405);
}

try {
    $payload = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    $action = $payload['action'] ?? '';
    $visitorId = $payload['visitorId'] ?? '';
    if (!in_array($action, ['visit', 'heartbeat', 'knock', 'stats'], true)
        || !is_string($visitorId)
        || !preg_match('/^[A-Za-z0-9-]{16,128}$/', $visitorId)) {
        reply(['error' => 'bad_request'], 400);
    }

    $db = new PDO('sqlite:/var/lib/jingjing/stats.sqlite', null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3,
    ]);
    $db->exec('PRAGMA journal_mode = WAL');
    $db->exec('CREATE TABLE IF NOT EXISTS daily_stats (stat_date TEXT PRIMARY KEY, merit_total INTEGER NOT NULL DEFAULT 0)');
    $db->exec('CREATE TABLE IF NOT EXISTS daily_visitors (stat_date TEXT NOT NULL, visitor_id TEXT NOT NULL, PRIMARY KEY (stat_date, visitor_id))');
    $db->exec('CREATE TABLE IF NOT EXISTS presence (visitor_id TEXT PRIMARY KEY, last_seen REAL NOT NULL)');
    $db->exec('CREATE TABLE IF NOT EXISTS knock_guards (visitor_id TEXT PRIMARY KEY, last_knock REAL NOT NULL)');

    $today = (new DateTimeImmutable('now', new DateTimeZone('Asia/Shanghai')))->format('Y-m-d');
    $now = microtime(true);
    $transactionStarted = true;
    $db->exec('BEGIN IMMEDIATE');
    $db->prepare('INSERT OR IGNORE INTO daily_stats (stat_date) VALUES (?)')->execute([$today]);

    if ($action !== 'stats') {
        $db->prepare('INSERT OR IGNORE INTO daily_visitors (stat_date, visitor_id) VALUES (?, ?)')->execute([$today, $visitorId]);
        $db->prepare('INSERT INTO presence (visitor_id, last_seen) VALUES (?, ?) ON CONFLICT(visitor_id) DO UPDATE SET last_seen = excluded.last_seen')->execute([$visitorId, $now]);
    }

    if ($action === 'knock') {
        $guard = $db->prepare('SELECT last_knock FROM knock_guards WHERE visitor_id = ?');
        $guard->execute([$visitorId]);
        $lastKnock = $guard->fetchColumn();
        if ($lastKnock === false || $now - (float) $lastKnock >= 0.3) {
            $db->prepare('INSERT INTO knock_guards (visitor_id, last_knock) VALUES (?, ?) ON CONFLICT(visitor_id) DO UPDATE SET last_knock = excluded.last_knock')->execute([$visitorId, $now]);
            $db->prepare('UPDATE daily_stats SET merit_total = merit_total + 1 WHERE stat_date = ?')->execute([$today]);
        }
    }

    $online = (int) $db->query('SELECT COUNT(*) FROM presence WHERE last_seen >= ' . ($now - 60))->fetchColumn();
    $visitorQuery = $db->prepare('SELECT COUNT(*) FROM daily_visitors WHERE stat_date = ?');
    $visitorQuery->execute([$today]);
    $visitors = (int) $visitorQuery->fetchColumn();
    $meritQuery = $db->prepare('SELECT merit_total FROM daily_stats WHERE stat_date = ?');
    $meritQuery->execute([$today]);
    $merits = (int) $meritQuery->fetchColumn();
    $db->exec('COMMIT');
    $transactionStarted = false;
    reply(['online' => $online, 'visitors' => $visitors, 'merits' => $merits]);
} catch (Throwable $error) {
    if (!empty($transactionStarted)) {
        $db->exec('ROLLBACK');
    }
    error_log('jingjing stats error: ' . $error->getMessage());
    reply(['error' => 'stats_unavailable'], 503);
}
