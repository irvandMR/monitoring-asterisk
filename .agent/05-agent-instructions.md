# Asterisk Manager — Agent Instructions

Kamu adalah senior engineer yang melanjutkan proyek **Asterisk Manager**.

## Baca Dulu Sebelum Menulis Kode

1. Baca `00-project-context.md` untuk konteks proyek.
2. Baca `04-implementation-plan.md` untuk status implementasi.
3. Inspeksi file yang relevan sebelum membuat asumsi.

## Aturan Tidak Boleh Dilanggar

1. **Nama aplikasi adalah "Asterisk Manager"** — jangan ganti jadi "PBX Manager", "PBX Builder", atau apapun yang lain.
2. **Server Role Dihapus & Istilah "Projects":** Server tidak lagi dibatasi role (karena satu server dapat memuat banyak project/dialplan). Gunakan istilah **"Projects"** di sidebar (bukan Engines).
3. **Mock data** boleh digunakan selama belum ada backend. Tapi harus jelas bahwa itu mock (jangan presentasikan sebagai data nyata).
4. **Jangan hapus fitur yang sudah ada** tanpa alasan eksplisit dari pengguna.
5. **Jalankan `npm run build`** setelah setiap perubahan signifikan untuk verifikasi tidak ada error TypeScript.
6. **Tabel kosong tetap tampil** — jangan sembunyikan tabel hanya karena datanya kosong. Tampilkan baris pesan "No data".
7. **Logger sticky di kanan** — format split-screen, bukan di bawah tabel.

## Konvensi Kode

- Framework: Next.js 16 App Router
- Semua page adalah `"use client"` karena menggunakan React state
- Server state ada di `src/lib/contexts/server-context.tsx`
- Komponen UI ada di `src/components/ui/` (shadcn)
- Data API (mock) ada di `src/lib/api/`

## Alur Deploy yang Benar (Mock)

```
User edit config → Klik "Deploy & Reload" →
Terminal dialog terbuka →
Animasi log: SSH connect → Transfer file → pjsip reload → dialplan reload →
Output hijau = sukses, merah = error
```

## Format Data Live Monitor

Saat nanti connect ke backend nyata, data yang ditampilkan harus mengikuti format output Asterisk CLI:

### pjsip show registrations:
```
Registration/ServerURI | Auth | Status (Exp)
voip-trunk-reg-1/sip:x.x.x.x | voip-trunk-auth-1 | Registered (exp. 1433s)
```

### pjsip show endpoints:
```
Endpoint Name | Status | Contact IP | Ping (RTT)
1001 | Avail | 10.0.2.14:5060 | 45ms
```

## Roadmap Berikutnya

Prioritas task yang belum selesai (urutkan dari paling penting):
1. Backend API (AMI/SSH connection)
2. Autentikasi login
3. Raw Config File Editor
4. Real deploy (SSH eksekusi nyata)
5. Audit log
