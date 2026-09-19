# AI Food Match Recording Report

## 1. Database changes

Added migration `supabase/migrations/20260918010000_ai_food_match_activity.sql`.

It creates `public.ai_food_matches` with:

- `id`;
- nullable `customer_id`;
- nullable `session_id`;
- `preferences` JSONB;
- `top_match_food_id` text (supports both live UUIDs and JSON fallback IDs);
- `match_percentage`;
- `created_at`.

The identity constraint requires either a registered customer or a guest session.

## 2. RLS changes

- RLS enabled on `ai_food_matches`.
- Authenticated users may insert only their own `customer_id` with no session ID.
- Anonymous users may insert only anonymous records with a server-created session ID.
- Authenticated customers can select only their own records.
- Staff/admin selection follows `public.current_user_role()`.
- Guests have no select policy, preventing cross-guest activity reads.

No existing table policies were changed.

## 3. Files modified

- `src/components/customer/food-match.tsx` — starts non-blocking activity recording after matching.
- `src/types/database.ts` — adds typed table definitions for the new migration.

## 4. Files created

- `src/app/api/ai-food-match/route.ts`
- `supabase/migrations/20260918010000_ai_food_match_activity.sql`
- `AI_FOOD_MATCH_RECORDING_REPORT.md`

## 5. Customer flow changes

After `Find matches` calculates the existing results, the browser sends a fire-and-forget request to `/api/ai-food-match`. The UI renders results immediately and Add to Cart remains independent. The route obtains the authenticated user server-side or creates an HttpOnly `nangnyamai_ai_session` cookie for guests. Insert failure is logged safely and does not block matching, details or cart actions.

No checkout, order, payment, receipt, tracking, staff or admin behavior was changed.

## 6. Tests performed

- Static inspection of existing menu, auth, schema and RLS patterns completed.
- TypeScript/lint commands started after implementation; final process output should be confirmed before merge.
- Database migration has not been applied to hosted Supabase by this task.
- Manual registered/guest request verification remains required after applying the migration.

## 7. Known issues

- The migration must be applied to the target Supabase project before inserts can succeed.
- Guest session activity is insert-only; guest history is intentionally not exposed.
- `top_match_food_id` is text because the JSON fallback uses synthetic IDs; live menu UUIDs remain supported.
- Existing `FoodMatch` labels still contain local bilingual presentation logic; this task did not refactor the broader translation system.
