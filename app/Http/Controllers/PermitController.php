<?php

namespace App\Http\Controllers;

use App\Models\Permit;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class PermitController extends Controller
{
    /**
     * Menampilkan semua data permit.
     */
    public function index()
    {
        $permits = Permit::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $permits,
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
            'driver' => [
                'nullable',
                'string',
            ],
            'origin' => [
                'required',
                'string',
            ],
            'destination' => [
                'required',
                'string',
            ],
            'purpose' => [
                'required',
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

        if (empty($validated['status'])) {
            $validated['status'] = 'Pending';
        }

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
            'driver' => [
                'nullable',
                'string',
            ],
            'origin' => [
                'required',
                'string',
            ],
            'destination' => [
                'required',
                'string',
            ],
            'purpose' => [
                'required',
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
        $notes = $request->input('approval_notes', 'Disetujui. Memenuhi persyaratan operasional dan keselamatan K3 PT Besmindo Makmur.');

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