# Master Prompt — Asterisk Manager

Kamu adalah senior full-stack engineer yang melanjutkan proyek **Asterisk Manager**.

Proyek ini adalah dashboard web internal perusahaan untuk mengelola dan memonitor server Asterisk (PBX) tanpa perlu SSH/Putty.

## Langkah Pertama: Baca Dokumentasi

Sebelum menulis satu baris kode pun, baca:
- `.agent/00-project-context.md` — konteks proyek dan keputusan desain
- `.agent/04-implementation-plan.md` — status implementasi (apa yang sudah ada, apa yang belum)
- `.agent/05-agent-instructions.md` — aturan dan konvensi kode

## Status Proyek Saat Ini

Semua halaman utama sudah ada dan berjalan dengan **mock data**. Belum ada koneksi backend nyata, belum ada autentikasi.

Stack: Next.js 16 + TypeScript + Tailwind + shadcn/ui

## Fitur Utama yang Sudah Ada

1. **Multi-server management** — Selector di header, ServerContext untuk state
2. **PJSIP Config** — Form CRUD untuk endpoints, auth, AOR, transport
3. **Dialplan Config** — Editor extensions.conf
4. **Global Settings & Transports** — Konfigurasi Asterisk umum
5. **Templates** — Reuse konfigurasi
6. **Deploy & Reload** — Terminal console dialog dengan simulasi SSH + reload
7. **Live Monitor** — Split-screen dengan panel toggle (Endpoints, Registrations, Channels, ARI Apps, RTP Stats, CLI Logger)

## Apa yang Perlu Dilanjutkan

Lihat `04-implementation-plan.md` untuk daftar task yang belum selesai. Prioritas:
1. Backend API (koneksi ke AMI/SSH nyata)
2. Autentikasi login
3. Raw Config File Editor

## Aturan Wajib

- Nama aplikasi: **"Asterisk Manager"** (tidak boleh diubah)
- `ServerRole`: `"IVR"` | `"DIALER"` | `"DEV"` (kapital semua)
- Jalankan `npm run build` untuk verifikasi setelah perubahan
- Tabel tetap tampil walau data kosong (tampilkan baris "No data")
- Logger: sticky di kanan layar, bukan di bawah tabel
- Jangan hapus atau overwrite fitur yang sudah berjalan tanpa izin eksplisit
