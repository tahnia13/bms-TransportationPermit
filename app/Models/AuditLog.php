<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $table = 'audit_logs';

    protected $fillable = [
        'user_name',
        'user_role',
        'action',
        'module',
        'entity_id',
        'description',
        'ip_address',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Helper to quickly record an audit event
     */
    public static function log($action, $module, $description, $entityId = null, $user = null, $ip = null)
    {
        $userName = $user['username'] ?? 'Admin';
        $userRole = $user['role'] ?? 'Transportation Admin';

        return self::create([
            'user_name' => $userName,
            'user_role' => $userRole,
            'action' => strtoupper($action),
            'module' => $module,
            'entity_id' => $entityId ? (string)$entityId : null,
            'description' => $description,
            'ip_address' => $ip ?? request()->ip(),
        ]);
    }
}
