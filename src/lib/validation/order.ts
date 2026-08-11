import { z } from "zod";

/**
 * Validates the shape of an incoming order submission before it touches
 * the database. Used server-side (Server Action / Route Handler) — never
 * trust client-submitted totals or prices; those must be recalculated
 * server-side from the current menu_items data.
 */
export const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  selectedOptions: z.record(z.string(), z.unknown()).optional(),
  note: z.string().max(280).optional(),
});

export const submitOrderInputSchema = z.object({
  tableToken: z.string().min(1),
  items: z.array(orderItemInputSchema).min(1, "Cart cannot be empty"),
  specialNote: z.string().max(280).optional(),
});

export type SubmitOrderInput = z.infer<typeof submitOrderInputSchema>;
