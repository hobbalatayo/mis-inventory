import type { InventoryItem } from "../type";
import { useState, useEffect } from "react";

export function InventoryLoadCheck() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("http://localhost:3000/inventoryItems");

        if (!response.ok) {
          throw new Error("Server answered with a problem.");
        }

        const data: InventoryItem[] = await response.json();
        setItems(data);
      } catch {
        setError("Could not load inventory.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  return <p>Inventory count: {items.length}</p>;
}
