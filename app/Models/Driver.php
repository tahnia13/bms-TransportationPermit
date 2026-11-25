<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'badge_number',
        'position',
        'license_number',
        'license_type',
        'photo_url',
        'nik_ktp',
        'blood_type',
        'phone',
        'email',
        'address',
        'emergency_contact',
        'expiry_date',
        'training_date',
        'certification',
        'rig',
        'crew',
        'status',
        'description',
    ];

    protected $casts = [
        'expiry_date' => 'date:Y-m-d',
        'training_date' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}