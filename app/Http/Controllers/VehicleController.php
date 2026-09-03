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

            'category' => [
                'required',
                Rule::in([
                    'Operational',
                    'Transport',
                    'Support',
                ]),
            ],

            'year' => [
                'required',
                'integer',
                'min:1900',
                'max:2100',
            ],

            'rig' => [
                'nullable',
                'string',
                'max:20',
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
        $validated =
            $request->validate([
                'plate_number' => [
                    'required',
                    'string',
                    'max:50',

                    Rule::unique(
                        'vehicles',
                        'plate_number'
                    )->ignore(
                        $vehicle->id
                    ),
                ],

                'type' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'category' => [
                    'required',

                    Rule::in([
                        'Operational',
                        'Transport',
                        'Support',
                    ]),
                ],

                'year' => [
                    'required',
                    'integer',
                    'min:1900',
                    'max:2100',
                ],

                'rig' => [
                    'nullable',
                    'string',
                    'max:20',
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