# Asterisk Manager — Project Context

## Identitas Proyek

**Nama:** Asterisk Manager  
**Tujuan:** Dashboard web internal perusahaan untuk mengelola dan memonitor server Asterisk (PBX). Menggantikan kebutuhan SSH/Putty untuk operasional sehari-hari.

## Kondisi Saat Ini (September 2026)

Proyek ini adalah **Next.js + TypeScript** dengan semua data masih berbentuk **mock/simulasi**. Belum ada koneksi ke server Asterisk sungguhan. Backend dan autentikasi belum diimplementasikan.

## Keputusan Desain yang Sudah Diambil

1. **Nama aplikasi:** "Asterisk Manager" (bukan PBX Manager, bukan PBX Builder)
2. **Konfigurasi:** Masih mengandalkan file `.conf` (bukan realtime DB). Mode `.conf` adalah prioritas utama.
3. **Multi-server & Multi-project:** Mendukung beberapa server sekaligus. Setiap server punya `id`, `name`, `ip`, dan `port`. Server tidak dibatasi oleh `role` kaku (seperti IVR/DIALER) karena satu server dapat memuat banyak project sekaligus.
4. **Projects di Sidebar:** Istilah di sidebar adalah "Projects" (bukan Engines). Setiap project mengelompokkan Endpoints, AORs, Auths, Registrations, Identifies, dan Dialplan.
5. **Deploy workflow:** Edit di UI → Generate `.conf` → Tekan "Deploy & Reload" → Sistem kirim file dan jalankan `asterisk -rx "pjsip reload"` + `asterisk -rx "dialplan reload"` → Lihat output di terminal console.
6. **Live Monitor:** Pengguna bisa toggle panel mana yang ingin dilihat (Endpoints, Contacts, Registrations, Channels, ARI Apps, RTP Stats, CLI Logger). Logger muncul sebagai panel sticky di kanan layar (split-screen).

## Konteks Pengguna

- Engineer PBX yang terbiasa dengan Asterisk CLI (`pjsip show endpoints`, `pjsip show contacts`, `pjsip show registrations`, `core show channels`, dll).
- Ingin **melihat data bergerak secara real-time** tanpa harus masuk ke terminal.
- Format data di Live Monitor harus **persis seperti output Asterisk CLI** (contoh: kolom ContactURI, AOR, Hash, Status, RTT).
- Tidak suka elemen UI yang tidak informatif (contoh: summary cards hitungan dihapus karena tidak perlu).
- Ingin bisa melihat logger Asterisk (`/var/log/asterisk/full`) langsung dari browser, termasuk bisa scroll ke atas untuk riwayat log.

## Workflows / Habit Pengguna (Penting!)
- Masuk ke server menggunakan **SSH via Mac Terminal** (contoh: `ssh dev@server`).
- **Saat menangani kasus IVR:** Pengguna melihat log aplikasi eksternal (ARI) menggunakan perintah Docker: `docker logs --tail 20 -f ari-server`. *(Catatan: Dashboard kelak perlu memiliki panel Docker Logs Viewer untuk ini).*
- **Melihat Log Asterisk:** Terbiasa masuk ke Asterisk CLI menggunakan `asterisk -rvvv`.
- **Handling Asterisk Mati:** Jika Asterisk terdeteksi mati, biasa merestart menggunakan `systemctl restart asterisk`, atau jika macet/perlu disesuaikan, mematikan paksa (kill), menghapus PID (`rm`), lalu menyalakan ulang (start). *(Catatan: Dashboard perlu tombol "Service Controls" yang bisa menjalankan command ini).*

## Server yang Dikelola

| Nama | IP |
|------|----|
| IVR-1 | 192.168.10.11 |
| IVR-2 | 192.168.10.12 |
| IVR-3 | 192.168.10.13 |
| IVR-4 | 192.168.10.14 |
| DIALER-1 | 10.0.0.50 |

## File Penting

- `src/lib/contexts/server-context.tsx` — State global untuk server aktif yang tersinkronisasi ke PostgreSQL via Prisma.
- `src/components/layout/header.tsx` — Header dengan server selector, arrow sidebar toggle, theme toggle, fullscreen mode, dan tombol "Deploy & Reload".
- `src/components/layout/sidebar.tsx` — Sidebar navigasi responsif dengan section "Projects" (CRUD project/product).
- `src/app/monitor/page.tsx` — Live Monitor (Endpoints, Contacts, Registrations, Channels, ARI, RTP, CLI Logger).
- `src/app/page.tsx` — Main Dashboard.
