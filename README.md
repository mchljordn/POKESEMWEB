# 🦖 Panduan Proyek Akhir Semantic Web (Tim Backend, Frontend & Laporan)

Halo tim! 👋 
Tugas Tahap 1 (Membangun Ontologi, Relasi RDF, dan Master Data 100 Dinosaurus) sudah **SELESAI** aku kerjakan. File ontologinya ada di `dinopedia-100.owl`.

Sekarang giliran kalian untuk mengeksekusi Tahap 2 dan 3 agar proyek kita selesai dan dapat nilai 100 dari Pak Erick Paulus! 🚀

---

## 📌 PEMBAGIAN TUGAS

1. **Tim Database & Backend:** Menjalankan Apache Jena Fuseki lokal & membuat API Route Next.js untuk menembak query SPARQL.
2. **Tim Frontend:** Membuat UI Website Pencarian (Search Bar, Filter, Card Dinosaurus) pakai Next.js & Tailwind CSS.
3. **Tim Laporan (Penting!):** Menulis Draf Artikel Ilmiah sesuai panduan dosen (Penjelasan RDF, Ontologi, SPARQL, dan Deteksi AI/Plagiarisme).

---

## 🛠️ TAHAP 1: Setup Database Semantic (Localhost)
*(Tugas Tim Backend)*

Karena kita menggunakan Semantic Web, kita tidak pakai MySQL/MongoDB, tapi pakai **Apache Jena Fuseki**.

1. **Download Apache Jena Fuseki** [Klik Di Sini (Pilih yang .zip)](https://archive.apache.org/dist/jena/binaries/apache-jena-fuseki-4.8.0.zip).
2. Pastikan laptop sudah terinstal **Java**.
3. Ekstrak file `.zip` tersebut.
4. Buka foldernya, klik 2x file `fuseki-server.bat` (Windows) atau jalankan `./fuseki-server` (Mac/Linux).
5. Biarkan terminal hitamnya terbuka di *background*.
6. Buka browser: `http://localhost:3030`
7. Klik **Manage Datasets** > **Add new dataset**.
   * Dataset name: `dinopedia` *(wajib huruf kecil)*
   * Dataset type: **Persistent**
   * Klik **Create dataset**.
8. Klik tombol **Upload data**, lalu *upload* file `dinopedia-100.owl` yang sudah aku buat. Database siap dipakai!

---

## 💻 TAHAP 2: Setup Project Next.js
*(Tugas Tim Backend & Frontend)*

Buka terminal di folder project kita, lalu jalankan:
```bash
npx create-next-app@latest web-dinopedia
