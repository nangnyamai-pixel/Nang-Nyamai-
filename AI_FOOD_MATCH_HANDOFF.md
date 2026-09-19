# AI Food Match Handoff

TABLE: `public.ai_food_matches`.

READ ACCESS: Authenticated `staff` and `admin` users through the existing `requireRole(["staff", "admin"])` helper; RLS policy `ai_food_matches_select_own_or_staff` permits staff/admin rows and registered customers' own rows. Guests have no direct SELECT policy.

FOOD RELATIONSHIP: No database foreign key exists. `top_match_food_id` is nullable `text`; resolve it against the existing `menu_items`/customer menu source and show `Unavailable menu item` if unresolved.

PREFERENCES FORMAT: JSONB containing the API-validated string array, e.g. `["spicy", "local", "budget"]`. Current UI keys are `spicy`, `noodles`, `meat`, `rice`, `local`, `vegetarian`, `budget`.

GUEST IDENTIFIER: `session_id`, populated from the HttpOnly `nangnyamai_ai_session` cookie (server-created UUID, 30-day lifetime). `customer_id` is null for guests; display `Guest` and do not expose the raw token.

QUERY UTILITY: Use `createClient()` from `src/lib/supabase/server.ts`; enforce `requireRole(["staff", "admin"])` from `src/lib/auth/roles.ts`, then select from `ai_food_matches` ordered by `created_at desc`.

MIGRATION: `supabase/migrations/20260918010000_ai_food_match_activity.sql`; applied successfully and verified in the shared Supabase SQL Editor on 18 September 2026.

RLS: `ai_food_matches_insert_own` allows registered self-inserts (`customer_id = auth.uid`, no session) or anonymous guest inserts (`customer_id is null`, session present). `ai_food_matches_select_own_or_staff` allows authenticated own-customer rows or `current_user_role()` of `staff`/`admin`. No update/delete policies.

TEST RESULT: Hosted table, all seven columns, customer FK, absent menu FK and both RLS policies verified. Guest insert is verified with one real test row (`customer_id` null, non-empty session ID, preferences `["spicy"]`). Staff/admin read remains to be verified with a staff/admin account.
