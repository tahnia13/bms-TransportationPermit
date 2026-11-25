<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    /**
     * Menampilkan semua vehicle.
     */
    public function index()
    {
        $vehicles = Vehicle::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $vehicles,
        ]);
    }

    /**
     * Menyimpan vehicle baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => [
                'required',
                'string',
                'max:50',
                'unique:vehicles,plate_number',
            ],
            'type' => [
                'required',
                'string',
                'max:255',
            ],
            'brand' => [
                'nullable',
                'string',
                'max:255',
            ],
            'axle' => [
                'nullable',
                'string',
                'max:50',
            ],
            'owner_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'category' => [
                'nullable',
                'string',
                'max:255',
            ],
            'year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2100',
            ],
            'color' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig_baru' => [
                'nullable',
                'string',
                'max:100',
            ],
            'stnk_expiry' => [
                'nullable',
                'date',
            ],
            'pajak_expiry' => [
                'nullable',
                'date',
            ],
            'kir_expiry' => [
                'nullable',
                'date',
            ],
            'pass_expiry' => [
                'nullable',
                'date',
            ],
            'status' => [
                'nullable',
                Rule::in([
                    'Active',
                    'Maintenance',
                    'Inactive',
                ]),
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        if (
            empty(
                $validated['status']
            )
        ) {
            $validated['status'] =
                'Active';
        }

        $vehicle =
            Vehicle::create(
                $validated
            );

        return response()->json([
            'success' => true,

            'message' =>
                'Vehicle created successfully.',

            'data' => $vehicle,
        ], 201);
    }

    /**
     * Menampilkan satu vehicle.
     */
    public function show(
        Vehicle $vehicle
    ) {
        return response()->json([
            'success' => true,
            'data' => $vehicle,
        ]);
    }

    /**
     * Update vehicle.
     */
    public function update(
        Request $request,
        Vehicle $vehicle
    ) {
        $validated = $request->validate([
            'plate_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('vehicles', 'plate_number')->ignore($vehicle->id),
            ],
            'type' => [
                'required',
                'string',
                'max:255',
            ],
            'brand' => [
                'nullable',
                'string',
                'max:255',
            ],
            'axle' => [
                'nullable',
                'string',
                'max:50',
            ],
            'owner_name' => [
                'nullable',
                'string',
                'max:255',
            ],
            'category' => [
                'nullable',
                'string',
                'max:255',
            ],
            'year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2100',
            ],
            'color' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig' => [
                'nullable',
                'string',
                'max:100',
            ],
            'rig_baru' => [
                'nullable',
                'string',
                'max:100',
            ],
            'stnk_expiry' => [
                'nullable',
                'date',
            ],
            'pajak_expiry' => [
                'nullable',
                'date',
            ],
            'kir_expiry' => [
                'nullable',
                'date',
            ],
            'pass_expiry' => [
                'nullable',
                'date',
            ],
            'status' => [
                'required',
                Rule::in([
                    'Active',
                    'Maintenance',
                    'Inactive',
                ]),
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $vehicle->update(
            $validated
        );

        $vehicle->refresh();

        return response()->json([
            'success' => true,

            'message' =>
                'Vehicle updated successfully.',

            'data' => $vehicle,
        ]);
    }

    /**
     * Menghapus vehicle.
     */
    public function destroy(
        Vehicle $vehicle
    ) {
        $vehicle->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Vehicle deleted successfully.',
        ]);
    }
}