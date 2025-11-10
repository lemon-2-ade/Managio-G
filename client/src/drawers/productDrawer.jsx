import { useState } from "react";
import axios from "axios";

const EditProductPopup = ({ isOpen, onClose, product, onUpdate, user }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    unitCost: product?.unitCost || 0,
    totalUnits: product?.totalUnits || 0,
    gstPer: product?.gstPer || 0,
  });

  const [selectedWarehouse, setSelectedWarehouse] = useState(
    product?.warehouses?.[0]?._id || ""
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseChange = (e) => {
    setSelectedWarehouse(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // console.log("Product:", product);
      // console.log("FormData:", formData);
      // console.log("Selected Warehouse:", selectedWarehouse.toString());

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/items/update-item`,
        {
          userID: user._id,
          warehouseID: selectedWarehouse.toString(),
          items: formData,
        }
      );

      if (res.status === 200) {
        // console.log("Item updated successfully:", res.data.updatedItem);
        onUpdate(res.data.updatedItem); // Update the product in the parent component
        onClose(); // Close the drawer
      } else {
        console.error("Failed to update item:", res.data.message);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="w-96 bg-white rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-cyan-600 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6 bg-cyan-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Product Name</p>
            <p className="text-lg font-semibold text-gray-800">
              {product.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost
              </label>
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-cyan-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Units
              </label>
              <input
                type="number"
                name="totalUnits"
                value={formData.totalUnits}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-cyan-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse
              </label>
              <select
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                className="w-full px-3 py-2 border border-cyan-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              >
                {product.warehouses &&
                  product.warehouses.map((warehouse) => (
                    <option key={warehouse._id} value={warehouse._id}>
                      {warehouse.name || `Warehouse ${warehouse._id}`}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors duration-300"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPopup;
