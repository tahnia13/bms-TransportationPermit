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
        'driver',
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

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
    ];
}