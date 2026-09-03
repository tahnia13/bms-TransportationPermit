<?php

namespace App\Http\Controllers;

use App\Models\Archive;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArchiveController extends Controller
{
    /**
     * Display a listing of archives.
     */
    public function index(Request $request)
    {
        $query = Archive::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('uploaded_by', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Year filter
        if ($request->filled('year')) {
            $query->whereYear('archive_date', $request->year);
        }

        $archives = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Archives retrieved successfully',
            'data' => $archives,
        ]);
    }

    /**
     * Store a newly created archive (supports physical file upload).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_number' => [
                'required',
                'string',
                'max:100',
                'unique:archives,document_number',
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'category' => [
                'required',
                'string',
                'max:100',
            ],
            'uploaded_by' => [
                'nullable',
                'string',
                'max:255',
            ],
            'archive_date' => [
                'nullable',
                'date',
            ],
            'status' => [
                'required',
                Rule::in(['Active', 'Pending', 'Archived']),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'file' => [
                'nullable',
                'file',
                'max:25600', // max 25MB
            ],
        ]);

        $filePath = null;
        $fileName = null;
        $fileSize = null;
        $fileType = null;

        if ($request->hasFile('file')) {
            $uploaded = $request->file('file');
            $fileName = $uploaded->getClientOriginalName();
            $fileSize = $uploaded->getSize();
            $fileType = $uploaded->getClientOriginalExtension();
            $filePath = $uploaded->store('archives', 'public');
        }

        $archive = Archive::create([
            'document_number' => $validated['document_number'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'uploaded_by' => $validated['uploaded_by'] ?? 'Staff',
            'archive_date' => $validated['archive_date'] ?? now()->toDateString(),
            'status' => $validated['status'],
            'description' => $validated['description'] ?? null,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'file_type' => $fileType,
        ]);

        AuditLog::log(
            'UPLOAD',
            'Archive',
            "Mengunggah berkas arsip #{$archive->document_number} - {$archive->title}" . ($fileName ? " ({$fileName})" : ""),
            $archive->id,
            [
                'username' => $archive->uploaded_by,
                'role' => $request->input('current_user_role', 'Transportation Staff')
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Berkas arsip digital berhasil disimpan.',
            'data' => $archive,
        ], 201);
    }

    /**
     * Display the specified archive.
     */
    public function show($id)
    {
        $archive = Archive::find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archive not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Archive retrieved successfully',
            'data' => $archive,
        ]);
    }

    /**
     * Download the physical file from archive.
     */
    public function download($id)
    {
        $archive = Archive::findOrFail($id);

        if (!$archive->file_path || !Storage::disk('public')->exists($archive->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas fisik tidak ditemukan di penyimpanan server.',
            ], 404);
        }

        AuditLog::log(
            'DOWNLOAD',
            'Archive',
            "Mengunduh berkas fisik arsip #{$archive->document_number} ({$archive->file_name})",
            $archive->id
        );

        return Storage::disk('public')->download(
            $archive->file_path,
            $archive->file_name ?: "{$archive->document_number}.pdf"
        );
    }

    /**
     * Update the specified archive.
     */
    public function update(Request $request, $id)
    {
        $archive = Archive::find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archive not found',
            ], 404);
        }

        $validated = $request->validate([
            'document_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('archives', 'document_number')->ignore($id),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'category' => [
                'required',
                'string',
                'max:100',
            ],
            'uploaded_by' => [
                'nullable',
                'string',
                'max:255',
            ],
            'archive_date' => [
                'nullable',
                'date',
            ],
            'status' => [
                'required',
                Rule::in(['Active', 'Pending', 'Archived']),
            ],
            'description' => [
                'nullable',
                'string',
            ],
            'file' => [
                'nullable',
                'file',
                'max:25600',
            ],
        ]);

        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($archive->file_path && Storage::disk('public')->exists($archive->file_path)) {
                Storage::disk('public')->delete($archive->file_path);
            }

            $uploaded = $request->file('file');
            $archive->file_name = $uploaded->getClientOriginalName();
            $archive->file_size = $uploaded->getSize();
            $archive->file_type = $uploaded->getClientOriginalExtension();
            $archive->file_path = $uploaded->store('archives', 'public');
        }

        $archive->document_number = $validated['document_number'];
        $archive->title = $validated['title'];
        $archive->category = $validated['category'];
        $archive->uploaded_by = $validated['uploaded_by'] ?? $archive->uploaded_by;
        $archive->archive_date = $validated['archive_date'] ?? $archive->archive_date;
        $archive->status = $validated['status'];
        $archive->description = $validated['description'] ?? null;
        $archive->save();

        AuditLog::log(
            'UPDATE',
            'Archive',
            "Memperbarui berkas arsip #{$archive->document_number}",
            $archive->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Archive updated successfully',
            'data' => $archive,
        ]);
    }

    /**
     * Remove the specified archive.
     */
    public function destroy($id)
    {
        $archive = Archive::find($id);

        if (!$archive) {
            return response()->json([
                'success' => false,
                'message' => 'Archive not found',
            ], 404);
        }

        if ($archive->file_path && Storage::disk('public')->exists($archive->file_path)) {
            Storage::disk('public')->delete($archive->file_path);
        }

        $docNo = $archive->document_number;
        $archive->delete();

        AuditLog::log(
            'DELETE',
            'Archive',
            "Menghapus berkas arsip #{$docNo}",
            $id
        );

        return response()->json([
            'success' => true,
            'message' => 'Archive deleted successfully',
        ]);
    }
}