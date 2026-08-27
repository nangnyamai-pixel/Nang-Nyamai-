# NangNyamai Product Requirements Document

| Medan | Nilai |
|---|---|
| Versi | 1.1 |
| Dikemas kini | 17 Ogos 2026 |
| Status | Development baseline |
| Produk | Web ordering dan operasi staf Budaya Restaurant |
| Audiens | Product owner, developer, QA, DevOps dan operasi restoran |
| Sumber | Kod repository, Supabase yang dikonfigurasi dan PRD PDF v1.0 (16 Ogos 2026) |

## 1. Ringkasan produk

NangNyamai ialah sistem pesanan restoran berasaskan web untuk Budaya
Restaurant, Sarawak Cultural Village. Pelanggan menggunakan QR meja untuk
melihat menu, memilih item dan option, menghantar pesanan serta menerima nombor
pesanan. Staf mengurus queue, dapur, status operasi dan pembayaran di kaunter.

Produk menggunakan Next.js App Router dan Supabase. Harga dan transaksi
ditentukan oleh server/database, bukan browser.

### Nota verifikasi repository

PRD PDF menetapkan `supabase/migrations/` sebagai deployment source of truth.
Semakan workspace pada 19 Ogos 2026 mendapati folder itu belum wujud; hanya
`supabase/sql/` dan `supabase/seed.sql` tersedia. Oleh itu, status migration
dan claim database dalam dokumen ini mesti dianggap perlu disahkan sebelum
perubahan schema atau deployment production. Jangan menandakan migration
sebagai applied tanpa bukti daripada Supabase CLI/dashboard.

## 2. Matlamat

- **OBJ-01:** Kurangkan friksi pelanggan dari QR meja hingga order diterima.
- **OBJ-02:** Pastikan harga dan jumlah pesanan ditentukan oleh server.
- **OBJ-03:** Elakkan order separa atau duplikasi melalui transaksi atomik dan
  idempotency.
- **OBJ-04:** Berikan staf queue operasi yang jelas dari `received` hingga
  `completed`.
- **OBJ-05:** Gunakan design system Sarawak Contemporary yang konsisten,
  responsive dan boleh diakses.
- **OBJ-06:** Sediakan asas keselamatan, pemerhatian dan deployment yang sesuai
  untuk operasi restoran sebenar.

## 3. Bukan skop baseline

- Sistem POS, perakaunan atau inventori enterprise.
- Integrasi AutoCount tanpa discovery dan spesifikasi API berasingan.
- Pemprosesan kad atau payment gateway dalam aplikasi.
- Aplikasi native iOS/Android.
- Program loyalty sebelum identity dan polisi ganjaran dimuktamadkan.
- Google Maps, discovery restoran luar atau marketplace makanan Sarawak.

## 4. Pengguna dan role

| Role | Keperluan | Sekatan |
|---|---|---|
| Guest | Baca menu dan cipta order daripada meja yang sah | Tiada akses staf/admin dan tiada direct table writes |
| Customer | Hak guest, profil sendiri, history dan feedback sendiri | Tidak boleh membaca order pengguna lain |
| Staff | Queue, kitchen, status, payment dan availability apabila diaktifkan | Tidak boleh mengubah role atau konfigurasi sensitif |
| Admin | Hak staff dan pengurusan yang diluluskan | Admin console penuh belum dilaksana |

Route `/staff` memerlukan `staff` atau `admin`. Route `/admin` memerlukan
`admin`. UI gating tidak menggantikan authorization server, RPC dan RLS.

## 5. Skop dan status

| ID | Modul | Status | Baseline |
|---|---|---|---|
| DS-01 | Sarawak Contemporary design system | Dilaksana | Token, typography, surfaces, button, badge, form dan card |
| CUS-01 | Home, menu, carian dan kategori | Dilaksana | Responsive customer discovery |
| CUS-02 | Detail item dan option | Dilaksana | Option rules, quantity dan cart |
| TXN-01 | Cart dan checkout | Dilaksana | Subtotal, SST 6% dan jumlah |
| TXN-02 | Atomic order creation | Dilaksana | Server validation dan idempotency |
| AUTH-01 | Email magic link | Dilaksana | Supabase Auth callback dan session |
| AUTH-02 | Google authentication | Separa | Kod tersedia; provider dan production QA belum disahkan |
| OPS-01 | Dashboard, queue, kitchen dan history | Dilaksana | Role gate, data langsung dan status progression |
| OPS-02 | Menu availability | Separa | RPC wujud; feature flag off kerana menu pelanggan masih JSON |
| CUS-03 | Customer tracking/history | Separa | Route wujud; guest ownership dan Realtime belum siap |
| FEED-01 | Feedback | Dirancang | Placeholder; workflow belum lengkap |
| RWD-01 | Rewards | Dirancang | Placeholder sahaja |
| ADM-01 | Admin console | Dirancang | Placeholder sahaja |
| DEP-01 | Production deployment | Dirancang | Launch gates belum selesai |

`Dilaksana` bermaksud fungsi wujud dalam kod atau database, tetapi masih
tertakluk kepada QA produksi. `Separa` bermaksud sebahagian aliran, integrasi
atau konfigurasi belum lengkap. `Dirancang` tidak boleh dipersembahkan sebagai
fungsi sebenar.

## 6. Golden path pelanggan

1. Pelanggan mengimbas QR meja yang sah.
2. Aplikasi membuka `/home?table={table}` dan mengekalkan konteks meja.
3. Pelanggan mencari atau menapis menu.
4. Pelanggan memilih item, option wajib/pilihan, kuantiti dan nota.
5. Pelanggan menyemak bakul, subtotal, SST dan total.
6. Checkout mencipta guest session dan `client_request_id`.
7. `create_customer_order` mengesahkan meja, item, availability, option dan
   harga dalam satu transaksi.
8. Pelanggan menerima `order_number`; cart dikosongkan hanya selepas berjaya.
9. Tracking status sebenar akan dipaparkan apabila scoped guest access dan
   Realtime siap.

## 7. Golden path staf

1. Pengguna log masuk melalui kaedah Supabase Auth yang dikonfigurasi.
2. Sistem mengesahkan `profiles.role` sebagai `staff` atau `admin`.
3. Staf melihat queue dan order details di `/staff`.
4. Staf memajukan status menggunakan transisi yang sah.
5. Dapur menyediakan item dan menanda order `ready`.
6. Kaunter menanda `payment_status=paid` selepas menerima bayaran.
7. Staf melengkapkan order dan rekod kekal dalam history.

## 8. Keperluan fungsi pelanggan

| ID | Keperluan | Status | Acceptance criteria |
|---|---|---|---|
| FR-CUS-001 | Baca konteks meja daripada URL | Separa | Table code berfungsi; signed token wajib sebelum produksi |
| FR-CUS-002 | Papar kategori dan item menu | Dilaksana | Nama, harga dan media tersedia |
| FR-CUS-003 | Carian dan penapisan kategori | Dilaksana | Hasil bertindak balas kepada query dan kategori |
| FR-CUS-004 | Papar detail, components dan option groups | Dilaksana | Option wajib mesti dipilih |
| FR-CUS-005 | Ubah kuantiti dan nota | Dilaksana | Cart state dikemas kini tanpa kehilangan meja |
| FR-CUS-006 | Kekalkan cart ketika navigation/reload | Dilaksana | Cart disimpan client-side; expiry masih perlu ditentukan |
| FR-CUS-007 | Papar subtotal, SST 6% dan total | Dilaksana | UI memaparkan anggaran; server mengira nilai muktamad |
| FR-CUS-008 | Elakkan duplicate order | Dilaksana | `client_request_id` digunakan untuk idempotency |
| FR-CUS-009 | Pulangkan nombor pesanan | Dilaksana | Order number dipapar selepas transaksi berjaya |
| FR-CUS-010 | Track order semasa | Separa | Tiada data simulasi; perlu scoped access dan Realtime |
| FR-CUS-011 | Papar history customer | Separa | Hanya order milik identity/session yang sah |
| FR-CUS-012 | Hantar feedback selepas selesai | Dirancang | Satu feedback bagi completed order yang sah |

## 9. Keperluan auth

| ID | Keperluan | Status | Acceptance criteria |
|---|---|---|---|
| FR-AUTH-001 | Email magic link | Dilaksana | Callback menghasilkan session Supabase |
| FR-AUTH-002 | Google OAuth | Separa | Provider, consent screen dan redirects lulus staging/production |
| FR-AUTH-003 | SSR session handling | Dilaksana | Menggunakan `@supabase/ssr` |
| FR-AUTH-004 | Map user kepada role | Dilaksana | `profiles.id` merujuk `auth.users.id` |
| FR-AUTH-005 | Lindungi staff/admin routes | Dilaksana | Unauthorized role ditolak pada server dan database |
| FR-AUTH-006 | Logout | Dilaksana | Session tamat dan protected routes tidak lagi boleh diakses |

## 10. Keperluan staf dan dapur

| ID | Keperluan | Status | Acceptance criteria |
|---|---|---|---|
| FR-OPS-001 | Operational dashboard | Dilaksana | Ringkasan order mengikut status |
| FR-OPS-002 | Order queue | Dilaksana | Susunan masa dan status jelas |
| FR-OPS-003 | Kitchen view | Dilaksana | Item, quantity, note dan elapsed time mudah dibaca |
| FR-OPS-004 | Advance order status | Dilaksana | Hanya transisi sah melalui `staff_advance_order` |
| FR-OPS-005 | Mark order paid | Dilaksana | Hanya staff/admin melalui `staff_mark_order_paid` |
| FR-OPS-006 | Order history | Dilaksana | Order dan item snapshot boleh dibaca staf |
| FR-OPS-007 | Order refresh | Dilaksana | Realtime/refresh tidak memerlukan full application restart |
| FR-OPS-008 | Menu availability | Separa | Aktif hanya selepas customer menu membaca live DB |
| FR-OPS-009 | Admin management | Dirancang | Users, menu dan config memerlukan modul admin sebenar |

## 11. Business rules transaksi

- Browser tidak boleh menentukan `unit_price`, subtotal, SST atau total
  muktamad.
- Item inactive/unavailable atau option tidak sah mesti menggagalkan transaksi
  tanpa meninggalkan order separa.
- Option minimum/maksimum mesti disahkan di database.
- `client_request_id` mesti menjadikan retry selamat.
- Cart hanya dikosongkan selepas RPC berjaya.
- Guest order production mesti memerlukan signed table token dengan expiry dan
  anti-replay.
- Bayaran baseline dibuat di kaunter; status pembayaran berasingan daripada
  status penyediaan.

## 12. Model status

```text
received -> verified -> preparing -> ready -> completed
    |           |            |
    +-----------+------------+-> cancelled
```

| Status | Transisi seterusnya |
|---|---|
| `received` | `verified`, `cancelled` |
| `verified` | `preparing`, `cancelled` |
| `preparing` | `ready`, `cancelled` |
| `ready` | `completed`, `cancelled` |
| `completed` | Terminal |
| `cancelled` | Terminal |

Payment status baseline: `unpaid` dan `paid`.

## 13. Seni bina

```text
Customer/Staff Browser
        |
        v
Next.js 16 App Router
  - Server Components by default
  - Client Components for browser interaction
  - Server Actions / Route Handlers
        |
        v
Supabase: Auth, Data API, Realtime
        |
        v
PostgreSQL: RLS, constraints, triggers dan transactional RPCs
```

Prinsip:

- Mutation penting melalui server action, route handler atau RPC.
- RLS ialah sempadan keselamatan; menyembunyikan UI tidak mencukupi.
- `supabase/migrations/` ialah source of truth perubahan skema.
- Tiada service-role key dalam browser atau repository.
- Environment variables dan secret diurus per environment.

## 14. Model data

| Jadual | Tanggungjawab |
|---|---|
| `profiles` | Role dan identity aplikasi |
| `restaurant_tables` | Meja, table number dan status aktif |
| `categories` | Kategori menu |
| `menu_items` | Item, harga, active dan availability |
| `menu_item_option_groups` | Kumpulan option dan min/max |
| `menu_item_options` | Option dan price delta |
| `menu_item_components` | Components/ingredient display |
| `orders` | Header transaksi, jumlah, status dan payment |
| `order_items` | Snapshot item, harga, option dan nota |
| `feedback` | Rating/komen berkaitan order |

Order history mesti menggunakan snapshot item/harga supaya perubahan menu
tidak mengubah rekod lama. Nilai wang menggunakan decimal/numeric, dan masa
disimpan sebagai `timestamptz`.

## 15. RPC contract

| RPC | Caller | Tujuan |
|---|---|---|
| `create_customer_order` | `anon`, `authenticated` | Validate dan cipta order secara atomik |
| `staff_advance_order` | `staff`, `admin` | Advance status dengan optimistic concurrency |
| `staff_mark_order_paid` | `staff`, `admin` | Tukar payment status |
| `staff_set_menu_availability` | `staff`, `admin` | Tukar availability apabila feature diaktifkan |

Fungsi `SECURITY DEFINER` mesti mempunyai explicit `search_path`,
schema-qualified object names, grants minimum dan identity/role checks.

## 16. Design system dan UX

| Token | Nilai |
|---|---|
| Brand | `#D71920` |
| Brand strong | `#B9151B` |
| Accent | `#F6C515` |
| Canvas | `#FFF8EB` |
| Surface | `#FFFFFF` |
| Text | `#161616` |
| Muted | `#77736D` |
| Border | `#D9CDB7` |
| Success | `#287A45` |
| Warning | `#9A6400` |
| Danger | `#B42318` |

UX requirements:

- Mobile-first pada 390 px hingga desktop 1440 px.
- Minimum touch target 44 x 44 px.
- WCAG 2.2 AA, keyboard navigation dan visible focus.
- Loading, empty, error, unavailable dan offline states mesti jelas.
- Gunakan primitives dalam `src/components/ui`; jangan tambah style ad hoc
  apabila token/variant sedia ada mencukupi.

## 17. Keperluan bukan fungsi

| ID | Kategori | Kriteria |
|---|---|---|
| NFR-001 | Prestasi | LCP sasaran <= 2.5s p75 pada mobile 4G |
| NFR-002 | Reliability | Checkout atomik, retry selamat dan backup/restore diuji |
| NFR-003 | Accessibility | WCAG 2.2 AA dan keyboard/screen-reader support |
| NFR-004 | Responsive | Tiada overflow pada 390, 768, 1024 dan 1440 px |
| NFR-005 | Observability | Structured logs, error monitoring dan RPC failure alert |
| NFR-006 | Security | RLS, least privilege, signed QR, rate limit dan secret management |
| NFR-007 | Privacy | Minimum PII dan retention policy yang diluluskan |
| NFR-008 | Maintainability | TypeScript, lint/typecheck/build dan reviewed migrations |
| NFR-009 | Localization | BM/English, MYR dan Asia/Kuala_Lumpur |

## 18. Deployment requirements

- Vercel untuk Next.js production dan preview deployments.
- Hosted Supabase di region `ap-southeast-1`.
- Environment variables diurus dalam Vercel, bukan committed files.
- Supabase Site URL dan Additional Redirect URLs sepadan dengan domain.
- Google OAuth client dan consent screen dikonfigurasi untuk production.
- Transactional SMTP mempunyai SPF, DKIM dan DMARC.
- Monitoring, database alerts, backup, restore dan rollback runbook tersedia.

## 19. Launch gates

- Semua item P0 dalam [TODO.md](TODO.md) selesai.
- Menu, harga, SST dan availability disahkan oleh restoran.
- E2E customer dan staff lulus pada peranti sasaran.
- RLS/RPC adversarial tests lulus untuk anon, customer, staff dan admin.
- Magic link dan Google OAuth lulus pada domain produksi.
- Backup, restore, alert, incident owner dan rollback plan tersedia.
- Privacy notice dan retention policy diluluskan.

## 20. Keputusan terbuka

- Kaedah scoped access untuk guest order tracking selepas checkout.
- Pemilik rasmi perubahan menu: staff, admin atau POS.
- Polisi pembatalan, refund dan payment reconciliation.
- Tempoh retention untuk order, profile dan feedback.
- Sama ada `verified` wajib atau order boleh terus ke `preparing`.
- Peranan AutoCount: source of truth atau penerima rekod jualan.

## 21. Definition of Done

- Keperluan dan acceptance criteria dikemas kini.
- Kod menggunakan design-system primitives dan constants sedia ada.
- Lint, typecheck, build dan ujian relevan lulus.
- Perubahan database dibuat melalui migration.
- Authorization diuji untuk role dibenarkan dan ditolak.
- Loading, empty, error dan unavailable states disediakan.
- Responsive dan accessibility diperiksa.
- Tiada secret, credential atau PII sensitif dalam repository/log.
- README, PRD dan TODO dikemas kini apabila status berubah.
- Perubahan menu, harga atau operasi diterima oleh product owner/restoran.
