# Outline Laporan Proyek: Dinopedia (Pokemon Semantic Web Backend)

Sesuai dengan spesifikasi tugas yang diberikan, berikut adalah draft *outline* untuk laporan proyek beserta panduan apa saja yang perlu diisi pada masing-masing bagian. Anda dapat menggunakan file ini sebagai kerangka dasar dalam menyusun laporan PDF.

## 1. Cover
- Judul Proyek: Dinopedia - Pokemon Semantic Web Backend
- Nama Anggota Kelompok / Individu
- NIM / Nomor Mahasiswa
- Mata Kuliah: Semantic Web (Sem 6)
- Institusi & Tahun

## 2. Daftar Isi
- (Akan dibuat secara otomatis melalui aplikasi word processor seperti MS Word atau Google Docs setelah seluruh konten selesai ditulis).

## 3. Pendahuluan Proyek
- **Latar Belakang:** Jelaskan alasan memilih topik Pokemon untuk diimplementasikan menggunakan teknologi *Semantic Web*. Diskusikan bagaimana data relasional biasa bisa ditingkatkan menjadi representasi *knowledge graph* yang kaya relasi.
- **Deskripsi Proyek:** Berikan gambaran singkat bahwa Dinopedia adalah aplikasi berbasis **Next.js** yang bertindak sebagai *frontend/REST API backend*, berkomunikasi dengan **Apache Jena Fuseki** sebagai *endpoint* SPARQL yang menyimpan data *ontology* Pokemon.

## 4. Tujuan Proyek
- Membangun representasi *Semantic Web* (Ontology/RDF) dari dataset Pokemon.
- Mengimplementasikan server *triplestore* menggunakan Apache Jena Fuseki.
- Membuat antarmuka pengguna atau API (menggunakan Next.js) untuk mempermudah pencarian, *filtering*, dan agregasi data Pokemon menggunakan query SPARQL.

## 5. Landasan Teori
*(Anda dapat merujuk pada file terlampir dari dosen untuk contoh bagian ini. Beberapa topik yang perlu dibahas antara lain:)*
- **Semantic Web & Linked Data:** Konsep dasar web semantik.
- **RDF (Resource Description Framework) & OWL:** Standar representasi data dan ontologi.
- **SPARQL:** Bahasa *query* untuk mengekstraksi data RDF.
- **Apache Jena Fuseki:** Server SPARQL yang digunakan dalam proyek.
- **Next.js & React:** Teknologi web yang digunakan untuk membangun antarmuka dan *routing* API.

## 6. Analisa Kebutuhan
- **Kebutuhan Sistem/Perangkat Lunak:** Node.js, Python (untuk konversi RDF di `data-ontology`), dan Java (untuk menjalankan Apache Jena Fuseki).
- **Kebutuhan Fungsional:**
  - Sistem mampu menampilkan daftar Pokemon.
  - Sistem mampu mencari Pokemon berdasarkan nama dan memfilter berdasarkan *type* (Fire, Water, dll).
  - Sistem mampu menyajikan statistik (Top HP, Top Attack, dll).
- **Kebutuhan Non-Fungsional:** Waktu respons *query* yang efisien, dan antarmuka *endpoint* `/api/health` untuk memantau status Fuseki.

## 7. Disain Semantic Web
- **Struktur Ontologi:** Jelaskan *class*, *object properties*, dan *data properties* yang didefinisikan (berdasarkan file `pokemon.owl` atau `pokemon.ttl` di direktori `data-ontology`).
  - *Class:* Pokemon, Type, Generation, dll.
  - *Data Properties:* HP, Attack, Defense, Speed, Weight, Height.
- **Diagram Graph:** *Sangat disarankan untuk menggambar diagram node dan edge yang merepresentasikan satu entitas Pokemon beserta propertinya.*
- **Desain Query:** Sebutkan beberapa contoh arsitektur *query* SPARQL yang digunakan (berdasarkan 13 templat *query* di `src/lib/queries.js`).

## 8. Tantangan dalam Implementasi
- **Pembuatan Dataset RDF:** Proses konversi data mentah menjadi format Turtle (`.ttl`) menggunakan *script* Python.
- **Konektivitas & Integrasi:** Menghubungkan Next.js API dengan Fuseki melalui HTTP *request* serta menangani respon JSON dari SPARQL.
- **Penyusunan Query:** Menulis query SPARQL yang kompleks (misalnya agregasi statistik rata-rata status per tipe Pokemon) agar hasilnya efisien.

## 9. Hasil dan Pembahasan
- **Implementasi Endpoint:** Tampilkan tabel atau *list* endpoint API yang telah dibuat (seperti `/api/pokemon`, `/api/stats`, `/api/types`).
- **Screenshot Hasil:** Masukkan *screenshot* (tangkapan layar) dari aplikasi yang sedang berjalan, contoh hasil respons JSON API (seperti yang ada di `README.md`), atau tampilan *Fuseki web interface*.
- **Pembahasan:** Evaluasi apakah sistem berhasil mencapai tujuan yang disebutkan di awal. Diskusikan kelebihan menggunakan pendekatan *Semantic Web* dibandingkan basis data relasional biasa untuk kasus ini.

---

### Catatan Tambahan untuk File ZIP Pengumpulan:
Pastikan Anda menyiapkan file zip sesuai dengan instruksi:
1. **Source Code:** Sertakan folder proyek ini (sebaiknya hapus folder `node_modules` dan `.next` agar ukuran file tidak terlalu besar).
2. **requirements.txt:** Proyek ini menggunakan `package.json` untuk Node.js. Namun, jika ada *script* Python di dalam `data-ontology`, Anda perlu membuat `requirements.txt` (contoh isi: `rdflib`, `pandas`, dll yang digunakan pada file `.py`).
3. **Readme.md:** File `README.md` yang ada di proyek sudah sangat lengkap mencakup **Panduan Instalasi**, **Panduan Pengguna**, dan **Contoh Hasil** (*API Endpoint responses*). Anda hanya perlu memastikannya rapi.
