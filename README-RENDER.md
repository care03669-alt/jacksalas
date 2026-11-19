# Deploy JACCKS AI V2 ke Render

Paket ini disiapkan untuk deploy sebagai Node.js Web Service di Render.

## Pengaturan Render
- Repository: upload isi folder proyek ini ke repository GitHub (jangan upload file `.env` atau API key).
- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`
- Environment variables:
  - `OPENAI_API_KEY`: masukkan secret API key OpenAI di Dashboard Render.
  - `OPENAI_MODEL`: model yang tersedia untuk akun API, default paket ini `gpt-5.5`.

File `render.yaml` sudah berisi konfigurasi dasar tersebut. Jika Render menawarkan Blueprint, konfigurasi dapat dibuat dari file ini. Kalau membuat Web Service secara manual, masukkan pengaturan di atas.

## Catatan
- Jangan pernah memasukkan API key ke file frontend, GitHub, atau chat publik.
- Render Free Web Service dapat tidur setelah 15 menit tanpa aktivitas dan perlu waktu untuk bangun ketika dibuka kembali.
- File sistem lokal pada instance gratis bersifat sementara. Riwayat chat versi ini tersimpan di browser pengguna, bukan database cloud.
- API OpenAI tetap memerlukan billing/kuota API terpisah dari langganan ChatGPT.
