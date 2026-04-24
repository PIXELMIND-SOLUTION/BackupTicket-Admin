import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const categoriesPerPage = 5;

  useEffect(() => {
    axios
      .get("http://31.97.206.144:4061/api/category/getall-cateogry")
      .then((res) => {
        if (res.data && res.data.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

  const exportData = (type) => {
  const exportItems = filteredCategories.map(
    ({ _id, categoryName, createdAt }, index) => ({
      SI: index + 1,
      ID: _id,
      Category: categoryName || "N/A",
      "Created At": createdAt
        ? new Date(createdAt).toLocaleDateString() // ✅ Only Date, no time
        : "N/A",
    })
  );

  const ws = utils.json_to_sheet(exportItems);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Categories");
  writeFile(wb, `categories.${type}`);
};



  const filteredCategories = categories.filter((cat) =>
    (cat.categoryName || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * categoriesPerPage;
  const indexOfFirst = indexOfLast - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.categoryName || "");
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    const updatedCategory = {
      ...selectedCategory,
      categoryName,
    };

    axios
      .put(`http://31.97.206.144:4061/api/category/update/${selectedCategory._id}`, updatedCategory)
      .then(() => {
        setCategories(categories.map((cat) => (cat._id === selectedCategory._id ? updatedCategory : cat)));
        setModalOpen(false);
        setCategoryName("");
        setSelectedCategory(null);
        alert("Category updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating category:", error);
        alert("Error updating category. Please try again.");
      });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    axios
      .delete(`http://31.97.206.144:4061/api/category/delete/${id}`)
      .then(() => {
        setCategories(categories.filter((cat) => cat._id !== id));
        alert("Category deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
      });
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Categories</h2>
      </div>

      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by category name..."
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
        <table className="w-full text-center border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.map((cat, index) => (
              <tr key={cat._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirst}</td>
                <td className="p-2 border">{cat.categoryName || "N/A"}</td>
                <td className="p-2 border">
                  {new Date(cat.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="bg-blue-500 text-white p-1 rounded"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="bg-red-500 text-white p-1 rounded"
                  >
                    <FaTrash />
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

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Category</h3>
            <div>
              <label className="block mb-2">Category Name</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
