<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permit extends Model
{
    use HasFactory;

    protected $fillable = [
        'permit_number',
        'requester',
        'department',
        'vehicle',
        'rig',
        'driver',
        'position',
        'license_number',
        'license_type',
        'license_expiry_year',
        'ddc_training_date',
        'equipment_type',
        'driver_photo',
        'origin',
        'destination',
        'purpose',
        'start_date',
        'end_date',
        'status',
        'approver',
        'approved_at',
        'approval_notes',
        'rejection_reason',
        'description',
    ];

    /**
     * Virtual attribute alias so both rig and rig_name can be accessed,
     * serta computed_status dan days_left untuk otomatisasi status.
     */
    protected $appends = ['rig_name', 'computed_status', 'days_left'];

    public function getRigNameAttribute()
    {
        return $this->attributes['rig'] ?? null;
    }

    public function setRigNameAttribute($value)
    {
        $this->attributes['rig'] = $value;
    }

    /**
     * Menghitung status efektif permit secara dinamis
     * berdasarkan status persetujuan dan sisa hari masa berlaku (end_date)
     */
    public function getComputedStatusAttribute()
    {
        $base = strtolower($this->status ?? 'pending');

        // 1. Pending (Menunggu Persetujuan Admin)
        if ($base === 'pending') {
            return 'Pending';
        }

        // 2. Rejected (Ditolak oleh Admin)
        if ($base === 'rejected') {
            return 'Rejected';
        }

        // 3. Evaluasi tanggal end_date vs hari ini
        if ($this->end_date) {
            $today = now()->startOfDay();
            $expiry = \Carbon\Carbon::parse($this->end_date)->startOfDay();
            $diffDays = (int) $today->diffInDays($expiry, false);

            if ($diffDays < 0) {
                return 'Expired';
            }

            if ($diffDays <= 30) {
                return 'Expiring Soon';
            }
        }

        if ($base === 'expired') {
            return 'Expired';
        }
        if ($base === 'expiring soon' || $base === 'expiring') {
            return 'Expiring Soon';
        }

        return 'Approved';
    }

    /**
     * Sisa hari sebelum kadaluarsa (bisa bernilai negatif jika sudah lewat)
     */
    public function getDaysLeftAttribute()
    {
        if (!$this->end_date) {
            return null;
        }
        $today = now()->startOfDay();
        $expiry = \Carbon\Carbon::parse($this->end_date)->startOfDay();
        return (int) $today->diffInDays($expiry, false);
    }

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'ddc_training_date' => 'date',
        'approved_at' => 'datetime',
    ];
}