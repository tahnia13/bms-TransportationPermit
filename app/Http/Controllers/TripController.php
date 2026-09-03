<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    /**
     * Menampilkan semua data trip.
     */
    public function index()
    {
        $trips = Trip::with([
            'permit',
            'vehicle',
            'driver',
        ])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Trips retrieved successfully',
            'data' => $trips,
        ]);
    }

    /**
     * Menyimpan trip baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'permit_id' => [
                'nullable',
                'exists:permits,id',
            ],

            'vehicle_id' => [
                'nullable',
                'exists:vehicles,id',
            ],

            'driver_id' => [
                'nullable',
                'exists:drivers,id',
            ],

            'trip_number' => [
                'required',
                'string',
                'max:255',
                'unique:trips,trip_number',
            ],

            'departure_date' => [
                'nullable',
                'date',
            ],

            'return_date' => [
                'nullable',
                'date',
                'after_or_equal:departure_date',
            ],

            'origin' => [
                'nullable',
                'string',
                'max:255',
            ],

            'destination' => [
                'nullable',
                'string',
                'max:255',
            ],

            'purpose' => [
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'Planned',
                    'Active',
                    'Completed',
                    'Cancelled',
                    'planned',
                    'active',
                    'completed',
                    'cancelled',
                ]),
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $validated['status'] = ucfirst(
            strtolower($validated['status'] ?? 'Planned')
        );

        $trip = Trip::create($validated);

        $trip->load([
            'permit',
            'vehicle',
            'driver',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip created successfully',
            'data' => $trip,
        ], 201);
    }

    /**
     * Menampilkan satu data trip.
     */
    public function show(string $id)
    {
        $trip = Trip::with([
            'permit',
            'vehicle',
            'driver',
        ])->find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Trip retrieved successfully',
            'data' => $trip,
        ]);
    }

    /**
     * Mengubah data trip.
     */
    public function update(Request $request, string $id)
    {
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found',
            ], 404);
        }

        $validated = $request->validate([
            'permit_id' => [
                'nullable',
                'exists:permits,id',
            ],

            'vehicle_id' => [
                'nullable',
                'exists:vehicles,id',
            ],

            'driver_id' => [
                'nullable',
                'exists:drivers,id',
            ],

            'trip_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('trips', 'trip_number')
                    ->ignore($trip->id),
            ],

            'departure_date' => [
                'nullable',
                'date',
            ],

            'return_date' => [
                'nullable',
                'date',
                'after_or_equal:departure_date',
            ],

            'origin' => [
                'nullable',
                'string',
                'max:255',
            ],

            'destination' => [
                'nullable',
                'string',
                'max:255',
            ],

            'purpose' => [
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'nullable',
                'string',
                Rule::in([
                    'Planned',
                    'Active',
                    'Completed',
                    'Cancelled',
                    'planned',
                    'active',
                    'completed',
                    'cancelled',
                ]),
            ],

            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $validated['status'] = ucfirst(
            strtolower($validated['status'] ?? $trip->status)
        );

        $trip->update($validated);

        $trip->load([
            'permit',
            'vehicle',
            'driver',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trip updated successfully',
            'data' => $trip,
        ]);
    }

    /**
     * Menghapus trip.
     */
    public function destroy(string $id)
    {
        $trip = Trip::find($id);

        if (!$trip) {
            return response()->json([
                'success' => false,
                'message' => 'Trip not found',
            ], 404);
        }

        $trip->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trip deleted successfully',
        ]);
    }
}