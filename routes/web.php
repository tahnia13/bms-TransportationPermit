<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'system' => 'PT. Besmindo Materi Sewatama - Transportation Permit API Server',
        'version' => '1.0.0',
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version(),
        'endpoints' => [
            'permits' => '/api/permits',
            'vehicles' => '/api/vehicles',
            'drivers' => '/api/drivers',
            'audit_logs' => '/api/audit-logs',
            'notifications' => '/api/notifications/alerts',
        ],
        'frontend_url' => 'http://localhost:5173',
    ]);
});
