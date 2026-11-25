<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$jsonPath = 'C:/Users/ASUS/.gemini/antigravity/brain/a3b77108-d6db-400c-af32-acb1204ee811/scratch/extracted_drivers.json';
if (!file_exists($jsonPath)) {
    echo "File not found: $jsonPath\n";
    exit(1);
}

$raw = file_get_contents($jsonPath);
$raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
if (substr($raw, 0, 2) === "\xFF\xFE") {
    $raw = mb_convert_encoding(substr($raw, 2), 'UTF-8', 'UTF-16LE');
}

$drivers = json_decode($raw, true);
if (!$drivers) {
    echo "JSON error: " . json_last_error_msg() . "\n";
    exit(1);
}

echo "Found " . count($drivers) . " driver/operator records.\n";

$inserted = 0;
$updated = 0;

foreach ($drivers as $d) {
    if (empty($d['name'])) continue;

    $badge = !empty($d['badge_number']) ? trim($d['badge_number']) : null;
    $name = trim($d['name']);

    $existing = null;
    if ($badge) {
        $existing = \App\Models\Driver::where('badge_number', $badge)->first();
    }
    if (!$existing) {
        $existing = \App\Models\Driver::where('name', $name)->first();
    }

    $blood = !empty($d['blood_type']) ? trim($d['blood_type']) : null;
    if ($blood && (stripos($blood, 'belum') !== false || stripos($blood, 'tidak') !== false || $blood === '-')) {
        $blood = null;
    }

    $phone = !empty($d['phone']) ? trim($d['phone']) : null;
    if ($phone && !str_starts_with($phone, '0') && !str_starts_with($phone, '+') && str_starts_with($phone, '8')) {
        $phone = '0' . $phone;
    }

    $data = [
        'name' => $name,
        'badge_number' => $badge,
        'position' => !empty($d['position']) ? trim($d['position']) : 'DRIVER',
        'license_number' => !empty($d['license_number']) ? trim($d['license_number']) : ('SIM-' . ($badge ?: rand(100000, 999999))),
        'license_type' => !empty($d['license_type']) ? trim($d['license_type']) : 'SIM BII Umum',
        'nik_ktp' => !empty($d['nik_ktp']) ? trim($d['nik_ktp']) : null,
        'blood_type' => $blood,
        'phone' => $phone,
        'email' => !empty($d['email']) ? trim($d['email']) : null,
        'address' => !empty($d['address']) ? trim($d['address']) : null,
        'emergency_contact' => null,
        'expiry_date' => !empty($d['expiry_date']) ? $d['expiry_date'] : '2028-12-31',
        'training_date' => !empty($d['training_date']) ? $d['training_date'] : '2026-05-15',
        'certification' => 'Defensive Driving Course (DDC) & K3LL Migas',
        'rig' => !empty($d['rig']) ? trim($d['rig']) : null,
        'crew' => !empty($d['crew']) ? trim($d['crew']) : null,
        'status' => 'Active',
        'description' => "Personil " . (!empty($d['position']) ? trim($d['position']) : 'Driver') . " penugasan " . (!empty($d['rig']) ? trim($d['rig']) : 'Pool') . ". No Badge: " . ($badge ?: '-') . ($blood ? ". Golongan Darah: $blood." : "."),
    ];

    if ($existing) {
        $existing->update($data);
        $updated++;
    } else {
        \App\Models\Driver::create($data);
        $inserted++;
    }
}

echo "Seeding completed: $inserted inserted, $updated updated. Total Drivers in DB: " . \App\Models\Driver::count() . "\n";
