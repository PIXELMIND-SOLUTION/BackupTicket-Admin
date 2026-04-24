import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

const LogoList = () => {
  const [logos, setLogos] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editedLogoData, setEditedLogoData] = useState({});
  const logosPerPage = 5;

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const res = await axios.get("http://31.97.206.144:4061/api/admin/getlogos");
      setLogos(res.data);
    } catch (error) {
      console.error("Failed to fetch logos", error);
    }
  };

 const exportData = (type) => {
  const exportItems = filteredLogos.map(({ _id, name, image }, index) => ({
    SI: index + 1,
    ID: _id,
    LogoName: name || "N/A",
    LogoImage: image || "N/A",
  }));

  const ws = utils.json_to_sheet(exportItems);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Logos");
  writeFile(wb, `logos.${type}`);
};

  const filteredLogos = logos.filter((logo) =>
    (logo.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * logosPerPage;
  const indexOfFirst = indexOfLast - logosPerPage;
  const currentLogos = filteredLogos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogos.length / logosPerPage);

  const handleEdit = (logo) => {
    setEditedLogoData(logo);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this logo?")) return;
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletelogo/${id}`);
      alert("Logo deleted successfully!");
      fetchLogos();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete logo.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `http://31.97.206.144:4061/api/admin/updatelogo/${editedLogoData._id}`,
        editedLogoData
      );
      alert("Logo updated successfully!");
      setModalOpen(false);
      fetchLogos();
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update logo.");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Logos</h2>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
        <input
          className="w-full md:w-1/3 p-2 border rounded"
          placeholder="Search by logo name..."
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
        <table className="w-full border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Logo Image</th>
              <th className="p-2 border">Logo Name</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentLogos.map((logo, index) => (
              <tr key={logo._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                <td className="p-2 border">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-12 h-12 object-cover rounded mx-auto"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/50")}
                  />
                </td>
                <td className="p-2 border">{logo.name || "N/A"}</td>
                <td className="p-2 border">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(logo)}
                      className="bg-blue-500 text-white p-1 rounded"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(logo._id)}
                      className="bg-red-500 text-white p-1 rounded"
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

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Previous
        </button>
        <span className="self-center">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Edit Logo</h3>
            <div>
              <label className="block mb-2">Logo Name</label>
              <input
                type="text"
                value={editedLogoData.name}
                onChange={(e) => setEditedLogoData({ ...editedLogoData, name: e.target.value })}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div>
              <label className="block mb-2">Logo Image URL</label>
              <input
                type="text"
                value={editedLogoData.image}
                onChange={(e) => setEditedLogoData({ ...editedLogoData, image: e.target.value })}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-blue-600 text-white px-4 py-2 rounded"
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

export default LogoList;
