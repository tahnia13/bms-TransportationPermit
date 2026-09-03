<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\PermitController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\NotificationController;

// =====================================================
// PERMIT & APPROVAL WORKFLOW
// =====================================================

Route::post('permits/{id}/approve', [PermitController::class, 'approve']);
Route::post('permits/{id}/reject', [PermitController::class, 'reject']);

Route::apiResource('permits', PermitController::class);

// =====================================================
// VEHICLE
// =====================================================

Route::apiResource('vehicles', VehicleController::class);

// =====================================================
// DRIVER
// =====================================================

Route::apiResource('drivers', DriverController::class);

// =====================================================
// TRIP
// =====================================================

Route::apiResource('trips', TripController::class);

// =====================================================
// ARCHIVE & PHYSICAL FILE DOWNLOAD
// =====================================================

Route::get('archives/{id}/download', [ArchiveController::class, 'download']);
Route::apiResource('archives', ArchiveController::class);

// =====================================================
// AUDIT LOG
// =====================================================

Route::get('audit-logs', [AuditLogController::class, 'index']);
Route::post('audit-logs', [AuditLogController::class, 'store']);

// =====================================================
// NOTIFICATIONS & EMAIL
// =====================================================

Route::get('notifications/alerts', [NotificationController::class, 'getAlerts']);
Route::post('notifications/email', [NotificationController::class, 'sendEmail']);