import { useState, useRef, useEffect } from "react";
import aceLogo from "./assets/ace-medical-center-bohol.png";
import "./App.css";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AssetStatus,
  InventoryItem,
  AppSection,
  ManageAssetAction,
  InventorySearchProps,
  InventoryStatusFilterProps,
} from "./type";

import {
  fetchInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  createInventoryTransaction,
  fetchInventoryTransactions,
} from "./api";

import {
  receiveSchema,
  issueSchema,
  borrowSchema,
  returnSchema,
  pullOutSchema,
  repairSchema,
  editSchema,
} from "./schema";

import type { EditFormData } from "./schema";

const statusLabels: Record<AssetStatus, string> = {
  IN_STOCK: "Available",
  ISSUED: "Issued",
  ON_LOAN: "On Loan",
  UNDER_REPAIR: "Under Repair",
  FOR_DISPOSAL: "For Disposal",
  DISPOSED: "Disposed",
};

type ItemDetailsProps = {
  item: InventoryItem;
  onClose: () => void;
  onSave: (itemId: number, data: EditFormData) => Promise<boolean>;
};

function InventorySearch({ searchText, onSearchChange }: InventorySearchProps) {
  return (
    <input
      type="text"
      aria-label="Search inventory"
      placeholder="Search property tag or item name..."
      value={searchText}
      onChange={(event) => onSearchChange(event.target.value)}
    />
  );
}

function InventoryStatusFilter({
  statusFilter,
  onStatusFilterChange,
}: InventoryStatusFilterProps) {
  return (
    <div className="status-filter">
      <label htmlFor="status-filter">Filter by status:</label>

      <select
        id="status-filter"
        value={statusFilter}
        onChange={(event) =>
          onStatusFilterChange(event.target.value as "All" | AssetStatus)
        }
      >
        <option value="All">All Statuses</option>
        <option value="IN_STOCK">Available</option>
        <option value="ISSUED">Issued</option>
        <option value="ON_LOAN">On Loan</option>
        <option value="UNDER_REPAIR">Under Repair</option>
        <option value="FOR_DISPOSAL">For Disposal</option>
        <option value="DISPOSED">Disposed</option>
      </select>
    </div>
  );
}

function ItemDetails({ item, onClose, onSave }: ItemDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    if (dialog) {
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (!dialog.open) {
        dialog.showModal();
      }
    }

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      propertyTag: item.propertyTag,
      serialNumber: item.serialNumber ?? "",
      name: item.name,
      location: item.location,
    },
  });

  const submitEditForm = async (data: EditFormData) => {
    const didSave = await onSave(item.id, data);

    if (didSave) {
      resetEdit(data);
      setIsEditing(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="item-details"
      aria-labelledby="item-details-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="item-details-header">
        <div>
          <p className="item-details-eyebrow">Inventory record</p>
          <h2 id="item-details-title">
            {isEditing ? "Edit Item" : "Item Details"}
          </h2>
        </div>
        <button
          className="item-details-icon-button"
          type="button"
          aria-label="Close item details"
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      {!isEditing && (
        <dl className="item-details-grid">
          <div className="item-detail">
            <dt>Property tag</dt>
            <dd>{item.propertyTag}</dd>
          </div>
          <div className="item-detail">
            <dt>Item name</dt>
            <dd>{item.name}</dd>
          </div>
          <div className="item-detail">
            <dt>Serial number</dt>
            <dd>{item.serialNumber || "Not recorded"}</dd>
          </div>
          <div className="item-detail">
            <dt>Location</dt>
            <dd>{item.location}</dd>
          </div>
          <div className="item-detail">
            <dt>Status</dt>
            <dd>
              <span className="item-status-pill">{statusLabels[item.status]}</span>
            </dd>
          </div>
          <div className="item-detail">
            <dt>Custodian</dt>
            <dd>{item.custodian ?? "Not assigned"}</dd>
          </div>
        </dl>
      )}

      {!isEditing && (
        <div className="item-details-actions">
          <button className="item-details-secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="item-details-primary" type="button" onClick={() => setIsEditing(true)}>
            Edit Item
          </button>
        </div>
      )}

      {isEditing && (
        <form
          className="item-edit-form"
          onSubmit={handleEditSubmit(submitEditForm)}
        >
          <label>
            Property Tag
            <input type="text" {...registerEdit("propertyTag")} />
            {editErrors.propertyTag && (
              <span className="item-edit-error" role="alert">
                {editErrors.propertyTag.message}
              </span>
            )}
          </label>
          <label>
            Serial Number
            <input type="text" {...registerEdit("serialNumber")} />
          </label>
          <label>
            Item Name
            <input type="text" {...registerEdit("name")} />
            {editErrors.name && (
              <span className="item-edit-error" role="alert">
                {editErrors.name.message}
              </span>
            )}
          </label>
          <label>
            Location
            <input type="text" {...registerEdit("location")} />
            {editErrors.location && (
              <span className="item-edit-error" role="alert">
                {editErrors.location.message}
              </span>
            )}
          </label>
          <div className="item-edit-actions">
            <button
              className="item-details-secondary"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button className="item-details-primary" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

function App() {
  const [issueError, setIssueError] = useState("");
  const [showIssueSuggestions, setShowIssueSuggestions] = useState(false);

  const [formError, setFormError] = useState("");

  const [borrowError, setBorrowError] = useState("");
  const [showBorrowSuggestions, setShowBorrowSuggestions] = useState(false);

  const [returnError, setReturnError] = useState("");

  const [pullOutError, setPullOutError] = useState("");

  const [repairError, setRepairError] = useState("");

  const [editError, setEditError] = useState("");

  const {
    register: registerReceive,
    handleSubmit: handleReceiveSubmit,
    reset: resetReceive,
    formState: { errors: receiveErrors, isSubmitting: isReceiving },
  } = useForm({
    resolver: zodResolver(receiveSchema),
    defaultValues: {
      propertyTag: "",
      serialNumber: "",
      name: "",
      location: "",
    },
  });

  const {
    register: registerIssue,
    handleSubmit: handleIssueSubmit,
    reset: resetIssue,
    formState: { errors: issueErrors },
    control: controlIssue,
    setValue: setIssueValue,
  } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      propertyTag: "",
      custodian: "",
      location: "",
    },
  });

  const issueTag = useWatch({ control: controlIssue, name: "propertyTag" });

  const {
    register: registerBorrow,
    handleSubmit: handleBorrowSubmit,
    reset: resetBorrow,
    control: controlBorrow,
    setValue: setBorrowValue,
    formState: { errors: borrowErrors },
  } = useForm({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      propertyTag: "",
      borrower: "",
      location: "",
    },
  });

  const {
    register: registerReturn,
    handleSubmit: handleReturnSubmit,
    reset: resetReturn,
    formState: { errors: returnErrors },
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      propertyTag: "",
    },
  });

  const {
    register: registerPullOut,
    handleSubmit: handlePullOutSubmit,
    reset: resetPullOut,
    formState: { errors: pullOutErrors },
  } = useForm({
    resolver: zodResolver(pullOutSchema),
    defaultValues: {
      propertyTag: "",
      repairLocation: "",
      reason: "",
    },
  });

  const {
    register: registerRepair,
    handleSubmit: handleRepairSubmit,
    reset: resetRepair,
    formState: { errors: repairErrors },
  } = useForm({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      propertyTag: "",
    },
  });

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AssetStatus>("All");

  const inventoryApiQuery = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: fetchInventoryItems,
  });

  const transactionsApiQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchInventoryTransactions,
  });

  const apiInventoryItems = inventoryApiQuery.data ?? [];
  const apiTransactions = transactionsApiQuery.data ?? [];

  const issueSearchText = (issueTag ?? "").trim().toLowerCase();

  const issueSuggestions = apiInventoryItems.filter((item) => {
    const isAvailable = item.status === "IN_STOCK";
    const matchesSearch =
      item.propertyTag.toLowerCase().includes(issueSearchText) ||
      item.name.toLowerCase().includes(issueSearchText);

    return isAvailable && matchesSearch;
  });
  const borrowTag = useWatch({ control: controlBorrow, name: "propertyTag" });
  const borrowSearchText = (borrowTag ?? "").trim().toLowerCase();

  const borrowSuggestions = apiInventoryItems.filter((item) => {
    const isAvailable = item.status === "IN_STOCK";
    const matchesSearch =
      item.propertyTag.toLowerCase().includes(borrowSearchText) ||
      item.name.toLowerCase().includes(borrowSearchText);

    return isAvailable && matchesSearch;
  });

  const queryClient = useQueryClient();

  const createInventoryMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] }),
  });

  const createTransactionMutation = useMutation({
    mutationFn: createInventoryTransaction,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<InventoryItem>;
    }) => updateInventoryItem(id, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] }),
  });

  const handleEditItem = async (
    itemId: number,
    data: EditFormData,
  ): Promise<boolean> => {
    setEditError("");

    const duplicateTag = apiInventoryItems.some(
      (item) =>
        item.propertyTag.toLowerCase() === data.propertyTag.toLowerCase() &&
        item.id !== itemId,
    );
    if (duplicateTag) {
      setEditError("Another item already uses that property tag.");
      return false;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemId,
        updates: data,
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Edited",
        date: new Date().toISOString(),
        details: `Edited ${updatedItem.name}`,
      });

      return true;
    } catch {
      setEditError(
        "Could not complete the edit. Check JSON Server. The item may have updated before the history entry failed.",
      );

      return false;
    }
  };

  const handleReceiveItem = async (data: z.infer<typeof receiveSchema>) => {
    setFormError("");

    const { propertyTag, serialNumber, name, location } = data;

    const duplicateTag = apiInventoryItems.some(
      (item) => item.propertyTag.toLowerCase() === propertyTag.toLowerCase(),
    );

    if (duplicateTag) {
      setFormError("That property tag already exists.");
      return;
    }

    const itemToCreate: Omit<InventoryItem, "id"> = {
      propertyTag,
      serialNumber,
      name,
      location,
      status: "IN_STOCK",
      condition: "UNKNOWN",
    };

    try {
      const newItem = await createInventoryMutation.mutateAsync(itemToCreate);

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: newItem.id,
        propertyTag: newItem.propertyTag,
        type: "Received",
        date: new Date().toISOString(),
        details: `Received ${newItem.name} at ${newItem.location}`,
      });

      resetReceive();
      setSelectedItemId(null);
    } catch {
      setFormError(
        "Could not save the item. Check that JSON Server is running.",
      );
    }
  };

  const handleIssueItem = async (data: z.infer<typeof issueSchema>) => {
    setIssueError("");

    const { propertyTag, custodian, location } = data;

    const itemToIssue = apiInventoryItems.find(
      (item) => item.propertyTag === propertyTag,
    );

    if (!itemToIssue) {
      setIssueError("Please select a valid inventory item.");
      return;
    }

    if (itemToIssue.status !== "IN_STOCK") {
      setIssueError("Only available items can be issued.");
      return;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemToIssue.id,
        updates: {
          status: "ISSUED",
          custodian,
          location,
        },
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Issued",
        date: new Date().toISOString(),
        details: `Issued to ${custodian} at ${location}`,
      });

      setSelectedItemId(updatedItem.id);
      resetIssue();
    } catch {
      setIssueError(
        "Could not issue the item. Check that JSON Server is running.",
      );
    }
  };

  const handleBorrowItem = async (data: z.infer<typeof borrowSchema>) => {
    setBorrowError("");

    const { propertyTag, borrower, location } = data;

    const itemToBorrow = apiInventoryItems.find(
      (item) => item.propertyTag === propertyTag,
    );

    if (!itemToBorrow) {
      setBorrowError("Please select a valid inventory item.");
      return;
    }

    if (itemToBorrow.status !== "IN_STOCK") {
      setBorrowError("Only available items can be borrowed.");
      return;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemToBorrow.id,
        updates: {
          status: "ON_LOAN",
          custodian: borrower,
          location,
        },
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Borrowed",
        date: new Date().toISOString(),
        details: `Borrowed by ${borrower} at ${location}`,
      });

      resetBorrow();
    } catch {
      setBorrowError(
        "Could not borrow the item. Check that JSON Server is running.",
      );
    }
  };

  const handlePullOutForRepair = async (
    data: z.infer<typeof pullOutSchema>,
  ) => {
    setPullOutError("");

    const { propertyTag, repairLocation, reason } = data;

    const itemToPullOut = apiInventoryItems.find(
      (item) => item.propertyTag === propertyTag,
    );

    if (!itemToPullOut) {
      setPullOutError("Please select a valid inventory item.");
      return;
    }

    const canBePulledOut =
      itemToPullOut.status === "ISSUED" ||
      itemToPullOut.status === "ON_LOAN" ||
      itemToPullOut.status === "IN_STOCK";

    if (!canBePulledOut) {
      setPullOutError("This item cannot be pulled out for repair right now.");
      return;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemToPullOut.id,
        updates: {
          status: "UNDER_REPAIR",
          location: repairLocation,
          custodian: null,
        },
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Pulled Out for Repair",
        date: new Date().toISOString(),
        details: `Pulled out from ${itemToPullOut.location} to ${repairLocation}. Reason: ${reason}`,
      });

      setSelectedItemId(updatedItem.id);
      resetPullOut();
    } catch {
      setPullOutError(
        "Could not pull out the item. Check that JSON Server is running.",
      );
    }
  };

  const handleReturnItem = async (data: z.infer<typeof returnSchema>) => {
    setReturnError("");

    const itemToReturn = apiInventoryItems.find(
      (item) => item.propertyTag === data.propertyTag,
    );

    if (!itemToReturn) {
      setReturnError("Please select a valid inventory item.");
      return;
    }

    if (itemToReturn.status !== "ISSUED" && itemToReturn.status !== "ON_LOAN") {
      setReturnError("Only issued or loaned items can be returned.");
      return;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemToReturn.id,
        updates: {
          status: "IN_STOCK",
          location: "MIS Office",
          custodian: null,
        },
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Returned",
        date: new Date().toISOString(),
        details: `${itemToReturn.custodian ?? "Previous custodian not recorded"} returned the item to ${updatedItem.location}`,
      });

      resetReturn();
    } catch {
      setReturnError(
        "Could not return the item. Check that JSON Server is running.",
      );
    }
  };

  const handleRepairItem = async (data: z.infer<typeof repairSchema>) => {
    setRepairError("");

    const { propertyTag } = data;

    const itemToRepair = apiInventoryItems.find(
      (item) => item.propertyTag === propertyTag,
    );

    if (!itemToRepair) {
      setRepairError("Please select a valid inventory item.");
      return;
    }

    if (itemToRepair.status !== "UNDER_REPAIR") {
      setRepairError("Only items under repair can be completed.");
      return;
    }

    try {
      const updatedItem = await updateInventoryMutation.mutateAsync({
        id: itemToRepair.id,
        updates: {
          status: "IN_STOCK",
          location: "MIS Office",
          custodian: null,
        },
      });

      await createTransactionMutation.mutateAsync({
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Repair Completed",
        date: new Date().toISOString(),
        details: `Repair completed. Returned to ${updatedItem.location}`,
      });

      setSelectedItemId(updatedItem.id);
      resetRepair();
    } catch {
      setRepairError(
        "Could not complete the repair. Check that JSON Server is running.",
      );
    }
  };

  const filteredItems = apiInventoryItems.filter((item) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      item.propertyTag.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalItems = apiInventoryItems.length;
  const visibleItems = filteredItems.length;

  const inStockCount = apiInventoryItems.filter(
    (item) => item.status === "IN_STOCK",
  ).length;

  const issuedCount = apiInventoryItems.filter(
    (item) => item.status === "ISSUED",
  ).length;

  const onLoanCount = apiInventoryItems.filter(
    (item) => item.status === "ON_LOAN",
  ).length;

  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const selectedItem =
    apiInventoryItems.find((item) => item.id === selectedItemId) ?? null;
  const location = useLocation();
  const navigate = useNavigate();

  const sectionByPath: Record<string, AppSection> = {
    "/": "dashboard",
    "/inventory": "inventory",
    "/transactions": "transactions",
    "/actions": "actions",
  };

  const activeSection = sectionByPath[location.pathname] ?? "dashboard";

  const [activeAction, setActiveAction] =
    useState<ManageAssetAction>("receive");

  const chooseAssetAction = (action: ManageAssetAction) => {
    setActiveAction(action);
    navigate("/actions");
  };

  return (
    <>
      <section id="center">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <strong>ACE Medical Center Bohol</strong>
            <span>MIS Inventory</span>
          </div>

          <nav aria-label="Main Navigation">
            <p className="sidebar-section-title">Inventory Monitoring</p>
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/inventory"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Inventory
            </NavLink>
            <p className="sidebar-section-title">Transactions</p>
            <NavLink
              to="/transactions"
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Transaction History
            </NavLink>
          </nav>

          <nav className="sidebar-actions-nav" aria-label="Inventory actions">
            <p className="sidebar-section-title">Inventory Actions</p>
            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "receive"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("receive")}
            >
              Receive Item
            </button>

            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "issue"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("issue")}
            >
              Issue Item
            </button>

            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "borrow"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("borrow")}
            >
              Borrow Item
            </button>

            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "return"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("return")}
            >
              Return Item
            </button>

            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "pullOut"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("pullOut")}
            >
              Pull out for Repair
            </button>

            <button
              type="button"
              className={
                activeSection === "actions" && activeAction === "repair"
                  ? "active"
                  : ""
              }
              onClick={() => chooseAssetAction("repair")}
            >
              Complete Repair
            </button>
          </nav>
        </aside>
        <div className="page-main">
          <header className="dashboard-header">
            <img src={aceLogo} alt="ACE Medical Center Bohol logo" />
            <div>
              <h1>ACE Medical Center Bohol</h1>
              <p>MIS Department</p>
            </div>
          </header>
          <div className="dashboard-content">
            {activeSection !== "actions" && (
              <main className="inventory-app" id="overview">
                {activeSection === "dashboard" && (
                  <>
                    <div className="dashboard-title-row">
                      <div>
                        <p className="eyebrow">ASSET MANAGEMENT</p>
                        <h1>Inventory Dashboard</h1>
                        <p className="dashboard-subtitle">
                          Monitor hospital equipment, assignments, and movement.
                        </p>
                      </div>
                      <span className="record-count">
                        {totalItems} total assets
                      </span>
                    </div>

                    <section
                      className="summary-grid"
                      aria-label="Inventory summary"
                    >
                      <article className="summary-card summary-total">
                        <span>Total assets</span>
                        <strong>{totalItems}</strong>
                        <small>All recorded equipment</small>
                      </article>
                      <article className="summary-card summary-stock">
                        <span>Available</span>
                        <strong>{inStockCount}</strong>
                        <small>Ready to assign or loan</small>
                      </article>
                      <article className="summary-card summary-issued">
                        <span>Issued</span>
                        <strong>{issuedCount}</strong>
                        <small>Assigned to departments</small>
                      </article>
                      <article className="summary-card summary-loan">
                        <span>On loan</span>
                        <strong>{onLoanCount}</strong>
                        <small>Temporarily borrowed</small>
                      </article>
                    </section>
                  </>
                )}
                {activeSection === "inventory" && (
                  <section className="dashboard-panel" id="inventory">
                    <div className="panel-heading">
                      <div>
                        <h2>Inventory Records</h2>
                        <p>
                          Showing {visibleItems} of {totalItems} assets
                        </p>
                      </div>
                    </div>

                    <div className="inventory-toolbar">
                      <InventorySearch
                        searchText={searchText}
                        onSearchChange={setSearchText}
                      />

                      <InventoryStatusFilter
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                      />
                    </div>

                    {inventoryApiQuery.isLoading && <p>Loading inventory...</p>}
                    {inventoryApiQuery.isError && (
                      <p role="alert">
                        Could not load inventory. Check if JSON Server is
                        running.
                      </p>
                    )}

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Property Tag</th>
                            <th>Item Name</th>
                            <th>Serial Number</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Custodian</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                              <tr
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className="inventory-row"
                              >
                                <td>{item.propertyTag}</td>
                                <td>{item.name}</td>
                                <td>{item.serialNumber}</td>
                                <td>{item.location}</td>
                                <td>
                                  <span
                                    className={`status-badge status-${item.status.toLowerCase()}`}
                                  >
                                    {statusLabels[item.status]}
                                  </span>
                                </td>
                                <td>{item.custodian ?? "Not assigned"}</td>
                              </tr>
                            ))
                          ) : !inventoryApiQuery.isLoading &&
                            !inventoryApiQuery.isError ? (
                            <tr>
                              <td colSpan={6}>No matching items found.</td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
                {activeSection === "transactions" && (
                  <section
                    className="dashboard-panel transaction-history"
                    id="transactions"
                  >
                    <h2>Transaction History</h2>
                    {transactionsApiQuery.isLoading && (
                      <p>Loading transactions...</p>
                    )}
                    {transactionsApiQuery.isError && (
                      <p role="alert">
                        Could not load transaction history. Check if JSON Server
                        is running.
                        <button
                          type="button"
                          onClick={() => transactionsApiQuery.refetch()}
                          disabled={transactionsApiQuery.isFetching}
                        >
                          {transactionsApiQuery.isFetching
                            ? "Retrying..."
                            : "Retry"}
                        </button>
                      </p>
                    )}

                    {transactionsApiQuery.isFetching &&
                      transactionsApiQuery.isSuccess && (
                        <p>Refreshing transactions...</p>
                      )}

                    {!transactionsApiQuery.isLoading &&
                    transactionsApiQuery.isSuccess &&
                    apiTransactions.length === 0 ? (
                      <p>No transactions recorded yet.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Property Tag</th>
                            <th>Transaction</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...apiTransactions]
                            .sort(
                              (a, b) =>
                                new Date(b.date).getTime() -
                                new Date(a.date).getTime(),
                            )
                            .map((transaction) => (
                              <tr key={transaction.id}>
                                <td>
                                  {new Date(transaction.date).toLocaleString(
                                    "en-PH",
                                    {
                                      timeZone: "Asia/Manila",
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    },
                                  )}
                                </td>
                                <td>{transaction.propertyTag}</td>
                                <td>{transaction.type}</td>
                                <td>{transaction.details}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                )}

                {activeSection === "inventory" && selectedItem && (
                  <>
                    <ItemDetails
                      key={selectedItem.id}
                      item={selectedItem}
                      onClose={() => setSelectedItemId(null)}
                      onSave={handleEditItem}
                    />
                    {editError && <p role="alert">{editError}</p>}
                  </>
                )}
              </main>
            )}

            {activeSection === "actions" && (
              <section className="action-area" id="actions">
                <div className="section-heading">
                  <p className="eyebrow">INVENTORY OPERATIONS</p>
                  <h2>Manage Assets</h2>
                  <p>
                    Receive equipment, issue it to staff, or record a loan or
                    return.
                  </p>
                </div>

                <div className="forms-grid">
                  {activeAction === "receive" && (
                    <section className="receive-form">
                      <h2>Receive New Item</h2>

                      <form onSubmit={handleReceiveSubmit(handleReceiveItem)}>
                        <label htmlFor="receive-tag">Property Tag</label>
                        <input
                          id="receive-tag"
                          {...registerReceive("propertyTag")}
                          placeholder="e.g. DEMO-IT-005"
                        />
                        {receiveErrors.propertyTag && (
                          <p role="alert">
                            {receiveErrors.propertyTag.message}
                          </p>
                        )}

                        <label htmlFor="receive-serial">Serial Number</label>
                        <input
                          id="receive-serial"
                          {...registerReceive("serialNumber")}
                          placeholder="Enter serial number"
                        />
                        {receiveErrors.serialNumber && (
                          <p role="alert">
                            {receiveErrors.serialNumber.message}
                          </p>
                        )}
                        <label htmlFor="receive-name">Item Name</label>
                        <input
                          id="receive-name"
                          {...registerReceive("name")}
                          placeholder="e.g. USB Keyboard"
                        />
                        {receiveErrors.name && (
                          <p role="alert">{receiveErrors.name.message}</p>
                        )}
                        <label htmlFor="receive-location">
                          Initial Location
                        </label>
                        <input
                          id="receive-location"
                          {...registerReceive("location")}
                          placeholder="e.g. MIS Office"
                        />
                        {receiveErrors.location && (
                          <p role="alert">{receiveErrors.location.message}</p>
                        )}

                        {formError && <p role="alert">{formError}</p>}
                        <button type="submit" disabled={isReceiving}>
                          {isReceiving ? "Saving..." : "Receive Item"}
                        </button>
                      </form>
                    </section>
                  )}

                  {activeAction === "issue" && (
                    <section className="issue-form">
                      <h2>Issue / Deploy Item</h2>

                      <form onSubmit={handleIssueSubmit(handleIssueItem)}>
                        <label htmlFor="issue-item">Available Item</label>
                        <div className="issue-item-picker">
                          <input
                            id="issue-item"
                            autoComplete="off"
                            {...registerIssue("propertyTag", {
                              onBlur: () => setShowIssueSuggestions(false),
                              onChange: () => setShowIssueSuggestions(true),
                            })}
                            placeholder="Type a property tag or item name..."
                            onFocus={() => setShowIssueSuggestions(true)}
                            aria-expanded={showIssueSuggestions}
                            aria-controls="issue-item-suggestions"
                          />

                          {showIssueSuggestions &&
                            issueSearchText.length > 0 && (
                              <ul
                                id="issue-item-suggestions"
                                className="issue-item-suggestions"
                                role="listbox"
                              >
                                {issueSuggestions.length > 0 ? (
                                  issueSuggestions.map((item) => (
                                    <li
                                      key={item.id}
                                      role="option"
                                      aria-selected="false"
                                    >
                                      <button
                                        type="button"
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        onClick={() => {
                                          setIssueValue(
                                            "propertyTag",
                                            item.propertyTag,
                                            {
                                              shouldValidate: true,
                                            },
                                          );
                                          setShowIssueSuggestions(false);
                                        }}
                                      >
                                        <strong>{item.propertyTag}</strong>
                                        <span>{item.name}</span>
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li className="issue-no-suggestions">
                                    No available items found.
                                  </li>
                                )}
                              </ul>
                            )}
                        </div>

                        {issueErrors.propertyTag && (
                          <p role="alert">{issueErrors.propertyTag.message}</p>
                        )}

                        <label htmlFor="issue-custodian">
                          Recipient / Custodian
                        </label>
                        <input
                          id="issue-custodian"
                          {...registerIssue("custodian")}
                          placeholder="Enter demo recipient"
                        />
                        {issueErrors.custodian && (
                          <p role="alert">{issueErrors.custodian.message}</p>
                        )}

                        <label htmlFor="issue-location">
                          Destination / Location
                        </label>
                        <input
                          id="issue-location"
                          {...registerIssue("location")}
                          placeholder="e.g. Admin Department"
                        />
                        {issueErrors.location && (
                          <p role="alert">{issueErrors.location.message}</p>
                        )}

                        {issueError && <p role="alert">{issueError}</p>}

                        <button type="submit">Issue Item</button>
                      </form>
                    </section>
                  )}

                  {activeAction === "borrow" && (
                    <section className="borrow-item">
                      <h2>Borrow Item</h2>
                      <form onSubmit={handleBorrowSubmit(handleBorrowItem)}>
                        <label htmlFor="borrow-item">Item to borrow</label>
                        <div className="issue-item-picker">
                          <input
                            id="borrow-item"
                            autoComplete="off"
                            {...registerBorrow("propertyTag", {
                              onChange: () => setShowBorrowSuggestions(true),
                              onBlur: () => setShowBorrowSuggestions(false),
                            })}
                            placeholder="Type a property tag or item name..."
                            onFocus={() => setShowBorrowSuggestions(true)}
                          />
                          {showBorrowSuggestions &&
                            borrowSearchText.length > 0 && (
                              <ul
                                id="borrow-item-suggestions"
                                className="issue-item-suggestions"
                                role="listbox"
                              >
                                {borrowSuggestions.length > 0 ? (
                                  borrowSuggestions.map((item) => (
                                    <li
                                      key={item.id}
                                      role="option"
                                      aria-selected="false"
                                    >
                                      <button
                                        type="button"
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        onClick={() => {
                                          setBorrowValue(
                                            "propertyTag",
                                            item.propertyTag,
                                            {
                                              shouldValidate: true,
                                            },
                                          );
                                          setShowBorrowSuggestions(false);
                                        }}
                                      >
                                        <strong>{item.propertyTag}</strong>
                                        <span>{item.name}</span>
                                      </button>
                                    </li>
                                  ))
                                ) : (
                                  <li className="issue-no-suggestions">
                                    No available items found.
                                  </li>
                                )}
                              </ul>
                            )}
                        </div>
                        {borrowErrors.propertyTag && (
                          <p role="alert">{borrowErrors.propertyTag.message}</p>
                        )}

                        <label htmlFor="borrow-custodian">
                          Recipient / Custodian
                        </label>
                        <input
                          id="borrow-custodian"
                          {...registerBorrow("borrower")}
                          placeholder="Enter demo recipient"
                        />
                        {borrowErrors.borrower && (
                          <p role="alert">{borrowErrors.borrower.message}</p>
                        )}

                        <label htmlFor="borrow-location">
                          Destination / Location
                        </label>
                        <input
                          id="borrow-location"
                          {...registerBorrow("location")}
                          placeholder="e.g. Admin Department"
                        />
                        {borrowErrors.location && (
                          <p role="alert">{borrowErrors.location.message}</p>
                        )}

                        {borrowError && <p role="alert">{borrowError}</p>}
                        <button type="submit">Borrow Item</button>
                      </form>
                    </section>
                  )}

                  {/* Only issued or loaned items are available in this return form. */}
                  {activeAction === "return" && (
                    <section className="return-item">
                      <h2>Return Item</h2>

                      <form onSubmit={handleReturnSubmit(handleReturnItem)}>
                        <label htmlFor="return-item">Item to return</label>
                        <select
                          id="return-item"
                          {...registerReturn("propertyTag")}
                        >
                          <option value="">Select an issued item</option>
                          {apiInventoryItems
                            .filter(
                              (item) =>
                                item.status === "ISSUED" ||
                                item.status === "ON_LOAN",
                            )
                            .map((item) => (
                              <option key={item.id} value={item.propertyTag}>
                                {item.propertyTag} — {item.name}
                              </option>
                            ))}
                        </select>
                        {returnErrors.propertyTag && (
                          <p role="alert">{returnErrors.propertyTag.message}</p>
                        )}

                        {returnError && <p role="alert">{returnError}</p>}

                        <button type="submit">Return Item</button>
                      </form>
                    </section>
                  )}

                  {activeAction === "pullOut" && (
                    <section className="pullout-item">
                      <h2>Pull Out Item</h2>
                      <form
                        onSubmit={handlePullOutSubmit(handlePullOutForRepair)}
                      >
                        <label htmlFor="pullout-item">Item to pull out</label>
                        <select
                          id="pullout-item"
                          {...registerPullOut("propertyTag")}
                        >
                          <option value="">Select an item to pull out</option>
                          {apiInventoryItems
                            .filter(
                              (item) =>
                                item.status === "ON_LOAN" ||
                                item.status === "ISSUED" ||
                                item.status === "IN_STOCK",
                            )
                            .map((item) => (
                              <option key={item.id} value={item.propertyTag}>
                                {item.propertyTag} — {item.name}
                              </option>
                            ))}
                        </select>
                        {pullOutErrors.propertyTag && (
                          <p role="alert">
                            {pullOutErrors.propertyTag.message}
                          </p>
                        )}

                        <label htmlFor="repair-location">Repair Location</label>
                        <input
                          id="repair-location"
                          {...registerPullOut("repairLocation")}
                          placeholder="Enter repair location"
                        />
                        {pullOutErrors.repairLocation && (
                          <p role="alert">
                            {pullOutErrors.repairLocation.message}
                          </p>
                        )}

                        <label htmlFor="pullout-reason">
                          Reason for repair
                        </label>
                        <input
                          id="pullout-reason"
                          {...registerPullOut("reason")}
                          placeholder="e.g. Printer not powering on"
                        />
                        {pullOutErrors.reason && (
                          <p role="alert">{pullOutErrors.reason.message}</p>
                        )}

                        {pullOutError && <p role="alert">{pullOutError}</p>}
                        <button type="submit">Pull out Item</button>
                      </form>
                    </section>
                  )}

                  {activeAction === "repair" && (
                    <section className="repair-item">
                      <h2>Repair Item</h2>
                      <form onSubmit={handleRepairSubmit(handleRepairItem)}>
                        <label htmlFor="repair-item">Item to repair</label>
                        <select
                          id="repair-item"
                          {...registerRepair("propertyTag")}
                        >
                          <option value="">
                            Select an item with completed repair
                          </option>
                          {apiInventoryItems
                            .filter((item) => item.status === "UNDER_REPAIR")
                            .map((item) => (
                              <option key={item.id} value={item.propertyTag}>
                                {item.propertyTag} — {item.name}
                              </option>
                            ))}
                        </select>
                        {repairErrors.propertyTag && (
                          <p role="alert">{repairErrors.propertyTag.message}</p>
                        )}

                        {repairError && <p role="alert">{repairError}</p>}
                        <button type="submit">Done Repair Item</button>
                      </form>
                    </section>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
