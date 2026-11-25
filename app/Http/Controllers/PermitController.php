<?php

namespace App\Http\Controllers;

use App\Models\Permit;
use App\Models\Driver;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class PermitController extends Controller
{
    /**
     * Menampilkan semua data permit dengan sinkronisasi status otomatis.
     */
    public function index(Request $request)
    {
        // 1. Sinkronisasi status otomatis di database berdasarkan tanggal hari ini
        // a. Permit yang telah melewati end_date -> Expired (kecuali yang Pending / Rejected)
        Permit::whereNotIn('status', ['Pending', 'Rejected'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', now()->toDateString())
            ->where('status', '!=', 'Expired')
            ->update(['status' => 'Expired']);

        // b. Permit yang berstatus Approved/Active tapi mendekati kadaluarsa (H-30 hari) -> Expiring Soon
        Permit::whereIn('status', ['Approved', 'Active'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '>=', now()->toDateString())
            ->whereDate('end_date', '<=', now()->addDays(30)->toDateString())
            ->update(['status' => 'Expiring Soon']);

        // 2. Query data permit
        $query = Permit::latest();

        if ($request->filled('status') && strtolower($request->status) !== 'all') {
            $status = strtolower($request->status);
            if ($status === 'pending') {
                $query->whereRaw('LOWER(status) = ?', ['pending']);
            } elseif ($status === 'rejected') {
                $query->whereRaw('LOWER(status) = ?', ['rejected']);
            } elseif ($status === 'expired') {
                $query->where(function ($q) {
                    $q->whereRaw('LOWER(status) = ?', ['expired'])
                      ->orWhereDate('end_date', '<', now()->toDateString());
                });
            } elseif ($status === 'expiring soon' || $status === 'expiring_soon' || $status === 'expiring') {
                $query->where(function ($q) {
                    $q->whereRaw('LOWER(status) = ?', ['expiring soon'])
                      ->orWhere(function ($sub) {
                          $sub->whereNotIn('status', ['Pending', 'Rejected'])
                              ->whereDate('end_date', '>=', now()->toDateString())
                              ->whereDate('end_date', '<=', now()->addDays(30)->toDateString());
                      });
                });
            } elseif ($status === 'approved') {
                $query->where(function ($q) {
                    $q->whereIn('status', ['Approved', 'Active'])
                      ->whereDate('end_date', '>', now()->addDays(30)->toDateString());
                });
            }
        }

        if ($request->filled('rig') && strtolower($request->rig) !== 'all') {
            $query->where('rig', 'LIKE', '%' . $request->rig . '%');
        }

        if ($request->filled('department') && strtolower($request->department) !== 'all') {
            $query->where('department', 'LIKE', '%' . $request->department . '%');
        }

        $permits = $query->get();

        // Hitung statistik ringkasan dinamis
        $allPermits = Permit::all();
        $summary = [
            'total' => $allPermits->count(),
            'approved' => $allPermits->where('computed_status', 'Approved')->count(),
            'pending' => $allPermits->where('computed_status', 'Pending')->count(),
            'expiring_soon' => $allPermits->where('computed_status', 'Expiring Soon')->count(),
            'expired' => $allPermits->where('computed_status', 'Expired')->count(),
            'rejected' => $allPermits->where('computed_status', 'Rejected')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $permits,
            'summary' => $summary,
        ]);
    }

    /**
     * Menyimpan permit baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'permit_number' => [
                'required',
                'string',
                'unique:permits,permit_number',
            ],
            'requester' => [
                'required',
                'string',
            ],
            'department' => [
                'nullable',
                'string',
            ],
            'vehicle' => [
                'nullable',
                'string',
            ],
            'rig' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig_name' => [
                'nullable',
                'string',
                'max:100',
            ],
            'driver' => [
                'nullable',
                'string',
            ],
            'position' => [
                'nullable',
                'string',
            ],
            'license_number' => [
                'nullable',
                'string',
            ],
            'license_type' => [
                'nullable',
                'string',
            ],
            'license_expiry_year' => [
                'nullable',
                'string',
            ],
            'ddc_training_date' => [
                'nullable',
                'date',
            ],
            'equipment_type' => [
                'nullable',
                'string',
            ],
            'driver_photo' => [
                'nullable',
                'string',
            ],
            'origin' => [
                'nullable',
                'string',
            ],
            'destination' => [
                'nullable',
                'string',
            ],
            'purpose' => [
                'nullable',
                'string',
            ],
            'start_date' => [
                'required',
                'date',
            ],
            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],
            'status' => [
                'nullable',
                'in:Approved,Pending,Rejected,Active,Expiring Soon,Expired',
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        if (empty($validated['origin'])) {
            $validated['origin'] = 'Pekanbaru Workshop';
        }
        if (empty($validated['destination'])) {
            $validated['destination'] = 'Rig / Area Operasional';
        }
        if (empty($validated['purpose'])) {
            $validated['purpose'] = 'Izin Mengemudi Resmi (Driving Permit)';
        }
        if (empty($validated['status'])) {
            $validated['status'] = 'Approved';
        }
        if (isset($validated['rig_name']) && empty($validated['rig'])) {
            $validated['rig'] = $validated['rig_name'];
        }
        unset($validated['rig_name']);

        $permit = Permit::create($validated);

        // Audit Log
        AuditLog::log(
            'CREATE',
            'Permit',
            "Membuat pengajuan permit baru #{$permit->permit_number} untuk rute {$permit->origin} -> {$permit->destination}",
            $permit->id,
            [
                'username' => $request->input('current_user_name', $permit->requester ?: 'Staff'),
                'role' => $request->input('current_user_role', 'Transportation Staff')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permit created successfully.',
            'data' => $permit,
        ], 201);
    }

    /**
     * Menampilkan satu permit.
     */
    public function show(Permit $permit)
    {
        return response()->json([
            'success' => true,
            'data' => $permit,
        ]);
    }

    /**
     * Mengubah permit.
     */
    public function update(Request $request, Permit $permit)
    {
        $validated = $request->validate([
            'permit_number' => [
                'required',
                'string',
                'unique:permits,permit_number,' . $permit->id,
            ],
            'requester' => [
                'required',
                'string',
            ],
            'department' => [
                'nullable',
                'string',
            ],
            'vehicle' => [
                'nullable',
                'string',
            ],
            'rig' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig_name' => [
                'nullable',
                'string',
                'max:100',
            ],
            'driver' => [
                'nullable',
                'string',
            ],
            'position' => [
                'nullable',
                'string',
            ],
            'license_number' => [
                'nullable',
                'string',
            ],
            'license_type' => [
                'nullable',
                'string',
            ],
            'license_expiry_year' => [
                'nullable',
                'string',
            ],
            'ddc_training_date' => [
                'nullable',
                'date',
            ],
            'equipment_type' => [
                'nullable',
                'string',
            ],
            'driver_photo' => [
                'nullable',
                'string',
            ],
            'origin' => [
                'nullable',
                'string',
            ],
            'destination' => [
                'nullable',
                'string',
            ],
            'purpose' => [
                'nullable',
                'string',
            ],
            'start_date' => [
                'required',
                'date',
            ],
            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],
            'status' => [
                'required',
                'in:Approved,Pending,Rejected,Active,Expiring Soon,Expired',
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        if (isset($validated['rig_name']) && empty($validated['rig'])) {
            $validated['rig'] = $validated['rig_name'];
        }
        unset($validated['rig_name']);

        $permit->update($validated);
        $permit->refresh();

        AuditLog::log(
            'UPDATE',
            'Permit',
            "Memperbarui data permit #{$permit->permit_number}",
            $permit->id,
            [
                'username' => $request->input('current_user_name', 'Admin'),
                'role' => $request->input('current_user_role', 'Transportation Admin')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permit updated successfully.',
            'data' => $permit,
        ]);
    }

    /**
     * Menyetujui permit (Approval Workflow).
     */
    public function approve(Request $request, $id)
    {
        $permit = Permit::findOrFail($id);

        $approver = $request->input('approver', $request->input('current_user_name', 'Transportation Admin'));
        $notes = $request->input('approval_notes', 'Disetujui. Memenuhi persyaratan operasional dan keselamatan K3 PT Besmindo Materi Sewatama.');

        $permit->update([
            'status' => 'Approved',
            'approver' => $approver,
            'approved_at' => now(),
            'approval_notes' => $notes,
            'rejection_reason' => null,
        ]);

        $permit->refresh();

        AuditLog::log(
            'APPROVE',
            'Permit',
            "Menyetujui izin jalan permit #{$permit->permit_number} ({$permit->vehicle} - {$permit->driver}). Catatan: {$notes}",
            $permit->id,
            [
                'username' => $approver,
                'role' => $request->input('current_user_role', 'Transportation Admin')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Permit #{$permit->permit_number} berhasil disetujui.",
            'data' => $permit,
        ]);
    }

    /**
     * Menolak permit (Approval Workflow).
     */
    public function reject(Request $request, $id)
    {
        $permit = Permit::findOrFail($id);

        $approver = $request->input('approver', $request->input('current_user_name', 'Transportation Admin'));
        $reason = $request->input('rejection_reason', 'Permohonan tidak memenuhi standar kelayakan armada / K3.');

        $permit->update([
            'status' => 'Rejected',
            'approver' => $approver,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $permit->refresh();

        AuditLog::log(
            'REJECT',
            'Permit',
            "Menolak izin jalan permit #{$permit->permit_number}. Alasan: {$reason}",
            $permit->id,
            [
                'username' => $approver,
                'role' => $request->input('current_user_role', 'Transportation Admin')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "Permit #{$permit->permit_number} telah ditolak.",
            'data' => $permit,
        ]);
    }

    /**
     * Menghapus permit.
     */
    public function destroy(Permit $permit)
    {
        $number = $permit->permit_number;
        $id = $permit->id;

        $permit->delete();

        AuditLog::log(
            'DELETE',
            'Permit',
            "Menghapus berkas permit #{$number}",
            $id
        );

        return response()->json([
            'success' => true,
            'message' => 'Permit deleted successfully.',
        ]);
    }
}