import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile, setIsCollapsed }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    if (isMobile && isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        setOpenDropdown(openDropdown === name ? null : name);
      }, 100);
    } else {
      setOpenDropdown(openDropdown === name ? null : name);
    }
  };

  const handleLogout = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://31.97.206.144:4061";
      await axios.post(`${apiUrl}/api/admin/logout`, {}, { withCredentials: true });
      localStorage.removeItem("authToken");
      alert("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const elements = [
    {
      icon: "ri-dashboard-fill",
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: "ri-user-fill",
      name: "Users",
      dropdown: [
        { name: "User List", path: "/users" },
        { name: "User Uploaded Movie List", path: "/usersmovietickets" },
        { name: "User Redemption List", path: "/usersredemption" },
      ],
    },
    {
      icon: "ri-ticket-fill",
      name: "Movie Tickets",
      dropdown: [
        { name: "Create Movie Name", path: "/moviename" },
        { name: "Uploaded Tickets", path: "/usersmovietickets" },
      ],
    },
    {
      icon: "ri-calendar-check-fill",
      name: "Bookings",
      dropdown: [
        { name: "Movie Bookings", path: "/moviebookinglist" },
      ],
    },
    {
      icon: "ri-exchange-dollar-fill",
      name: "Withdrawals",
      dropdown: [
        { name: "Withdrawal Requests", path: "/usersredemption" },
      ],
    },
    {
      icon: "ri-gallery-fill",
      name: "Banners",
      dropdown: [
        { name: "Manage Banners", path: "/banner" },
      ],
    },
    {
      icon: "ri-money-dollar-circle-fill",
      name: "Charges",
      dropdown: [
        { name: "Manage Platform Charges", path: "/platformcharge" },
      ],
    },
    {
      icon: "ri-flag-fill",
      name: "Reports",
      dropdown: [
        { name: "Reported Movie Tickets", path: "/reportedbooking" }
      ],
    },
    {
      icon: "ri-notification-3-fill",
      name: "Notifications",
      dropdown: [
        { name: "Admin Notifications", path: "/getnotifications" }
      ],
    },
    {
      icon: "ri-user-settings-fill",
      name: "Profile",
      path: "/profile",
    },
    {
      icon: "ri-logout-box-fill",
      name: "Logout",
      action: handleLogout,
    },
  ];

  const sidebarWidth = !isMobile 
    ? (isCollapsed ? 'w-16' : 'w-64')
    : (isCollapsed ? 'w-0' : 'w-64');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      <div className={`
        ${sidebarWidth}
        ${isMobile && !isCollapsed ? 'fixed left-0 top-0 z-50' : 'relative'}
        ${isMobile && isCollapsed ? 'hidden' : 'flex'}
        transition-all duration-300 ease-in-out
        h-screen overflow-y-auto no-scrollbar
        flex flex-col
        bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800
        shadow-2xl
      `}>
        {/* Header */}
        <div className="sticky top-0 p-3 sm:p-4 md:p-5 font-bold text-white flex justify-center text-xl sm:text-2xl bg-gradient-to-r from-indigo-800 to-purple-800 border-b border-white border-opacity-10 shadow-lg z-10">
          <span className={`${isCollapsed && !isMobile ? 'hidden' : 'block'} text-sm sm:text-base md:text-xl`}>
            BACKUP Admin
          </span>
          <span className={`${isCollapsed && !isMobile ? 'block' : 'hidden'} text-xl sm:text-2xl md:text-3xl`}>
            BA
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2 mt-2">
          {elements.map((item, idx) => (
            <div key={idx} className="relative">
              {item.dropdown ? (
                <>
                  <div
                    className={`
                      flex items-center py-2.5 sm:py-3 md:py-3.5
                      px-2 sm:px-3 md:px-4
                      font-semibold text-white rounded-xl
                      cursor-pointer transition-all duration-300
                      hover:bg-white hover:bg-opacity-10 hover:shadow-lg hover:scale-105
                      ${openDropdown === item.name ? '' : ''}
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}
                      active:scale-95
                    `}
                    onClick={() => toggleDropdown(item.name)}
                  >
                    <i className={`${item.icon} text-white text-base sm:text-lg md:text-xl`}></i>
                    <span className={`ml-2 sm:ml-3 md:ml-4 text-sm sm:text-base ${isCollapsed && !isMobile ? 'hidden' : 'block'}`}>
                      {item.name}
                    </span>
                    <FaChevronDown
                      className={`
                        ml-auto text-[10px] sm:text-xs transition-transform duration-300
                        ${openDropdown === item.name ? 'rotate-180' : 'rotate-0'}
                        ${isCollapsed && !isMobile ? 'hidden' : 'block'}
                      `}
                    />
                  </div>

                  {openDropdown === item.name && (
                    <div className={`
                      mt-1 sm:mt-2
                      ${isCollapsed && !isMobile ? 'ml-0' : 'ml-3 sm:ml-4 md:ml-6'}
                      pl-2 sm:pl-3 md:pl-4
                      border-l-2 border-white border-opacity-30
                      transition-all duration-300
                    `}>
                      {item.dropdown.map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          to={subItem.path}
                          className={`
                            flex items-center py-1.5 sm:py-2 md:py-2.5
                            text-white text-opacity-90 hover:text-white
                            transition-all duration-300 group
                            text-sm sm:text-base
                          `}
                          onClick={() => {
                            if (isMobile) setIsCollapsed(true);
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 mr-2 sm:mr-3 group-hover:scale-125 transition-transform"></span>
                          <span className="font-medium group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform">
                            {subItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path || "#"}
                  className={`
                    flex items-center py-2.5 sm:py-3 md:py-3.5
                    px-2 sm:px-3 md:px-4
                    font-semibold text-white rounded-xl
                    transition-all duration-300
                    hover:bg-white hover:bg-opacity-10 hover:shadow-lg hover:scale-105
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                    active:scale-95
                    no-underline
                  `}
                  onClick={(e) => {
                    if (item.action) {
                      e.preventDefault();
                      item.action();
                    }
                    if (isMobile) setIsCollapsed(true);
                  }}
                >
                  <i className={`${item.icon} text-white text-base sm:text-lg md:text-xl`}></i>
                  <span className={`ml-2 sm:ml-3 md:ml-4 text-sm sm:text-base ${isCollapsed && !isMobile ? 'hidden' : 'block'}`}>
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 sm:p-3 md:p-4 text-center text-white text-opacity-50 text-[10px] sm:text-xs border-t border-white border-opacity-10">
          <span className={`${isCollapsed && !isMobile ? 'hidden' : 'block'}`}>
            © 2024 Backup Ticket
          </span>
        </div>
      </div>

      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Remove underline from all links */
        a, a:hover, a:focus, a:active {
          text-decoration: none !important;
        }
        
        /* Smooth scrolling */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Better touch targets on mobile */
        @media (max-width: 768px) {
          button, 
          a,
          [role="button"] {
            min-height: 44px;
          }
        }
        
        /* Prevent horizontal scroll */
        body {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
};

export default Sidebar;