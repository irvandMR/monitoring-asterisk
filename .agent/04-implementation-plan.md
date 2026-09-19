# Asterisk Manager — Implementation Status

## Sudah Selesai ✅

### Layout & Shell
- Sidebar navigasi dengan branding "Asterisk Manager"
- Header dengan server selector (dropdown) dan tombol "Deploy & Reload"
- `ServerContext` untuk state management server aktif
- **Responsive Mobile Drawer & Show/Hide Sidebar**:
  - Tombol hamburger menu di Header (mobile & desktop)
  - Mobile drawer off-canvas dengan backdrop blur & animasi slide-in
  - Tombol close (X) di header sidebar pada mobile
  - Auto-close drawer saat memilih menu / navigasi
  - Left padding dinamis (`lg:pl-64 pl-0`) agar tidak memotong konten di layar HP
  - Header adaptif (elemen non-kritis disembunyikan/di-truncate pada viewport kecil)
- **Theme & Display Mode**:
  - Dark / Light mode toggle (ikon Sun / Moon di Header) dengan `localStorage` persistence
  - Fullscreen Mode (ikon Maximize / Minimize di Header) untuk tampilan NOC / Wallboard Monitoring


### Halaman yang Sudah Ada
| Halaman | Route | Status |
|---------|-------|--------|
| Main Dashboard | `/` | ✅ Lengkap |
| Live Monitor | `/monitor` | ✅ Lengkap |
| PJSIP Config | `/pjsip-config` | ✅ Lengkap |
| Dialplan Config | `/dialplan-config` | ✅ Lengkap |
| Global Settings | `/global-settings` | ✅ Lengkap |
| Transports | `/transports` | ✅ Lengkap |
| Templates | `/templates` | ✅ Lengkap |
| Per-product Config | `/product/[productId]/[type]` | ✅ Dynamic |

### Fitur Live Monitor (detail)
- Panel toggle: Endpoints, Contacts, Registrations, Channels, ARI Apps, RTP Stats, CLI Logger
- **PJSIP Contacts (`pjsip show contacts`)**: Tabel ContactURI/Binding, AOR, Hash, Status (Avail/Unavail/NonQual), dan RTT Ping
- Format tabel Registrations: `Registration/ServerURI | Auth | Status (Exp)` — persis seperti `pjsip show registrations`
- Empty state pada setiap tabel (tampil tabel kosong dengan pesan, bukan disembunyikan)
- Split-screen logger: panel sticky di kanan, lebar 400px (xl: 500px), tinggi full viewport
- CLI input di logger: ketik perintah Asterisk → Enter → tampil di log
- Auto-scroll log setiap 1.5 detik saat logger aktif, dapat scroll ke atas (riwayat 500 baris)
- Role-aware default panels: IVR → Endpoints+Contacts+Reg+ARI, DIALER → Endpoints+Contacts+Channels

### Deploy & Reload
- Dialog terminal console di header
- Simulasi log SSH + `pjsip reload` + `dialplan reload`
- Log berwarna: hijau = sukses, merah = error

### Autentikasi & Database
- PostgreSQL via Prisma ORM (`User`, `Server`, `DeployLog` models)
- Autentikasi JWT + bcrypt cookie-based (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- Halaman Login `/login` dengan visual Asterisk Manager
- Route protection via `proxy.ts` (Next.js 16)
- Seeding default user (`admin` / `admin123`) & 5 server awal

### Manajemen Server (CRUD & Edit IP)
- API `/api/servers` (GET, POST, PUT, DELETE) tersimpan permanen di DB
- Modal "Kelola Server Asterisk" (`ServerManagerDialog`) di Header
- Fitur Edit IP Address, Nama Server, Role (IVR/DIALER/DEV), dan Port AMI
- Tambah server baru dan hapus server langsung dari UI

---

## Belum Diimplementasikan ⬜

### Prioritas Tinggi
1. **Koneksi SSH / AMI Nyata** — Eksekusi command Asterisk & reload via SSH Key
2. **Live Log Stream Nyata** — Baca `/var/log/asterisk/full` via SSH/WebSocket

5. **Real deploy via SSH** — Kirim file ke server dan jalankan reload sungguhan
6. **Notifikasi error live** — Kalau ada endpoint Unreachable, tampilkan alert di dashboard

### Prioritas Rendah
7. **Audit log** — Riwayat siapa mengubah konfigurasi apa kapan

---

## Aturan Penting untuk Sesi Berikutnya

1. Jangan ubah nama aplikasi. Selalu gunakan **"Asterisk Manager"**.
2. `ServerRole` adalah union type: `"IVR" | "DIALER" | "DEV"` — bukan `"Dialer"` dengan huruf kecil.
3. Saat menggunakan filter panel di Live Monitor, cek kondisi `activeServer.role === "IVR"` atau `"DIALER"` (kapital semua).
4. Logger harus selalu **sticky di kanan** (bukan di bawah tabel). Gunakan `sticky top-4` dan `h-[calc(100vh-32px)]`.
5. Tabel selalu tampil saat diaktifkan (bahkan jika data kosong). Tampilkan baris "No data" di dalam tabel.
6. Format timestamp log: `[ISO string] LEVEL[PID] file.c: message`.
