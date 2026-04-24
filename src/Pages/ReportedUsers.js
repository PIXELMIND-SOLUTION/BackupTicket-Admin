import { useState, useEffect } from "react";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function ReportedUsers() {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchReportedUsers();
  }, []);

  const fetchReportedUsers = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:4061/api/admin/getallreporteduser");
      if (res.data?.users) {
        setReportedUsers(res.data.users);
      }
    } catch (error) {
      console.error("Failed to fetch reported users:", error);
    }
  };

  const handleBlock = async (userId, isBlocked) => {
    const action = isBlocked ? "unblock" : "block";
    const confirmMsg = `Are you sure you want to ${action} this user?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await axios.put(`http://31.97.206.144:4061/api/admin/block-user/${userId}`, {
        block: !isBlocked,
      });

      if (response.data?.isBlocked === !isBlocked) {
        alert(`User has been ${action}ed successfully.`);

        setReportedUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isBlocked: !isBlocked } : user
          )
        );
      } else {
        alert(`Failed to ${action} user. Try again.`);
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(error?.response?.data?.message || `Something went wrong while trying to ${action} the user.`);
    }
  };

  const exportData = (type) => {
    const exportUsers = filteredUsers.map(({ name, email, reportedBy }) => ({
      name,
      email,
      reportCount: reportedBy?.length || 0,
    }));
    const ws = utils.json_to_sheet(exportUsers);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Reported Users");
    writeFile(wb, `reported_users.${type}`);
  };

  const filteredUsers = reportedUsers.filter((user) =>
    (user.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Reported Users</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("csv")}>
            CSV
          </button>
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => exportData("xlsx")}>
            Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Report Count</th>
              <th className="p-2 border">Reported By</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No reported users found.
                </td>
              </tr>
            )}

            {currentUsers.map((user, index) => (
              <tr key={user._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                <td className="p-2 border">{user.name || "N/A"}</td>
                <td className="p-2 border">{user.email || "N/A"}</td>
                <td className="p-2 border">{user.reportedBy?.length || 0}</td>
                <td className="p-2 border space-y-1">
                  {user.reportedBy?.map((rep, idx) => (
                    <div key={idx}>
                      <strong>{rep.name}</strong> ({rep.email})
                    </div>
                  ))}
                </td>
                <td className="p-2 border">
                  <button
                    className={`px-3 py-1 rounded text-white ${
                      user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={() => handleBlock(user._id, user.isBlocked)}
                  >
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          className="bg-blue-500 text-white p-2 rounded"
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
