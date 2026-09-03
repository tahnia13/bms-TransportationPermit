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
        'category',
        'year',
        'rig',
        'status',
        'description',
    ];

    protected $casts = [
        'year' => 'integer',
    ];
}