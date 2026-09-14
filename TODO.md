# NangNyamai TODO

Dikemas kini: **7 September 2026**

Gunakan fail ini untuk kerja yang belum selesai. Keperluan dan acceptance
criteria berada dalam [PRD.md](PRD.md). Jangan menandakan tugasan selesai hanya
kerana UI placeholder wujud.

## Legend

- `[ ]` belum selesai
- `[x]` disahkan selesai
- **P0** wajib sebelum public production
- **P1** selepas core launch atau production hardening
- **P2** roadmap/optional discovery

## Baseline yang telah dilaksanakan

- [x] Sarawak Contemporary global design tokens dan UI primitives
- [x] Customer home, menu, search dan category navigation
- [x] Food detail, option selection, quantity dan cart persistence
- [x] Checkout UI dengan subtotal, SST 6% dan total
- [x] Atomic `create_customer_order` RPC dengan server-side pricing
- [x] Idempotency melalui `client_request_id`
- [x] Email magic link dan Supabase Auth callback
- [x] Staff role gate, dashboard, queue, kitchen dan history
- [x] Staff order status RPC dan payment RPC
- [x] RLS aktif pada semua jadual public baseline
- [x] Profile provisioning migration dan backfill Auth users
- [x] Global English/Bahasa Melayu provider dan shared language selector asas

## P0 - sebelum public production

### Database migration source of truth

- [ ] Reconcile PRD claim of baseline migrations with the local workspace.
- [x] Add reviewed profile provisioning migration under `supabase/migrations/`.
- [x] Apply and verify profile trigger/backfill against hosted Supabase.

Exit condition: A fresh environment can reproduce the required schema and
RPCs from reviewed migrations, and hosted migration history is documented.

### QR dan guest security

- [ ] Reka bentuk signed table token yang mengandungi table identity, expiry
      dan nonce/version.
- [ ] Tambah `QR_SIGNING_SECRET` sebagai server-only secret.
- [ ] Tolak missing, expired, malformed dan tampered tokens.
- [ ] Tentukan strategi anti-replay dan rotation.
- [ ] Uji order creation daripada table token sah dan tidak sah.

Exit condition: Kod meja biasa tidak lagi mencukupi untuk mencipta order pada
production.

### Rate limiting dan abuse protection

- [ ] Rate limit `create_customer_order` mengikut IP/session/table.
- [ ] Rate limit magic link dan OAuth initiation.
- [ ] Sediakan asas rate limit untuk feedback.
- [ ] Log rejection tanpa menyimpan PII berlebihan.
- [ ] Papar error `RATE_LIMITED` yang selamat kepada pengguna.

Exit condition: Load/abuse test mengesahkan request berlebihan ditolak tanpa
menjejaskan transaksi sah.

### Live menu data

- [ ] Gantikan import JSON pada customer home/menu/detail dengan query
      Supabase.
- [ ] Pastikan option groups, options dan components dibaca dari database.
- [ ] Gunakan `is_active` dan `is_available` pada semua customer surfaces.
- [ ] Pastikan cart dan checkout menangani item yang menjadi unavailable.
- [ ] Jalankan regression QA terhadap 10 kategori dan 81 item.
- [ ] Aktifkan `STAFF_MENU_MUTATIONS_ENABLED=true` hanya selepas QA lulus.

Exit condition: Perubahan availability staf kelihatan kepada pelanggan tanpa
redeploy dataset JSON.

### Database dan RPC hardening

- [ ] Audit semua `SECURITY DEFINER` functions.
- [ ] Tetapkan explicit `search_path` dan schema-qualified references.
- [ ] Revoke default grants dan grant execute kepada role minimum.
- [ ] Uji staff RPC dengan customer, anon dan unauthorized authenticated user.
- [ ] Uji atomic rollback untuk invalid item dan invalid option.
- [ ] Uji retry/idempotency dan concurrent staff updates.
- [ ] Semak semula multiple permissive RLS policies.

Exit condition: RLS/RPC adversarial test suite lulus untuk semua role.

### Customer tracking dan history

- [ ] Putuskan kontrak pemilikan guest order selepas checkout.
- [ ] Tambah scoped query/RPC untuk order sendiri sahaja.
- [ ] Sambungkan `/orders/[orderNumber]` kepada order sebenar.
- [ ] Tambah Realtime atau polling fallback untuk status.
- [ ] Sambungkan `/orders` untuk authenticated customer/session yang sah.
- [ ] Sediakan loading, empty, error, expired dan unauthorized states.

Exit condition: Pelanggan boleh melihat order sendiri dan tidak boleh membaca
order orang lain.

### Authentication production

- [ ] Konfigurasi Google OAuth provider di Supabase.
- [ ] Konfigurasi Google consent screen dan production redirect URI.
- [ ] Tetapkan Supabase Site URL dan Additional Redirect URLs.
- [ ] Konfigurasi transactional SMTP, SPF, DKIM dan DMARC.
- [ ] Uji magic link, Google login, logout, expiry dan multi-tab behavior.
- [ ] Dokumentasi recovery path jika provider gagal.

Exit condition: Customer/staff login lulus staging dan production smoke test.

### Deployment dan operations

- [ ] Initialize Git repository dan commit baseline yang telah disemak.
- [ ] Tetapkan protected main branch dan CI untuk lint/typecheck/build.
- [ ] Cipta Vercel project dan preview deployment.
- [ ] Tetapkan production environment variables dan custom domain.
- [ ] Konfigurasi error monitoring, uptime dan database alerts.
- [ ] Dokumentasi backup, restore, incident response dan rollback.
- [ ] Jalankan production smoke test untuk customer dan staff golden paths.

Exit condition: Release candidate boleh dideploy dan di-rollback dengan
runbook yang diuji.

### Restaurant sign-off

- [ ] Sahkan semua nama, deskripsi, harga dan SST dengan restoran.
- [ ] Sahkan availability dan option rules.
- [ ] Sahkan pembayaran di kaunter dan status workflow.
- [ ] Sahkan kandungan berkaitan dietary/halal sebelum dipaparkan.

Exit condition: Product owner/restoran memberi sign-off bertulis terhadap data
dan aliran operasi.

## P1 - selepas core launch

### Customer features

- [ ] Lengkapkan feedback untuk completed order sahaja.
- [ ] Hadkan satu feedback bagi setiap order/customer yang sah.
- [ ] Tambah customer history filters dan useful empty states.
- [ ] Complete translation-key audit for checkout confirmation and order
      tracking so no application-owned Malay text remains in English locale.

### Admin

- [ ] Tentukan skop admin dan role escalation process.
- [ ] Bina user/staff management dengan audit trail.
- [ ] Bina menu/category/option management.
- [ ] Bina configuration dan basic operational analytics.

### Security dan observability

- [ ] Aktifkan leaked password protection jika password auth digunakan.
- [ ] Tambah audit log untuk role, menu, payment dan status mutations.
- [ ] Tambah structured logs dan checkout failure metrics.
- [ ] Semak unused indexes selepas trafik/query pattern stabil.
- [ ] Tetapkan privacy notice dan data retention policy.

### Quality

- [ ] Unit tests untuk cart calculation, validators dan status transitions.
- [ ] Integration tests untuk RPC, RLS, rollback dan idempotency.
- [ ] E2E customer golden path.
- [ ] E2E staff golden path.
- [ ] Accessibility audit WCAG 2.2 AA.
- [ ] Performance audit dan query plan review.

## P2 - roadmap

- [ ] Tentukan rewards model, earning rules dan redemption rules.
- [ ] PWA/offline enhancement selepas live-data strategy stabil.
- [ ] Extend bilingual translation coverage to future live staff/admin modules.
- [ ] Push notification discovery.
- [ ] AutoCount/POS integration discovery selepas API dan data ownership
      disahkan.
- [ ] AI menu assistant hanya selepas katalog, permissions dan safety scope
      stabil.

## Keputusan yang memerlukan product owner

- [ ] Adakah guest perlu log masuk untuk tracking selepas meninggalkan
      checkout?
- [ ] Siapa source of truth menu, harga dan availability?
- [ ] Apakah polisi cancellation/refund?
- [ ] Berapa lama order, profile dan feedback disimpan?
- [ ] Adakah `verified` wajib dalam order state machine?
- [ ] Apakah peranan AutoCount dalam future integration?

## Checklist setiap perubahan

- [ ] Baca arahan Next.js yang relevan dalam `node_modules/next/dist/docs/`.
- [ ] Preserve fungsi sedia ada dan jangan tambah fake data.
- [ ] Gunakan constants dan UI primitives sedia ada.
- [ ] Validate input pada trust boundary.
- [ ] Semak RLS/authorization jika data atau mutation berubah.
- [ ] Jalankan `npm run lint`.
- [ ] Jalankan `npm exec tsc -- --noEmit`.
- [ ] Jalankan `npm run build`.
- [ ] Kemas kini README/PRD/TODO apabila status atau kontrak berubah.
