import type { OrderStatus, PaymentStatus } from "@/types/database";

/**
 * Single source of truth for order status values and their UI labels.
 * Do not introduce alternate status vocabularies elsewhere in the app.
 */
export const ORDER_STATUS = {
  RECEIVED: "received",
  VERIFIED: "verified",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const satisfies Record<string, OrderStatus>;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Received",
  verified: "Verified",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Valid forward transitions for the normalized order state model. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ["verified", "cancelled"],
  verified: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
} as const satisfies Record<string, PaymentStatus>;

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
};
