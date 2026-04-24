import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobile={isMobile} 
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          setIsCollapsed={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
        />
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#EFF0F1] p-3 sm:p-4 md:p-5 lg:p-6">
          <div className="w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}