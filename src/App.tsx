import { useState, type FormEvent } from "react";
import aceLogo from "./assets/ace-medical-center-bohol.png";
import "./App.css";

type AssetStatus =
  | "IN_STOCK"
  | "ISSUED"
  | "ON_LOAN"
  | "UNDER_REPAIR"
  | "FOR_DISPOSAL"
  | "DISPOSED";

type InventoryItem = {
  id: number;
  propertyTag: string;
  serialNumber: string;
  name: string;
  location: string;
  status: AssetStatus;
  condition: AssetCondition;
  custodian?: string;
};

type InventoryTransaction = {
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
    | "Repair Completed";
  date: string;
  details: string;
};

type AssetCondition =
  | "BRAND_NEW"
  | "SERVICEABLE"
  | "WITH_ISSUES"
  | "DEFECTIVE"
  | "UNKNOWN";

const statusLabels: Record<AssetStatus, string> = {
  IN_STOCK: "Available",
  ISSUED: "Issued",
  ON_LOAN: "On Loan",
  UNDER_REPAIR: "Under Repair",
  FOR_DISPOSAL: "For Disposal",
  DISPOSED: "Disposed",
};

function App() {
  const [receiveForm, setReceiveForm] = useState({
    propertyTag: "",
    serialNumber: "",
    name: "",
    location: "",
  });

  const [issueForm, setIssueForm] = useState({
    propertyTag: "",
    custodian: "",
    location: "",
  });

  const [returnForm, setReturnForm] = useState({
    propertyTag: "",
  });

  const [borrowForm, setBorrowForm] = useState({
    propertyTag: "",
    borrower: "",
    location: "",
  });

  const [pullOutForm, setPullOutForm] = useState({
    propertyTag: "",
    repairLocation: "",
    reason: "",
  });

  const [repairForm, setRepairForm] = useState({
    propertyTag: "",
  });

  const [issueError, setIssueError] = useState("");

  const [formError, setFormError] = useState("");

  const [borrowError, setBorrowError] = useState("");

  const [pullOutError, setPullOutError] = useState("");

  const [repairError, setRepairError] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      propertyTag: "DEMO-IT-001",
      serialNumber: "SN-DEMO-001",
      name: "Desktop Computer",
      location: "MIS Office",
      status: "IN_STOCK",
      condition: "BRAND_NEW",
    },
    {
      id: 2,
      propertyTag: "DEMO-IT-002",
      serialNumber: "SN-DEMO-002",
      name: "Laptop",
      location: "Admin Department",
      status: "ISSUED",
      condition: "SERVICEABLE",
    },
    {
      id: 3,
      propertyTag: "DEMO-IT-003",
      serialNumber: "SN-DEMO-003",
      name: "Network Printer",
      location: "MIS Office",
      status: "IN_STOCK",
      condition: "BRAND_NEW",
    },
  ]);

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AssetStatus>("All");

  const handleReceiveItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const propertyTag = receiveForm.propertyTag.trim();
    const serialNumber = receiveForm.serialNumber.trim();
    const name = receiveForm.name.trim();
    const location = receiveForm.location.trim();
    if (!propertyTag || !serialNumber || !name || !location) {
      setFormError("Please complete all fields.");
      return;
    }

    const duplicateTag = inventoryItems.some(
      (item) => item.propertyTag.toLowerCase() === propertyTag.toLowerCase(),
    );

    if (duplicateTag) {
      setFormError("That property tag already exists.");
      return;
    }

    const newItem: InventoryItem = {
      id: Math.max(0, ...inventoryItems.map((item) => item.id)) + 1,
      propertyTag,
      serialNumber,
      name,
      location,
      status: "IN_STOCK",
      condition: "UNKNOWN",
    };

    setInventoryItems((currentItems) => [...currentItems, newItem]);

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: newItem.id,
        propertyTag: newItem.propertyTag,
        type: "Received",
        date: new Date().toISOString(),
        details: `Received ${newItem.name} at ${newItem.location}`,
      },
    ]);

    setReceiveForm({
      propertyTag: "",
      serialNumber: "",
      name: "",
      location: "",
    });

    setSelectedItemId(null);
    setFormError("");
  };

  const handleIssueItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIssueError("");

    const propertyTag = issueForm.propertyTag;
    const custodian = issueForm.custodian.trim();
    const location = issueForm.location.trim();

    if (!propertyTag || !custodian || !location) {
      setIssueError("Please complete all issuance fields.");
      return;
    }

    const itemToIssue = inventoryItems.find(
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

    const updatedItem: InventoryItem = {
      ...itemToIssue,
      status: "ISSUED",
      custodian,
      location,
    };

    setInventoryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Issued",
        date: new Date().toISOString(),
        details: `Issued to ${custodian} at ${location}`,
      },
    ]);

    setSelectedItemId(updatedItem.id);

    setIssueForm({
      propertyTag: "",
      custodian: "",
      location: "",
    });
  };

  const handleBorrowItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBorrowError("");

    const propertyTag = borrowForm.propertyTag;
    const borrower = borrowForm.borrower.trim();
    const location = borrowForm.location.trim();

    if (!propertyTag || !borrower || !location) {
      setBorrowError("Please complete all borrowing fields.");
      return;
    }

    const itemToBorrow = inventoryItems.find(
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
    const updatedItem: InventoryItem = {
      ...itemToBorrow,
      status: "ON_LOAN",
      custodian: borrower,
      location,
    };
    setInventoryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Borrowed",
        date: new Date().toISOString(),
        details: `Borrowed by ${borrower} at ${location}`,
      },
    ]);

    setBorrowForm({
      propertyTag: "",
      borrower: "",
      location: "",
    });
  };

  const handlePullOutForRepair = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPullOutError("");

    const propertyTag = pullOutForm.propertyTag;
    const repairLocation = pullOutForm.repairLocation.trim();
    const reason = pullOutForm.reason.trim();

    if (!propertyTag || !repairLocation || !reason) {
      setPullOutError("Please complete all repair fields.");
      return;
    }

    const itemToPullOut = inventoryItems.find(
      (item) => item.propertyTag === pullOutForm.propertyTag,
    );

    if (!itemToPullOut) {
      setPullOutError("Please select a valid inventory item.");
      return;
    }

    const canBePulledOut =
      itemToPullOut.status === "ISSUED" || itemToPullOut.status === "ON_LOAN" || itemToPullOut.status === "IN_STOCK";

    if (!canBePulledOut) {
      setPullOutError("This item cannot be pulled out for repair right now.");
      return;
    }

    const updatedItem: InventoryItem = {
      ...itemToPullOut,
      status: "UNDER_REPAIR",
      location: repairLocation,
    };
    delete updatedItem.custodian;

    setInventoryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Pulled Out for Repair",
        date: new Date().toISOString(),
        details: `Pulled out from ${itemToPullOut.location} to ${repairLocation}. Reason: ${reason}`,
      },
    ]);

    setSelectedItemId(updatedItem.id);

    setPullOutForm({
      propertyTag: "",
      repairLocation: "",
      reason: "",
    });
  };

  // Return an issued or loaned item to the MIS Office and record the return.
  const handleReturnItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const itemToReturn = inventoryItems.find(
      (item) => item.propertyTag === returnForm.propertyTag,
    );

    // Stop if the selection is missing or the item is no longer out.
    if (!itemToReturn) {
      return;
    }
    if (itemToReturn.status !== "ISSUED" && itemToReturn.status !== "ON_LOAN") {
      return;
    }
    // Create the item's new state after it has been returned.
    const updatedItem: InventoryItem = {
      ...itemToReturn,
      status: "IN_STOCK",
      location: "MIS Office",
    };
    delete updatedItem.custodian;

    // Replace this item in the list while keeping every other item unchanged.
    setInventoryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    // Keep the return event in transaction history as a separate record.
    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Returned",
        date: new Date().toISOString(),
        details: `Returned to ${updatedItem.location}`,
      },
    ]);
    // Clear the controlled select after a successful return.
    setReturnForm({
      propertyTag: "",
    });
  };

  const handleRepairItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRepairError("");

    const propertyTag = repairForm.propertyTag;

    if (!propertyTag) {
      setRepairError("Please select an item to complete repair.");
      return;
    }

    const itemToRepair = inventoryItems.find(
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

    const updatedItem: InventoryItem = {
      ...itemToRepair,
      status: "IN_STOCK",
      location: "MIS Office",
    };
    delete updatedItem.custodian;

    setInventoryItems((currentItems) =>
      currentItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item,
      ),
    );

    setTransactions((currentTransactions) => [
      ...currentTransactions,
      {
        id: crypto.randomUUID(),
        itemId: updatedItem.id,
        propertyTag: updatedItem.propertyTag,
        type: "Repair Completed",
        date: new Date().toISOString(),
        details: `Repair completed. Returned to ${updatedItem.location}`,
      },
    ]);

    setSelectedItemId(updatedItem.id);

    setRepairForm({
      propertyTag: "",
    });
  };

  const filteredItems = inventoryItems.filter((item) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      item.propertyTag.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const totalItems = inventoryItems.length;
  const visibleItems = filteredItems.length;
  const inStockCount = inventoryItems.filter(
    (item) => item.status === "IN_STOCK",
  ).length;
  const issuedCount = inventoryItems.filter(
    (item) => item.status === "ISSUED",
  ).length;
  const onLoanCount = inventoryItems.filter(
    (item) => item.status === "ON_LOAN",
  ).length;
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const selectedItem =
    inventoryItems.find((item) => item.id === selectedItemId) ?? null;

  const [activeSection, setActiveSection] = useState("inventory");

  return (
    <>
      <section id="center">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <strong>ACE Medical Center Bohol</strong>
            <span>MIS Inventory</span>
          </div>
          <nav aria-label="Main Navigation">
            <a
              href="#inventory"
              className={activeSection === "inventory" ? "active" : ""}
              onClick={() => setActiveSection("inventory")}
            >
              Inventory
            </a>
            <a
              href="#transactions"
              className={activeSection === "transactions" ? "active" : ""}
              onClick={() => setActiveSection("transactions")}
            >
              Transactions
            </a>

            <a
              href="#actions"
              className={activeSection === "actions" ? "active" : ""}
              onClick={() => setActiveSection("actions")}
            >
              Manage Assets
            </a>
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
            <main className="inventory-app" id="overview">
              <div className="dashboard-title-row">
                <div>
                  <p className="eyebrow">ASSET MANAGEMENT</p>
                  <h1>Inventory Dashboard</h1>
                  <p className="dashboard-subtitle">
                    Monitor hospital equipment, assignments, and movement.
                  </p>
                </div>
                <span className="record-count">{totalItems} total assets</span>
              </div>

              <section className="summary-grid" aria-label="Inventory summary">
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
                  <input
                    type="text"
                    aria-label="Search inventory"
                    placeholder="Search property tag or item name..."
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                  />

                  <div className="status-filter">
                    <label htmlFor="status-filter">Filter by status:</label>
                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value as "All" | AssetStatus,
                        )
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
                </div>
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
                      ) : (
                        <tr>
                          <td colSpan={6}>No matching items found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              <section
                className="dashboard-panel transaction-history"
                id="transactions"
              >
                <h2>Transaction History</h2>

                {transactions.length === 0 ? (
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
                      {[...transactions].reverse().map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.date}</td>
                          <td>{transaction.propertyTag}</td>
                          <td>{transaction.type}</td>
                          <td>{transaction.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
              {selectedItem && (
                <section className="item-details">
                  <h2>Item Details</h2>

                  <p>
                    <strong>Property Tag:</strong> {selectedItem.propertyTag}
                  </p>

                  <p>
                    <strong>Item Name:</strong> {selectedItem.name}
                  </p>

                  <p>
                    <strong>Serial Number:</strong> {selectedItem.serialNumber}
                  </p>

                  <p>
                    <strong>Location:</strong> {selectedItem.location}
                  </p>

                  <p>
                    <strong>Status:</strong> {statusLabels[selectedItem.status]}
                  </p>
                  <p>
                    <strong>Custodian:</strong>{" "}
                    {selectedItem.custodian ?? "Not assigned"}
                  </p>

                  <button type="button" onClick={() => setSelectedItemId(null)}>
                    Close Details
                  </button>
                </section>
              )}
            </main>

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
                <section className="receive-form">
                  <h2>Receive New Item</h2>

                  <form onSubmit={handleReceiveItem}>
                    <label htmlFor="receive-tag">Property Tag</label>
                    <input
                      id="receive-tag"
                      required
                      value={receiveForm.propertyTag}
                      onChange={(event) =>
                        setReceiveForm({
                          ...receiveForm,
                          propertyTag: event.target.value,
                        })
                      }
                      placeholder="e.g. DEMO-IT-005"
                    />

                    <label htmlFor="receive-serial">Serial Number</label>
                    <input
                      id="receive-serial"
                      required
                      value={receiveForm.serialNumber}
                      onChange={(event) =>
                        setReceiveForm({
                          ...receiveForm,
                          serialNumber: event.target.value,
                        })
                      }
                      placeholder="Enter serial number"
                    />

                    <label htmlFor="receive-name">Item Name</label>
                    <input
                      id="receive-name"
                      required
                      value={receiveForm.name}
                      onChange={(event) =>
                        setReceiveForm({
                          ...receiveForm,
                          name: event.target.value,
                        })
                      }
                      placeholder="e.g. USB Keyboard"
                    />

                    <label htmlFor="receive-location">Initial Location</label>
                    <input
                      id="receive-location"
                      required
                      value={receiveForm.location}
                      onChange={(event) =>
                        setReceiveForm({
                          ...receiveForm,
                          location: event.target.value,
                        })
                      }
                      placeholder="e.g. MIS Office"
                    />

                    {formError && <p role="alert">{formError}</p>}

                    <button type="submit">Receive Item</button>
                  </form>
                </section>

                <section className="issue-form">
                  <h2>Issue / Deploy Item</h2>

                  <form onSubmit={handleIssueItem}>
                    <label htmlFor="issue-item">Available Item</label>
                    <select
                      id="issue-item"
                      required
                      value={issueForm.propertyTag}
                      onChange={(event) =>
                        setIssueForm({
                          ...issueForm,
                          propertyTag: event.target.value,
                        })
                      }
                    >
                      <option value="">Select an available item</option>
                      {inventoryItems
                        .filter((item) => item.status === "IN_STOCK")
                        .map((item) => (
                          <option key={item.id} value={item.propertyTag}>
                            {item.propertyTag} — {item.name}
                          </option>
                        ))}
                    </select>

                    <label htmlFor="issue-custodian">
                      Recipient / Custodian
                    </label>
                    <input
                      id="issue-custodian"
                      required
                      value={issueForm.custodian}
                      onChange={(event) =>
                        setIssueForm({
                          ...issueForm,
                          custodian: event.target.value,
                        })
                      }
                      placeholder="Enter demo recipient"
                    />

                    <label htmlFor="issue-location">
                      Destination / Location
                    </label>
                    <input
                      id="issue-location"
                      required
                      value={issueForm.location}
                      onChange={(event) =>
                        setIssueForm({
                          ...issueForm,
                          location: event.target.value,
                        })
                      }
                      placeholder="e.g. Admin Department"
                    />

                    {issueError && <p role="alert">{issueError}</p>}

                    <button type="submit">Issue Item</button>
                  </form>
                </section>

                <section className="pullout-item">
                  <h2>Pull Out Item</h2>
                  <form onSubmit={handlePullOutForRepair}>
                    <label htmlFor="pullout-item">Item to pull out</label>
                    <select
                      id="pullout-item"
                      required
                      value={pullOutForm.propertyTag}
                      onChange={(event) =>
                        setPullOutForm({
                          ...pullOutForm,
                          propertyTag: event.target.value,
                        })
                      }
                    >
                      <option value="">Select an item to pull out</option>
                      {inventoryItems
                        .filter(
                          (item) =>
                            item.status === "ON_LOAN" ||
                            item.status === "ISSUED"  ||
                            item.status === "IN_STOCK",
                        )
                        .map((item) => (
                          <option key={item.id} value={item.propertyTag}>
                            {item.propertyTag} — {item.name}
                          </option>
                        ))}
                    </select>
                    <label htmlFor="repair-location">Repair Location</label>
                    <input
                      id="repair-location"
                      required
                      value={pullOutForm.repairLocation}
                      onChange={(event) =>
                        setPullOutForm({
                          ...pullOutForm,
                          repairLocation: event.target.value,
                        })
                      }
                      placeholder="Enter repair location"
                    />
                    <label htmlFor="pullout-reason">Reason for repair</label>
                    <input
                      id="pullout-reason"
                      required
                      value={pullOutForm.reason}
                      onChange={(event) =>
                        setPullOutForm({
                          ...pullOutForm,
                          reason: event.target.value,
                        })
                      }
                      placeholder="e.g. Printer not powering on"
                    />

                    {pullOutError && <p role="alert">{pullOutError}</p>}
                    <button type="submit">Pull out Item</button>
                  </form>
                </section>

                <section className="borrow-item">
                  <h2>Borrow Item</h2>
                  <form onSubmit={handleBorrowItem}>
                    <label htmlFor="borrow-item">Item to borrow</label>
                    <select
                      id="borrow-item"
                      required
                      value={borrowForm.propertyTag}
                      onChange={(event) =>
                        setBorrowForm({
                          ...borrowForm,
                          propertyTag: event.target.value,
                        })
                      }
                    >
                      <option value="">Select an item to borrow</option>
                      {inventoryItems
                        .filter((item) => item.status === "IN_STOCK")
                        .map((item) => (
                          <option key={item.id} value={item.propertyTag}>
                            {item.propertyTag} — {item.name}
                          </option>
                        ))}
                    </select>

                    <label htmlFor="borrow-custodian">
                      Recipient / Custodian
                    </label>
                    <input
                      id="borrow-custodian"
                      required
                      value={borrowForm.borrower}
                      onChange={(event) =>
                        setBorrowForm({
                          ...borrowForm,
                          borrower: event.target.value,
                        })
                      }
                      placeholder="Enter demo recipient"
                    />

                    <label htmlFor="borrow-location">
                      Destination / Location
                    </label>
                    <input
                      id="borrow-location"
                      required
                      value={borrowForm.location}
                      onChange={(event) =>
                        setBorrowForm({
                          ...borrowForm,
                          location: event.target.value,
                        })
                      }
                      placeholder="e.g. Admin Department"
                    />

                    {borrowError && <p role="alert">{borrowError}</p>}
                    <button type="submit">Borrow Item</button>
                  </form>
                </section>

                {/* Only issued or loaned items are available in this return form. */}
                <section className="return-item">
                  <h2>Return Item</h2>

                  <form onSubmit={handleReturnItem}>
                    <label htmlFor="return-item">Item to return</label>
                    <select
                      id="return-item"
                      required
                      value={returnForm.propertyTag}
                      onChange={(event) =>
                        setReturnForm({
                          ...returnForm,
                          propertyTag: event.target.value,
                        })
                      }
                    >
                      <option value="">Select an issued item</option>
                      {inventoryItems
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

                    <button type="submit">Return Item</button>
                  </form>
                </section>

                <section className="repair-item">
                  <h2>Repair Item</h2>
                  <form onSubmit={handleRepairItem}>
                    <label htmlFor="repair-item">Item to repair</label>
                    <select
                      id="repair-item"
                      required
                      value={repairForm.propertyTag}
                      onChange={(event) =>
                        setRepairForm({
                          ...repairForm,
                          propertyTag: event.target.value,
                        })
                      }
                    >
                      <option value="">Select an item with completed repair</option>
                      {inventoryItems
                        .filter((item) => item.status === "UNDER_REPAIR")
                        .map((item) => (
                          <option key={item.id} value={item.propertyTag}>
                            {item.propertyTag} — {item.name}
                          </option>
                        ))}
                    </select>
                    {repairError && <p role="alert">{repairError}</p>}
                    <button type="submit">Done Repair Item</button>
                  </form>
                </section>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
