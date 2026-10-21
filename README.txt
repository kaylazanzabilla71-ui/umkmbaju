MEY FASHION — THE LIVING WARDROBE V5
==================================================

1. Extract folder "Mey_Fashion_V5".
2. Klik dua kali "index.html" untuk membuka langsung di Chrome/Edge.
3. Perlu internet hanya untuk Google Fonts dan peta Google. Seluruh animasi inti menggunakan JavaScript bawaan (requestAnimationFrame + Web Animations API) sehingga berjalan OFFLINE.

GERAKAN HERO (sesuai referensi):
- Geser / swipe (drag) baju untuk mengganti koleksi pada gantungan melengkung.
- Klik baju samping untuk membawa ke tengah, klik baju tengah untuk memperbesar dan membuka panel detail DALAM SCENE yang sama (bukan popup berhalaman).
- Klik tombol "ON MODEL" untuk animasi pergantian baju menjadi karakter perempuan sesuai produknya.
- Tombol "DEPAN" / "MIRING" menampilkan foto baju asli.
- Tombol "KEMBALI" menganimasikan baju kembali menggantung di rel.
- Tombol berikutnya/sebelumnya juga bekerja saat membuka detail.
- Keyboard: panah kiri/kanan untuk ganti baju, Escape untuk tutup panel.
- Tombol tas untuk keranjang. Pesanan dikirim ke WhatsApp 0838-9758-1501.

KONTAK:
TikTok: https://www.tiktok.com/@meyfashion10
WhatsApp: https://wa.me/6283897581501
Maps: Mey Fashion Batang Kuis, Jl. Tembakau Deli, Bakaran Batu.

PERUBAHAN V5:
- 6 model baju (baju hijau kembar dihapus).
- Hero: baju di tengah dibuat besar, baju kiri-kanan kecil. Ukuran menyesuaikan tinggi layar.
- Katalog diganti jadi grid biasa (3 kolom di desktop, 2 kolom di HP), TIDAK ada scroll ke samping. Tiap kartu: foto, nama, deskripsi, harga, ukuran, tombol Lihat detail dan Tanya admin.
- Section baru: Keunggulan, Cara Pesan (4 langkah), Tanya Jawab (FAQ), fakta singkat di Tentang, kartu kontak, footer 4 kolom, tombol WhatsApp melayang.
- Navbar desktop dirapikan. Di HP/tablet navbar jadi bar aplikasi di ATAS (logo, WhatsApp, tas, dan 5 tab berikon). Saat scroll ke bawah baris logo mengecil otomatis supaya layar lebih lega.

PENTING:
- Harga di katalog adalah estimasi; harga final dikonfirmasi admin via WhatsApp.
- Aset berupa foto transparan (depan, miring, model), bukan 3D asli.
- Semua aset ada di assets/products, assets/brand dan assets/backgrounds.

EDIT PRODUK:
Data produk ada di array "items" paling atas pada script.js. Untuk menambah model, tambahkan satu baris baru dan tiga foto (slug-front.webp, slug-angle.webp, slug-model.webp) di assets/products. Jumlah "06" di tampilan mengikuti jumlah item secara otomatis, kecuali teks "6 look pilihan" di index.html yang diubah manual.

Teknologi: HTML5, CSS3, JavaScript native. Tidak ada database/payment gateway.
