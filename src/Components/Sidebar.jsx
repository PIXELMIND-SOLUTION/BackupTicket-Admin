import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = async () => {
    try {
      // Get API URL based on environment
      const apiUrl = process.env.REACT_APP_API_URL || "http://31.97.206.144:4061";

      // Make the POST request to the logout API
      await axios.post(`${apiUrl}/api/admin/logout`, {}, { withCredentials: true });

      // Remove the token from localStorage
      localStorage.removeItem("authToken");

      // Alert the user and redirect to login
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: <i className="ri-dashboard-fill text-white"></i>,
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <i className="ri-user-fill text-white"></i>,
      name: "Users",
      dropdown: [
        { name: "User List", path: "/users" },
        { name: "User Uploaded Movie List", path: "/usersmovietickets" },
        { name: "User Redemption List", path: "/usersredemption" },
      ],
    },
    {
      icon: <i className="ri-ticket-fill text-white"></i>,
      name: "Movie Tickets",
      dropdown: [
        { name: "Create Movie Name", path: "/moviename" },
        { name: "Uploaded Tickets", path: "/usersmovietickets" },
      ],
    },
    {
      icon: <i className="ri-calendar-check-fill text-white"></i>,
      name: "Bookings",
      dropdown: [
        { name: "Movie Bookings", path: "/moviebookinglist" },
      ],
    },
    {
      icon: <i className="ri-exchange-dollar-fill text-white"></i>,
      name: "Withdrawals",
      dropdown: [
        { name: "Withdrawal Requests", path: "/usersredemption" },
      ],
    },
    {
      icon: <i className="ri-gallery-fill text-white"></i>,
      name: "Banners",
      dropdown: [
        { name: "Manage Banners", path: "/banner" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-circle-fill text-white"></i>, // any icon you like
      name: "Charges",
      dropdown: [
        { name: "Manage Platform Charges", path: "/platformcharge" },
      ],
    },
    {
      icon: <i className="ri-flag-fill text-white"></i>,
      name: "Reports",
      dropdown: [
        { name: "Reported Movie Tickets", path: "/reportedbooking" }
      ],
    },
    {
      icon: <i className="ri-notification-3-fill text-white"></i>,
      name: "Notifications",
      dropdown: [
        { name: "Admin Notifications", path: "/getnotifications" }
      ],
    },
    {
      icon: <i className="ri-user-settings-fill text-white"></i>,
      name: "Profile",
      path: "/profile",
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile
        ? (isCollapsed ? "w-0" : "w-64")
        : isCollapsed ? "w-16" : "w-64"
        } h-screen overflow-y-auto no-scrollbar flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 shadow-2xl`}
    >
      {/* Header */}
      <div className="sticky top-0 p-5 font-bold text-white flex justify-center text-2xl bg-gradient-to-r from-indigo-800 to-purple-800 border-b border-white/10 shadow-lg z-10">
        <span className={`${isCollapsed && !isMobile ? "hidden" : "block"}`}>
          BACKUP Admin
        </span>
        <span className={`${isCollapsed && !isMobile ? "block" : "hidden"} text-3xl`}>
          AP
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {elements.map((item, idx) => (
          <div key={idx} className="relative">
            {item.dropdown ? (
              <>
                <div
                  className={`flex items-center py-3.5 px-4 font-semibold text-white rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-[1.02] ${openDropdown === item.name
                    ? "bg-white/15 shadow-lg scale-[1.02]"
                    : ""
                    }`}
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transition-transform duration-300 ${openDropdown === item.name ? "rotate-180" : "rotate-0"
                      } ${isCollapsed && !isMobile ? "hidden" : "block"}`}
                  />
                </div>

                {openDropdown === item.name && (
                  <div className="mt-2 ml-6 pl-4 border-l-2 border-white/30 animate-fadeIn">
                    {item.dropdown.map((subItem, subIdx) => (
                      <Link
                        key={subIdx}
                        to={subItem.path}
                        className="flex items-center py-2.5 text-white/90 hover:text-white transition-all duration-300 group"
                        onClick={() => !isMobile && setOpenDropdown(null)}
                      >
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 mr-3 group-hover:scale-125 transition-transform"></span>
                        <span className="font-medium group-hover:translate-x-2 transition-transform">
                          {subItem.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className={`flex items-center py-3.5 px-4 font-semibold text-white rounded-xl transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:scale-[1.02] no-underline ${isCollapsed && !isMobile ? "justify-center" : ""
                  }`}
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 text-center text-white/50 text-sm border-t border-white/10">
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        /* REMOVE ALL UNDERLINES FROM ALL ELEMENTS */
        a {
          text-decoration: none !important;
        }
        
        .group:hover span {
          text-decoration: none !important;
        }
        
        .hover\\:text-\\[\\#00B074\\]:hover {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;