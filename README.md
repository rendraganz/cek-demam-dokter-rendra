# DokterRendra - Spesialis Cek Demam — SPK CBR DBD (Prototype Akademik)

Website statis HTML, CSS, dan JavaScript untuk deploy di GitHub Pages. Tidak membutuhkan build step atau backend.

## Link
[Kunjungi Cek Demam Dokter Rendra](https://rendraganz.github.io/cek-demam-dokter-rendra/)

## Fitur
- Dashboard dan gambaran siklus Retrieve, Reuse, Revise, Retain
- Form subjek dan 14 indikator gejala (G1–G14)
- Perhitungan cosine similarity terhadap kasus awal P1–P4
- Tabel ranking dan rincian dot product / jumlah indikator yang cocok
- Riwayat tersimpan di `localStorage` browser
- Simulasi Revise dan Retain ke basis kasus lokal browser
- Ekspor riwayat dan basis kasus ke JSON
- Responsif untuk desktop dan ponsel

## Data kasus awal
- P1 / DBD-I: `[1,0,0,0,0,0,0,1,0,0,0,1,1,1]`
- P2 / DBD-II: `[1,0,0,0,0,0,0,1,1,0,0,1,1,1]`
- P3 / DBD-III: `[1,0,0,0,0,0,0,1,1,1,0,1,1,1]`
- P4 / DBD-IV: `[1,0,0,0,0,1,0,0,0,1,0,1,1,1]`

Urutan indikator: G1 Demam, G2 Mual, G3 Muntah, G4 Lemas, G5 Mencret, G6 Kejang, G7 Tenggorokan sakit, G8 Bintik merah, G9 Mimisan, G10 Nyeri sendi, G11 Pusing, G12 Leukosit, G13 Hematokrit, G14 Trombosit.

## Batasan penting
- Semua data diagnosis dan kasus baru disimpan hanya di `localStorage` pada browser/perangkat yang sedang digunakan. Tidak ada sinkronisasi lintas perangkat atau pengguna karena tidak ada backend.
- Jangan masukkan data pasien nyata atau informasi sensitif.
- Kasus P1–P4 adalah data contoh yang dibahas dalam tugas, bukan basis data klinis tervalidasi.
- Sistem ini hanya demonstrasi akademik metode CBR/cosine similarity, bukan alat diagnosis atau penentuan derajat DBD. Penentuan klinis harus dilakukan oleh tenaga kesehatan.
