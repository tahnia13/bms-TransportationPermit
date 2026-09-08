<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Permit;
use App\Models\Trip;
use App\Models\Archive;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic operational data for PT Besmindo Materi Sewatama.
     */
    public function run(): void
    {
        // 1. Users
        User::firstOrCreate(
            ['email' => 'admin@besmindo.co.id'],
            [
                'name' => 'Administrator BMS',
                'password' => Hash::make('password'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'ops@besmindo.co.id'],
            [
                'name' => 'Staff Operasional Logistik',
                'password' => Hash::make('password'),
            ]
        );

        User::firstOrCreate(
            ['email' => 'hse@besmindo.co.id'],
            [
                'name' => 'HSE Safety Officer',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Vehicles
        $vehiclesData = [
            [
                'plate_number' => 'BM 8891 TU',
                'type' => 'Hino 500 Prime Mover Heavy Duty',
                'category' => 'Heavy Truck',
                'year' => 2023,
                'rig' => '02',
                'status' => 'Active',
                'description' => 'Armada penarik trailer pipa bor & drill string, Rig 02 Minas.',
            ],
            [
                'plate_number' => 'BM 9412 QK',
                'type' => 'Mitsubishi Triton HDX 4x4 Double Cabin',
                'category' => 'Light Vehicle',
                'year' => 2024,
                'rig' => '03',
                'status' => 'Active',
                'description' => 'Kendaraan pengawas lapangan dan patroli keselamatan Rig 03 Duri.',
            ],
            [
                'plate_number' => 'BM 8102 XX',
                'type' => 'Scania R580 Multi-Axle Lowbed Trailer',
                'category' => 'Heavy Truck',
                'year' => 2022,
                'rig' => '16',
                'status' => 'Active',
                'description' => 'Khusus mobilisasi substructure rig dan generator daya tinggi.',
            ],
            [
                'plate_number' => 'BM 7731 AZ',
                'type' => 'Toyota Hilux 2.4 D-4D 4x4 Safety Edition',
                'category' => 'Light Vehicle',
                'year' => 2023,
                'rig' => '05',
                'status' => 'Active',
                'description' => 'Armada respon cepat mekanik & teknisi logging tool.',
            ],
            [
                'plate_number' => 'BM 9920 BB',
                'type' => 'Isuzu Giga FVR 34P Crane Truck 10 Ton',
                'category' => 'Heavy Truck',
                'year' => 2021,
                'rig' => '02',
                'status' => 'Maintenance',
                'description' => 'Sedang dalam jadwal servis berkala hidrolik crane di workshop Pekanbaru.',
            ],
            [
                'plate_number' => 'BM 8450 XY',
                'type' => 'Mitsubishi Fuso Fighter FM 6x2 Flatbed',
                'category' => 'Rig Truck',
                'year' => 2023,
                'rig' => '11',
                'status' => 'Active',
                'description' => 'Pengangkut casing tong, drill bit, dan perlengkapan workover rig.',
            ],
        ];

        $createdVehicles = [];
        foreach ($vehiclesData as $v) {
            $createdVehicles[] = Vehicle::updateOrCreate(
                ['plate_number' => $v['plate_number']],
                $v
            );
        }

        // 3. Drivers
        $driversData = [
            [
                'name' => 'Bambang Sutrisno',
                'license_number' => 'SIM-B2-88129031',
                'license_type' => 'SIM BII Umum',
                'phone' => '0812-7654-3210',
                'expiry_date' => Carbon::now()->addMonths(14)->toDateString(),
                'training_date' => Carbon::now()->subMonths(3)->toDateString(),
                'rig' => '02',
                'status' => 'Active',
                'description' => 'Driver senior bersertifikasi Defensive Driving Course (DDC) & K3LL Migas.',
            ],
            [
                'name' => 'Hendra Wijaya',
                'license_number' => 'SIM-B2-74910243',
                'license_type' => 'SIM BII Umum',
                'phone' => '0821-6543-9876',
                'expiry_date' => Carbon::now()->addMonths(8)->toDateString(),
                'training_date' => Carbon::now()->subMonths(5)->toDateString(),
                'rig' => '03',
                'status' => 'Active',
                'description' => 'Berpengalaman rute Duri - Bekasap dan area medan berat (off-road rig).',
            ],
            [
                'name' => 'Agus Prasetyo',
                'license_number' => 'SIM-B1-65239104',
                'license_type' => 'SIM BI Umum',
                'phone' => '0813-8822-4411',
                'expiry_date' => Carbon::now()->addMonths(20)->toDateString(),
                'training_date' => Carbon::now()->subMonths(1)->toDateString(),
                'rig' => '05',
                'status' => 'Active',
                'description' => 'Spesialis pengemudi light vehicle & armada antar jemput kru teknis.',
            ],
            [
                'name' => 'Dedi Kurniawan',
                'license_number' => 'SIM-B2-99014238',
                'license_type' => 'SIM BII Umum',
                'phone' => '0852-3344-9988',
                'expiry_date' => Carbon::now()->addMonths(11)->toDateString(),
                'training_date' => Carbon::now()->subMonths(6)->toDateString(),
                'rig' => '16',
                'status' => 'Active',
                'description' => 'Operator armada crane truck dan pengawas keselamatan muatan trailer.',
            ],
            [
                'name' => 'Rudi Hermawan',
                'license_number' => 'SIM-B2-55610294',
                'license_type' => 'SIM BII Umum',
                'phone' => '0823-1122-7788',
                'expiry_date' => Carbon::now()->addDays(25)->toDateString(),
                'training_date' => Carbon::now()->subMonths(11)->toDateString(),
                'rig' => '11',
                'status' => 'Active',
                'description' => 'Jadwal perpanjangan SIM dan Medical Check Up (MCU) dijadwalkan bulan ini.',
            ],
        ];

        $createdDrivers = [];
        foreach ($driversData as $d) {
            $createdDrivers[] = Driver::updateOrCreate(
                ['license_number' => $d['license_number']],
                $d
            );
        }

        // 4. Permits
        $permitsData = [
            [
                'permit_number' => 'PM-2609-1011',
                'requester' => 'Ahmad Fauzi',
                'department' => 'Rig Operations',
                'vehicle' => 'BM 8891 TU',
                'driver' => 'Bambang Sutrisno',
                'origin' => 'Workshop Tenayan Pekanbaru',
                'destination' => 'Rig Site 02 Minas Field',
                'purpose' => 'Mobilisasi Drill Pipe 5-inch & Heavy Weight Drill Collar',
                'start_date' => Carbon::now()->subDays(2)->toDateString(),
                'end_date' => Carbon::now()->addDays(20)->toDateString(),
                'status' => 'Approved',
                'approver' => 'Kepala Divisi Transportasi BMS',
                'approved_at' => Carbon::now()->subDays(2),
                'approval_notes' => 'Disetujui. Seluruh persyaratan APD dan cek fisik rem lolos inspeksi K3.',
                'description' => 'Izin jalan prioritas operasional pengeboran sumur minyak.',
            ],
            [
                'permit_number' => 'PM-2609-1022',
                'requester' => 'Surya Dinata',
                'department' => 'Fuel & Energy Logistics',
                'vehicle' => 'BM 9412 QK',
                'driver' => 'Hendra Wijaya',
                'origin' => 'Pekanbaru Logistics Base',
                'destination' => 'Rig Site 03 Duri Field',
                'purpose' => 'Pengiriman Sparepart Mud Pump & Pelumas Industri Rig',
                'start_date' => Carbon::now()->toDateString(),
                'end_date' => Carbon::now()->addDays(14)->toDateString(),
                'status' => 'Pending',
                'approver' => null,
                'approved_at' => null,
                'approval_notes' => null,
                'description' => 'Menunggu verifikasi hasil uji kelayakan armada dari tim inspeksi.',
            ],
            [
                'permit_number' => 'PM-2609-1033',
                'requester' => 'Dimas Wicaksono',
                'department' => 'Work Over & Well Services',
                'vehicle' => 'BM 8102 XX',
                'driver' => 'Dedi Kurniawan',
                'origin' => 'Pelabuhan Dumai Port Terminal',
                'destination' => 'Rig Site 16 Petapahan',
                'purpose' => 'Mobilisasi Unit Substructure Rig & Generator 1200 KVA',
                'start_date' => Carbon::now()->subDays(5)->toDateString(),
                'end_date' => Carbon::now()->addDays(18)->toDateString(),
                'status' => 'Approved',
                'approver' => 'Kepala Divisi Transportasi BMS',
                'approved_at' => Carbon::now()->subDays(5),
                'approval_notes' => 'Diizinkan dengan pengawalan mobil patroli di rute jalan lintas nasional.',
                'description' => 'Muatan kategori berbobot berat (over-dimension / over-weight permit).',
            ],
            [
                'permit_number' => 'PM-2609-1044',
                'requester' => 'Rian Hidayat',
                'department' => 'Field Support',
                'vehicle' => 'BM 7731 AZ',
                'driver' => 'Agus Prasetyo',
                'origin' => 'Workshop Tenayan Pekanbaru',
                'destination' => 'Rig Site 05 Siak',
                'purpose' => 'Pengiriman Peralatan Pengukur Tekanan & Logging Sensor',
                'start_date' => Carbon::now()->subDays(15)->toDateString(),
                'end_date' => Carbon::now()->addDays(4)->toDateString(),
                'status' => 'Approved',
                'approver' => 'Kepala Divisi Transportasi BMS',
                'approved_at' => Carbon::now()->subDays(15),
                'approval_notes' => 'Disetujui untuk masa operasi 20 hari kalender.',
                'description' => 'Segera ajukan perpanjangan izin sebelum tanggal berakhir.',
            ],
            [
                'permit_number' => 'PM-2609-1055',
                'requester' => 'M. Iqbal Pratama',
                'department' => 'Supply Chain',
                'vehicle' => 'BM 8450 XY',
                'driver' => 'Rudi Hermawan',
                'origin' => 'Duri Central Yard',
                'destination' => 'Rig Site 11 Bangko',
                'purpose' => 'Pengangkutan Casing Tubing 9-5/8 inch',
                'start_date' => Carbon::now()->subDays(40)->toDateString(),
                'end_date' => Carbon::now()->subDays(5)->toDateString(),
                'status' => 'Expired',
                'approver' => 'Kepala Divisi Transportasi BMS',
                'approved_at' => Carbon::now()->subDays(40),
                'approval_notes' => 'Izin operasional telah kedaluwarsa.',
                'description' => 'Armada dilarang beroperasi sebelum permit diperpanjang.',
            ],
            [
                'permit_number' => 'PM-2609-1066',
                'requester' => 'Taufik Rahman',
                'department' => 'Rig Operations',
                'vehicle' => 'BM 8891 TU',
                'driver' => 'Bambang Sutrisno',
                'origin' => 'Pekanbaru Workshop',
                'destination' => 'Rig Site 16 Petapahan',
                'purpose' => 'Mobilisasi Unit Top Drive System & Catwalk Hidrolik',
                'start_date' => Carbon::now()->addDays(1)->toDateString(),
                'end_date' => Carbon::now()->addDays(21)->toDateString(),
                'status' => 'Pending',
                'approver' => null,
                'approved_at' => null,
                'approval_notes' => null,
                'description' => 'Permohonan baru, membutuhkan otorisasi approval.',
            ],
        ];

        $createdPermits = [];
        foreach ($permitsData as $p) {
            $createdPermits[] = Permit::updateOrCreate(
                ['permit_number' => $p['permit_number']],
                $p
            );
        }

        // 5. Trips
        $tripsData = [
            [
                'trip_number' => 'TRP-2609-101',
                'permit_id' => $createdPermits[0]->id,
                'vehicle_id' => $createdVehicles[0]->id,
                'driver_id' => $createdDrivers[0]->id,
                'departure_date' => Carbon::now()->subDays(1)->toDateString(),
                'return_date' => Carbon::now()->addDays(3)->toDateString(),
                'origin' => 'Workshop Tenayan Pekanbaru',
                'destination' => 'Rig Site 02 Minas Field',
                'purpose' => 'Mobilisasi Drill Pipe 5-inch & Heavy Weight Drill Collar',
                'status' => 'In Transit',
                'description' => 'Armada sedang bergerak menuju checkpoint KM 32 Minas. Estimasi sampai sore hari.',
            ],
            [
                'trip_number' => 'TRP-2609-102',
                'permit_id' => $createdPermits[2]->id,
                'vehicle_id' => $createdVehicles[2]->id,
                'driver_id' => $createdDrivers[3]->id,
                'departure_date' => Carbon::now()->subDays(4)->toDateString(),
                'return_date' => Carbon::now()->subDays(1)->toDateString(),
                'origin' => 'Pelabuhan Dumai Port',
                'destination' => 'Rig Site 16 Petapahan',
                'purpose' => 'Mobilisasi Unit Substructure Rig & Generator Daya',
                'status' => 'Completed',
                'description' => 'Muatan telah dibongkar selamat di rig site 16, surat penerimaan muatan lengkap.',
            ],
            [
                'trip_number' => 'TRP-2609-103',
                'permit_id' => $createdPermits[1]->id,
                'vehicle_id' => $createdVehicles[1]->id,
                'driver_id' => $createdDrivers[1]->id,
                'departure_date' => Carbon::now()->addDays(1)->toDateString(),
                'return_date' => Carbon::now()->addDays(2)->toDateString(),
                'origin' => 'Pekanbaru Logistics Base',
                'destination' => 'Rig Site 03 Duri Field',
                'purpose' => 'Pengiriman Sparepart Mud Pump & Pelumas Industri',
                'status' => 'Planned',
                'description' => 'Jadwal keberangkatan pukul 07:00 WIB setelah checklist keselamatan pra-perjalanan.',
            ],
            [
                'trip_number' => 'TRP-2609-104',
                'permit_id' => $createdPermits[3]->id,
                'vehicle_id' => $createdVehicles[3]->id,
                'driver_id' => $createdDrivers[2]->id,
                'departure_date' => Carbon::now()->toDateString(),
                'return_date' => Carbon::now()->addDays(1)->toDateString(),
                'origin' => 'Workshop Tenayan Pekanbaru',
                'destination' => 'Rig Site 05 Siak',
                'purpose' => 'Pengiriman Peralatan Pengukur Tekanan & Sensor Casing',
                'status' => 'In Transit',
                'description' => 'Perjalanan dinas darat pengiriman instrumentasi penting rig.',
            ],
            [
                'trip_number' => 'TRP-2609-105',
                'permit_id' => $createdPermits[4]->id,
                'vehicle_id' => $createdVehicles[5]->id,
                'driver_id' => $createdDrivers[4]->id,
                'departure_date' => Carbon::now()->subDays(10)->toDateString(),
                'return_date' => Carbon::now()->subDays(7)->toDateString(),
                'origin' => 'Duri Central Yard',
                'destination' => 'Rig Site 11 Bangko',
                'purpose' => 'Pengangkutan Casing Tubing 9-5/8 inch',
                'status' => 'Completed',
                'description' => 'Selesai diantar sesuai jadwal. Dokumen berita acara serah terima tersimpan.',
            ],
        ];

        foreach ($tripsData as $t) {
            Trip::updateOrCreate(
                ['trip_number' => $t['trip_number']],
                $t
            );
        }

        // 6. Archives & Sample Files
        Storage::disk('public')->makeDirectory('archives');

        $samplePermitDoc = "DOKUMEN RESMI PT BESMINDO MATERI SEWATAMA\n=========================================\nNomor: DOC-BMS-2026-001\nKategori: Permit Operasional Rig\nPerihal: Izin Jalan Angkutan Alat Berat Rig 02 Minas\nTanggal Terbit: " . Carbon::now()->subDays(10)->format('d F Y') . "\nStatus: Aktif & Terverifikasi K3LL.";
        Storage::disk('public')->put('archives/sample-permit-rig02.txt', $samplePermitDoc);

        $sampleInspectionDoc = "LAPORAN HASIL INSPEKSI KELAYAKAN ARMADA TRUK\n============================================\nPT BESMINDO MATERI SEWATAMA\nNomor Unit: BM 8891 TU (Hino 500 Prime Mover)\nHasil Pengecekan: Rem, Ban, Kemudi, Lampu, GPS Tracker berfungsi 100% normal.\nInspektor: Divisi HSE & Maintenance.";
        Storage::disk('public')->put('archives/sample-inspeksi-armada.txt', $sampleInspectionDoc);

        $archivesData = [
            [
                'document_number' => 'DOC-BMS-2026-001',
                'title' => 'Surat Izin Operasional Angkutan Rig 02 Minas',
                'category' => 'Permit',
                'uploaded_by' => 'Staff Operasional',
                'archive_date' => Carbon::now()->subDays(10)->toDateString(),
                'status' => 'Active',
                'description' => 'Salinan digital surat izin mobilisasi peralatan pengeboran Rig 02.',
                'file_path' => 'archives/sample-permit-rig02.txt',
                'file_name' => 'sample-permit-rig02.txt',
                'file_size' => strlen($samplePermitDoc),
                'file_type' => 'text/plain',
            ],
            [
                'document_number' => 'DOC-BMS-2026-002',
                'title' => 'Laporan Hasil Inspeksi Kelaikan Armada Hino 500 (BM 8891 TU)',
                'category' => 'Vehicle',
                'uploaded_by' => 'HSE Inspector',
                'archive_date' => Carbon::now()->subDays(7)->toDateString(),
                'status' => 'Active',
                'description' => 'Hasil checklist kelayakan armada 50 titik uji berkala.',
                'file_path' => 'archives/sample-inspeksi-armada.txt',
                'file_name' => 'sample-inspeksi-armada.txt',
                'file_size' => strlen($sampleInspectionDoc),
                'file_type' => 'text/plain',
            ],
            [
                'document_number' => 'DOC-BMS-2026-003',
                'title' => 'Sertifikat Uji Berkala (KIR) & Uji Emisi Armada Lowbed Scania',
                'category' => 'Vehicle',
                'uploaded_by' => 'Staff Logistik',
                'archive_date' => Carbon::now()->subDays(15)->toDateString(),
                'status' => 'Active',
                'description' => 'Sertifikat resmi kelayakan jalan Dinas Perhubungan Riau.',
                'file_path' => null,
                'file_name' => 'kir-scania-2026.pdf',
                'file_size' => 148576,
                'file_type' => 'application/pdf',
            ],
            [
                'document_number' => 'DOC-BMS-2026-004',
                'title' => 'Sertifikasi K3 Pengemudi & Lisensi SIM BII Umum Bambang Sutrisno',
                'category' => 'Driver',
                'uploaded_by' => 'HSE Officer',
                'archive_date' => Carbon::now()->subDays(20)->toDateString(),
                'status' => 'Active',
                'description' => 'Dokumen bukti kelulusan Defensive Driving Course & Medical Check Up.',
                'file_path' => null,
                'file_name' => 'sim-ddc-bambang.pdf',
                'file_size' => 245760,
                'file_type' => 'application/pdf',
            ],
        ];

        foreach ($archivesData as $a) {
            Archive::updateOrCreate(
                ['document_number' => $a['document_number']],
                $a
            );
        }

        // 7. Audit Logs
        AuditLog::create([
            'action' => 'DATABASE_SEED',
            'module' => 'System',
            'description' => 'Inisialisasi data operasional armada, pengemudi, perizinan, dan arsip PT Besmindo Materi Sewatama.',
            'user_name' => 'System Initializer',
            'user_role' => 'Administrator',
            'ip_address' => '127.0.0.1',
        ]);
    }
}
