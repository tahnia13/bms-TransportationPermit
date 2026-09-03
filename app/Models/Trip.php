<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'permit_id',
        'vehicle_id',
        'driver_id',
        'trip_number',
        'departure_date',
        'return_date',
        'origin',
        'destination',
        'purpose',
        'status',
        'description',
    ];

    protected $casts = [
        'departure_date' => 'date:Y-m-d',
        'return_date' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relasi ke Permit
     */
    public function permit()
    {
        return $this->belongsTo(Permit::class);
    }

    /**
     * Relasi ke Vehicle
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Relasi ke Driver
     */
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}