import { useState, useEffect } from "react";
import { MdShoppingCart } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ setIsCollapsed, isCollapsed, isMobile }) => {
  const navigate = useNavigate();
  const [redemptionCount, setRedemptionCount] = useState(0);

  useEffect(() => {
    const fetchRedemptionRequests = async () => {
      try {
        const response = await axios.get("http://31.97.228.17:8127/api/admin/redemption-requests");
        
        if (response.data.success && response.data.redemptionRequests) {
          const totalRequests = response.data.redemptionRequests.length;
          setRedemptionCount(totalRequests);
        } else {
          setRedemptionCount(0);
        }
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
        setRedemptionCount(0);
      }
    };

    fetchRedemptionRequests();
    const intervalId = setInterval(fetchRedemptionRequests, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRedemptionClick = () => {
    navigate("/usersredemption");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 text-white sticky top-0 w-full p-2 sm:p-3 flex items-center shadow-2xl z-50">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="text-xl p-1.5 sm:p-2 hover:scale-105 transition-transform focus:outline-none active:scale-95"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-xl sm:text-2xl text-white" />
        ) : (
          <RiMenu3Line className="text-xl sm:text-2xl text-white" />
        )}
      </button>

      <div className="flex justify-between items-center w-full ml-2 sm:ml-0">
        <div className="flex gap-2 sm:gap-3 md:gap-4 ml-1 sm:ml-4 items-center">
          <button
            onClick={handleRedemptionClick}
            className="relative px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white/15 hover:bg-white/25 rounded-lg text-xs sm:text-sm md:text-base font-semibold flex items-center gap-1 sm:gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm whitespace-nowrap active:scale-95"
          >
            <MdShoppingCart className="text-sm sm:text-base md:text-xl" />
            <span className="hidden min-[400px]:inline">Redemption Requests</span>
            <span className="min-[400px]:hidden">Req</span>
            {redemptionCount > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full min-w-[1.25rem] h-5 text-[0.7rem] sm:text-xs flex items-center justify-center shadow-lg animate-pulse px-1">
                {redemptionCount > 99 ? '99+' : redemptionCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2 sm:gap-3 md:gap-4 items-center">
          <div className="flex flex-col justify-center items-center">
            <img
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-2 border-white/30 shadow-lg object-cover"
              src="https://cdn-icons-gif.flaticon.com/11783/11783157.gif"
              alt="BACKUP TICKET Logo"
            />
            <h1 className="text-[10px] sm:text-xs md:text-sm font-bold mt-0.5 sm:mt-1 text-white tracking-wider hidden min-[480px]:block">
              BACKUP TICKET
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;