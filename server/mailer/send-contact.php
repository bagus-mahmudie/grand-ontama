<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

function respond(int $status, bool $success, string $message): never
{
    http_response_code($status);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Metode tidak diizinkan.');
}

if (!empty($_POST['website'])) {
    respond(200, true, 'Terima kasih.');
}

$configuredPath = getenv('GRAND_ONTAMA_CONFIG');
$configPath = $configuredPath ?: dirname(__DIR__, 2) . '/grand-ontama-config.php';
if (!is_file($configPath)) {
    error_log('Grand Ontama config tidak ditemukan: ' . $configPath);
    respond(500, false, 'Konfigurasi layanan belum tersedia.');
}
$config = require $configPath;

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$rateDir = sys_get_temp_dir() . '/grand_ontama_contact_rate';
if (!is_dir($rateDir) && !mkdir($rateDir, 0700, true) && !is_dir($rateDir)) {
    respond(500, false, 'Layanan sementara tidak tersedia.');
}
$rateFile = $rateDir . '/' . hash('sha256', $ip) . '.json';
$now = time();
$window = 3600;
$timestamps = [];
if (is_file($rateFile)) {
    $stored = json_decode((string) file_get_contents($rateFile), true);
    $timestamps = is_array($stored) ? array_values(array_filter($stored, static fn($time) => $now - (int) $time < $window)) : [];
}
if (count($timestamps) >= (int) ($config['rate_limit']['max_per_hour'] ?? 5)) {
    respond(429, false, 'Terlalu banyak percobaan. Coba lagi nanti.');
}

$token = trim((string) ($_POST['g-recaptcha-response'] ?? ''));
if ($token === '' || !function_exists('curl_init')) {
    respond(400, false, 'Verifikasi keamanan gagal.');
}
$verify = curl_init('https://www.google.com/recaptcha/api/siteverify');
curl_setopt_array($verify, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_POSTFIELDS => http_build_query([
        'secret' => $config['recaptcha']['secret_key'],
        'response' => $token,
        'remoteip' => $ip,
    ]),
]);
$verificationBody = curl_exec($verify);
$verificationError = curl_error($verify);
curl_close($verify);
if ($verificationBody === false || $verificationError !== '') {
    error_log('reCAPTCHA error: ' . $verificationError);
    respond(502, false, 'Verifikasi keamanan tidak dapat diproses.');
}
$verification = json_decode((string) $verificationBody, true);
if (!($verification['success'] ?? false) || ($verification['score'] ?? 0) < (float) ($config['recaptcha']['min_score'] ?? 0.5)) {
    respond(400, false, 'Verifikasi keamanan gagal.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
if ($name === '' || $email === '' || $phone === '' || $message === '') {
    respond(422, false, 'Harap lengkapi semua bidang yang wajib diisi.');
}
if (mb_strlen($name) > 120 || mb_strlen($email) > 190 || mb_strlen($phone) > 24 || mb_strlen($message) > 3000) {
    respond(422, false, 'Salah satu isian terlalu panjang.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    respond(422, false, 'Alamat email tidak valid.');
}
if (!preg_match('/^[0-9+() .-]{8,24}$/', $phone)) {
    respond(422, false, 'Nomor telepon tidak valid.');
}

$autoload = dirname(__DIR__) . '/vendor/autoload.php';
if (!is_file($autoload)) {
    error_log('PHPMailer autoload tidak ditemukan.');
    respond(500, false, 'Layanan email belum tersedia.');
}
require $autoload;

try {
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp']['host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp']['username'];
    $mail->Password = $config['smtp']['password'];
    $mail->SMTPSecure = $config['smtp']['encryption'];
    $mail->Port = (int) $config['smtp']['port'];
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['smtp']['from_email'], $config['smtp']['from_name']);
    $mail->addAddress($config['to']['email'], $config['to']['name']);
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = 'Pesan dari ' . $name . ' via Website Grand Ontama';
    $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeEmail = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safePhone = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));
    $mail->Body = "<h3>Permintaan informasi Grand Ontama</h3><p><strong>Nama:</strong> {$safeName}</p><p><strong>Email:</strong> {$safeEmail}</p><p><strong>Telepon:</strong> {$safePhone}</p><p><strong>Pesan:</strong><br>{$safeMessage}</p>";
    $mail->AltBody = "Permintaan informasi Grand Ontama\nNama: {$name}\nEmail: {$email}\nTelepon: {$phone}\nPesan:\n{$message}";
    $mail->send();

    $timestamps[] = $now;
    file_put_contents($rateFile, json_encode($timestamps), LOCK_EX);
    respond(200, true, 'Terima kasih! Pesan Anda telah terkirim.');
} catch (Throwable $exception) {
    error_log('SEND CONTACT ERROR: ' . $exception->getMessage());
    respond(500, false, 'Pengiriman email gagal. Silakan coba kembali.');
}
