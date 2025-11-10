import { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  Settings,
  MapPin,
  ClipboardList,
  Package,
  PhoneCall,
  Building,
  ListFilter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WarehouseDetails = ({ user }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWarehouseDetail = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const userID = user._id;
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/warehouse/info`,
        {
          params: { userID: userID },
          withCredentials: true,
        }
      );

      setWarehouses(data.warehouseDetails || []);
      setError(null);

      // Auto-select first warehouse if exists
      if (data.warehouseDetails && data.warehouseDetails.length > 0) {
        setSelectedWarehouse(data.warehouseDetails[0]);
      }
    } catch (err) {
      console.error("Error fetching warehouse details:", err);
      setError("Failed to fetch warehouse details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseDetail();
  }, [user?._id]);

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading warehouses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full ">
      {/* Left Sidebar - Warehouse List */}
      <div className="w-1/3 border-r p-6 bg-gray-50 overflow-y-auto ">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 ">Warehouses</h1>

          {/* Search and Filter */}
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon">
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>

          {/* Warehouse List */}
          <div className="space-y-4">
            {filteredWarehouses.map((warehouse) => (
              <Card
                key={warehouse._id}
                className={`cursor-pointer hover:border-blue-500 transition-all ${
                  selectedWarehouse?._id === warehouse._id
                    ? "border-blue-500 border-2"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedWarehouse(warehouse)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{warehouse.name}</h3>
                    <div className="text-sm text-gray-500">
                      {warehouse.location.city}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Progress
                    value={warehouse.perUsed || 0}
                    className="h-2 mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {warehouse.perUsed || 0}% Utilized
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="w-2/3 p-8 overflow-y-auto">
        {selectedWarehouse ? (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedWarehouse.name}
                </h2>
                {/* <div className="flex space-x-2">
                  <Button variant="outline">Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </div> */}
              </div>

              {/* Detailed Warehouse Information */}
              <div className="grid grid-cols-2 gap-6">
                {/* Location Details */}
                <div>
                  <div className="flex items-center mb-4">
                    <MapPin className="mr-2 text-blue-500" />
                    <h3 className="text-xl font-semibold">Location</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{selectedWarehouse.location.line1}</p>
                    {selectedWarehouse.location.line2 && (
                      <p>{selectedWarehouse.location.line2}</p>
                    )}
                    <p>
                      {selectedWarehouse.location.city},
                      {selectedWarehouse.location.state}
                    </p>
                    <p>
                      {selectedWarehouse.location.country} -
                      {selectedWarehouse.location.pincode}
                    </p>
                  </div>
                </div>

                {/* Capacity Details */}
                <div>
                  <div className="flex items-center mb-4">
                    <Building className="mr-2 text-blue-500" />
                    <h3 className="text-xl font-semibold">Capacity</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Total Capacity:</span>
                      <span className="font-medium">
                        {selectedWarehouse.totalCapacity} sq ft
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Utilized:</span>
                      <span className="font-medium">
                        {selectedWarehouse.perUsed}%
                      </span>
                    </div>
                    <Progress
                      value={selectedWarehouse.perUsed}
                      className="h-2 mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Items in Warehouse */}
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <Package className="mr-2 text-blue-500" />
                  <h3 className="text-xl font-semibold">Items</h3>
                </div>
                {selectedWarehouse.items &&
                selectedWarehouse.items.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Item Name</th>
                          <th className="text-right p-2">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedWarehouse.items.map((item, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="p-2">{item.name}</td>
                            <td className="text-right p-2">{item.units}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No items in this warehouse</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Select a warehouse to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDetails;
