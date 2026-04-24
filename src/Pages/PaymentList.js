import React, { useState, useEffect } from "react";
import axios from "axios";
import { utils, writeFile } from "xlsx";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://31.97.206.144:4061/api/payment/payments");
        if (response.data.success) {
          const sorted = response.data.payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPayments(sorted);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, []);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format((amount || 0) / 100);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const filteredPayments = payments.filter((payment) =>
    (payment.userId?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const exportTo = (type) => {
    const data = filteredPayments.map((item, index) => ({
      SI: index + 1,
      Name: item.userId?.name || "N/A",
      Email: item.userId?.email || "N/A",
      Plan: item.plan?.name || "N/A",
      Amount: formatAmount(item.amount),
      Status: item.status,
      Method: item.paymentResponse?.method || "N/A",
      "Transaction ID": item.paymentResponse?.id || "N/A",
      Date: formatDate(item.createdAt),
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Payments");
    writeFile(wb, `payments.${type}`);
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-900">Payment History</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by user name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportTo("csv")}>CSV</button>
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportTo("xlsx")}>Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">User</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Plan</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Transaction ID</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item._id}>
                <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                <td className="p-2 border">{item.userId?.name || "N/A"}</td>
                <td className="p-2 border">{item.userId?.email || "N/A"}</td>
                <td className="p-2 border">{item.plan?.name || "N/A"}</td>
                <td className="p-2 border">{formatAmount(item.amount)}</td>
                <td className="p-2 border capitalize">{item.status}</td>
                <td className="p-2 border capitalize">
                  {item.paymentResponse?.method === "netbanking"
                    ? `Netbanking (${item.paymentResponse?.bank || "N/A"})`
                    : item.paymentResponse?.method || "N/A"}
                </td>
                <td className="p-2 border">{item.paymentResponse?.id || "N/A"}</td>
                <td className="p-2 border">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaymentList;
