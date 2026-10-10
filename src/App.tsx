import { useState, type FormEvent } from "react";
import heroImg from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";

type InventoryItem = {
  id: number;
  propertyTag: string;
  serialNumber: string;
  name: string;
  location: string;
  status: "Available" | "Issued";
  custodian?: string;
};

type InventoryTransaction = {
  id: string;
  itemId: number;
  propertyTag: string;
  type: "Received" | "Issued" | "Returned" | "Transferred";
  date: string;
  details: string;
};

function App() {
  const [count, setCount] = useState(0);
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

  const [issueError, setIssueError] = useState("");

  const [formError, setFormError] = useState("");

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    {
      id: 1,
      propertyTag: "DEMO-IT-001",
      serialNumber: "SN-DEMO-001",
      name: "Desktop Computer",
      location: "MIS Office",
      status: "Available",
    },
    {
      id: 2,
      propertyTag: "DEMO-IT-002",
      serialNumber: "SN-DEMO-002",
      name: "Laptop",
      location: "Admin Department",
      status: "Issued",
    },
    {
      id: 3,
      propertyTag: "DEMO-IT-003",
      serialNumber: "SN-DEMO-003",
      name: "Network Printer",
      location: "MIS Office",
      status: "Available",
    },
  ]);

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Available" | "Issued"
  >("All");

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
      status: "Available",
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

    if (itemToIssue.status !== "Available") {
      setIssueError("Only available items can be issued.");
      return;
    }

    const updatedItem: InventoryItem = {
      ...itemToIssue,
      status: "Issued",
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
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const selectedItem =
    inventoryItems.find((item) => item.id === selectedItemId) ?? null;

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
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
                  .filter((item) => item.status === "Available")
                  .map((item) => (
                    <option key={item.id} value={item.propertyTag}>
                      {item.propertyTag} — {item.name}
                    </option>
                  ))}
              </select>

              <label htmlFor="issue-custodian">Recipient / Custodian</label>
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

              <label htmlFor="issue-location">Destination / Location</label>
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

          <main className="inventory-app">
            <h1>MIS Inventory</h1>
            <p>ACE Medical Center Bohol — MIS Department</p>

            <p>
              Showing {visibleItems} of {totalItems} items
            </p>

            <input
              type="text"
              placeholder="Search by property tag or item name..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <label htmlFor="status-filter">Filter by status:</label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "All" | "Available" | "Issued",
                )
              }
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
            </select>
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
                      <td>{item.status}</td>
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
            <section className="transaction-history">
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
                  <strong>Status:</strong> {selectedItem.status}
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
        </div>

        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
