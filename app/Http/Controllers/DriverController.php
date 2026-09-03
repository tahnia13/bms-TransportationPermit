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

            'license_number' =>
                'required|string|max:100|unique:drivers,license_number',

            'license_type' =>
                'nullable|string|max:50',

            'phone' =>
                'nullable|string|max:30',

            'expiry_date' =>
                'nullable|date',

            'training_date' =>
                'nullable|date',

            'rig' =>
                'nullable|string|max:20',

            'status' =>
                'nullable|in:Active,Inactive,Pending,active,inactive,pending',

            'description' =>
                'nullable|string',
        ]);

        $status = $validated['status'] ?? 'Active';

        /*
         * Samakan format status dengan data UI lama:
         * Active / Inactive / Pending
         */
        $status = ucfirst(strtolower($status));

        $driver = Driver::create([
            'name' => $validated['name'],

            'license_number' =>
                $validated['license_number'],

            'license_type' =>
                $validated['license_type'] ?? null,

            'phone' =>
                $validated['phone'] ?? null,

            'expiry_date' =>
                $validated['expiry_date'] ?? null,

            'training_date' =>
                $validated['training_date'] ?? null,

            'rig' =>
                $validated['rig'] ?? null,

            'status' =>
                $status,

            'description' =>
                $validated['description'] ?? null,
        ]);

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

            'license_number' =>
                'required|string|max:100|unique:drivers,license_number,' . $id,

            'license_type' =>
                'nullable|string|max:50',

            'phone' =>
                'nullable|string|max:30',

            'expiry_date' =>
                'nullable|date',

            'training_date' =>
                'nullable|date',

            'rig' =>
                'nullable|string|max:20',

            'status' =>
                'nullable|in:Active,Inactive,Pending,active,inactive,pending',

            'description' =>
                'nullable|string',
        ]);

        $status = $validated['status'] ?? $driver->status;
        $status = ucfirst(strtolower($status));

        $driver->update([
            'name' =>
                $validated['name'],

            'license_number' =>
                $validated['license_number'],

            'license_type' =>
                $validated['license_type'] ?? null,

            'phone' =>
                $validated['phone'] ?? null,

            'expiry_date' =>
                $validated['expiry_date'] ?? null,

            'training_date' =>
                $validated['training_date'] ?? null,

            'rig' =>
                $validated['rig'] ?? null,

            'status' =>
                $status,

            'description' =>
                $validated['description'] ?? null,
        ]);

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