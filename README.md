# Asterisk Manager

Dashboard manajemen Asterisk berbasis web, dibangun dengan Next.js dan TypeScript.
Tujuannya adalah menggantikan kebutuhan SSH/Putty untuk konfigurasi dan monitoring Asterisk sehari-hari.

---

## Fitur Utama

### Konfigurasi
- **PJSIP Config** — Kelola endpoints, auth, AOR, dan transport via UI form, lalu generate file `pjsip.conf` otomatis.
- **Dialplan Config** — Edit `extensions.conf` dan context dialplan langsung dari browser.
- **Global Settings** — Konfigurasi parameter global Asterisk (`general` section di `pjsip.conf`).
- **Transports** — Kelola transport SIP (UDP/TCP/TLS/WS/WSS).
- **Templates** — Simpan dan reuse konfigurasi PJSIP yang sering dipakai.

### Deployment & Reload
- **Deploy & Reload** (tombol di Header) — Simulasikan push konfigurasi ke server dan jalankan:
  - `asterisk -rx "pjsip reload"`
  - `asterisk -rx "dialplan reload"`
  - Output log reload tampil di terminal console berwarna (hijau = sukses, merah = error).

### Live Monitor
Halaman monitoring real-time yang dapat disesuaikan pengguna:
- **Panel Toggle (Visible Panels):** Aktifkan/matikan panel sesuka hati:
  - PJSIP Endpoints
  - PJSIP Registrations (format persis seperti `pjsip show registrations`)
  - Active Channels (untuk server Dialer)
  - ARI Applications (untuk server IVR)
  - RTP Stats (Jitter & Packet Loss)
  - Asterisk CLI & Logger
- **Split-Screen Logger:** Saat CLI & Logger diaktifkan, terminal hitam muncul di kolom kanan layar secara sticky (tidak ikut scroll), sehingga Anda bisa membaca tabel di kiri sambil memantau log di kanan.
- **CLI Input:** Ketik perintah Asterisk apa saja (contoh: `pjsip show aors`, `core show channels`) langsung dari browser dan lihat hasilnya di layar terminal.
- **Auto-scroll Log:** Log berjalan otomatis setiap 1.5 detik mensimulasikan `tail -f /var/log/asterisk/full`. Log dapat di-scroll ke atas untuk melihat riwayat.
- **Role-aware:** Tampilan panel default berbeda tergantung peran server (IVR vs DIALER).

### Multi-Server Management
- Kelola hingga 5+ server Asterisk dari satu dashboard.
- Pilih server aktif dari dropdown di header; semua halaman langsung beradaptasi ke server yang dipilih.
- Setiap server memiliki properti **Role**: `IVR`, `DIALER`, atau `DEV`.

---

## Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix-based) |
| Icons | Lucide React |
| State | React Context (`ServerContext`) |

---

## Struktur Folder

```
src/
├── app/
│   ├── page.tsx              # Main Dashboard
│   ├── monitor/page.tsx      # Live Monitor (split-screen)
│   ├── pjsip-config/         # PJSIP configuration
│   ├── dialplan-config/      # Dialplan editor
│   ├── global-settings/      # Global Asterisk settings
│   ├── transports/           # Transport management
│   ├── templates/            # Config templates
│   └── product/[productId]/  # Per-product config pages
├── components/
│   ├── layout/
│   │   ├── header.tsx        # Header + Server Selector + Deploy & Reload
│   │   ├── sidebar.tsx       # Navigasi utama
│   │   └── page-container.tsx
│   └── ui/                   # shadcn components
└── lib/
    ├── contexts/
    │   └── server-context.tsx # State management server aktif + role
    └── api/
        ├── pjsip-objects.ts  # Core PJSIP data definitions
        ├── endpoints.ts
        ├── trunks.ts
        ├── global.ts
        └── products.ts
```

---

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Status Implementasi

| Fitur | Status |
|-------|--------|
| Multi-server selector | ✅ Done |
| Main Dashboard | ✅ Done |
| PJSIP Config (CRUD) | ✅ Done |
| Dialplan Config | ✅ Done |
| Global Settings | ✅ Done |
| Transports | ✅ Done |
| Templates | ✅ Done |
| Deploy & Reload Console | ✅ Done (Simulasi) |
| Live Monitor (Panel Toggle) | ✅ Done |
| Live Monitor (CLI & Logger) | ✅ Done (Simulasi) |
| Live Monitor (RTP Stats) | ✅ Done (Simulasi) |
| Koneksi AMI/SSH Real | ⬜ Belum (perlu backend) |
| Autentikasi Login | ⬜ Belum |
| Raw Config File Editor | ⬜ Belum (direncanakan) |

---

## Roadmap Selanjutnya

1. **Backend API** — Sambungkan ke server Asterisk nyata via AMI (port 5038) atau SSH untuk data real-time.
2. **Autentikasi** — Login page untuk akses internal perusahaan.
3. **Raw Config Editor** — Editor file `.conf` mentah (rtp.conf, logger.conf, dll) langsung dari browser.
4. **Persistent Deploy Log** — Simpan riwayat deploy di database.
