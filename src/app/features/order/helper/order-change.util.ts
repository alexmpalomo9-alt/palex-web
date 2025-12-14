import { OrderItem } from "../models/order.model";

export function hasOrderChanges(
  currentItems: OrderItem[],
  originalItems: OrderItem[],
  currentNotes: string,
  originalNotes: string
): boolean {
  if (currentNotes !== originalNotes) return true;
  if (currentItems.length !== originalItems.length) return true;

  return currentItems.some((c, i) => {
    const o = originalItems[i];
    return (
      c.qty !== o.qty ||
      c.price !== o.price ||
      c.notes !== o.notes ||
      c.productId !== o.productId
    );
  });
}
