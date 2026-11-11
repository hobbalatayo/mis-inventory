import { useInventoryItems } from "../hooks/useInventoryItems";

export function InventoryLoadCheck() {
  const { items, loading, error } = useInventoryItems();

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p>{error}</p>;

  return (
    <ul>
      {items.slice(0, 10).map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
