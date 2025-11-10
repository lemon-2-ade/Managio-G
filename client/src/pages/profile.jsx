import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Bar from "../navBars/mainNav";
import { motion } from "framer-motion";
import { use } from "react";
import ProfileAnimation from "../assets/profileAnimation.json";
import Lottie from "lottie-react";
import { Alert } from "@/components/ui/alert";

function Profile({ user, refreshUser }) {
  const navigate = useNavigate();
  const [war, setWar] = useState([]);
  const fetchWarehouseDetail = async () => {
    const userID = user?._id;
    // console.log("UsER ID",userID);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/warehouse/info`,
        {
          params: { userID: user?._id },
          withCredentials: true,
        }
      );
      // console.log(user._id);
      // console.log(data);
      localStorage.setItem("warehouses", JSON.stringify(data.warehouseDetails));
      setWarehouses(data.warehouseDetails);
      // console.log(data.warehouseDetails)
    } catch (err) {
      console.error("Hello from Aryan", err);
    }
  };
  useEffect(() => {
    fetchWarehouseDetail();
  }, []);
  // Profile form data
  const [formData, setFormData] = useState({
    name: user.name || "",
    companyName: user.companyName || "",
    gstIN: user.gstIN || "",
    email: user.email || "",
  });

  // Warehouses array
  const [warehouses, setWarehouses] = useState([
    {
      name: "",
      capacity: "",

      location: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      },
      contactNo: "",
    },
  ]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWarehouseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWarehouses = [...warehouses];

    if (name.startsWith("location.")) {
      const field = name.split(".")[1];
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        location: {
          ...updatedWarehouses[index].location,
          [field]: value,
        },
      };
    } else {
      updatedWarehouses[index] = {
        ...updatedWarehouses[index],
        [name]: value,
      };
    }

    setWarehouses(updatedWarehouses);
  };

  const addWarehouse = () => {
    setWarehouses([
      ...warehouses,
      {
        name: "",
        capacity: "",

        location: {
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
          country: "",
        },
        contactNo: "",
      },
    ]);
  };

  const removeWarehouse = async (index) => {
    const updatedWarehouses = warehouses.filter((_, i) => i !== index);
    setWarehouses(updatedWarehouses);
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/warehouse/info-delete`,
      {
        params: { userID: user._id, warehouseID: warehouses[index]._id },
        withCredentials: true,
      }
    );
    alert("Warehouse deleted successfully!");
    fetchWarehouseDetail();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = { ...formData };
    const warehouseData = {
      userID: user?._id,
      warehouseDetails: warehouses,
    };

    try {
      if (user?.isNewUser) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/warehouse/info-add`,
          warehouseData
        );
      } else {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/warehouse/info-update`,
          warehouseData
        );
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/update`,
        submitData,
        {
          withCredentials: true,
        }
      );
      // console.log(submitData);
      alert("Profile updated successfully!");
      await refreshUser();
      navigate("/");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Error updating profile");
    }
  };

  return (
    <div className="fixed w-full flex flex-row items-start justify-center  min-h-screen bg-gradient-to-br from-cyan-100 to-slate-300 py-8">
      <h1
        class="absolute font-[Bebas Neue] font-black tracking-[5px] left-[0px] w-[25%] 
   text-4xl text-start pl-14 text-slate-600 bg-gradient-to-r from-blue-100 to-cyan-200 text-shahow-8xl
   p-2 rounded-r-2xl shadow-xl"
      >
        PROFILE
      </h1>
      <div className="relative flex flex-col w-[25.5%] z-[-30]">
        <div className="mt-6">
          <Lottie
            animationData={ProfileAnimation}
            loop
            autoplay
            className="w-[350px] md:w-[400px] lg:w-[500px] h-auto"
            rendererSettings={{
              preserveAspectRatio: "xMidYMid slice",
            }}
          />
        </div>
      </div>

      <div className="transparent flex-col p-8 rounded-xl shadow-2xl w-[70%] m-7 max-h-[90vh] overflow-y-auto hide-scrollbar bg-white">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-left text-xl font-semibold text-blue-800">
              Company Details
            </h3>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleProfileChange}
              className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Name"
            />
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleProfileChange}
              className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Company Name"
            />
            <input
              type="text"
              name="gstIN"
              value={formData.gstIN}
              onChange={handleProfileChange}
              className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="GSTIN No."
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleProfileChange}
              className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="Email ID"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-left text-xl font-semibold text-blue-800">
              Warehouses
            </h3>

            {warehouses.map((warehouse, index) => (
              <div
                key={index}
                className="border-2 border-blue-200 p-5 rounded-xl bg-blue-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-blue-700">
                    Warehouse #{index + 1}
                  </h4>
                  {warehouses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWarehouse(index)}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  name="name"
                  value={warehouse.name}
                  onChange={(e) => handleWarehouseChange(index, e)}
                  className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder="Warehouse Name"
                />
                <input
                  type="text"
                  name="capacity"
                  value={warehouse.capacity}
                  onChange={(e) => handleWarehouseChange(index, e)}
                  className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder="Capacity"
                />
                <input
                  type="text"
                  name="contactNo"
                  value={warehouse.contactNo}
                  onChange={(e) => handleWarehouseChange(index, e)}
                  className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  placeholder="Contact Number"
                />

                <details className="text-left">
                  <summary className="cursor-pointer text-blue-600 font-medium py-2">
                    Location Details
                  </summary>
                  <div className="pl-4 pt-2 space-y-2">
                    <input
                      type="text"
                      name="location.line1"
                      value={warehouse.location.line1}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Address Line 1"
                    />
                    <input
                      type="text"
                      name="location.line2"
                      value={warehouse.location.line2}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Address Line 2"
                    />
                    <input
                      type="text"
                      name="location.city"
                      value={warehouse.location.city}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      name="location.state"
                      value={warehouse.location.state}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      name="location.pincode"
                      value={warehouse.location.pincode}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Pincode"
                    />
                    <input
                      type="text"
                      name="location.country"
                      value={warehouse.location.country}
                      onChange={(e) => handleWarehouseChange(index, e)}
                      className="border-2 border-blue-200 p-3 rounded-lg w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Country"
                    />
                  </div>
                </details>
              </div>
            ))}

            <button
              type="button"
              onClick={addWarehouse}
              className="w-[10%]  px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Add
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
