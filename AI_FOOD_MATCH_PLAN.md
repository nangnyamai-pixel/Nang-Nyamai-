# AI Food Match Implementation Plan

Status: Planning only  
Scope: Customer-facing discovery feature  
Constraint: No application code or database changes are made by this plan.

## 1. User flow

1. Customer enters the existing menu through QR/table context.
2. Customer selects **Find My Food** from the existing menu experience.
3. The feature opens a preference panel without leaving the menu or clearing the cart.
4. Customer selects one or more preferences:
   - Spicy;
   - Noodles;
   - Meat;
   - Local Food;
   - Rice;
   - Vegetarian, only when verified data exists;
   - Budget.
5. Customer submits preferences.
6. A deterministic scorer evaluates available menu items.
7. The UI shows up to three ranked matches and a short reason for each match.
8. Customer opens the existing food detail dialog/page.
9. Customer uses the existing Add action and existing cart state.
10. Customer continues through the unchanged cart and checkout flow.

The feature must preserve table code/token, current cart contents, language, theme and authentication state.

## 2. UI states

### Entry state

- “Find My Food” button or card in the existing customer menu.
- Uses the existing Button and design tokens.
- Does not replace search or category navigation.

### Preference state

- Multi-select preference controls with semantic buttons or checkboxes.
- Budget control with a clear no-budget option.
- English and Bahasa Melayu labels from the centralized translation dictionary.
- Continue/Match button disabled only when the state is invalid.
- Existing cart summary remains available.

### Calculating state

- Short, local loading state while scoring runs.
- No network request is required for rule-based matching.
- Preserve the current menu and cart context.

### Results state

- Heading such as “Your top matches”.
- Maximum three eligible items.
- Existing food card visual language.
- Match reasons rendered from structured scoring signals.
- Existing item detail and Add handlers reused.

### No-result state

- Explain that no available item matched all selected preferences.
- Offer “Broaden preferences” and “View all menu” actions.
- Never invent a recommendation or show unavailable items.

### Error state

- Safe customer-facing message if normalization or rendering fails.
- Preserve the normal menu and cart so ordering can continue.
- No AI/API error details shown to customers.

## 3. Components to reuse

- `MenuBrowser` for menu context, current item list, cart state and handlers.
- `FoodCard` for ranked result presentation.
- Existing food detail dialog inside `MenuBrowser` for item details.
- `Button`, `Badge`, `Input` and existing form primitives.
- `CategoryNavigation` and search as fallback discovery paths.
- `LanguageSelector`, `ThemeToggle` and `useLanguage`.
- Existing `getMenuImage`/image mapping.
- Existing order/cart callbacks; no second cart implementation.

## 4. Components to create

### `src/components/customer/food-match.tsx`

Client component responsible for preference selection, submit/reset states and rendering ranked results. It receives normalized menu items and callbacks from `MenuBrowser`.

### `src/lib/food-match.ts`

Pure, framework-independent utility containing:

- normalized item types;
- preference types;
- keyword/category signal mapping;
- scoring and deterministic sorting;
- explanation signal generation.

### Optional shared types

Only create a shared type file if the existing menu item types cannot be reused safely. Avoid duplicating the cart item type.

### Translation keys

Add only the required customer-owned labels/messages to the centralized i18n dictionary. Do not add language checks inside the feature component.

No API route, migration, loyalty component or AI provider is required for v1.

## 5. Data fields required

### Existing fields to reuse

- `id`;
- `category_id` or category slug/name;
- `name`;
- `description`;
- `price`;
- `is_available`;
- existing options/option groups;
- image field for display only.

### Derived fields

The normalizer may derive non-persisted signals from category, name and description:

- `isNoodle`;
- `isRice`;
- `isMeat`;
- `isLocalFood`;
- `isSpicy` only when an explicit verified signal exists;
- `isVegetarian` only when an explicit verified signal exists;
- `priceBand`.

Do not persist these derived values in the first version.

### Data gaps

The current menu does not consistently provide tags, ingredients, spice levels, dietary status or food-type metadata. The UI must not claim those attributes unless verified. A later data-enrichment migration can be considered separately.

## 6. Matching algorithm

Use deterministic rule-based scoring only.

1. Exclude every item where `is_available !== true`.
2. Normalize names, descriptions and category labels to lowercase tokens.
3. Apply preference signals using an explicit, reviewable keyword/category map.
4. Add points for confirmed matches:
   - category or strong keyword match: `+3`;
   - supporting description/ingredient keyword: `+2`;
   - budget satisfied: `+2`;
   - weak text-only signal: `+1`, only if product owner approves it.
5. Do not award points for unverified spicy or vegetarian claims.
6. Require at least one positive match when preferences are selected.
7. Sort by score descending, then price ascending, then stable menu name/ID.
8. Return the first three items.

The scorer must return structured reasons, for example:

```text
{ score: 7, reasons: ["Local Food", "Noodles", "Within budget"] }
```

The browser may calculate ranking for display, but cart addition and final price remain governed by the existing order flow and server-side validation.

## 7. AI explanation flow

There is no existing AI infrastructure in the repository audit. Therefore:

### v1

- Do not add Gemini or another AI provider.
- Render explanations directly from deterministic reasons.
- Keep explanations factual and short.

### Optional later phase

If an approved AI integration becomes available:

1. Calculate the match deterministically first.
2. Send only the top match metadata and structured reasons to a server-side AI endpoint.
3. Never send auth tokens, cookies, customer profile data or cart secrets.
4. Instruct the model to explain, not rank, price, or override availability.
5. Apply timeout, rate limit and fallback to deterministic reasons.
6. Log only safe operational metadata if interaction logging is approved.

AI must remain optional and must never block Add to cart or checkout.

## 8. Error and empty states

- Invalid preference state: explain what is required and keep selections.
- No eligible matches: show broaden/reset and view-all actions.
- Menu unavailable: show the existing unavailable/menu error state.
- Normalization failure: fall back to the normal menu and preserve cart.
- Optional AI explanation failure: show deterministic reasons instead.
- Stale item: re-check availability through the existing menu/order path; never force-add an unavailable item.
- Network failure: should not affect v1 scoring because matching is local; existing checkout errors remain unchanged.

All states require English/Bahasa Melayu translations, keyboard access, visible focus and minimum 44px targets.

## 9. Testing scenarios

### Functional

1. Match with no preferences and verify the defined default behavior.
2. Select Noodles and verify noodle items rank above unrelated items.
3. Select Local Food and verify category/keyword reasons are shown.
4. Select Rice and Budget together and verify both signals affect ranking.
5. Select conflicting preferences and verify a clear no-result/broaden state.
6. Verify unavailable items never appear.
7. Verify fewer than three eligible items renders correctly.
8. Verify duplicate names use stable IDs/category context.
9. Verify Top 3 detail actions open the existing detail UI.
10. Verify Add uses the existing cart and preserves existing cart items.
11. Verify required options still apply after recommendation.
12. Verify checkout, order creation, payment and receipt behavior are unchanged.

### Localization and theme

13. Verify English and Bahasa Melayu labels.
14. Verify language persistence after refresh.
15. Verify Light and Dark Mode styling.
16. Verify Pua Kumbu pattern and no horizontal overflow.

### Responsive/accessibility

17. Test 390px, 768px, 1024px and 1440px.
18. Keyboard-tab all controls and verify focus visibility.
19. Verify semantic labels and screen-reader names.
20. Verify disabled/loading states and touch targets.

### Regression

21. Guest QR checkout remains functional.
22. Authenticated checkout remains functional.
23. Customer profile and order tracking remain functional.
24. Staff/admin routes and menu behavior are unchanged.
25. No loyalty data or rewards state is required.

## 10. Implementation order

1. Confirm product-approved vocabulary and verified attribute policy.
2. Normalize JSON fallback and live Supabase menu shapes into one in-memory type.
3. Implement pure scoring and explanation-signal utility with unit tests.
4. Add translation keys.
5. Build the preference/results client component using existing UI primitives.
6. Integrate the entry point into `MenuBrowser` without changing cart or checkout handlers.
7. Reuse existing detail and Add actions for every match.
8. Add no-result, unavailable, loading and reset states.
9. Run lint, TypeScript check and build.
10. Perform responsive, accessibility and customer-flow regression testing.
11. Update PRD/TODO only after implementation and validation are complete.

## Final implementation boundary

The first release should be a small, explainable customer UI feature backed by a pure scoring utility. It should share menu normalization, food detail and cart behavior, remain independent from Loyalty Rewards, and leave checkout, order creation, payment, receipts, authentication, QR handling and staff/admin functionality untouched.
