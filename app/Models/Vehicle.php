<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'plate_number',
        'type',
        'brand',
        'axle',
        'owner_name',
        'category',
        'year',
        'color',
        'rig',
        'rig_baru',
        'stnk_expiry',
        'pajak_expiry',
        'kir_expiry',
        'pass_expiry',
        'status',
        'description',
    ];

    protected $casts = [
        'year' => 'integer',
        'stnk_expiry' => 'date:Y-m-d',
        'pajak_expiry' => 'date:Y-m-d',
        'kir_expiry' => 'date:Y-m-d',
        'pass_expiry' => 'date:Y-m-d',
    ];
}