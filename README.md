# JACCKS AI v2

Chatbot web responsif + PWA berbasis Node.js dan OpenAI Responses API.

## Fitur v2
- Streaming jawaban dan konteks percakapan berlanjut.
- Riwayat chat lokal, chat baru, hapus chat.
- Upload gambar PNG/JPEG/WEBP/GIF (maks. 5 MB) untuk dianalisis model yang mendukung input gambar.
- Input suara melalui Web Speech API pada browser yang mendukungnya.
- PWA: dapat dipasang ke layar utama; shell aplikasi di-cache untuk membuka antarmuka saat offline. Chat AI tetap memerlukan internet.
- API key tetap di server; rate limit, validasi input, dan security headers.

## Menjalankan
1. Instal Node.js 20+.
2. Di folder proyek: `npm install`.
3. Salin `.env.example` menjadi `.env`, isi `OPENAI_API_KEY` dan model yang tersedia pada akun API Anda.
4. Jalankan `npm start`.
5. Buka `http://localhost:3000`.

## Menjalankan langsung di Android dengan Termux
1. Instal Termux dari F-Droid atau rilis resmi GitHub Termux.
2. Buka Termux lalu jalankan:
   ```sh
   pkg update && pkg upgrade -y
   pkg install nodejs-lts unzip -y
   ```
3. Pindahkan `jaccks-ai-v2.zip` ke penyimpanan HP, lalu di Termux: `termux-setup-storage`.
4. Ekstrak arsip (sesuaikan lokasi file):
   ```sh
   mkdir -p ~/apps && cd ~/apps
   unzip ~/storage/downloads/jaccks-ai-v2.zip
   cd jaccks-ai
   npm install
   cp .env.example .env
   nano .env
   ```
5. Isi `OPENAI_API_KEY=...` dan simpan file. Di nano: Ctrl+O, Enter, Ctrl+X.
6. Jalankan `npm start`, lalu buka Chrome Android ke `http://127.0.0.1:3000`.
7. Untuk memasang seperti aplikasi: menu Chrome ⋮ → **Tambahkan ke layar utama** atau **Install app** (jika muncul).

Jangan tutup Termux saat memakai chatbot. Untuk mencegah Android menghentikan proses, izinkan Termux berjalan di latar belakang/battery unrestricted.

## Akses dari perangkat lain di Wi-Fi yang sama
Jalankan `ip addr` di Termux, cari alamat IP Wi-Fi HP (umumnya `192.168.x.x`), lalu buka `http://IP-HP:3000` dari perangkat lain. Jangan buka port ini ke internet publik tanpa autentikasi dan HTTPS.

## Konfigurasi
```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.5
PORT=3000
```
Pilih nama model yang benar-benar tersedia untuk API key Anda. ChatGPT Plus/Free tidak termasuk saldo API; API memiliki penagihan terpisah.

## Batasan saat ini
- Riwayat disimpan di localStorage browser, belum sinkron antarperangkat.
- Input suara bergantung pada dukungan browser dan layanan speech recognition browser.
- Cache offline hanya untuk antarmuka; request AI membutuhkan jaringan.
- Belum ada login multi-user atau database cloud.
