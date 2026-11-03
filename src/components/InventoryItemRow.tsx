import type { InventoryItem } from "../type";

export function InventoryItemRow({
  item,
  statusLabel,
  onSelect,
}: {
  item: InventoryItem;
  statusLabel: string;
  onSelect: () => void;
}) {
  return (
    <p onClick={onSelect}>
      {item.propertyTag} {item.name} {item.location} {statusLabel}
    </p>
  );
}
