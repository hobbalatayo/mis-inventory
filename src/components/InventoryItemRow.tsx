import type { InventoryItem } from "../type";

export function InventoryItemRow({ item }: { item: InventoryItem }) {
  return (
    <p>
      {item.propertyTag}: {item.name}: {item.location}: {item.status}:
    </p>
  );
}
