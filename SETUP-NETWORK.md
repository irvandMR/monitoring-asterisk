# Panduan Setup Jaringan (Multi-Server AMI Monitoring)

Dokumen ini menjelaskan cara menghubungkan Asterisk Dashboard ke beberapa server Asterisk sekaligus (seperti Server DEV dan Server RTC) menggunakan **SSH Tunneling**.

Karena Dashboard ini berjalan di mesin lokal Anda (localhost), ia tidak bisa begitu saja mengakses port AMI (5038) dari server produksi yang biasanya ditutup oleh firewall demi keamanan. Solusinya adalah dengan membuat terowongan aman (SSH Tunnel) dari mesin lokal ke masing-masing server.

---

## 1. Konsep Dasar Port Forwarding

Asterisk Manager Interface (AMI) secara default berjalan di port `5038`. 
Jika Anda memiliki lebih dari 1 server (misal DEV dan RTC), Anda tidak bisa mendaftarkan keduanya ke port lokal `5038` secara bersamaan karena akan bentrok.

Solusinya:
- **Server 1 (DEV)** di-mapping ke port lokal `3461`
- **Server 2 (RTC)** di-mapping ke port lokal `5038` (default)
- **Server 3 (Lainnya)** di-mapping ke port lokal `5039`
- *dan seterusnya...*

---

## 2. Cara Membuka SSH Tunnel

Buka terminal di komputer/Mac Anda (bisa buka beberapa tab terminal), lalu jalankan perintah SSH berikut untuk masing-masing server:

### Untuk Server DEV
Jalankan perintah ini dan biarkan terminalnya tetap terbuka di background:
```bash
ssh -i ~/.ssh/id_ed25519 -N -L <PORT_LOKAL_DEV>:127.0.0.1:5038 dev@<IP_SERVER_DEV>
```
*(Penjelasan: Terowongan ini membawa port 5038 dari server DEV agar bisa diakses lewat port <PORT_LOKAL_DEV> di localhost Anda).*

### Untuk Server RTC
Jalankan perintah ini di tab terminal yang baru:
```bash
ssh -i ~/.ssh/id_ed25519 -N -L <PORT_LOKAL_RTC>:127.0.0.1:5038 dev@<IP_SERVER_RTC>
```
*(Penjelasan: Terowongan ini membawa port 5038 dari server RTC agar bisa diakses langsung lewat port <PORT_LOKAL_RTC> di localhost Anda).*

---

## 3. Konfigurasi Database (Prisma Seed)

Setelah terowongan jaringan terbuka, Anda harus memberi tahu Dashboard ke pintu mana ia harus mengetuk untuk masing-masing server. 
Pengaturan ini disimpan di database. Buka file `prisma/seed.ts` dan pastikan konfigurasinya seperti ini:

```typescript
{
    name : "SERVER DEV", 
    ip : "<IP_SERVER_DEV>", 
    amiHost: "127.0.0.1",   // Wajib: Memaksa Dashboard konek via localhost
    port: <PORT_LOKAL_DEV>, // Sesuai port SSH tunnel DEV di atas
    amiUsername: "nodejs-ami",
    amiPassword: "Pass1234",
    sshUsername: "dev"
},
{
    name : "SERVER Call RTC", 
    ip : "<IP_SERVER_RTC>", 
    amiHost: "127.0.0.1",   // Wajib: Memaksa Dashboard konek via localhost
    port: <PORT_LOKAL_RTC>, // Sesuai port SSH tunnel RTC di atas
    amiUsername: "nodejs-ami",
    amiPassword: "Pass1234",
    sshUsername: "dev"
}
```

Setelah mengubah file `seed.ts`, jalankan perintah berikut di terminal (berada di folder project) untuk memperbarui database:
```bash
npx prisma db seed
```

---

## 4. Troubleshooting

**Q: Saya mendapat pesan "Error: connect ECONNREFUSED 127.0.0.1:<PORT_LOKAL_DEV>"**
A: Pastikan terminal yang menjalankan perintah SSH Tunnel untuk DEV masih terbuka dan tidak terputus (Timeout). Jika terputus, jalankan kembali perintah SSH-nya.

**Q: Log di Dashboard berhenti berjalan?**
A: Terkadang koneksi SSH bisa mengalami "sleep" atau "broken pipe". Coba tutup (Ctrl+C) koneksi SSH-nya dan jalankan lagi. Anda juga bisa menambahkan flag `-o ServerAliveInterval=60` di perintah SSH agar koneksi tidak mudah terputus. Contoh:
```bash
ssh -i ~/.ssh/id_ed25519 -N -o ServerAliveInterval=60 -L <PORT_LOKAL_RTC>:127.0.0.1:5038 dev@<IP_SERVER_RTC>
```
