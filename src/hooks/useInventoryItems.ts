import { useState, useEffect } from "react";
import { type InventoryItem } from "../type";

export function useInventoryItems() {
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
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { items, loading, error };
}
