# AI Food Match Developer Audit

Audit scope: independent customer-module work only.  
Audit date: 18 September 2026.  
No application, schema or documentation files were changed for this audit.

## Existing AI Food Match flow

The current implementation is a client-side, rule-based discovery panel inside the existing `/order` menu route:

1. `OrderPage` loads the JSON fallback or Supabase categories/menu items.
2. `MenuBrowser` preserves the existing menu search, category filter, cart and checkout state.
3. `FoodMatch` opens from a “Find My Food” entry point.
4. Customer selects Spicy, Noodles, Meat, Rice, Local Food, Vegetarian or Budget.
5. `matchFood` filters unavailable items, scores keyword/category signals and returns up to three results.
6. Results display percentage and rule-derived “Why this match?” text.
7. Existing `FoodCard` selection opens the existing food detail dialog; existing Add handlers update the existing cart.

There is no Gemini call, AI endpoint, machine-learning model or AI interaction log. AI failure handling is therefore a non-network fallback: the deterministic explanation is always available.

Known implementation characteristics:

- Scores are derived from name, description and category text.
- Empty preferences produce a baseline ranked list.
- Vegetarian/spicy claims are inferred from keywords and are not verified structured dietary data; this is a product/data risk.
- `FoodMatch` currently contains bilingual labels locally rather than using the central translation dictionary for every new label.

## Existing Supabase structure

Relevant public tables from the schema/migrations:

- `categories`: active menu grouping and display order.
- `menu_items`: item ID, category, name, description, price, image URL, availability/popular state.
- `menu_item_components`: component/ingredient display support.
- `menu_item_option_groups` and `menu_item_options`: required/optional option rules.
- `restaurant_tables`: QR/table identity and active status.
- `orders` and `order_items`: transactional order header and snapshots.
- `profiles`: application identity/role.
- `feedback`: completed-order feedback.

RLS is enabled for the public tables. Customer ordering uses server validation/RPC contracts and must remain the authority for availability, option validity and pricing. AI Food Match currently performs no database writes and needs no migration.

The repository note says the customer menu may use the JSON fallback while live menu migration/availability work is incomplete. Any future developer must preserve that dual-source normalization and avoid assuming that JSON and live rows have identical fields.

## Existing authentication

- Browser and server Supabase clients use `@supabase/ssr` and public publishable/anon keys.
- `/auth/login` supports password and Google OAuth paths, plus guest navigation.
- `/auth/callback` handles session exchange and redirect continuation.
- Middleware refreshes sessions; protected customer profile/feedback routes check the authenticated user server-side.
- Guest checkout remains supported through the existing table/session/order path.

AI Food Match must not require authentication, alter the auth redirect, inspect tokens/cookies, or send customer identity to an AI service.

## Existing Admin Dashboard

`src/app/admin/page.tsx` is currently a placeholder protected by middleware/server role checks; it is not a menu management dashboard. Staff operational screens live under `/staff` and include queue, kitchen, status, payment and receipt workflows. No admin AI recommendation management exists.

AI Food Match must not add admin controls, alter staff styling, change menu availability workflows or modify receipt/order management.

## Relevant files

Current AI Food Match files:

- `src/lib/food-match.ts` — pure preference types, keyword signals, scoring and result reasons.
- `src/components/customer/food-match.tsx` — preference UI, result rendering and existing handlers.
- `src/components/customer/menu-browser.tsx` — integration point, menu normalization handoff, existing cart/detail/checkout ownership.
- `src/app/(customer)/order/page.tsx` — JSON/live menu source and category normalization.
- `src/components/customer/food-card.tsx` — reusable item card, detail selection and Add UI.
- `src/components/customer/category-navigation.tsx` — existing category filter.
- `src/lib/menu-images.ts` — local image mapping.
- `src/lib/i18n.tsx` — centralized customer language provider/dictionary.

Supporting customer flow files:

- `src/app/order/[id]/page.tsx` — tracking/details.
- `src/app/api/orders/route.ts` — existing order route; out of scope.
- `src/components/customer/order-summary.tsx` and `quantity-selector.tsx` — cart/checkout primitives.
- `src/app/profile/page.tsx` and profile components — customer profile; out of scope.

## Shared files with the other developer

Treat these as shared/high-conflict files:

- `src/components/customer/menu-browser.tsx` — integration, cart state, detail dialog and checkout.
- `src/app/(customer)/order/page.tsx` — menu source/normalization.
- `src/components/customer/food-card.tsx` — shared visual card.
- `src/lib/i18n.tsx` — shared translation dictionary.
- `src/app/globals.css` — shared theme tokens and heritage pattern.
- `src/lib/theme.tsx` — theme persistence/provider.
- `src/types/database.ts` — generated/hand-maintained schema types.

Coordinate changes to shared files, keep patches narrow, and avoid formatting the whole file. Prefer isolated utilities/components for new work.

## Potential conflict areas

1. Both developers may edit `MenuBrowser` to add entry points or result actions.
2. Both may change `FoodCard` sizing, image behavior or metadata placement.
3. Translation additions can conflict in the one-line dictionary structure.
4. Theme/pattern work in `globals.css` can unintentionally affect staff/admin surfaces.
5. Menu source changes can break JSON/live normalization or duplicate IDs.
6. Changes to cart handlers can violate the invariant that cart clears only after successful order creation.
7. Any direct menu-table query or availability change can conflict with the feature flag and RLS/PRD baseline.
8. Adding Gemini/API code could introduce secret, privacy, latency and failure-surface conflicts; no such infrastructure currently exists.

## Recommended implementation boundaries

### In scope

- `src/lib/food-match.ts` scoring corrections/tests.
- `src/components/customer/food-match.tsx` layout, accessibility and state polish.
- A small adapter/normalizer if JSON/live menu fields need a single shape.
- Centralized translation keys, coordinated with the owner of `src/lib/i18n.tsx`.
- Customer-only visual fixes using existing primitives/tokens.

### Out of scope

- Checkout/order/payment/receipt routes and RPCs.
- Cart redesign or a second cart store.
- Supabase migrations, RLS, auth callbacks and profiles.
- Admin/staff screens and menu mutation workflows.
- Loyalty Rewards, Smart Cart and customer feedback workflow.
- Gemini/AI provider integration unless separately approved and infrastructure is first audited.

### Safety rules

- Recommendations must use the current menu source and stable item IDs.
- Filter unavailable items before display and rely on existing server validation at checkout.
- Use existing detail/Add handlers; never create recommendation-specific order writes.
- Explain matches using structured rule reasons, not unverified dietary promises.
- Keep theme, language, QR/table context and authentication state unchanged.
- Validate with lint, typecheck, build and customer-flow regression tests.

## Recommended handoff

The second developer should work primarily in the isolated scoring utility and Food Match component. Any required `MenuBrowser` integration should be a small, coordinated patch. Before merging, compare the shared-file diff, run the full customer flow and verify that staff/admin, checkout, receipt, auth and loyalty behavior are unchanged.
