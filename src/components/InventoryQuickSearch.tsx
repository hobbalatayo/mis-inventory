import type { InventoryItem } from "../type";
import { useState } from "react";

export function InventoryQuickSearch({ items }: { items: InventoryItem[] }) {
  const [searchText, setSearchText] = useState("");

  const search = searchText.toLowerCase();

  const matches = items.filter(
    (item) =>
      item.propertyTag.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search),
  );

  return (
    <div>
      <input
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
      />

      <p>
        Showing {matches.length} of {items.length} items.
      </p>

      {matches.length === 0 && <p>No matching items.</p>}

      {matches.slice(0, 5).map((item) => (
        <p key={item.id}>
          {item.propertyTag}: {item.name}
        </p>
      ))}
    </div>
  );
}
