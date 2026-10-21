import fs from "node:fs";

const inputPath = "C:/Users/Hob/Downloads/db.json";
const outputPath = "C:/Users/Hob/WebDevelopment/mis-inventory/db.local.json";

const sourceRows = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!Array.isArray(sourceRows)) {
  throw new Error("Expected the source JSON to be an array.");
}

const inventoryItems = sourceRows.map((row) => {
  const { assignedTo, status, condition, ...otherFields } = row;

  return {
    ...otherFields,
    custodian: assignedTo,
    status: status === "DEPLOYED" ? "ISSUED" : status,
    condition: condition === "GOOD" ? "SERVICEABLE" : condition,
  };
});

fs.writeFileSync(
  outputPath,
  JSON.stringify({ inventoryItems }, null, 2),
  "utf8",
);

console.log(`Converted ${inventoryItems.length} inventory records.`);
