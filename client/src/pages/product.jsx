import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaSearch, FaFilter, FaEdit, FaBoxOpen } from "react-icons/fa";
import { ShoppingBag } from "lucide-react";
import axios from "axios";
import EditProductPopup from "@/drawers/productDrawer";

const ProductsPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stockStatus: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
  });
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer visibility

  useEffect(() => {
    const fetchItemsDetail = async () => {
      try {
        // Check if user and user._id are defined
        if (!user || !user._id) {
          console.error("User is not defined or invalid");
          return;
        }

        const userID = user._id;
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/items/all-items`,
          {
            params: { userID: userID },
          }
        );
        // console.log("Fetched data:", res.data);
        if (res.data) {
          setProducts(res.data);
        } else {
          console.error("Fetched data is not valid:", res.data);
          setProducts([]);
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItemsDetail();
  }, [user]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = (updatedProduct) => {
    // Add a safety check to ensure updatedProduct and its _id exist
    if (updatedProduct && updatedProduct._id) {
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
      // console.log("Product updated:", updatedProduct._id);
    } else {
      // console.error("Invalid product update: missing _id", updatedProduct);
    }
  };

  const applyFilters = (products) => {
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filters.stockStatus === "all" ||
            (filters.stockStatus === "inStock" && product.totalUnits > 0) ||
            (filters.stockStatus === "outOfStock" &&
              product.totalUnits <= 0)) &&
          (!filters.minPrice ||
            product.unitCost >= parseFloat(filters.minPrice)) &&
          (!filters.maxPrice ||
            product.unitCost <= parseFloat(filters.maxPrice))
      )
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "priceAsc":
            return a.unitCost - b.unitCost;
          case "priceDesc":
            return b.unitCost - a.unitCost;
          case "name":
            return a.name.localeCompare(b.name);
          case "stock":
            return b.totalUnits - a.totalUnits;
          default:
            return 0;
        }
      });
  };

  const filteredProducts = applyFilters(products);

  if (!user || !user._id) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-gray-500">
          User not found. Please log in.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <ShoppingBag className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Product Inventory
            </h1>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="rounded-2xl pr-2 pt-6 ">
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<FaSearch className="text-gray-400" />}
            />
          </div>

          <Select
            value={filters.stockStatus}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, stockStatus: value }))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="inStock">In Stock</SelectItem>
              <SelectItem value="outOfStock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="priceAsc">Price: Low to High</SelectItem>
              <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              <SelectItem value="stock">Stock Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin">
              <FaBoxOpen className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="relative group overflow-hidden transition-all duration-300 
                         hover:shadow-xl hover:scale-[1.02] 
                         border-2 border-transparent 
                         hover:border-blue-200 
                         bg-white rounded-2xl"
            >
              <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  onClick={() => handleEditClick(product)}
                >
                  <FaEdit className="w-5 h-5" />
                </button>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold text-gray-800 truncate">
                  {product.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Stock
                    </p>
                    <p
                      className={`font-semibold ${product.totalUnits > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {product.totalUnits > 0
                        ? product.totalUnits
                        : "Out of Stock"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Price
                    </p>
                    <p className="font-semibold text-green-700">
                      ₹{product.unitCost.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="ml-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">GST</p>
                    <p className="font-medium">{product.gstPer || "N/A"}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Units Sold</p>
                    <p className="font-medium">{product.unitsSolds || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        )}
      </div>
      {isDrawerOpen && (
        <EditProductPopup
          user={user}
          onUpdate={handleProductUpdate}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          product={selectedProduct} // Pass the selected product to the drawer
        />
      )}
    </div>
  );
};

export default ProductsPage;
