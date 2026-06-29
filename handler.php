<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed.']);
    exit;
}

$recipient = 'help@greenscapelawn.example';
$siteName = 'GreenScape Lawn Care Connect';
$configPath = __DIR__ . '/js/site-config.js';

if (is_readable($configPath)) {
    $configSource = (string)file_get_contents($configPath);
    if (preg_match('/email:\s*"([^"]+)"/', $configSource, $match) && filter_var($match[1], FILTER_VALIDATE_EMAIL)) {
        $recipient = $match[1];
    }
    if (preg_match('/companyName:\s*"([^"]+)"/', $configSource, $match)) {
        $siteName = str_replace(["\r", "\n"], ' ', $match[1]);
    }
}

$clean = static function (string $key, int $limit = 1000): string {
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r", "\n"], ' ', $value);
    return substr($value, 0, $limit);
};

$name = $clean('name', 120);
$phone = $clean('phone', 80);
$email = $clean('email', 160);
$service = $clean('service', 180);
$message = trim((string)($_POST['message'] ?? ''));
$message = substr($message, 0, 3000);

if ($name === '' || $phone === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please provide your name and phone number.']);
    exit;
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

$subject = 'New lawn care provider request';
$body = implode("\n", [
    'New request from ' . $siteName,
    '',
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Email: ' . ($email !== '' ? $email : 'Not provided'),
    'Service: ' . ($service !== '' ? $service : 'Not selected'),
    '',
    'Property details:',
    $message !== '' ? $message : 'Not provided',
    '',
    'Submitted: ' . date('Y-m-d H:i:s'),
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown')
]);

$host = preg_replace('/[^a-z0-9.-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
$host = explode(':', $host)[0] ?: 'localhost';

$headers = [
    'From: ' . $siteName . ' <no-reply@' . $host . '>',
    'Reply-To: ' . ($email !== '' ? $email : $recipient),
    'Content-Type: text/plain; charset=UTF-8'
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Request could not be sent. Please call or email us directly.']);
    exit;
}

echo json_encode(['ok' => true, 'message' => 'Request sent.']);
