# Laporan Proyek: Dinopedia - Pokemon Semantic Web Backend

## 1. Cover
**(Halaman Cover - Silakan disesuaikan)**
- **Judul Proyek:** Dinopedia - Pokemon Semantic Web Backend
- **Nama Anggota / Individu:** [Nama Anda]
- **NIM:** [NIM Anda]
- **Mata Kuliah:** Semantic Web (Semester 6)
- **Institusi:** [Nama Kampus/Universitas]
- **Tahun:** 2026

---

## 2. Daftar Isi
*(Buat daftar isi otomatis menggunakan fitur Word/Google Docs setelah seluruh isi disalin)*

---

## 3. Pendahuluana Proyek
**Latar Belakang:**
Perkembangan teknologi data saat ini menuntut cara penyimpanan yang tidak hanya menyimpan nilai, tetapi juga merepresentasikan makna dan relasi dari data tersebut. Pendekatan basis data relasional konvensional seringkali memiliki keterbatasan dalam menggambarkan relasi kompleks secara fleksibel. *Semantic Web* hadir sebagai solusi untuk merepresentasikan data dalam bentuk *knowledge graph* yang saling terhubung (Linked Data), sehingga mesin dapat memahami konteks dari informasi tersebut. 

Sebagai studi kasus penerapan Semantic Web, proyek **Dinopedia** ini dikembangkan untuk membangun ontologi dan *knowledge base* dari data Pokemon. Data Pokemon memiliki struktur relasi yang sangat kaya—seperti jenis (*type*), generasi, status (*stats*), hingga kemampuan bawaan (*abilities*) dan garis evolusi. Dengan merepresentasikannya ke dalam format RDF (Resource Description Framework), data Pokemon dapat dieksplorasi secara semantik.

**Deskripsi Singkat:**
Dinopedia adalah aplikasi web *full-stack* berbasis **Next.js** (berjalan pada platform Node.js dengan TypeScript) yang bertindak sebagai antarmuka pengguna sekaligus penyedia REST API. Aplikasi ini menggunakan **Apache Jena Fuseki** di sisi *backend* sebagai *triplestore* untuk mengeksekusi *query* SPARQL terhadap data ontologi Pokemon yang telah dikonversi ke format `.ttl` (Turtle).

---

## 4. Tujuan Proyek
Tujuan utama dari proyek ini adalah:
1. Membangun representasi Semantic Web dengan mendesain ontologi (OWL) dan RDF *triples* (Turtle) dari dataset Pokemon.
2. Mengimplementasikan server *triplestore* mandiri menggunakan Apache Jena Fuseki sebagai *endpoint* data semantik.
3. Mengembangkan REST API dan antarmuka web interaktif menggunakan Next.js yang mampu melakukan *query* (SPARQL) ke server Fuseki untuk mencari, mem-filter, dan mengagregasi data Pokemon.

---

## 5. Landasan Teori
**Semantic Web & Linked Data**
Semantic web merupakan ekstensi dari World Wide Web melalui standar yang ditetapkan oleh W3C. Tujuan utamanya adalah membuat data di internet dapat dibaca dan dipahami oleh mesin (machine-readable), sehingga memfasilitasi integrasi data antar sistem yang berbeda (Linked Data).

**RDF (Resource Description Framework) dan OWL**
RDF adalah kerangka standar untuk merepresentasikan informasi di web dalam bentuk *triples*: *Subject, Predicate, Object*. OWL (Web Ontology Language) digunakan di atas RDF untuk mendefinisikan ontologi, yaitu skema atau struktur konseptual yang mencakup *class* (kelas), properti, dan relasi yang lebih kompleks antar entitas.

**SPARQL**
SPARQL (SPARQL Protocol and RDF Query Language) adalah bahasa *query* semantik untuk database (triplestore) yang menyimpan data berformat RDF. SPARQL memungkinkan pencarian data dengan pola *graph matching*.

**Apache Jena Fuseki**
Apache Jena Fuseki adalah server SPARQL berbasis Java yang menyediakan *endpoint* REST untuk mengelola dan melakukan *query* (SELECT, CONSTRUCT, DESCRIBE, ASK) terhadap data RDF/triplestore.

**Next.js & React**
Next.js adalah *framework* React untuk membangun antarmuka pengguna berbasis web (frontend) dan server-side rendering/API routes (backend). Framework ini memungkinkan pengiriman HTTP *request* ke *endpoint* SPARQL Fuseki dan menyajikan hasil JSON ke pengguna akhir secara instan.

---

## 6. Analisa Kebutuhan
**A. Kebutuhan Fungsional:**
1. **Fitur Pencarian:** Sistem harus dapat mencari detail Pokemon berdasarkan nama atau nomor Pokedex secara dinamis.
2. **Fitur Penyaringan (Filter):** Sistem mampu memfilter Pokemon berdasarkan tipe (misalnya Fire, Water, Grass).
3. **Statistik dan Agregasi:** Sistem menyediakan data agregasi (misalnya Top HP, Top Attack) dengan mengolah perhitungan langsung melalui *query* SPARQL.
4. **API Endpoint:** Sistem menyediakan REST API (seperti `/api/pokemon`, `/api/types`, `/api/stats`) yang bisa dikonsumsi oleh *client* lain.

**B. Kebutuhan Non-Fungsional:**
1. **Kinerja / Responsivitas:** Query SPARQL harus dioptimalkan untuk meminimalkan waktu tunggu respons data.
2. **Ketersediaan Layanan:** Menyediakan *endpoint* *Health Check* (`/api/health`) untuk memantau status koneksi server Jena Fuseki.
3. **Desain Arsitektur:** Kode ditulis dengan prinsip modular, pemisahan yang jelas antara logika *query* (`src/lib/queries.ts`) dengan *controller* API (`src/app/api/...`).

---

## 7. Disain Semantic Web
Desain semantic web pada proyek Dinopedia terdiri dari pembangunan ontologi dan struktur *query* SPARQL.

**A. Struktur Ontologi (Classes dan Properties)**
Berdasarkan file `pokemon.owl` dan `pokemon.ttl`, struktur data didesain sebagai berikut:
*   **Top-Level Classes:** `Pokemon`, `StarterPokemon`, `LegendaryPokemon`, `MythicalPokemon`.
*   **Master Data Classes:** `Type` (Tipe), `Ability` (Kemampuan), `Generation` (Generasi), `Region`, `Move`, `Item`.
*   **Object Properties (Relasi antar Class):** 
    *   `:hasPrimaryType` dan `:hasSecondaryType` (menghubungkan Pokemon dengan Type).
    *   `:belongsToGen` (menghubungkan Pokemon dengan Generation).
    *   `:hasAbility` dan `:hasHiddenAbility` (menghubungkan Pokemon dengan Ability).
    *   `:evolvesFrom` (menghubungkan evolusi Pokemon).
*   **Data Properties (Atribut Nilai):** `:pokedexNumber`, `:name`, `:baseHP`, `:baseAttack`, `:baseDefense`, `:baseSpAttack`, `:baseSpDefense`, `:baseSpeed`, `:heightM`, `:weightKg`, serta `:imageUrl`.

**B. Templat Query SPARQL**
Terdapat 13 arsitektur *query* (pada `queries.ts`) yang mengatur pengambilan data, antara lain:
*   `getAllPokemon` / `getPokemonById`: Menarik data detail (termasuk relasi tipe dan generasi) menggunakan *keyword* `OPTIONAL` untuk data yang mungkin kosong (seperti tipe kedua atau hidden ability).
*   `searchPokemonByName`: Memanfaatkan fungsi filter *substring*.
*   `getTopByHP` / `getAverageStatsByType`: Melakukan agregasi dan pengurutan status (menggunakan `ORDER BY DESC`).

---

## 8. Tantangan dalam Implementasi
Selama proses pengembangan, terdapat beberapa tantangan yang dihadapi:
1. **Pembuatan dan Konversi Dataset RDF:**
   Data awal Pokemon (biasanya berupa file CSV/JSON) harus dikonversi menjadi format struktur *graph* RDF (seperti `.ttl`). Mengatur relasi referensi antar *node* (misalnya memastikan *node* tipe yang dirujuk oleh Pokemon benar-benar terdefinisi sebagai *class* Type) memerlukan *script* Python khusus (`data-ontology/`) yang cermat agar tidak terjadi inkonsistensi.
2. **Pemrosesan Query yang Optimal:**
   Pengambilan seluruh data properti Pokemon sekaligus dapat memberatkan *server* Fuseki jika tidak menggunakan klausa `LIMIT`. Menyusun *query* berlapis (misalnya mengambil nama dari URI tipe yang direferensikan) membutuhkan pemahaman logika SPARQL yang baik.
3. **Integrasi Middleware Next.js:**
   Menerjemahkan respons data mentah RDF JSON (dengan *binding value*) dari Jena Fuseki menjadi format JSON REST API standar yang mudah dikonsumsi oleh komponen *frontend* React (diatur pada `fuseki.ts` dan *route handlers*).

---

## 9. Hasil dan Pembahasan
Proyek **Dinopedia** berhasil diimplementasikan sesuai dengan tujuan. Sebuah aplikasi berbasis Next.js sukses terkoneksi ke Apache Jena Fuseki dan dapat memproses operasi *Semantic Web*.

**Pencapaian Fitur API:**
*   **Health Check (`/api/health`)**: Berhasil memantau status Fuseki dan menghitung statistik dataset/triples yang ada.
*   **Pokemon Explorer (`/api/pokemon`)**: Berhasil menyajikan daftar Pokemon, melakukan pencarian substring, dan memfilter berdasarkan *Type* (seperti `?type=Fire`).
*   **Stats & Analytics (`/api/stats`)**: Aplikasi mampu melakukan perhitungan rata-rata (*average*) dan mengurutkan top Pokemon berdasar statusnya.

**Pembahasan:**
Penggunaan Semantic Web melalui ontologi OWL dan RDF terbukti memberikan fleksibilitas luar biasa. Tidak seperti database SQL di mana kita harus menggunakan JOIN kompleks ke banyak tabel, RDF *graph* memungkinkan penelusuran relasi secara *native*. Fitur SPARQL seperti *Pattern Matching* sangat mempermudah penarikan informasi (seperti mengambil tipe sekunder hanya jika ada via `OPTIONAL`). Aplikasi Next.js di bagian depan dapat secara efisien menangkap hasil ini untuk kemudian disajikan dalam bentuk antarmuka web dan API JSON yang bersih. Secara keseluruhan, proyek ini menunjukkan bahwa teknologi Semantic Web sangat relevan untuk mengelola dataset *knowledge-base* yang kompleks dan kaya relasi seperti data Pokemon.

---
*(Catatan: Anda dapat menambahkan Screenshot tampilan antarmuka aplikasi atau contoh JSON response dari README.md pada bagian Hasil dan Pembahasan saat memindahkan teks ini ke dokumen laporan PDF.)*
