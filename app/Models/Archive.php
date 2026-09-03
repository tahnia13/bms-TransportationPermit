<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Archive extends Model
{
    use HasFactory;

    protected $table = 'archives';

    protected $fillable = [
        'document_number',
        'title',
        'category',
        'uploaded_by',
        'archive_date',
        'status',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
    ];

    protected $appends = [
        'file_url',
    ];

    protected $casts = [
        'archive_date' => 'date:Y-m-d',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'file_size' => 'integer',
    ];

    public function getFileUrlAttribute()
    {
        if (!$this->file_path) {
            return null;
        }

        return asset('storage/' . $this->file_path);
    }
}