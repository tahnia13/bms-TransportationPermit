<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'license_number',
        'license_type',
        'phone',
        'expiry_date',
        'training_date',
        'rig',
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