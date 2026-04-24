import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function PosterList() {
  const [posters, setPosters] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postersPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [editedData, setEditedData] = useState({
    name: "",
    categoryName: "",
    title: "",
    description: ""
  });

  const [previewModalImage, setPreviewModalImage] = useState(null);

  useEffect(() => {
    axios
      .get("http://31.97.206.144:4061/api/poster/getallposter")
      .then((res) => {
        if (res.data) setPosters(res.data);
      })
      .catch((error) => {
        console.error("Error fetching posters:", error);
      });
  }, []);

  const filteredPosters = posters.filter((poster) =>
    (poster.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const currentPosters = filteredPosters.slice(
    (currentPage - 1) * postersPerPage,
    currentPage * postersPerPage
  );

  const totalPages = Math.ceil(filteredPosters.length / postersPerPage);

  const handleDelete = (id) => {
    axios
      .delete(`http://31.97.206.144:4061/api/poster/deleteposter/${id}`)
      .then(() => {
        setPosters(posters.filter((poster) => poster._id !== id));
        alert("Poster deleted successfully!");
      })
      .catch((error) => {
        console.error("Delete error:", error);
      });
  };

  const handleEdit = (poster) => {
    setSelectedPoster(poster);
    setEditedData({
      name: poster.name || "",
      categoryName: poster.categoryName || "",
      title: poster.title || "",
      description: poster.description || ""
    });
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    axios
      .put(`http://31.97.206.144:4061/api/poster/editposter/${selectedPoster._id}`, editedData)
      .then(() => {
        setPosters((prev) =>
          prev.map((p) => (p._id === selectedPoster._id ? { ...p, ...editedData } : p))
        );
        alert("Poster updated successfully!");
        setModalOpen(false);
        setSelectedPoster(null);
      })
      .catch((error) => {
        console.error("Error updating poster:", error);
        alert("Error updating the poster.");
      });
  };

  const exportData = (type) => {
    const exportPosters = filteredPosters.map((poster, i) => ({
      SI: i + 1,
      ID: poster._id,
      PosterName: poster.name || "N/A",
      Category: poster.categoryName || "N/A",
      Title: poster.title || "N/A",
      Description: poster.description || "N/A",
      Tags: Array.isArray(poster.tags) ? poster.tags.join(", ") : "N/A",
      PosterImage: poster.posterImage?.url || "N/A",
      CreatedAt: poster.createdAt ? new Date(poster.createdAt).toLocaleString() : "N/A"
    }));

    const ws = utils.json_to_sheet(exportPosters);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Posters");
    writeFile(wb, `posters.${type}`);
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Posters</h2>
        <div className="flex gap-2">
          <button onClick={() => exportData("csv")} className="bg-gray-200 px-4 py-2 rounded">CSV</button>
          <button onClick={() => exportData("xlsx")} className="bg-gray-200 px-4 py-2 rounded">Excel</button>
        </div>
      </div>

      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Search by poster name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Poster Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentPosters.map((poster, index) => (
              <tr key={poster._id} className="border-b">
                <td className="p-2 border">{index + 1 + (currentPage - 1) * postersPerPage}</td>
                <td className="p-2 border">
                  {poster.posterImage?.url ? (
                    <img
                      src={poster.posterImage.url}
                      alt="poster"
                      className="w-12 h-12 object-cover rounded cursor-pointer"
                      onClick={() => setPreviewModalImage(poster.posterImage.url)}
                      onError={(e) => (e.target.src = "/default-image.jpg")}
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="p-2 border">{poster.title || "N/A"}</td>
                <td className="p-2 border">{poster.name || "N/A"}</td>
                <td className="p-2 border">{poster.categoryName || "N/A"}</td>
                <td className="p-2 border">
                  <div className="max-w-xs truncate" title={poster.description}>
                    {poster.description || "N/A"}
                  </div>
                </td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(poster)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(poster._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Edit Modal - Removed black background */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Poster</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                className="w-full p-2 border rounded"
                placeholder="Name"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Category"
                value={editedData.categoryName}
                onChange={(e) => setEditedData({ ...editedData, categoryName: e.target.value })}
              />
              <input
                className="w-full p-2 border rounded"
                placeholder="Title"
                value={editedData.title}
                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              />
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Description"
                value={editedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="relative">
            <button
              className="absolute -top-8 right-0 text-white bg-red-500 rounded-full p-1"
              onClick={() => setPreviewModalImage(null)}
            >
              <FaTimes size={20} />
            </button>
            <img
              src={previewModalImage}
              alt="Poster Preview"
              className="max-w-full max-h-[90vh] rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}