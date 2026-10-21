export type AssetStatus =
  | "IN_STOCK"
  | "ISSUED"
  | "ON_LOAN"
  | "UNDER_REPAIR"
  | "FOR_DISPOSAL"
  | "DISPOSED";

export type InventoryItem = {
  id: number;
  propertyTag: string;
  serialNumber: string | null;
  name: string;
  location: string;
  status: AssetStatus;
  condition: AssetCondition;
  custodian?: string | null;

  category?: string | null;
  assetGroup?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  supplier?: string | null;
  floor?: string | null;
  area?: string | null;
  department?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | null;
  araNo?: string | null;
  remarks?: string | null;
  originalTag?: string | null;
};

export type AssetCondition =
  | "BRAND_NEW"
  | "SERVICEABLE"
  | "WITH_ISSUES"
  | "DEFECTIVE"
  | "UNKNOWN";

export type InventoryTransaction = {
  id: string;
  itemId: number;
  propertyTag: string;
  type:
    | "Received"
    | "Issued"
    | "Returned"
    | "Transferred"
    | "Borrowed"
    | "Pulled Out for Repair"
    | "Repair Completed"
    | "Edited";
  date: string;
  details: string;
};

export type AppSection = "dashboard" | "inventory" | "transactions" | "actions";

export type ManageAssetAction =
  | "receive"
  | "issue"
  | "borrow"
  | "return"
  | "pullOut"
  | "repair";

export type InventorySearchProps = {
  searchText: string;
  onSearchChange: (value: string) => void;
};

export type InventoryStatusFilterProps = {
  statusFilter: "All" | AssetStatus;
  onStatusFilterChange: (value: "All" | AssetStatus) => void;
};