import { useState, useEffect } from "react";
import { MdShoppingCart } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed }) => {
  const navigate = useNavigate();

  // New state for redemption requests
  const [redemptionCount, setRedemptionCount] = useState(0);

  // Fetch redemption request count
  useEffect(() => {
    const fetchRedemptionRequests = async () => {
      try {
        const response = await axios.get("http://31.97.206.144:8127/api/admin/redemption-requests");
        
        console.log("API Response:", response.data); // Debug ke liye
        
        // Simple count - sabhi requests ka
        if (response.data.success && response.data.redemptionRequests) {
          // Sirf array ki length count karo
          const totalRequests = response.data.redemptionRequests.length;
          setRedemptionCount(totalRequests);
          console.log("Total Redemption Requests:", totalRequests); // Debug
        } else {
          setRedemptionCount(0);
        }
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
        setRedemptionCount(0);
      }
    };

    fetchRedemptionRequests();
    
    // Optional: Refresh every 30 seconds
    const intervalId = setInterval(fetchRedemptionRequests, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleRedemptionClick = () => {
    navigate("/usersredemption");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 text-white sticky top-0 w-full p-3 flex items-center shadow-2xl z-50">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="text-xl p-2 hover:scale-105 transition-transform"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl text-white" />
        ) : (
          <RiMenu3Line className="text-2xl text-white" />
        )}
      </button>

      <div className="flex justify-between items-center w-full">
        {/* Left Side - Redemption Button */}
        <div className="flex gap-6 ml-4 items-center">
          <button
            onClick={handleRedemptionClick}
            className="relative px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm"
          >
            <MdShoppingCart className="text-xl" />
            Redemption Requests
            {redemptionCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-lg animate-pulse">
                {redemptionCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Side - Logo */}
        <div className="flex gap-4 items-center">
          <div className="flex flex-col justify-center items-center">
            <img
              className="rounded-full w-16 h-16 border-2 border-white/30 shadow-lg"
              src="https://cdn-icons-gif.flaticon.com/11783/11783157.gif"
              alt="BACKUP TICKET Logo"
            />
            <h1 className="text-sm font-bold mt-1 text-white tracking-wider">BACKUP TICKET</h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;