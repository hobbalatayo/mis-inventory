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
    <tr onClick={onSelect} className="inventory-row">
      <td>{item.propertyTag}</td>
      <td>{item.name}</td>
      <td>{item.serialNumber}</td>
      <td>{item.location}</td>
      <td>
        <span className={`status-badge status-${item.status.toLowerCase()}`}>
          {statusLabel}
        </span>
      </td>
      <td>{item.custodian ?? "Not assigned"}</td>
    </tr>
  );
}
