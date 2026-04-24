import { useState, useEffect, useRef } from "react";
import { MdShoppingCart } from "react-icons/md";
import { RiMenu2Line, RiMenu3Line } from "react-icons/ri";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import sound from "../assets/notifacation.mp3";
const Navbar = ({ setIsCollapsed, isCollapsed, isMobile }) => {
  const navigate = useNavigate();

  const [redemptionCount, setRedemptionCount] = useState(0);

  // 🔔 Notification states
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // 🔊 Audio Ref
  const audioRef = useRef(null);

  // 🛒 Redemption API
  useEffect(() => {
    const fetchRedemptionRequests = async () => {
      try {
        const response = await axios.get(
          "http://31.97.228.17:8127/api/admin/redemption-requests"
        );

        if (response.data.success && response.data.redemptionRequests) {
          setRedemptionCount(response.data.redemptionRequests.length);
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

  // 🔔 Notifications API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://31.97.228.17:8127/api/admin/getnotifications/695d04dc805a43b7744d898a"
        );

        if (res.data.success) {
          const list = res.data.notifications || [];

          // Count
          setNotificationCount(list.length);

          if (list.length > 0) {
            const latest = list[0];

            if (!lastNotificationId) {
              setLastNotificationId(latest._id);
            } else if (latest._id !== lastNotificationId) {
              // 🚀 NEW NOTIFICATION
              setNewMessage(latest.message);
              setShowModal(true);
              setLastNotificationId(latest._id);
            }
          }
        }
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [lastNotificationId]);

  // 🔊 Play sound when modal opens
  useEffect(() => {
    if (showModal && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.6;
      audioRef.current.play().catch(() => {});
    }

    if (!showModal && audioRef.current) {
      audioRef.current.pause();
    }
  }, [showModal]);

  const handleRedemptionClick = () => {
    navigate("/usersredemption");
  };

  return (
    <>
      {/* 🔊 Hidden Audio */}
      <audio ref={audioRef} src={sound} preload="auto" />

      {/* 🔔 Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center animate-scaleIn">
            <h2 className="text-lg font-bold mb-3 text-[#EB6664]">
              🔔 New Notification
            </h2>

            <p className="text-gray-700 text-sm mb-5">{newMessage}</p>

            <button
              onClick={() => setShowModal(false)}
              className="bg-[#EB6664] text-white px-5 py-2 rounded-lg hover:bg-[#d95553] transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 text-white sticky top-0 w-full p-2 sm:p-3 flex items-center shadow-2xl z-50">

        {/* Menu Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xl p-2 hover:scale-105 transition"
        >
          {isCollapsed ? (
            <RiMenu2Line className="text-xl sm:text-2xl" />
          ) : (
            <RiMenu3Line className="text-xl sm:text-2xl" />
          )}
        </button>

        <div className="flex justify-between items-center w-full ml-2 sm:ml-0">

          {/* Left Section */}
          <div className="flex gap-3 ml-4 items-center">

            {/* 🔔 Notification Bell */}
            <button
              onClick={() => navigate("/getnotifications")}
              className="relative px-3 py-2 bg-white/15 hover:bg-white/25 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            >
              <IoNotifications className="text-lg" />

              <span className="hidden sm:inline text-sm font-semibold">
                {notificationCount}
              </span>

              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-xs flex items-center justify-center animate-pulse px-1">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {/* 🛒 Redemption */}
            <button
              onClick={handleRedemptionClick}
              className="relative px-3 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:scale-105 backdrop-blur-sm"
            >
              <MdShoppingCart />
              <span className="hidden sm:inline">Redemption Requests</span>
              <span className="sm:hidden">Req</span>

              {redemptionCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-xs flex items-center justify-center animate-pulse px-1">
                  {redemptionCount > 99 ? "99+" : redemptionCount}
                </span>
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <img
                className="rounded-full w-12 h-12 border-2 border-white/30 shadow-lg object-cover"
                src="https://cdn-icons-gif.flaticon.com/11783/11783157.gif"
                alt="Logo"
              />
              <h1 className="text-xs font-bold mt-1 hidden sm:block">
                BACKUP TICKET
              </h1>
            </div>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;