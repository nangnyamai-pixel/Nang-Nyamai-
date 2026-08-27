# NangNyamai

NangNyamai ialah aplikasi web menu digital dan pesanan meja untuk Budaya
Restaurant, Sarawak Cultural Village. Pelanggan mengimbas QR meja, memilih
menu, menghantar pesanan dan menunggu penyediaan; staf mengurus queue, dapur,
status pesanan dan pembayaran di kaunter.

Produk ini bukan marketplace food-discovery, bukan POS enterprise dan tidak
membuat integrasi AutoCount tanpa discovery serta arahan berasingan.

## Status semasa

Baseline aplikasi telah meliputi customer menu/detail/cart/checkout, Supabase
Auth callback, staff dashboard/queue/kitchen/history, status/payment RPC,
RLS dan Sarawak Contemporary design system. Customer tracking/history,
feedback, rewards, admin console dan production hardening masih belum lengkap.

Menu pelanggan masih menggunakan `data/budaya-restaurant-menu-2025.json`.
Dataset tersebut bersumber daripada PDF menu 2025 dan kekal
`requires_restaurant_verification` sehingga restoran mengesahkan nama,
deskripsi, harga, availability, option rules serta dakwaan dietary/halal.

Rujukan utama:

- [PRD.md](PRD.md) - requirements, status, kontrak dan launch gates.
- [TODO.md](TODO.md) - backlog, prioriti dan exit conditions.
- [AGENTS.md](AGENTS.md) - arahan kerja untuk Codex/agent.
- `NangNyamai_PRD_Developer_Reference_v1.0.pdf` - PRD pembangun dalaman.

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 16.3.0 App Router, React 19.2.8, TypeScript |
| Styling | Tailwind CSS 4 + token Sarawak Contemporary |
| Backend | Supabase Auth, PostgreSQL, Data API dan Realtime |
| Validation | Zod + constraints/RPC server-side |
| Hosting sasaran | Vercel + Supabase hosted `ap-southeast-1` |

Gunakan Server Components secara lalai. Client Components hanya untuk browser
state, event handling atau API client-only.

## Struktur penting

```text
src/app/              route UI, auth callback, customer dan staff surfaces
src/components/       ui primitives, customer dan staff components
src/constants/        role, order status dan payment constants
src/lib/               Supabase clients, auth, validation dan data helpers
data/                  dataset menu 2025 (interim; bukan source live produksi)
supabase/sql/          SQL legacy/proposal dalam workspace semasa
supabase/migrations/   deployment source of truth yang diperlukan oleh PRD
```

Percanggahan repository yang diketahui pada 19 Ogos 2026: workspace ini
belum mempunyai `supabase/migrations/`; hanya `supabase/sql/` dan `seed.sql`
kelihatan. Jangan tambah atau ubah schema production secara ad hoc. Sebelum
perubahan database seterusnya, bina/review migration yang boleh diaudit dan
kemas kini [TODO.md](TODO.md).

## Menjalankan secara lokal

Keperluan: Node.js yang sepadan dengan project dan npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Docker/Supabase local tidak diperlukan untuk
preview UI, tetapi ujian migration/RLS/RPC lokal memerlukan runtime Supabase
yang sesuai.

Validation standard:

```powershell
npm run lint
npm exec tsc -- --noEmit
npm run build
```

## Environment variables

Simpan nilai sebenar dalam `.env.local`, Vercel environment settings atau
secret manager. Jangan commit fail tersebut dan jangan dedahkan service-role
key dalam `NEXT_PUBLIC_*`, source, log atau screenshot.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_BASE_URL=http://localhost:3000
STAFF_MUTATIONS_ENABLED=false
STAFF_MENU_MUTATIONS_ENABLED=false
QR_SIGNING_SECRET=                 # server-only; wajib sebelum production
```

`STAFF_MENU_MUTATIONS_ENABLED` mesti kekal `false` sehingga customer menu
membaca `menu_items.is_available` secara live daripada Supabase.

## Supabase dan Auth

Supabase ialah backend utama. Semua public tables mesti mempunyai RLS.
Mutation penting menggunakan server action, route handler atau RPC yang
mengesahkan role dan input. Kontrak utama yang dirujuk PRD ialah:

- `create_customer_order` - transactional pricing, option validation dan
  `client_request_id` idempotency.
- `staff_advance_order` - transisi `received -> verified -> preparing ->
  ready -> completed` atau `cancelled`.
- `staff_mark_order_paid` - payment status `unpaid`/`paid`.
- `staff_set_menu_availability` - staff/admin sahaja dan masih feature-flagged.

Magic link callback dan Google OAuth code tersedia, tetapi provider,
credentials, SMTP dan production redirects mesti disahkan di Supabase/Google
Cloud sebelum launch.

## Keselamatan dan invariants

- Browser tidak boleh menetapkan harga, subtotal, SST atau total muktamad.
- Checkout atomik; cart dikosongkan hanya selepas RPC berjaya.
- Retry request yang sama tidak boleh mencipta duplicate order.
- Guest tiada direct insert/update ke order tables; gunakan RPC.
- RLS dan server authorization ialah kawalan sebenar, bukan UI hiding.
- `SECURITY DEFINER` wajib explicit `search_path`, schema-qualified objects,
  least-privilege grants dan identity checks.
- Signed QR token, expiry, anti-replay dan rate limiting ialah P0 sebelum
  public production.

## Golden path

Guest: QR meja sah -> menu/kategori -> detail/options -> cart -> checkout ->
order number -> tracking.

Staf: login -> role check -> queue -> verify/preparing/ready -> mark paid ->
completed.

## Skop yang belum diluluskan

Jangan tambah payment gateway, AutoCount integration, Google Maps, shadcn/ui,
Framer Motion, rewards kompleks atau native mobile app tanpa permintaan
pengguna yang jelas. Ikuti [TODO.md](TODO.md) untuk kerja seterusnya.
