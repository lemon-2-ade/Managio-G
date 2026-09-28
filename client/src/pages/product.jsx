import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Pencil, PackageSearch, ShoppingBag, LoaderCircle } from "lucide-react";
import api from "@/lib/axios";
import EditProductPopup from "@/drawers/productDrawer";
import ErrorState from "@/components/errors/ErrorState";

const ProductsPage = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState({
    stockStatus: "all",
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
  });
  const [selectedProduct, setSelectedProduct] = useState(null); // State for selected product
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // State for drawer visibility

  const fetchItemsDetail = async () => {
    if (!user || !user._id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const userID = user._id;
      const res = await api.get(`/api/items/all-items`, {
        params: { userID: userID },
      });
      setProducts(res.data || []);
    } catch (error) {
      setLoadError(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemsDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="flex flex-col items-center gap-1 py-16 text-center">
        <PackageSearch size={22} className="mb-1 text-muted-foreground" />
        <p className="text-sm font-medium">User not found</p>
        <p className="text-xs text-muted-foreground">Please log in to view your inventory.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8">
      {/* Header Section */}
      <Card className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <ShoppingBag size={19} />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Product inventory</h1>
          <p className="text-xs text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} tracked
          </p>
        </div>
      </Card>

      {/* Filters and Search Section */}
      <div>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9"
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
      {loadError ? (
        <Card>
          <ErrorState error={loadError} onRetry={fetchItemsDetail} />
        </Card>
      ) : (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,220px))] justify-start gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16">
            <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card
              key={product._id}
              className="group relative overflow-hidden p-4 transition-shadow hover:shadow-md"
            >
              <button
                className="absolute right-3 top-3 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                onClick={() => handleEditClick(product)}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <h3 className="mb-3 truncate pr-6 text-base font-semibold">{product.name}</h3>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-accent p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Stock</p>
                  <p className={`font-mono text-sm font-semibold ${product.totalUnits > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                    {product.totalUnits > 0 ? product.totalUnits : "Out of stock"}
                  </p>
                </div>
                <div className="rounded-md bg-accent p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Price</p>
                  <p className="font-mono text-sm font-semibold">₹{product.unitCost.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">GST</p>
                  <p className="font-mono font-medium">{product.gstPer ?? "N/A"}{product.gstPer != null ? "%" : ""}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Units sold</p>
                  <p className="font-mono font-medium">{product.unitsSolds || 0}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center gap-1 py-16 text-center">
            <ShoppingBag size={22} className="mb-1 text-muted-foreground" />
            <p className="text-sm font-medium">No products found</p>
            <p className="text-xs text-muted-foreground">Products you purchase will appear here.</p>
          </div>
        )}
      </div>
      )}
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
