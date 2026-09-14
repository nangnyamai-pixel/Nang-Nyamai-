# NangNyamai Customer Module Audit

Audit date: 14 September 2026  
Scope: customer-facing Next.js routes, Supabase integration, customer RLS, journey, UI and static verification. No functional refactor was performed.

## 1. Executive Summary

The customer menu, cart, QR context, profile and basic authentication are present and usable. The module is not production-ready because the checked-in customer order route still performs separate `orders` and `order_items` inserts, does not use the transactional/idempotent RPC described by the PRD, and can leave an order without items. Authentication and role boundaries have a sound baseline, but OAuth production configuration, live-policy reconciliation, complete i18n coverage and end-to-end verification remain incomplete.

## 2. Customer Module Architecture

Next.js 16 App Router uses `/order` for the menu and cart, `/order/[id]` for tracking/detail, `/profile` for the authenticated profile, and `/auth/*` for login/callback/error. `MenuBrowser` is the main client-side state owner for cart and checkout. Supabase SSR clients handle server requests; the menu currently uses `data/budaya-restaurant-menu-2025.json` while order submission validates live `menu_items` in non-development mode.

## 3. Feature Inventory

| Feature | Route | Main Files | Backend/Data Source | Status | Issues |
|---|---|---|---|---|---|
| Entry/menu | `/`, `/order` | `src/app/page.tsx`, `src/app/(customer)/order/page.tsx` | Local JSON/menu helpers | PARTIALLY WORKING | Home hard-redirects to `T12`; live menu and local menu can diverge. |
| Categories/search | `/order` | `menu-browser.tsx`, `category-navigation.tsx` | Local JSON | WORKING | No live availability in customer browsing. |
| Item detail/options | `/order` | `menu-browser.tsx`, `food-card.tsx` | Local JSON | PARTIALLY WORKING | Option support is limited and must match server menu IDs. |
| Cart | `/order` | `menu-browser.tsx`, `quantity-selector.tsx` | Browser state/local storage strategy | PARTIALLY WORKING | Cross-tab, unavailable-item and auth/table-context behavior need tests. |
| Email/password login | `/auth/login` | `auth/login/page.tsx` | Supabase Auth | WORKING | Registration UI is absent. |
| Google OAuth | `/auth/login`, `/auth/callback` | callback route | Supabase Auth | NEEDS VERIFICATION | Provider/redirect production configuration not proven. |
| Guest access | `/auth/login`, checkout choice | login/menu | Guest cookie + server route | PARTIALLY WORKING | Requires valid table context; no dedicated guest session UI. |
| Profile/edit | `/profile`, `/api/profile` | `profile/page.tsx`, `profile-form.tsx` | `profiles` | WORKING | Loyalty data is placeholder; i18n is incomplete. |
| Member ID | `/profile` | profile page, member migration | `profiles.member_id` | WORKING | Hosted migration must remain in deployment history. |
| QR/table | `/order?table=...` | order page, orders route | `restaurant_tables` | PARTIALLY WORKING | Development accepts table number; production accepts QR token only. |
| Checkout/order | `/order` | `api/orders/route.ts` | `orders`, `order_items`, `menu_items` | P1 BROKEN RISK | Separate inserts can create partial orders; not the PRD RPC. |
| Confirmation/tracking | `/order/[id]` | order detail page | `orders`/items | PARTIALLY WORKING | Customer route/RLS and guest tracking require verification. |
| History | `/profile` | profile page | `orders` | PARTIALLY WORKING | Only authenticated profile history; no guest recovery. |
| Feedback/rewards | none usable | schema only | `feedback`; no rewards table | MISSING | PRD marks these incomplete. |
| Loading/error/empty | order loading/auth error | route files | UI | PARTIALLY WORKING | Several labels are hard-coded and mixed-language. |

## 4. Customer Journey

The verified path is QR URL -> menu/category/search -> local cart -> checkout -> server table lookup -> live menu availability/price lookup -> order insert -> order-item insert -> confirmation. Authenticated checkout uses `auth.getUser()` and `customer_id`; guest checkout uses the `nangnyamai_guest_session` HTTP-only cookie. Profile is protected by its server component. Main dead end: an `orders` insert can succeed while `order_items` fails, and the API returns an error after leaving the order behind.

## 5. Authentication Findings

- `src/lib/supabase/middleware.ts` refreshes sessions and redirects unauthenticated `/staff` and `/admin` users.
- Middleware itself does not enforce staff/admin role; role enforcement must occur in the route/page/RLS layer. The current staff/admin pages are placeholders and do not show a complete server role gate.
- `/auth/callback` exchanges the code and redirects but does not explicitly surface exchange errors or synchronize profile metadata.
- Email/password login exists; customer registration is missing.
- `profiles.id = auth.users.id` is provisioned by `handle_new_user` migration and existing users were backfilled.
- Google provider, allowed redirect URLs and production OAuth QA remain NEEDS VERIFICATION.

## 6. Database Findings

Relevant tables from the schema: `profiles`, `restaurant_tables`, `categories`, `menu_items`, `orders`, `order_items`, and `feedback`. Orders reference tables and optionally profiles; order items reference orders and menu items; feedback references completed orders conceptually but completion enforcement is policy-level. Indexes exist for menu category, order table/customer/status and order items order ID. `member_id` is an added unique generated profile identifier; it is a display/member key, not an auth identity.

## 7. RLS & Authorization Findings

The proposed/live baseline has customer-own profile/order policies and staff/admin role helper functions. `menu_items` public SELECT uses `USING (true)` intentionally for menu discovery, but it exposes unavailable rows and requires server-side write restrictions. Orders constrain authenticated inserts to `customer_id = auth.uid()` and guest inserts to null customer plus a guest session. Order-item insertion is scoped through the owning order helper policy.

Confirmed operational issue fixed during the project: live `profiles` initially lacked an UPDATE policy; the update-own policy is now represented by migrations `20260914010000_profiles_update_own.sql` and `20260914011000_profiles_update_policy_role_check.sql`. Hosted migration history should be reconciled against the repository before production.

## 8. Cart Findings

Cart quantity and removal are client-side. The server recalculates subtotal from live `menu_items.price` and ignores client totals, which is correct. The route does not accept client prices. Missing verification: cart refresh persistence, stale/unavailable item reconciliation, multiple tabs, table changes and options/modifiers.

## 9. Checkout & Order Findings

`src/app/api/orders/route.ts` validates shape, table, item availability and server prices, then inserts an order and separately inserts order items. It generates an order number and UUID in the route. It does not use the transactional `create_customer_order` RPC or a client request idempotency key described in `PRD.md`. Double-click/retry can therefore duplicate orders, and item failure leaves an order without items. Error messages are generic, which is good for privacy but weak for support. This is the highest correctness risk.

## 10. Table / QR Findings

Production lookup uses active `restaurant_tables.qr_token`; development additionally accepts `table_number`, which is suitable only for local testing. Checkout revalidates the token. The route stores the resolved table ID. Restaurant/store association is not represented in the inspected schema, so multi-restaurant isolation is not applicable to the current single-restaurant model but would require a schema change before expansion.

## 11. UI/UX Findings

The customer UI has reusable Button/Input/Card-like primitives, responsive grid and theme/language controls. Recent theme changes cover customer `/profile` as well as `/order`. Remaining inconsistencies include hard-coded labels, mixed English/Malay, modal styling using legacy tokens, and limited visual verification at 320/375/430 widths. The cart bar contrast was corrected, but a full accessibility pass is still needed.

## 12. Multilanguage Findings

`src/lib/i18n.tsx` centralizes a useful English/Bahasa Melayu dictionary, but profile, order detail, confirmation, loading, auth error and several menu labels remain hard-coded. `locale === "en"` branching still exists in staff/admin placeholders. Customer strings such as “Profile saved.”, “Unable to save profile.”, “Saving…”, “Customer profile”, “Your details”, and “Loyalty rewards” bypass the dictionary. Status and payment vocabulary also needs centralized translation.

## 13. Error Handling Findings

Most route failures return safe generic messages. `api/orders/route.ts` hides database details, but its separate writes create ambiguous partial state. `api/profile/route.ts` also returns a generic failure without logging a safe server diagnostic. OAuth callback sends all exchange failures to a generic error page. Network and retry recovery UI is limited.

## 14. Security Findings

No service-role key or token was found in the inspected customer source. Server order pricing is recalculated. Main risks are transaction/idempotency gaps and the need to verify all live RLS policies against migrations. Production must confirm `QR_SIGNING_SECRET`/environment requirements and OAuth redirects. Public menu reads are expected, but customer APIs must not trust IDs, roles or totals.

## 15. Code Quality Findings

`MenuBrowser` and some profile/menu components are dense single-line JSX and combine state, rendering and API behavior. `src/lib/validation/order.ts` defines Zod schemas but `api/orders/route.ts` uses manual validation instead, creating duplicated validation contracts. `data/menu-2025.json` remains a local source while server order validation uses live menu rows. There is no `typecheck` npm script.

## 16. Build / TypeScript / Lint Findings

| Command | Result |
|---|---|
| `npm run lint` | PASS |
| `npm exec tsc -- --noEmit --incremental false` | PASS |
| `npm run build` | NOT RUN in this audit turn; run before release |
| `npm run typecheck` | NOT AVAILABLE; no script in `package.json` |

## 17. Master Findings

| ID | Severity | Area | Issue | Evidence | File(s) | Recommended Fix |
|---|---|---|---|---|---|---|
| CUST-P0-001 | P0 | Checkout integrity | Order and order-items are separate writes; partial orders are possible. | `orders` insert precedes `order_items` insert. | `src/app/api/orders/route.ts` | Use the reviewed transactional `create_customer_order` RPC and verify rollback. |
| CUST-P1-001 | P1 | Duplicate prevention | No client request idempotency key or double-submit protection at server contract. | Route generates a new UUID/order number per request. | `src/app/api/orders/route.ts` | Add idempotent RPC/request key without trusting client totals. |
| CUST-P1-002 | P1 | Auth | OAuth provider/redirect production configuration is unverified. | PRD/README explicitly mark Google OAuth partial. | auth route + Supabase config | Verify provider, redirect allow-list and mobile/browser QA. |
| CUST-P1-003 | P1 | Authorization | Staff/admin route role enforcement is documented but not demonstrated in the page implementation. | Middleware only checks user presence; pages are placeholders. | `src/lib/supabase/middleware.ts`, staff/admin pages | Add/verify server role gate and tests. |
| CUST-P2-001 | P2 | Data source | Customer browse uses local JSON while order validation uses live `menu_items`. | README and route code. | `menu-browser.tsx`, `api/orders/route.ts` | Unify source or explicitly reconcile IDs/availability. |
| CUST-P2-002 | P2 | i18n | Many customer strings bypass translations. | Profile/auth/order detail JSX. | customer pages/components | Complete dictionary coverage and locale tests. |
| CUST-P2-003 | P2 | Error recovery | Generic errors provide no retry/diagnostic correlation. | API responses and client messages. | API routes/components | Add safe structured server logging and customer retry states. |
| CUST-P2-004 | P2 | QA | Mobile widths and guest/auth/table retry scenarios are not automated or documented as passing. | No test script; manual-only baseline. | project-wide | Add journey/RLS/RPC tests and viewport QA checklist. |
| CUST-P3-001 | P3 | Maintainability | Dense JSX and duplicated manual/Zod validation. | `MenuBrowser`, order route, validation module. | listed files | Consolidate only while implementing P0/P1 work. |
| CUST-P3-002 | P3 | Product completeness | Rewards, feedback UI, registration and customer notifications are missing/placeholder. | PRD and routes. | profile/order/auth | Plan separately; do not present as complete. |

## 18. Recommended Development Phases

1. Phase 0: replace separate order writes with the reviewed atomic/idempotent RPC; test rollback and duplicate submission.
2. Phase 1: verify server role gates, OAuth configuration, session refresh and profile/member provisioning.
3. Phase 2: reconcile local/live menu IDs, availability and table context.
4. Phase 3: harden cart persistence, stale items, options and mobile behavior.
5. Phase 4: complete checkout/order confirmation and guest/auth tracking.
6. Phase 5: complete profile, order history, feedback and rewards contracts.
7. Phase 6: remove remaining hard-coded customer strings and test English/Bahasa Melayu.
8. Phase 7: responsive/accessibility polish.
9. Phase 8: full journey, RLS, build and production verification.

## 19. Final Readiness Score

| Area | Score |
|---|---:|
| Authentication | 68 |
| Authorization & RLS | 62 |
| Database Integrity | 55 |
| Menu/Browsing | 72 |
| Cart | 65 |
| Checkout | 48 |
| Orders | 52 |
| Table/QR Flow | 70 |
| Multilanguage | 58 |
| UI/UX | 72 |
| Mobile Responsiveness | 65 |
| Error Handling | 58 |
| Security | 60 |
| Code Quality | 62 |

**Overall Customer Module Readiness: 59/100 — Major Improvements Required**

P0: 1. P1: 3. P2: 4. P3: 2.

Top five fixes: atomic order creation; idempotent duplicate protection; server-enforced staff/admin roles; production OAuth verification; local/live menu source reconciliation.

The first phase should be **Phase 0 — Critical Security & Data Integrity**, primarily affecting `src/app/api/orders/route.ts`, the customer order RPC/migrations, related RLS and order journey tests. The module is **not safe for production use** until the P0 checkout integrity risk and P1 authorization/OAuth gaps are resolved and validated.
