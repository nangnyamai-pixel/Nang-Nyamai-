# Smart Cart Audit

## Scope

This audit covers the existing customer cart and the smallest possible Smart Cart enhancement. No application files, database schema, checkout logic, or order behaviour were changed for this audit.

## Current Cart Architecture

The cart is owned by the client-side `MenuBrowser` component (`src/components/customer/menu-browser.tsx`). It is a single React state object, not a separate cart service or database table:

```ts
Record<string, { item: MenuItem; quantity: number }>
```

The object key is the menu item ID. `cartItems` is derived with `Object.values(cart)`, `cartCount` sums quantities, and `cartTotal` multiplies each current menu item price by its quantity. The cart is currently in-memory for the mounted menu page; no localStorage persistence or cart table was found.

The same state is used by menu cards, AI Food Match results, the food-detail modal, the cart dialog, checkout, and the post-order reset. There is no second cart implementation.

## Existing Menu, Card, Detail and Add Flow

- `src/app/(customer)/order/page.tsx` loads active categories and menu items from Supabase when configured, with `data/menu-2025.json` as the development/preview fallback.
- Live menu selection includes `id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_available`, and `is_popular`. The customer mapping exposes `is_popular` as `is_signature` for the existing badge UI.
- `src/components/customer/food-card.tsx` is the reusable card. It already provides image/placeholder, name, price, description, optional badge, detail selection and Add action. Images use a 4:3 area and `object-fit: cover`.
- `MenuBrowser` opens the selected item in its existing detail modal and adds it to the same cart state. AI Food Match calls the same `setCart` path.
- Quantity controls are already present in the cart dialog through `src/components/ui/quantity-selector.tsx`; remove is an item-level action in `MenuBrowser`.

## Existing Checkout and Order Creation

`MenuBrowser` calculates and displays the current subtotal/total through `src/components/customer/order-summary.tsx`. Checkout posts only `{ tableToken, specialNote, paymentMethod, items: [{ menuItemId, quantity }] }` to `src/app/api/orders/route.ts`.

The server re-reads current `menu_items` prices and availability, validates the QR/table token, creates the order and inserts `order_items`. The authoritative order fields are `subtotal`, `service_charge`, `total`, `payment_status`, and `payment_method`; the browser total is not trusted for order creation. A successful order clears the existing React cart. Smart Cart must not replace or bypass this flow.

## Existing Database and Order Data

The schema source files define:

- `menu_items`: `id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_available`, `is_popular`, `spice_level`, `allergens`, timestamps.
- `orders`: `id`, `table_id`, nullable `customer_id`, nullable `guest_session_id`, status, totals, payment fields, timestamps. A check constraint requires either a customer or guest session.
- `order_items`: `id`, `order_id`, `menu_item_id`, name/price snapshots, quantity, selected options, note, timestamp.
- `restaurant_tables`: `id`, `table_number`, `qr_token`, `is_active`.

`order_items.menu_item_id` has a foreign key to `menu_items.id`; `orders.table_id` has a foreign key to `restaurant_tables.id`; `orders.customer_id` references `profiles.id`.

For a Popular badge, completed and paid `orders` joined to `order_items` provide sufficient data. The existing `src/app/api/ai-food-match/personalization/route.ts` already aggregates quantities by `menu_item_id` and returns ranked `popularIds`. This is the only existing order-derived popularity implementation found. Customer menu data also contains `menu_items.is_popular`, but it is currently mapped to the existing Signature badge and should not be silently relabeled as Smart Cart Popular without an explicit product decision.

## Existing AI Food Match Data

`src/lib/food-match.ts` performs explainable, rule-based scoring from the current menu item name, description and category. It returns up to three available items with `percentage`, `reasons`, and personalization reasons.

`src/components/customer/food-match.tsx` renders the results and calls the same `onAdd` callback supplied by `MenuBrowser`. It also records the session through `/api/ai-food-match` and requests order-derived personalization from `/api/ai-food-match/personalization`.

The current cart line shape does not retain the fact that an item came from AI Food Match. Therefore a Recommended badge cannot be derived later from the cart item alone without either (a) adding a small optional metadata field to the existing cart line, or (b) keeping a recommendation ID set alongside the same cart state. The latter avoids changing order payloads and database schema.

## Existing Table/QR Context

`src/app/(customer)/order/page.tsx` reads `table` and `token` query parameters and passes `token || table` as `tableToken` to `MenuBrowser`. Checkout displays the detected token and sends it unchanged to `/api/orders`. The API resolves it against active `restaurant_tables` (`qr_token` in production; token/table number fallback in development). Smart Cart can display the existing `tableToken` but must not invent or replace table context.

## Reusable Components and Utilities

- `MenuBrowser` — single cart owner, add/remove/quantity, checkout and table context.
- `FoodCard` — existing item visual and actions.
- `QuantitySelector` — existing quantity controls.
- `OrderSummary` — existing subtotal/total presentation.
- `Button`, `Badge`, `Card`/surface primitives and theme tokens.
- `food-match.ts` and `FoodMatch` — existing recommendation data and result flow.
- `/api/ai-food-match/personalization` — existing completed/paid order aggregation.
- `/api/orders` — existing authoritative order creation; must remain unchanged.

## Recommended Minimal Smart Cart Implementation

1. Keep `MenuBrowser` as the sole cart owner and retain its current line-item shape.
2. Improve cart presentation only: explicit plus/minus controls, remove action, existing `OrderSummary`, and table context when present.
3. Add a small optional in-memory recommendation marker keyed by menu item ID (for example, a `Set` maintained next to cart state). When AI Food Match adds an item, mark that ID as Recommended; normal menu/detail adds do not.
4. Render `Recommended` only for marked cart lines. Do not add a new order column, cart table, or recommendation engine.
5. Use the existing completed+paid `order_items` aggregation for Popular. Prefer one server endpoint or existing personalization response reused by the cart; do not calculate popularity from incomplete/unpaid orders.
6. Treat availability at add/checkout time as authoritative. If a previously added item becomes unavailable, show an unavailable state and let the existing order API reject invalid checkout safely.
7. Keep subtotal/total calculation and checkout request unchanged. Do not add suggestions, add-ons, loyalty dependencies, or AI calls from inside the cart.

## Files Likely to Modify

- `src/components/customer/menu-browser.tsx` — presentation/metadata wiring while retaining cart and checkout handlers.
- `src/components/customer/food-card.tsx` only if a badge prop is needed by the existing card; avoid changing unrelated card behaviour.
- `src/components/customer/order-summary.tsx` only if a purely presentational label is required.
- `src/components/customer/quantity-selector.tsx` only if an existing control cannot meet the requested presentation.
- `src/app/api/ai-food-match/personalization/route.ts` only if its existing aggregation must be safely reused for Popular data.
- Centralized translation dictionary for new badge labels, if required.

No new database table is required for Smart Cart MVP.

## Files That Should Not Be Modified

- `src/app/api/orders/route.ts` and checkout/order RPC/database logic.
- Payment, receipt, staff queue, kitchen, order tracking and loyalty functionality.
- Menu schema, order schema, RLS or migrations, unless a separate approved requirement proves a schema change is unavoidable.
- `src/lib/food-match.ts` matching rules, unless only a non-functional metadata handoff is required.
- Admin/staff UI.

## Potential Regression Risks

- Persisting cart in a new place could create two sources of truth; avoid it.
- Sending badge metadata in the order payload would be ignored by current validation and risks scope creep.
- Using `is_popular` as Popular without clarifying its current Signature meaning could mislabel items.
- Counting all orders instead of completed+paid orders would make Popular unstable or misleading.
- Guest/customer RLS does not make direct browser aggregation safe; keep order-derived reads behind the existing server route or reuse its safe response.
- Removing an item at quantity one must preserve the current behaviour unless a deliberate UX change is approved.

## Audit Conclusion

The current cart already supports the core Smart Cart MVP mechanics: quantity, remove, subtotal, total, QR table context and checkout. The smallest safe enhancement is presentational plus an in-memory Recommended marker and reuse of the existing completed/paid popularity aggregation. No second cart, new database table, checkout change, payment change, or order-creation change is warranted.
