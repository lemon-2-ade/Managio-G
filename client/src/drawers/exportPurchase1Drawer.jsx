import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";

// Schema validation function for purchase data
const validateAgainstSchema = (data) => {
  const errors = [];

  // Check if data is an array
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ["Data must be an array of purchase details"],
    };
  }

  // Empty array check
  if (data.length === 0) {
    return {
      isValid: false,
      errors: ["No valid purchase records found in the Excel file"],
    };
  }

  // Validate each purchase detail entry
  data.forEach((purchase, purchaseIndex) => {
    // Check for required structure
    if (!purchase.supplierDetails) {
      errors.push(`Row ${purchaseIndex + 1}: Missing supplierDetails`);
    } else {
      // Validate supplierDetails
      if (
        typeof purchase.supplierDetails.name !== "string" &&
        purchase.supplierDetails.name !== undefined
      ) {
        errors.push(
          `Row ${purchaseIndex + 1}: supplierDetails.name must be a string`
        );
      }
      if (
        typeof purchase.supplierDetails.contactNo !== "string" &&
        purchase.supplierDetails.contactNo !== undefined
      ) {
        errors.push(
          `Row ${purchaseIndex + 1}: supplierDetails.contactNo must be a string`
        );
      }
      if (
        typeof purchase.supplierDetails.email !== "string" &&
        purchase.supplierDetails.email !== undefined
      ) {
        errors.push(
          `Row ${purchaseIndex + 1}: supplierDetails.email must be a string`
        );
      }
      if (
        typeof purchase.supplierDetails.gstIN !== "string" &&
        purchase.supplierDetails.gstIN !== undefined
      ) {
        errors.push(
          `Row ${purchaseIndex + 1}: supplierDetails.gstIN must be a string`
        );
      }
    }

    // Validate invoiceNo
    if (
      typeof purchase.invoiceNo !== "string" &&
      purchase.invoiceNo !== undefined
    ) {
      errors.push(`Row ${purchaseIndex + 1}: invoiceNo must be a string`);
    }

    // Validate date
    if (
      purchase.date &&
      !(purchase.date instanceof Date) &&
      isNaN(new Date(purchase.date).getTime())
    ) {
      errors.push(`Row ${purchaseIndex + 1}: Invalid date format`);
    }

    // Validate items
    if (!Array.isArray(purchase.items)) {
      errors.push(`Row ${purchaseIndex + 1}: items must be an array`);
    } else if (purchase.items.length === 0) {
      errors.push(`Row ${purchaseIndex + 1}: No items found for this purchase`);
    } else {
      purchase.items.forEach((item, itemIndex) => {
        if (typeof item.name !== "string" && item.name !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: name must be a string`
          );
        }
        if (typeof item.hsnCode !== "string" && item.hsnCode !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: hsnCode must be a string`
          );
        }
        if (typeof item.itemCode !== "string" && item.itemCode !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: itemCode must be a string`
          );
        }
        if (isNaN(Number(item.units)) && item.units !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: units must be a number`
          );
        }
        if (isNaN(Number(item.unitCost)) && item.unitCost !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: unitCost must be a number`
          );
        }
        if (isNaN(Number(item.gstPer)) && item.gstPer !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: gstPer must be a number`
          );
        }
        if (isNaN(Number(item.amt)) && item.amt !== undefined) {
          errors.push(
            `Row ${purchaseIndex + 1}, Item ${itemIndex + 1}: amt must be a number`
          );
        }
      });
    }

    // Validate taxAmt and finalAmt
    if (isNaN(Number(purchase.taxAmt)) && purchase.taxAmt !== undefined) {
      errors.push(`Row ${purchaseIndex + 1}: taxAmt must be a number`);
    }
    if (isNaN(Number(purchase.finalAmt)) && purchase.finalAmt !== undefined) {
      errors.push(`Row ${purchaseIndex + 1}: finalAmt must be a number`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Function to transform Excel data to purchase schema-compatible format
const transformExcelData = (excelData, user) => {
  if (!excelData || excelData.length === 0) {
    console.error("No data in Excel file");
    return [];
  }

  console.log("Excel columns:", Object.keys(excelData[0]));

  const result = [];

  // Process each row as a separate purchase order
  excelData.forEach((row, index) => {
    // Check for minimal required fields
    if (!row.invoiceNo || !row.supplierName) {
      console.log(`Skipping row ${index} - missing required fields`);
      return;
    }
    console.log("UserID:", user);
    // Create base purchase object
    const purchase = {
      userID: user,
      supplierDetails: {
        name: row.supplierName || "",
        contactNo: String(row.supplierContactNo || ""),
        email: row.supplierEmail || "",
        gstIN: row.supplierGSTIN || "",
        address: {
          line1: row.supplierAddressLine1 || "",
          line2: row.supplierAddressLine2 || "",
          city: row.supplierCity || "",
          state: row.supplierState || "",
          pincode: row.supplierPincode
            ? Number(row.supplierPincode)
            : undefined,
          country: row.supplierCountry || "",
        },
      },
      date: row.date ? new Date(row.date) : new Date(),
      invoiceNo: row.invoiceNo || "",
      items: [],
      taxAmt: parseFloat(row.taxAmt) || 0,
      finalAmt: parseFloat(row.finalAmt) || 0,
      warehouseID: row.warehouseID || "",
    };

    // Debug item fields
    console.log(`Row ${index} checking for items`);

    // Find all item fields in this row
    const itemKeyPattern = /^item(\d+)Name$/;
    const itemIndices = [];

    Object.keys(row).forEach((key) => {
      const match = key.match(itemKeyPattern);
      if (match && row[key]) {
        // Only if the name field has a value
        itemIndices.push(parseInt(match[1]));
      }
    });

    console.log(`Found item indices: ${itemIndices.join(", ")}`);

    // Process each item
    itemIndices.forEach((i) => {
      const prefix = `item${i}`;
      const itemName = row[`${prefix}Name`];

      if (itemName) {
        purchase.items.push({
          name: itemName,
          hsnCode: row[`${prefix}HSN`] || "",
          itemCode: row[`${prefix}Code`] || "",
          units: parseFloat(row[`${prefix}Units`]) || 0,
          unitCost: parseFloat(row[`${prefix}UnitCost`]) || 0,
          gstPer: parseFloat(row[`${prefix}GSTPer`]) || 0,
          amt: parseFloat(row[`${prefix}Amt`]) || 0,
        });
        console.log(`Added item: ${itemName}`);
      }
    });

    // If no items were found using the indexing pattern, try generic item fields
    if (purchase.items.length === 0 && row.itemName) {
      purchase.items.push({
        name: row.itemName || "",
        hsnCode: row.itemHSN || "",
        itemCode: row.itemCode || "",
        units: parseFloat(row.itemUnits) || 0,
        unitCost: parseFloat(row.itemUnitCost) || 0,
        gstPer: parseFloat(row.itemGSTPer) || 0,
        amt: parseFloat(row.itemAmt) || 0,
      });
      console.log(`Added generic item: ${row.itemName}`);
    }

    // Add purchase to result only if it has items
    if (purchase.items.length > 0) {
      result.push(purchase);
      console.log(
        `Added purchase with invoice #${row.invoiceNo} and ${purchase.items.length} items`
      );
    } else {
      console.warn(
        `Skipping purchase with invoice #${row.invoiceNo} - no items found`
      );
    }
  });

  console.log(`Transformed ${result.length} valid purchases`);
  return result;
};

// Maintain the original Excel data for preview
const readExcelData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelJson = XLSX.utils.sheet_to_json(worksheet);

        console.log("Excel parsing result:", excelJson);
        resolve(excelJson);
      } catch (err) {
        console.error("Excel parsing error:", err);
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Function to generate sample Excel file for purchases
const generateSampleExcel = () => {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Sample data for purchases with easy-to-follow format
  const sampleData = [
    {
      invoiceNo: "PUR-001",
      date: new Date().toISOString().split("T")[0],
      supplierName: "ABC Suppliers Ltd",
      supplierContactNo: "1234567890",
      supplierEmail: "contact@abcsuppliers.com",
      supplierGSTIN: "22AAAAA0000A1Z5",
      supplierAddressLine1: "123 Supplier Street",
      supplierAddressLine2: "Business District",
      supplierCity: "Mumbai",
      supplierState: "Maharashtra",
      supplierPincode: 400001,
      supplierCountry: "India",
      item1Name: "Raw Material A",
      item1HSN: "HSN001",
      item1Code: "RM-A",
      item1Units: 100,
      item1UnitCost: 50,
      item1GSTPer: 18,
      item1Amt: 5000,
      taxAmt: 900,
      finalAmt: 5900,
      warehouseID: "warehouserandomid123",
    },
    {
      invoiceNo: "PUR-002",
      date: new Date().toISOString().split("T")[0],
      supplierName: "XYZ Manufacturing",
      supplierContactNo: "9876543210",
      supplierEmail: "info@xyzmanufacturing.com",
      supplierGSTIN: "27BBBBB0000B1Z3",
      supplierAddressLine1: "456 Industry Avenue",
      supplierAddressLine2: "Industrial Zone",
      supplierCity: "Delhi",
      supplierState: "Delhi",
      supplierPincode: 110001,
      supplierCountry: "India",
      item1Name: "Component B",
      item1HSN: "HSN002",
      item1Code: "COMP-B",
      item1Units: 50,
      item1UnitCost: 120,
      item1GSTPer: 12,
      item1Amt: 6000,
      taxAmt: 720,
      finalAmt: 6720,
      warehouseID: "",
    },
  ];

  // Convert to worksheet
  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Generate column widths to make the template more readable
  const colWidths = [
    { wch: 10 }, // invoiceNo
    { wch: 10 }, // date
    { wch: 20 }, // supplierName
    { wch: 15 }, // supplierContactNo
    { wch: 25 }, // supplierEmail
  ];
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "PurchaseData");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Create Blob and download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "purchase_template.xlsx";
  a.click();

  URL.revokeObjectURL(url);
};

const ExcelImportDrawer = ({ onImportComplete, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrors([]);
    setDebug("");

    if (selectedFile) {
      processExcelFile(selectedFile);
    }
  };

  const processExcelFile = async (file) => {
    setIsLoading(true);
    setDebug("");

    try {
      const originalExcelData = await readExcelData(file);
      console.log("Original Excel Data:", originalExcelData);

      // Add debug information
      let debugInfo = `Excel data loaded: ${originalExcelData.length} rows\n`;

      if (originalExcelData.length > 0) {
        debugInfo += `Column names: ${Object.keys(originalExcelData[0]).join(", ")}\n`;
      }

      setExcelData(originalExcelData);
      setDebug((prev) => prev + debugInfo);

      const transformedData = transformExcelData(originalExcelData, user._id);
      console.log("Transformed Data:", transformedData);

      debugInfo = `Transformed data: ${transformedData.length} purchases\n`;
      setDebug((prev) => prev + debugInfo);

      // Check if we have valid transformed data
      if (transformedData.length === 0) {
        setErrors([
          "Could not find any valid purchase records in the Excel file. Make sure your file has invoiceNo, supplierName, and at least one item with a name (item1Name, item2Name, etc.)",
        ]);
        setJsonData(null);
        return;
      }

      const validation = validateAgainstSchema(transformedData);
      console.log("Validation Result:", validation);

      debugInfo = `Validation: ${validation.isValid ? "Passed" : `Failed with ${validation.errors.length} errors`}\n`;
      setDebug((prev) => prev + debugInfo);

      if (validation.isValid) {
        setJsonData(transformedData);
        setErrors([]);
      } else {
        setErrors(validation.errors);
        setJsonData(null);
      }
    } catch (err) {
      console.error("Error processing Excel file:", err);
      setErrors([
        "Failed to parse Excel file. Please ensure it's a valid Excel document.",
      ]);
      setJsonData(null);
      setExcelData(null);
      setDebug((prev) => prev + `Error: ${err.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Purchase Order Data:", jsonData); // Debugging log

    if (!jsonData || jsonData.length === 0) {
      alert("No valid data to import.");
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let failureCount = 0;

    for (const purchase of jsonData) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/purchase/add-purchase`,
          purchase
        );

        if (response.status === 200) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (err) {
        console.error("Error adding purchase order:", err);
        failureCount++;
      }
    }

    setIsLoading(false);

    alert(
      `Purchase order import completed. Success: ${successCount}, Failures: ${failureCount}`
    );
    onImportComplete(jsonData);
    setIsOpen(false);
    setFile(null);
    setJsonData(null);
    setExcelData(null);
  };

  const getTableHeaders = () => {
    if (!excelData || excelData.length === 0) return [];

    const allKeys = excelData.reduce((keys, row) => {
      Object.keys(row).forEach((key) => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      });
      return keys;
    }, []);

    const priorityKeys = [
      "invoiceNo",
      "date",
      "supplierName",
      "supplierContactNo",
      "supplierEmail",
      "supplierGSTIN",
      "item1Name",
      "taxAmt",
      "finalAmt",
    ];

    const sortedKeys = [
      ...priorityKeys.filter((key) => allKeys.includes(key)),
      ...allKeys.filter((key) => !priorityKeys.includes(key)),
    ];

    return sortedKeys.slice(0, 8);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Purchase Data
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form onSubmit={handleSubmit}>
          <DrawerHeader>
            <DrawerTitle>Import Purchase Data</DrawerTitle>
            <DrawerDescription>
              Upload an Excel file with purchase details. Make sure it follows
              the required format.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <div className="flex justify-between mb-4">
              <Input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="w-3/4"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSampleExcel}
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
            </div>

            {errors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  <div className="text-sm font-medium mb-1">
                    The Excel file has the following errors:
                  </div>
                  <ul className="text-xs list-disc pl-4">
                    {errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>...and {errors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <p className="text-sm text-gray-500">Processing file...</p>
            )}

            {excelData && excelData.length > 0 && (
              <Card className="mb-4">
                <CardContent className="pt-4 px-2">
                  <div className="text-sm font-medium mb-2">
                    Excel Data Preview
                  </div>
                  <div className="max-h-64 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getTableHeaders().map((header, index) => (
                            <TableHead key={index} className="text-xs py-2">
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelData.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {getTableHeaders().map((header, colIndex) => (
                              <TableCell
                                key={colIndex}
                                className="text-xs py-2"
                              >
                                {row[header] !== undefined
                                  ? String(row[header])
                                  : ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {excelData.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2 px-4 pb-2">
                        ... and {excelData.length - 5} more rows
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {jsonData && (
              <div className="mb-4 p-2 border rounded bg-green-50">
                <p className="text-sm text-green-700">
                  {jsonData.length} valid purchase records found with{" "}
                  {jsonData.reduce((total, p) => total + p.items.length, 0)}{" "}
                  total items
                </p>
              </div>
            )}

            {debug && (
              <div className="mb-4 p-2 border rounded bg-gray-50 text-xs text-gray-500 font-mono">
                <pre>{debug}</pre>
              </div>
            )}
          </div>

          <DrawerFooter>
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-500">
                {jsonData
                  ? `${jsonData.length} valid records ready to import`
                  : "No valid records found"}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={!jsonData || isLoading}>
                  Import Data
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default ExcelImportDrawer;
