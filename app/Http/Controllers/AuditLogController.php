<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs with filters.
     */
    public function index(Request $request)
    {
        $query = AuditLog::query();

        // Keyword search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_name', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('entity_id', 'like', "%{$search}%");
            });
        }

        // Module filter
        if ($request->filled('module') && $request->module !== 'All') {
            $query->where('module', $request->module);
        }

        // Action filter
        if ($request->filled('action') && $request->action !== 'All') {
            $query->where('action', $request->action);
        }

        // Date filter
        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $logs = $query->latest()->limit(200)->get();

        return response()->json([
            'success' => true,
            'data' => $logs,
            'total' => $logs->count(),
        ]);
    }

    /**
     * Store a custom audit log entry.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'module' => 'required|string',
            'description' => 'required|string',
            'entity_id' => 'nullable|string',
            'user_name' => 'nullable|string',
            'user_role' => 'nullable|string',
        ]);

        $log = AuditLog::create([
            'user_name' => $validated['user_name'] ?? 'Admin',
            'user_role' => $validated['user_role'] ?? 'Transportation Admin',
            'action' => strtoupper($validated['action']),
            'module' => $validated['module'],
            'entity_id' => $validated['entity_id'] ?? null,
            'description' => $validated['description'],
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $log,
        ], 201);
    }
}
