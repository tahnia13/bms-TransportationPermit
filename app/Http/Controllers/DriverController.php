<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DriverController extends Controller
{
    /**
     * Display a listing of drivers.
     */
    public function index(): JsonResponse
    {
        $drivers = Driver::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Drivers retrieved successfully',
            'data' => $drivers,
        ]);
    }

    /**
     * Store a newly created driver.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'badge_number' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:100',
            'license_number' => 'required|string|max:100',
            'license_type' => 'nullable|string|max:50',
            'nik_ktp' => 'nullable|string|max:50',
            'blood_type' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|max:150',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'training_date' => 'nullable|date',
            'certification' => 'nullable|string|max:255',
            'rig' => 'nullable|string|max:50',
            'crew' => 'nullable|string|max:50',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $status = $validated['status'] ?? 'Active';
        if (strtolower($status) === 'on leave') {
            $status = 'On Leave';
        } else {
            $status = ucfirst(strtolower($status));
        }
        $validated['status'] = $status;

        $driver = Driver::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Driver created successfully',
            'data' => $driver,
        ], 201);
    }

    /**
     * Display the specified driver.
     */
    public function show(string $id): JsonResponse
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Driver retrieved successfully',
            'data' => $driver,
        ]);
    }

    /**
     * Update the specified driver.
     */
    public function update(
        Request $request,
        string $id
    ): JsonResponse {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not found',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'badge_number' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:100',
            'license_number' => 'required|string|max:100',
            'license_type' => 'nullable|string|max:50',
            'nik_ktp' => 'nullable|string|max:50',
            'blood_type' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|max:150',
            'address' => 'nullable|string',
            'emergency_contact' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'training_date' => 'nullable|date',
            'certification' => 'nullable|string|max:255',
            'rig' => 'nullable|string|max:50',
            'crew' => 'nullable|string|max:50',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            if (strtolower($validated['status']) === 'on leave') {
                $validated['status'] = 'On Leave';
            } else {
                $validated['status'] = ucfirst(strtolower($validated['status']));
            }
        }

        $driver->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Driver updated successfully',
            'data' => $driver->fresh(),
        ]);
    }

    /**
     * Remove the specified driver.
     */
    public function destroy(string $id): JsonResponse
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not found',
            ], 404);
        }

        $driver->delete();

        return response()->json([
            'success' => true,
            'message' => 'Driver deleted successfully',
        ]);
    }
}