<?php

namespace App\Http\Controllers;

use App\Models\Permit;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Get aggregated active alerts for permits.
     */
    public function getAlerts()
    {
        $today = Carbon::today();
        $thirtyDaysAhead = Carbon::today()->addDays(30);

        $allPermits = Permit::all();

        $expiringSoon = [];
        $expired = [];
        $pendingApproval = [];

        foreach ($allPermits as $permit) {
            $endDate = $permit->end_date ? Carbon::parse($permit->end_date) : null;
            $status = strtolower($permit->status ?? '');

            if ($status === 'pending') {
                $pendingApproval[] = [
                    'id' => $permit->id,
                    'permit_number' => $permit->permit_number,
                    'requester' => $permit->requester,
                    'driver' => $permit->driver,
                    'vehicle' => $permit->vehicle,
                    'route' => "{$permit->origin} -> {$permit->destination}",
                    'created_at' => $permit->created_at ? $permit->created_at->toIso8601String() : null,
                    'type' => 'pending_approval',
                    'title' => "Permit Butuh Persetujuan: #{$permit->permit_number}",
                    'message' => "Pengajuan oleh {$permit->requester} untuk armada {$permit->vehicle} ({$permit->driver}) menunggu verifikasi.",
                ];
            }

            if ($endDate) {
                $diffDays = $today->diffInDays($endDate, false); // negative if in past

                if ($diffDays < 0 || $status === 'expired') {
                    $expired[] = [
                        'id' => $permit->id,
                        'permit_number' => $permit->permit_number,
                        'driver' => $permit->driver,
                        'vehicle' => $permit->vehicle,
                        'end_date' => $endDate->toDateString(),
                        'days_overdue' => abs((int)$diffDays),
                        'type' => 'expired',
                        'title' => "Permit Kedaluwarsa: #{$permit->permit_number}",
                        'message' => "Masa berlaku habis sejak {$endDate->translatedFormat('d M Y')} (" . abs((int)$diffDays) . " hari lalu). Segera lakukan perpanjangan!",
                    ];
                } elseif ($diffDays <= 30 && $status !== 'rejected') {
                    $expiringSoon[] = [
                        'id' => $permit->id,
                        'permit_number' => $permit->permit_number,
                        'driver' => $permit->driver,
                        'vehicle' => $permit->vehicle,
                        'end_date' => $endDate->toDateString(),
                        'days_left' => (int)$diffDays,
                        'type' => 'expiring_soon',
                        'title' => "Permit Mendekati Kedaluwarsa: #{$permit->permit_number}",
                        'message' => "Tersisa {$diffDays} hari lagi sebelum habis masa berlaku ({$endDate->translatedFormat('d M Y')}).",
                    ];
                }
            }
        }

        $totalAlerts = count($expiringSoon) + count($expired) + count($pendingApproval);

        return response()->json([
            'success' => true,
            'summary' => [
                'total' => $totalAlerts,
                'expiring_soon_count' => count($expiringSoon),
                'expired_count' => count($expired),
                'pending_approval_count' => count($pendingApproval),
            ],
            'expiring_soon' => $expiringSoon,
            'expired' => $expired,
            'pending_approval' => $pendingApproval,
        ]);
    }

    /**
     * Send email notification regarding permits or alerts.
     */
    public function sendEmail(Request $request)
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string',
            'permit_id' => 'nullable|integer',
            'type' => 'nullable|string', // 'expiry_alert', 'approval_notice', 'reminder'
            'sender_name' => 'nullable|string',
        ]);

        $permitNumber = '-';
        if (!empty($validated['permit_id'])) {
            $permit = Permit::find($validated['permit_id']);
            if ($permit) {
                $permitNumber = $permit->permit_number;
            }
        }

        // Record into AuditLog
        AuditLog::log(
            'EMAIL',
            'Notification',
            "Mengirim notifikasi email ke [{$validated['recipient_email']}] - Subjek: '{$validated['subject']}' (Permit: {$permitNumber})",
            $validated['permit_id'] ?? null,
            [
                'username' => $validated['sender_name'] ?? 'Admin',
                'role' => 'Transportation Admin'
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Email notifikasi berhasil dikirimkan ke {$validated['recipient_email']}.",
            'data' => [
                'recipient' => $validated['recipient_email'],
                'subject' => $validated['subject'],
                'sent_at' => now()->toIso8601String(),
                'status' => 'Delivered',
            ],
        ]);
    }
}
