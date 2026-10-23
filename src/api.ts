import type { InventoryItem, InventoryTransaction } from "./type";

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const response = await fetch("http://localhost:3000/inventoryItems");

  if (!response.ok) {
    throw new Error("Failed to fetch inventory items.");
  }

  return response.json();
}

export async function fetchTransactionsForItem(
  itemId: number,
): Promise<InventoryTransaction[]> {
  const response = await fetch(
    `http://localhost:3000/transactions?itemId=${itemId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch transactions for item.");
  }

  return response.json();
}

export async function createInventoryItem(
  item: Omit<InventoryItem, "id">,
): Promise<InventoryItem> {
  const response = await fetch("http://localhost:3000/inventoryItems", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error("Failed to create inventory item.");
  }

  return response.json() as Promise<InventoryItem>;
}

export async function updateInventoryItem(
  id: number,
  updates: Partial<InventoryItem>,
): Promise<InventoryItem> {
  const response = await fetch(`http://localhost:3000/inventoryItems/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update inventory item.");
  }

  return response.json() as Promise<InventoryItem>;
}

export async function createInventoryTransaction(
  transaction: InventoryTransaction,
): Promise<InventoryTransaction> {
  const response = await fetch("http://localhost:3000/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    throw new Error("Failed to create inventory transaction.");
  }

  return response.json() as Promise<InventoryTransaction>;
}

export async function fetchInventoryTransactions(): Promise<
  InventoryTransaction[]
> {
  const response = await fetch("http://localhost:3000/transactions");

  if (!response.ok) {
    throw new Error("Failed to fetch inventory transactions.");
  }

  return response.json();
}


