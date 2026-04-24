import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";  // Importing for Excel/CSV export

const OrdersList = () => {
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [search, setSearch] = useState(""); // State for search query
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "http://31.97.206.144:4061/api/users/allorders"
        );
        console.log("API Response:", response.data); // Log the response to check the structure
        if (response.data && response.data.orders) {
          setOrdersData(response.data.orders);
        } else {
          setError("No orders data found.");
        }
      } catch (err) {
        setError("Error fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    console.log("Orders Data:", ordersData);  // Log the ordersData to check if it's being set correctly
  }, [ordersData]);

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleSaveStatus = async () => {
    if (selectedOrder) {
      try {
        await axios.put(
          `http://31.97.206.144:4061/api/users/orderstatus/${selectedOrder._id}`,
          { status: newStatus }
        );

        setOrdersData((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, status: newStatus }
              : order
          )
        );

        setIsModalOpen(false);
      } catch (err) {
        console.error("Error updating status", err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(
          `http://31.97.206.144:4061/api/users/deleteorder/${id}`
        );
        setOrdersData(ordersData.filter((order) => order._id !== id));
        alert("Order deleted successfully.");
      } catch (err) {
        console.error("Error deleting order", err);
      }
    }
  };

  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = ordersData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(ordersData.length / ordersPerPage);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const filteredOrders = ordersData.filter((order) =>
    order.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  console.log("Filtered Orders:", filteredOrders);  // Log filteredOrders to check if filtering works correctly

  // Export CSV or Excel
  const exportData = (type) => {
    const exportItems = filteredOrders.map(({ _id, user, poster, totalAmount, status, orderDate }) => ({
      ID: _id,
      UserName: user?.name || "N/A",
      Poster: poster?.name || "N/A",
      TotalAmount: totalAmount || "N/A",
      Status: status || "N/A",
      OrderDate: new Date(orderDate).toLocaleString(),
    }));

    const ws = utils.json_to_sheet(exportItems);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Orders");
    writeFile(wb, `orders.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-blue-900 mb-6">User Orders</h2>

       <div className="flex items-center justify-between mb-4 w-full">
  <div className="flex-1">
    <input
      className="w-full max-w-xs p-2 border rounded"
      placeholder="Search by user name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  <div className="flex gap-2">
    <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("csv")}>
      CSV
    </button>
    <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("xlsx")}>
      Excel
    </button>
  </div>
</div>
</div>

      {ordersData.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="p-2 border">Sl</th>
                <th className="p-2 border">User Name</th>
                <th className="p-2 border">User Email</th>
                <th className="p-2 border">Payment Method</th>
                <th className="p-2 border">Poster Name</th>
                <th className="p-2 border">Total Amount</th>
                <th className="p-2 border">Order Status</th>
                <th className="p-2 border">Order Date</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order, index) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                  <td className="p-2 border">{order.user?.name || "N/A"}</td>
                  <td className="p-2 border">{order.user?.email || "N/A"}</td>
                  <td className="p-2 border">
                    {order.paymentMethod || order.paymentDetails?.method || "N/A"}
                  </td>
                  <td className="p-2 border">
                    {order.poster?.name || order.businessPoster?.name || "N/A"}
                  </td>
                  <td className="p-2 border">₹{order.totalAmount || 0}</td>
                  <td className="p-2 border">{order.status}</td>
                  <td className="p-2 border">
                    {new Date(order.orderDate).toLocaleString()}
                  </td>
                  <td className="p-2 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="bg-blue-500 text-white p-1 rounded"
                        onClick={() => handleEdit(order)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="bg-red-500 text-white p-1 rounded"
                        onClick={() => handleDelete(order._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Next
        </button>
      </div>
{isModalOpen && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center px-4 z-50">
    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Edit Order Status</h2>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm sm:text-base" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          value={newStatus}
          onChange={handleStatusChange}
          className="p-2 border rounded w-full text-sm sm:text-base"
        >
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-3 py-2 bg-gray-300 rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveStatus}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default OrdersList;
