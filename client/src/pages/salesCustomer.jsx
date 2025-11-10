import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MoreHorizontal,
  FileEdit,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";

const CustomerManagement = ({ user }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterField, setFilterField] = useState("all");
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const userID = user._id;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/customer/all-customers`,
          {
            params: { userID: userID },
          }
        );
        setCustomers(response.data);
        toast.success("Customer data loaded successfully!");
      } catch (error) {
        console.error("Error fetching customer data:", error);
        toast.error("Failed to load customer data.");
      }
    };
    fetchCustomers();
  }, [user._id]);

  // const handleAddCustomer = (newCustomer) => {
  //   setCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);
  //   toast.success("Customer Added Successfully", {
  //     description: `${newCustomer.email} has been added to your customer list.`,
  //   });
  // };

  // const handleDeleteCustomer = async (customerId) => {
  //   try {
  //     const deletedCustomer = customers.find((customer) => customer._id === customerId);
  //     await axios.delete(`{import.meta.env.VITE_API_URL}/api/customer/delete-customer`, {
  //       params: { userID: user._id, customerID: customerId },
  //     });
  //     setCustomers((prevCustomers) => prevCustomers.filter((customer) => customer._id !== customerId));
  //     toast.success("Customer Deleted Successfully", {
  //       description: `${deletedCustomer.email} has been removed from your customer list.`,
  //     });
  //   } catch (error) {
  //     console.error("Error deleting customer:", error);
  //     toast.error("Failed to delete customer.");
  //   }
  // };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;

    switch (filterField) {
      case "customerId":
        return `CUST-${customer._id.toString().padStart(4, "0")}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      case "gstin":
        return customer.gstIN.toLowerCase().includes(searchTerm.toLowerCase());
      case "contactNo":
        return customer.contactNo.includes(searchTerm);
      case "email":
        return customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      case "address":
        return customer.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      case "all":
      default:
        return (
          customer.gstIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `CUST-${customer._id.toString().padStart(4, "0")}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.contactNo.includes(searchTerm)
        );
    }
  });

  const indexOfLastCustomer = currentPage * entriesPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - entriesPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);

  const handleFilterChange = (value) => {
    setFilterField(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-4 bg-gray-50">
      {/* <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      /> */}

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Customer Management
              </h1>
              <p className="ml-1 mt-1 text-gray-500 text-sm">
                Manage and track your customer information
              </p>
            </div>
          </div>
          {/* <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle className="h-4 w-4" /> Add Customer
          </Button> */}
        </div>
      </div>

      {/* Search and Filters */}
      <div className=" rounded-2xl  pl-1 pr-1 pt-2 mb-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select defaultValue="all" onValueChange={handleFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="customerId">Customer ID</SelectItem>
                  <SelectItem value="gstin">GSTIN</SelectItem>
                  <SelectItem value="contactNo">Contact No.</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl  border-6 shadow-lg overflow-hidden">
        <div className=" pr-2 pl-1 bg-gray-50 border-b p-1  flex justify-between items-center">
          <div className="flex items-center space-x-2 ">
            <span className="text-sm text-gray-600">Show</span>
            <Select
              defaultValue="10"
              onValueChange={(value) => setEntriesPerPage(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600 ">entries</span>
          </div>

          {filterField !== "all" && (
            <div className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs flex items-center">
              Filtering by:{" "}
              {filterField === "customerId"
                ? "Customer ID"
                : filterField === "gstin"
                  ? "GSTIN"
                  : filterField === "contactNo"
                    ? "Contact No."
                    : filterField === "email"
                      ? "Email"
                      : "Address"}
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={() => setFilterField("all")}
              >
                ×
              </button>
            </div>
          )}

          <div className="text-sm text-gray-500 italic">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-48">Customer ID/GSTIN</TableHead>
              <TableHead className="w-36">Contact No.</TableHead>
              <TableHead className="w-48">Email Address</TableHead>
              <TableHead className="w-64">Address</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCustomers.length > 0 ? (
              currentCustomers.map((customer) => (
                <TableRow key={customer._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    <div
                      className={
                        filterField === "customerId"
                          ? "bg-yellow-50 px-1 rounded"
                          : ""
                      }
                    >
                      {customer.gstIN}
                    </div>
                    <div
                      className={`text-xs text-gray-500 mt-1 ${filterField === "gstin" ? "bg-yellow-50 px-1 rounded" : ""}`}
                    >
                      {customer.name}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${filterField === "contactNo" ? "bg-yellow-50 px-1 rounded" : ""}`}
                  >
                    {customer.contactNo}
                  </TableCell>
                  <TableCell
                    className={`text-blue-600 hover:text-blue-800 ${filterField === "email" ? "bg-yellow-50 px-1 rounded" : ""}`}
                  >
                    <a href={`mailto:${customer.email}`}>{customer.email}</a>
                  </TableCell>
                  <TableCell
                    className={`max-w-xs truncate ${filterField === "address" ? "bg-yellow-50 px-1 rounded" : ""}`}
                  >
                    {customer.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Customer Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                          <FileEdit className="mr-2 h-4 w-4 text-blue-600" />
                          Edit Customer
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem className="cursor-pointer">
                          <DownloadIcon className="mr-2 h-4 w-4 text-green-600" />
                          Export Details
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem 
                          className="cursor-pointer text-red-600" 
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className="h-8 w-8 text-gray-300" />
                    <p className="text-gray-500">
                      No customers found matching your search
                    </p>
                    {filterField !== "all" && (
                      <Button
                        variant="link"
                        className="text-blue-600"
                        onClick={() => setFilterField("all")}
                      >
                        Clear filter and try again
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 text-sm">
        <div className="text-gray-600">
          Showing {filteredCustomers.length > 0 ? indexOfFirstCustomer + 1 : 0}{" "}
          to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of{" "}
          {filteredCustomers.length} customer
          {filteredCustomers.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 ${currentPage === page ? "bg-blue-50 text-blue-700 border-blue-300" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
