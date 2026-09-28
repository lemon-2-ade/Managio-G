"use client";
import GST from "../assets/gstTreat.svg";
import logoMark from "../assets/simply.svg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Package,
  Handshake,
  ShoppingCart,
  BarChart3,
  Building2,
  Smartphone,
  Menu,
  X,
} from "lucide-react";
// Components to Render
function ComponentOne() {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-lg">
      <motion.div 
        initial={{ x: "-50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full md:w-3/5 flex items-center justify-center"
      > 
        <img src={GST} className="w-4/5 max-w-md shadow-lg rounded-lg" alt="GST Illustration" />
      </motion.div>
      
      <motion.div 
        initial={{ x: "50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        className="w-full md:w-2/5 text-center md:text-left"
      >
        <h3 className="text-3xl font-bold text-teal-400 mb-4">
          Save GSTINs
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          Keep a central record of the GSTIN for the registered
          businesses and save time from manually entering it every
          time.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-all"
        >
          Learn More
        </motion.button>
      </motion.div>
    </div>
  );
}

function ComponentTwo() {
  return (
    <div className="w-full flex flex-col md:flex-row-reverse items-center justify-between gap-8 p-6 rounded-lg">
      <motion.div 
        initial={{ x: "50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full md:w-3/5 flex items-center justify-center"
      > 
        <div className="w-4/5 max-w-md h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-teal-800 shadow-lg shadow-teal-900/20">
          <div className="text-center p-6">
            <span className="text-2xl font-bold text-teal-300 block mb-3">HSN/SAC Codes</span>
            <p className="text-gray-300">Quickly search and apply the right codes to your products</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ x: "-50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        className="w-full md:w-2/5 text-center md:text-left"
      >
        <h3 className="text-3xl font-bold text-teal-400 mb-4">
          HSN/SAC Codes
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          Easily assign accurate HSN/SAC codes to all your products and services.
          Make tax calculations simpler and ensure compliance with GST regulations.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-all"
        >
          View Codes
        </motion.button>
      </motion.div>
    </div>
  );
}

function ComponentThree() {
  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 p-6 rounded-lg">
      <motion.div 
        initial={{ x: "-50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full md:w-3/5 flex items-center justify-center"
      > 
        <div className="w-4/5 max-w-md h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-teal-800 shadow-lg shadow-teal-900/20">
          <div className="text-center p-6">
            <span className="text-2xl font-bold text-teal-300 block mb-3">Invoice Generator</span>
            <p className="text-gray-300">Professional, compliant invoices in seconds</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ x: "50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        className="w-full md:w-2/5 text-center md:text-left"
      >
        <h3 className="text-3xl font-bold text-teal-400 mb-4">
          GST Invoices
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          Generate GST-compliant invoices with all required fields automatically 
          populated. Customize templates to match your brand identity.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-all"
        >
          Create Invoice
        </motion.button>
      </motion.div>
    </div>
  );
}

function ComponentFour() {
  return (
    <div className="w-full flex flex-col md:flex-row-reverse items-center justify-between gap-8 p-6 rounded-lg">
      <motion.div 
        initial={{ x: "50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full md:w-3/5 flex items-center justify-center"
      > 
        <div className="w-4/5 max-w-md h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-teal-800 shadow-lg shadow-teal-900/20">
          <div className="text-center p-6">
            <span className="text-2xl font-bold text-teal-300 block mb-3">Tax Calculator</span>
            <p className="text-gray-300">Automatic calculations based on item category and location</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ x: "-50%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
        className="w-full md:w-2/5 text-center md:text-left"
      >
        <h3 className="text-3xl font-bold text-teal-400 mb-4">
          Tax Management
        </h3>
        <p className="text-lg text-gray-300 leading-relaxed">
          Automatically calculate correct tax rates based on item category and customer location.
          Generate tax reports to simplify your GST filing process.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-all"
        >
          Calculate Taxes
        </motion.button>
      </motion.div>
    </div>
  );
}

// First View
function FirstView() {
  const [selectedComponent, setSelectedComponent] = useState(null);
  
  const handleTask = (component) => {
    setSelectedComponent(component);
  };
  
  useEffect(() => {
    handleTask(<ComponentOne />);
  }, []);

  return (
    <section className="flex items-center justify-center py-20 relative bg-gradient-to-b from-black to-gray-900">
      <div className="w-full max-w-7xl mx-auto bg-black/60 rounded-xl p-8 z-10 relative
    border border-teal-900
    shadow-2xl
    backdrop-blur-md">
        <div className="w-full flex flex-col items-center">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-teal-400 text-center mb-12"
          >
            What makes Managio Inventory GST Compliant
          </motion.h2>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap w-full mb-10 gap-2">
            <TabButton label="GSTIN" onClick={() => handleTask(<ComponentOne />)} />
            <TabButton label="HSN/SAC CODES" onClick={() => handleTask(<ComponentTwo />)} />
            <TabButton label="INVOICES" onClick={() => handleTask(<ComponentThree />)} />
            <TabButton label="TAXES" onClick={() => handleTask(<ComponentFour />)} />
          </div>
          
          {/* Rendered Component Below */}
          {selectedComponent && (
            <div className="w-full">{selectedComponent}</div>
          )}
        </div>
      </div>
    </section>
  );
}

// Tab Button Component
function TabButton({ label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex-1 min-w-[150px] py-4 px-2 m-1 rounded-lg text-gray-300 font-bold transition-all bg-gray-800 hover:bg-teal-900 hover:text-white relative overflow-hidden
        after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-teal-500
        after:scale-x-0 after:origin-center
        after:transition-transform after:duration-300 after:ease-in-out
        hover:after:scale-x-100 shadow-md"
    >
      {label}
    </motion.button>
  );
}

// Second View
function SecondView() {
  return (
    <section id="features" className="min-h-screen flex items-center justify-center py-16 bg-gradient-to-br from-gray-900 via-gray-900 to-teal-900 "
  
    >
      <div className="w-4/5 max-w-7xl mx-auto rounded-lg p-8">
        <div className="w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg mb-12 border-b border-teal-800"
          >
            <h2 className="text-3xl font-bold text-teal-400 text-center">Explore the Features</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            <FeatureCard
              title="Stock Management"
              icon={Package}
              description="Real-time inventory tracking and management"
            />
            <FeatureCard
              title="Supplier Management"
              icon={Handshake}
              description="Track all your supplier relationships in one place"
            />
            <FeatureCard
              title="Order Processing"
              icon={ShoppingCart}
              description="Streamline your order fulfillment workflow"
            />
            <FeatureCard
              title="Reporting"
              icon={BarChart3}
              description="Detailed insights and analytics for better decisions"
            />
            <FeatureCard
              title="Multi-location"
              icon={Building2}
              description="Manage inventory across multiple warehouses"
            />
            <FeatureCard
              title="Mobile Access"
              icon={Smartphone}
              description="Access your inventory system from anywhere"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Feature Card Component
function FeatureCard({ title, icon: Icon, description }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="bg-gray-900 rounded-xl flex flex-col items-center justify-center p-8 transition-shadow cursor-default border-t border-teal-800 shadow-lg hover:shadow-xl"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10">
        <Icon size={22} className="text-teal-400" />
      </div>
      <span className="text-lg font-semibold text-gray-100 mb-1.5">{title}</span>
      <p className="text-sm text-gray-400 text-center">{description}</p>
    </motion.div>
  );
}

const Navbar = ({ user }) => {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Show navbar when scrolled down 100px from the top
      if (window.scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md border-b border-teal-900 shadow-lg"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <a href="#" className="text-lg font-semibold text-white flex items-center gap-2">
            <img src={logoMark} alt="" className="h-6 w-6" />
            Managio
          </a>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-200 hover:text-teal-400 focus:outline-none"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-teal-400 font-medium transition-colors">Home</a>
            <a href="#features" className="text-gray-300 hover:text-teal-400 font-medium transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-teal-400 font-medium transition-colors">Pricing</a>
            <a href="#contact" className="text-gray-300 hover:text-teal-400 font-medium transition-colors">Contact</a>
          </div>
          
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-gray-300 font-medium">
                  {user.name || 'User'}
                </div>
                <div className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="h-10 w-10 rounded-full overflow-hidden border-2 border-teal-500 cursor-pointer shadow-md"
                  >
                    {user.profileImg ? (
                      <img 
                        src={user.profileImg} 
                        alt={user.name || 'User'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-teal-700 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                        {(user.name?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                  </motion.div>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-700">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors">Profile</a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors">Settings</a>
                    <a href="/logout" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-teal-400 transition-colors">Logout</a>
                  </div>
                </div>
              </div>
            ) : (
              <motion.button 
                onClick={() => window.location.href = "/login"} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg text-gray-100 font-medium hover:from-teal-600 hover:to-teal-500 transition-all shadow-md"
              >
                Login/Sign Up
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-base font-medium text-white hover:bg-gray-700 rounded-md transition-colors">
                Home
              </a>
              <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                Features
              </a>
              <a href="#pricing" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                Pricing
              </a>
              <a href="#contact" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                Contact
              </a>
            </div>
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border-2 border-teal-500 shadow-md">
                    {user.profileImg ? (
                      <img 
                        src={user.profileImg} 
                        alt={user.name || 'User'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-teal-700 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                        {(user.name?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name || 'User'}</div>
                    <div className="text-sm font-medium text-gray-400">{user.email || ''}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <a href="/profile" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                    Profile
                  </a>
                  <a href="/settings" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                    Settings
                  </a>
                  <a href="/logout" className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors">
                    Logout
                  </a>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex justify-center">
                  <button 
                    onClick={() => window.location.href = "/login"} 
                    className="w-full mx-3 px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg text-gray-100 font-medium hover:from-teal-600 hover:to-teal-500 transition-all shadow-md"
                  >
                    Login/Sign Up
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

// Main Parallax Component
export default function InventoryManagement({user}) {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Navbar - appears on scroll */}
      <Navbar user={user}/>
      
      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-700 filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-teal-700 filter blur-3xl"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-50 drop-shadow-lg">
            Inventory Management Software
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-teal-100 mb-4">
            Designed for Indian Businesses
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            A complete GST-compliant solution to manage your inventory, suppliers, and orders efficiently.
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-12 flex flex-wrap gap-4 justify-center"
          >
            <motion.a 
              onClick={() => window.location.href = "/login"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-teal-700 to-teal-600 rounded-lg text-lg font-bold hover:from-teal-600 hover:to-teal-500 transition-all shadow-lg"
            >
              Access to Managio
            </motion.a>
            <motion.a 
              href="#contact" 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gray-800 rounded-lg text-lg font-bold border border-teal-800 hover:bg-gray-700 transition-all shadow-lg"
            >
              Contact Us
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Parallax Views Container */}
      <div className="flex flex-col">
        <FirstView />
        <SecondView />
      </div>
      
      {/* Footer */}
      <footer className="bg-black py-10 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <div className="w-4/5 max-w-6xl mx-auto bg-black bg-opacity-80 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-teal-400 mb-8">Get Started Today</h2>
              <p className="text-xl text-gray-300 mb-10">
                Join thousands of Indian businesses already using Managio Inventory.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button 
                  onClick={() => window.location.href = "/login"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-teal-600 text-white font-bold text-xl rounded-lg hover:bg-teal-500 transition-colors"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-800 text-teal-300 font-bold text-xl rounded-lg hover:bg-gray-700 transition-colors border border-teal-700"
                >
                  Watch Demo
                </motion.button>
              </div>
            </div>
          </div>
          <p>© 2025 Managio Inventory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}