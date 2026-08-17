<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NangNyamai project context

## Product

NangNyamai ialah sistem menu digital dan pesanan meja untuk Budaya
Restaurant, Sarawak Cultural Village. Ia bukan food-discovery marketplace.
Pelanggan membuka aplikasi melalui QR meja, membuat pesanan dan membayar di
kaunter. Staf mengurus queue, dapur, status dan pembayaran.

Rujuk:

- `README.md` untuk onboarding dan current baseline.
- `PRD.md` untuk requirements, business rules dan acceptance criteria.
- `TODO.md` untuk backlog dan exit conditions.
- `supabase/migrations/` untuk source of truth database.

Jika dokumen bercanggah dengan kod, jangan senyap-senyap memilih satu versi.
Semak implementation dan migrations, nyatakan percanggahan, kemudian buat
perubahan paling kecil yang memenuhi permintaan pengguna.

## Current baseline

- Next.js 16.3.0, React 19.2.8, TypeScript dan Tailwind CSS 4.
- Supabase Auth, PostgreSQL, Data API dan Realtime.
- Customer menu/detail/cart/checkout dilaksana.
- Checkout menggunakan transactional `create_customer_order` RPC dengan
  server-side pricing dan `client_request_id` idempotency.
- Staff dashboard/queue/kitchen/history, status RPC dan payment RPC dilaksana.
- Customer tracking/history, feedback, rewards dan admin belum lengkap.
- Customer menu masih membaca `data/budaya-restaurant-menu-2025.json`.
- `STAFF_MENU_MUTATIONS_ENABLED` mesti kekal false sehingga customer menu
  membaca live `menu_items.is_available`.
- Google OAuth code wujud tetapi provider dan production redirects mungkin
  belum dikonfigurasi.
- Production deployment dan P0 security hardening belum selesai.

Jangan tambah shadcn/ui, Framer Motion, Google Maps, payment gateway atau
AutoCount integration melainkan pengguna meminta skop tersebut secara jelas.

## Working rules

1. Baca fail Next.js versioned yang relevan dalam `node_modules/next/dist/docs/`
   sebelum menulis atau mengubah Next.js code.
2. Preserve existing functionality dan perubahan pengguna yang tidak berkaitan.
3. Gunakan Server Components secara lalai. Tambah Client Component hanya untuk
   browser state, event handling atau client-only API.
4. Gunakan TypeScript dan Zod pada input trust boundaries.
5. Reuse `src/components/ui`, customer/staff primitives, constants dan helpers.
6. Jangan simulasikan production data atau menampilkan placeholder sebagai
   feature yang sudah siap.
7. Jangan mengubah database hosted/production, auth users, role atau external
   configuration tanpa arahan pengguna yang jelas.
8. Gunakan `apply_patch` untuk perubahan fail manual dan kekalkan diff kecil.

## Product invariants

- Browser tidak boleh menentukan harga, subtotal, SST atau total muktamad.
- Checkout mesti atomik; error tidak boleh meninggalkan order separa.
- Retry request yang sama tidak boleh mencipta duplicate order.
- Cart hanya dikosongkan selepas order berjaya.
- Order status mesti menggunakan constants dalam `src/constants/status.ts`.
- Valid flow: `received -> verified -> preparing -> ready -> completed`, dengan
  `cancelled` sebagai terminal branch yang dibenarkan.
- Payment status (`unpaid`, `paid`) berasingan daripada order status.
- Sensitive reads/writes memerlukan server authorization dan RLS; UI hiding
  bukan kawalan keselamatan.
- Guest tidak boleh mempunyai direct insert/update policy kepada order tables;
  gunakan RPC yang mengesahkan input.

## Supabase and database

- `supabase/migrations/` ialah deployment source of truth. Jangan gunakan
  `supabase/sql/` sebagai migration semasa.
- Tambah migration baharu; jangan edit migration yang telah applied kecuali
  pengguna secara jelas meminta repair strategy.
- Semua public tables mesti mempunyai RLS.
- `SECURITY DEFINER` functions mesti mempunyai explicit `search_path`,
  schema-qualified object names, least-privilege grants dan authorization.
- Jangan dedahkan service-role key. Tiada secret dalam `NEXT_PUBLIC_*`, source,
  log atau screenshot.
- Generated database types perlu sepadan dengan schema apabila schema berubah.
- Data menu 2025 berstatus `requires_restaurant_verification`; jangan membuat
  tuntutan harga, availability, dietary atau halal yang belum disahkan.

## UI and UX

- Gunakan Sarawak Contemporary tokens dalam `src/app/globals.css`.
- Brand utama ialah merah `#D71920`, accent `#F6C515`, canvas `#FFF8EB`.
- Reuse Button, Badge, FormControl, Card dan Surface primitives.
- Mobile-first; semak sekurang-kurangnya 390, 768, 1024 dan 1440 px.
- Minimum touch target 44 x 44 px dan visible focus.
- Sediakan loading, empty, error dan unavailable states.
- Jangan menambah warna, spacing atau status vocabulary ad hoc jika token atau
  constant sedia ada mencukupi.

## Validation

Selepas perubahan yang relevan, jalankan:

```powershell
npm run lint
npm exec tsc -- --noEmit
npm run build
```

Untuk perubahan database atau auth, tambah ujian role/RLS/RPC dan nyatakan jika
ujian local Supabase tidak boleh dijalankan kerana Docker tiada.

## Documentation maintenance

Kemas kini dokumentasi apabila berlaku perubahan kepada:

- product scope atau feature status;
- route, role atau order/payment status;
- environment variables atau feature flags;
- schema, migration, RLS atau RPC contract;
- deployment flow atau launch gates.

Jangan menandakan item `TODO.md` selesai sehingga implementation dan validation
yang berkaitan benar-benar lulus.
