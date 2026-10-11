<?php
// Salin sebagai grand-ontama-config.php di luar public_html dan isi nilainya.
return [
  'smtp' => [
    'host' => 'smtp.example.com',
    'port' => 587,
    'encryption' => 'tls',
    'username' => '',
    'password' => '',
    'from_email' => '',
    'from_name' => 'Grand Ontama',
  ],
  'to' => [
    'email' => '',
    'name' => 'Tim Marketing Grand Ontama',
  ],
  'recaptcha' => [
    'secret_key' => '',
    'min_score' => 0.5,
  ],
  'rate_limit' => [
    'max_per_hour' => 5,
  ],
];
