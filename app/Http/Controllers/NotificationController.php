<?php

namespace App\Http\Controllers;

use App\Models\Permit;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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

        $permit = null;
        $permitNumber = '-';
        if (!empty($validated['permit_id'])) {
            $permit = Permit::find($validated['permit_id']);
            if ($permit) {
                $permitNumber = $permit->permit_number;
            }
        }

        $recipientEmail = trim($validated['recipient_email']);
        $subject = $validated['subject'];
        $messageContent = nl2br(e($validated['message'] ?? ''));
        $senderName = $validated['sender_name'] ?? 'Transportation Admin';

        // Build HTML template
        $permitDetailsHtml = '';
        if ($permit) {
            $permitDetailsHtml = '
            <div style="background-color: #f8faf9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; width: 140px; color: #12372A;">Nomor Permit</td>
                        <td style="padding: 6px 0;">: <strong>' . e($permit->permit_number) . '</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Pemohon</td>
                        <td style="padding: 6px 0;">: ' . e($permit->requester ?: '-') . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Kendaraan / Armada</td>
                        <td style="padding: 6px 0;">: ' . e($permit->vehicle ?: '-') . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Pengemudi</td>
                        <td style="padding: 6px 0;">: ' . e($permit->driver ?: '-') . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Rute Perjalanan</td>
                        <td style="padding: 6px 0;">: ' . e($permit->origin ?: '-') . ' &rarr; ' . e($permit->destination ?: '-') . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Masa Berlaku</td>
                        <td style="padding: 6px 0;">: ' . e($permit->start_date ?: '-') . ' s/d ' . e($permit->end_date ?: '-') . '</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-weight: bold; color: #12372A;">Status Permit</td>
                        <td style="padding: 6px 0;">: <span style="display: inline-block; background-color: #12372A; color: #D8FF00; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 11px;">' . e($permit->status ?: 'Pending') . '</span></td>
                    </tr>
                </table>
            </div>';
        }

        $htmlBody = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>' . e($subject) . '</title>
        </head>
        <body style="font-family: \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                
                <!-- HEADER -->
                <div style="background-color: #12372A; padding: 24px 28px; text-align: left;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td>
                                <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">BESMINDO MATERI SEWATAMA</h1>
                                <p style="color: #D8FF00; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Transportation Permit & Fleet System</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- CONTENT -->
                <div style="padding: 28px; font-size: 14px; line-height: 1.6; color: #334155;">
                    <h2 style="color: #12372A; margin-top: 0; font-size: 16px; font-weight: 700;">' . e($subject) . '</h2>
                    
                    <div style="margin: 16px 0; color: #334155; font-size: 13.5px; line-height: 1.7;">
                        ' . $messageContent . '
                    </div>

                    ' . $permitDetailsHtml . '

                    <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
                        Pemberitahuan ini dikirimkan secara resmi oleh sistem <strong>Transportation Department PT Besmindo Materi Sewatama</strong>.
                    </p>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f8faf9; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
                    <p style="margin: 0;">&copy; ' . date('Y') . ' PT Besmindo Materi Sewatama. All rights reserved.</p>
                    <p style="margin: 4px 0 0 0;">Jl. Raya Minas KM. 18, Minas, Siak, Riau &bull; Sistem Internal Logistik & Transportasi</p>
                </div>
            </div>
        </body>
        </html>';

        $deliveryStatus = 'Sent';
        $mailError = null;

        try {
            Mail::html($htmlBody, function ($mailMessage) use ($recipientEmail, $subject) {
                $mailMessage->to($recipientEmail)
                            ->subject($subject);
            });
        } catch (\Exception $e) {
            Log::error("Failed to send email via Laravel Mail: " . $e->getMessage());
            $deliveryStatus = 'Failed: ' . $e->getMessage();
            $mailError = $e->getMessage();
        }

        // Record into AuditLog
        AuditLog::log(
            'EMAIL',
            'Notification',
            "Mengirim notifikasi email ke [{$recipientEmail}] - Subjek: '{$subject}' (Permit: {$permitNumber}) - Status: {$deliveryStatus}",
            $validated['permit_id'] ?? null,
            [
                'username' => $senderName,
                'role' => 'Transportation Admin'
            ]
        );

        if ($mailError) {
            return response()->json([
                'success' => false,
                'message' => "Pengiriman email gagal ke {$recipientEmail}. Error: {$mailError}. Harap periksa konfigurasi SMTP pada file .env.",
                'error' => $mailError,
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Email notifikasi berhasil dikirimkan ke {$recipientEmail}.",
            'data' => [
                'recipient' => $recipientEmail,
                'subject' => $subject,
                'sent_at' => now()->toIso8601String(),
                'status' => 'Delivered',
            ],
        ]);
    }
}
