import { FaUserCircle, FaHome, FaBell, FaCog } from "react-icons/fa";
import PropTypes from "prop-types";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ user }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    console.log("User Data:", user);
  }, [user]);

  const logout = () => {
    window.open(`${import.meta.env.VITE_API_URL}/auth/logout`, "_self");
  };

  const navigationLinks = [
    {
      name: "Quick Create",
      href: "/home",
      description: "Go to Home",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      name: "Notifications",
      href: "/notification",
      description: "View Notifications",
      icon: <FaBell className="w-5 h-5" />,
    },
    {
      name: "Settings",
      href: "/settings",
      description: "Adjust Settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full h-[71px] bg-gray-800 shadow-md flex items-center justify-end px-[2%]">
      <div className="relative flex items-center h-full ml-">
        {/* Active/Hover Background */}
        <motion.div
          className="absolute h-10 w-10 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-lg shadow-lg"
          initial={false}
          animate={{
            x: activeIndex * 80,
            scale: hoveredIndex === activeIndex ? 1.1 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />

        <div className="flex gap-8 relative z-10">
          {navigationLinks.map((link, index) => (
            <motion.div
              key={link.name}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveIndex(index)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.a
                href={link.href}
                className="relative flex flex-col items-center"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                  flex items-center justify-center w-10 h-10 rounded-lg
                  transition-colors duration-200
                  ${index === activeIndex ? "text-gray-900" : "text-cyan-300"}
                  ${hoveredIndex === index && index !== activeIndex ? "text-cyan-400" : ""}
                `}
                >
                  {link.icon}
                </div>

                <AnimatePresence>
                  {hoveredIndex === index && index !== activeIndex && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-700 px-3 py-1.5 rounded-md shadow-lg z-50"
                    >
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45" />
                      <span className="text-xs font-medium text-cyan-300">
                        {link.description}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Profile Menu */}
      <NavigationMenu className="ml-12">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="flex ml-10 items-center gap-2 bg-gray-800 w-15   h-15 p-2 rounded-md shadow-md hover:bg-cyan-500 hover:text-gray-900 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-300">
              <img
                src={user?.profileImg}
                alt="Profile"
                className="w-full h-10 rounded-full"
              />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="absolute bg-gray-50 shadow-lg rounded-md mt-2 w-48 opacity-100 visible transition-transform transform scale-95 group-hover:scale-100">
              <div className="p-4">
                <NavigationMenuLink
                  href="/profile"
                  className="block text-sm text-slate-900 font-semibold hover:bg-gray-200 hover:text-gray-900 px-4 py-2 rounded transition-colors"
                >
                  Profile
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="/billing"
                  className="block text-sm text-slate-900 font-semibold hover:bg-gray-200 hover:text-gray-900 px-4 py-2 rounded transition-colors"
                >
                  Billing
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="/team"
                  className="block text-sm text-slate-900 font-semibold hover:bg-gray-200  hover:text-gray-900 px-4 py-2 rounded transition-colors"
                >
                  Team
                </NavigationMenuLink>
                <NavigationMenuLink
                  href="/subscription"
                  className="block text-sm text-slate-900 font-semibold hover:bg-gray-200  hover:text-gray-900 px-4 py-2 rounded transition-colors"
                >
                  Subscription
                </NavigationMenuLink>
                <NavigationMenuLink
                  onClick={logout}
                  className="block text-sm text-slate-900 font-semibold hover:bg-gray-200 hover:text-gray-900 px-4 py-2 rounded cursor-pointer transition-colors"
                >
                  Logout
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
Navbar.propTypes = {
  user: PropTypes.shape({
    profileImg: PropTypes.string,
  }),
};

export default Navbar;
