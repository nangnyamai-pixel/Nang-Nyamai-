# AI Food Match Audit

Audit date: 18 September 2026  
Scope: customer experience and existing AI/menu recommendation capability only.  
No application code was modified for this audit.

## A. Current customer flow

| Area | Current implementation | PRD comparison |
|---|---|---|
| QR entry | `src/app/(customer)/order/page.tsx` reads `table` and `token` query parameters and passes the table token into `MenuBrowser`. | The PRD describes `/home?table=...`; the repository currently uses `/order`. Signed QR tokens remain a production hardening item. |
| Home/menu | There is no separate customer home route; `/order` is the customer menu surface. | Functionally covers the menu entry point, but route naming differs from PRD. |
| Categories | `CategoryNavigation` filters the category list client-side. | Matches CUS-01 and FR-CUS-003. |
| Food details | `FoodCard` opens an in-page detail dialog with description, price and Add action. There is no separate detail route. | Covers the interaction, but not a standalone detail URL. |
| Cart | `MenuBrowser` owns an in-memory cart keyed by menu item ID, with quantity controls and subtotal. | Covers cart behavior; persistence across reload is not evident in this component. |
| Checkout | Checkout modal collects note/payment method and calls `/api/orders`; auth or guest choice is presented before submit. | Core flow exists. Server validates table, availability and prices; browser total is display-only. |
| Order confirmation | Successful response renders an in-page confirmation with order number and tracking link. | Covers order number/confirmation. |
| Tracking | `/order/[id]` reads order/order items and displays status progression. Feedback route is available for completed and paid orders. | Tracking is marked partial in PRD because scoped guest access and Realtime are not complete. |
| Registration/login | `/auth/login` and callback support Supabase authentication; Google is partial/configuration-dependent. Guest checkout is supported. | Matches AUTH baseline with Google still partial. |
| Profile | `/profile` supports authenticated profile details, member ID, order history, theme/language controls and logout. | Profile exists; loyalty remains a placeholder. |

## B. Existing AI functionality

No existing AI Menu Assistant, Gemini integration, recommendation API, prompt, recommendation UI or AI interaction logging was found in the repository.

Evidence:

- `package.json` has no Gemini/AI SDK dependency.
- `src/` contains no AI route, prompt, assistant component or recommendation service.
- `MenuBrowser` only performs text search and category filtering.
- No AI/recommendation/interaction table or migration was found.

Therefore AI Food Match would be a new customer feature, not an extension of an existing AI feature. The smallest safe version should be deterministic and local.

## C. Existing reusable components

- `MenuBrowser`: current menu filtering, detail dialog, cart state and checkout handoff.
- `FoodCard`: item display and existing Add action.
- `CategoryNavigation`: category selection UI.
- `Button`, `Badge`, `Input` and existing theme/language providers in `src/components/ui` and `src/components/shared`.
- `OrderSummary`, `QuantitySelector` and existing cart item shape.
- `getMenuImage` and existing menu image mapping.
- `/api/orders` and existing `create_customer_order`/server validation path.

AI Food Match should call the same `onAdd`/cart state path rather than introducing another cart.

## D. Existing menu data available

The customer menu has two possible sources:

1. `data/menu-2025.json` preview/fallback data.
2. Supabase `categories` and `menu_items` when configured.

The local JSON currently provides category, name, price, description, optional options, size and one seasonal availability value. It does **not** consistently provide structured tags, ingredients, spicy level, food type, local classification, dietary flags or a normalized availability field.

The live query currently selects `id, category_id, name, description, price, image_url, is_available, is_popular`. This provides category relationship, price, description, image, availability and popular/signature-like state, but not recommendation attributes.

Useful derivable signals (explainable but imperfect):

- category/slug: noodles, beverages, dessert, ethnic/highlander;
- text keywords: rice, noodle, chicken, beef, fish, prawn, vegetable, salad, soup;
- price for budget scoring;
- `is_available` for eligibility;
- options/description text for additional keyword matches.

Do not infer vegetarian, halal, allergy safety or exact spice level without restaurant-confirmed data.

## E. Existing database/API structure

Reusable database tables include `categories`, `menu_items`, `menu_item_components`, `menu_item_option_groups`, `menu_item_options`, `orders` and `order_items`. RLS and server-side order creation are already established.

The current customer menu still reads the JSON fallback/preview path in the repository baseline and uses live menu data when Supabase is configured. `STAFF_MENU_MUTATIONS_ENABLED` must remain off while customer availability is not fully live-safe.

There is no recommendation table, AI service, feedback dependency or loyalty dependency required for matching. AI Food Match should be a read-only client calculation over the already loaded menu list. No new backend is necessary for the first version.

## F. Files that would need modification for the smallest implementation

Expected future changes only (not made in this audit):

- `src/components/customer/menu-browser.tsx`: add a Find My Food entry point and pass the current available menu list into the match UI; reuse existing cart callbacks.
- New client component, preferably `src/components/customer/food-match.tsx`: preference selection, deterministic scoring and Top 3 results.
- `src/lib/food-match.ts`: pure scoring/types/tests-friendly rule layer, if the logic is kept out of UI.
- `src/lib/i18n.tsx`: English/Bahasa Melayu labels and explanations.
- Possibly `src/types/...` only if shared menu types are centralized.
- `AI_FOOD_MATCH_AUDIT.md`/PRD/TODO documentation after implementation status is verified.

No database migration is required for the first rule-based version.

## G. Files that should NOT be modified

- `src/app/api/orders/route.ts` and checkout/RPC contracts, unless a separate approved defect is found.
- `src/components/customer/order-summary.tsx`, order confirmation and receipt/payment code.
- Supabase RLS, auth callbacks, profile provisioning and loyalty schema.
- Staff/admin routes and components.
- Menu prices, IDs, availability semantics or image mapping.
- `supabase/migrations/` for the initial rule-based feature.

## H. Recommended AI Food Match implementation

Target flow:

`Menu -> Find My Food -> preferences -> score available items -> Top 3 -> existing detail dialog -> existing cart`

Recommended preferences:

- Spicy;
- Noodles;
- Meat;
- Local Food;
- Rice;
- Vegetarian (only if verified attributes exist; otherwise omit or mark unavailable);
- Budget.

Use a simple deterministic score, for example:

- +3 for a verified/category or keyword match;
- +2 for a description/ingredient keyword match;
- +2 when under the selected budget;
- -999 for unavailable items;
- stable tie-break by price then menu name.

Show a short explanation based only on matched signals, e.g. “Matches Local Food and Noodles; within your budget.” Never claim dietary safety or spice certainty from weak text inference.

The UI should show exactly three results when three eligible items exist, fewer when the menu cannot support three. Each result must use the existing item ID/object and existing Add/detail actions. No duplicate cart, order or pricing logic should be introduced.

Gemini should not be added for the first implementation. If an optional “Why this match?” explanation is later requested, it should consume the already computed rule reasons, use a server-side integration, avoid sending unnecessary customer data, have a timeout/fallback, and never determine eligibility or price.

## I. Potential risks

- Sparse attributes make “spicy”, vegetarian and dietary recommendations unreliable.
- JSON and live Supabase menu shapes may differ; scoring must normalize both.
- Duplicate names such as Set A require category plus ID, never name-only lookup.
- `is_available` must be respected so unavailable items cannot be recommended or added.
- Recommendation UI must not bypass option requirements or server pricing.
- Guest table context and QR token handling must remain untouched.
- Mobile layout must remain usable at 390px and not compete with checkout/cart actions.
- Localization needs centralized keys; do not scatter language conditionals.
- Current PRD marks tracking/history and Google OAuth partial; Food Match must not imply those are complete.
- No loyalty points/redeems are needed for matching.

## J. Estimated implementation steps

1. Confirm product wording and the verified attribute vocabulary with the restaurant.
2. Define a normalized `MatchableMenuItem` shape for JSON and live rows.
3. Implement and unit-test a pure deterministic scoring function.
4. Add bilingual preference UI and “Find My Food” entry point using existing primitives.
5. Render Top 3 cards with existing detail and cart handlers.
6. Verify unavailable items, duplicate names, options and budget edge cases.
7. Run lint, TypeScript, build and responsive/accessibility checks.
8. Update PRD/TODO only after the feature is actually implemented and validated.

Estimated scope: small customer UI + pure utility; no database/API migration for v1.

## K. Final recommendation

Implement AI Food Match as a separate customer-facing discovery tool that shares the existing menu normalization, `FoodCard`, detail dialog and cart actions. Keep it rule-based and explainable; do not introduce machine learning or a new recommendation backend. There is no existing AI Menu Assistant to merge with, so no feature conflict exists. If an AI explanation is added later, keep Gemini optional and downstream of deterministic scoring. Keep checkout, order creation, payment, receipt, authentication, QR handling and loyalty entirely independent.
