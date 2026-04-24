import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";

const PlanList = () => {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planFeatures, setPlanFeatures] = useState("");
  const plansPerPage = 5;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get("http://31.97.206.144:4061/api/plans/getallplan");
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const exportData = (type) => {
  const exportItems = filteredPlans.map(
    (
      { _id, name, originalPrice, offerPrice, discountPercentage, duration, features = [] },
      index
    ) => ({
      SI: index + 1,
      ID: _id,
      PlanName: name || "N/A",
      OriginalPrice: originalPrice !== undefined ? `₹${originalPrice}` : "N/A",
      OfferPrice: offerPrice !== undefined ? `₹${offerPrice}` : "N/A",
      DiscountPercentage: discountPercentage !== undefined ? `${discountPercentage}%` : "N/A",
      Duration: duration || "N/A",
      Features: features.length ? features.join(", ") : "N/A",
    })
  );

  const ws = utils.json_to_sheet(exportItems);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Plans");
  writeFile(wb, `plans.${type}`);
};


  const filteredPlans = plans.filter((plan) =>
    (plan.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastPlan = currentPage * plansPerPage;
  const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
  const currentPlans = filteredPlans.slice(indexOfFirstPlan, indexOfLastPlan);
  const totalPages = Math.ceil(filteredPlans.length / plansPerPage);

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setPlanName(plan.name || "");
    setPlanPrice(plan.offerPrice || "");
    setPlanFeatures(plan.features.join(", ") || "");
    setIsModalOpen(true);
  };

  const handleSaveChanges = () => {
    const updatedPlan = {
      ...selectedPlan,
      name: planName,
      offerPrice: planPrice,
      features: planFeatures.split(","),
    };

    axios
      .put(`http://31.97.206.144:4061/api/plans/update/${selectedPlan._id}`, updatedPlan)
      .then(() => {
        setPlans(plans.map((plan) => (plan._id === selectedPlan._id ? updatedPlan : plan)));
        setIsModalOpen(false);
        alert("Plan updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating plan:", error);
        alert("Error updating plan. Please try again.");
      });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;

    axios
      .delete(`http://31.97.206.144:4061/api/plans/delete/${id}`)
      .then(() => {
        setPlans(plans.filter((plan) => plan._id !== id));
        alert("Plan deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting plan:", error);
        alert("Error deleting plan. Please try again.");
      });
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">All Plans</h2>
      </div>

      {/* Search and Export section */}
      <div className="flex justify-between mb-4">
        <input
          className="w-1/3 p-2 border rounded"
          placeholder="Search by plan name..."
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

      {/* Table Section */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-purple-600 text-white">
              <th className="p-2 border">Sl</th>
              <th className="p-2 border">Plan Name</th>
              <th className="p-2 border">Original Price</th>
              <th className="p-2 border">Offer Price</th>
              <th className="p-2 border">Discount (%)</th>
              <th className="p-2 border">Duration</th>
              <th className="p-2 border">Features</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPlans.map((plan, index) => (
              <tr key={plan._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirstPlan}</td>
                <td className="p-2 border">{plan.name}</td>
                <td className="p-2 border">₹{plan.originalPrice}</td>
                <td className="p-2 border">₹{plan.offerPrice}</td>
                <td className="p-2 border">{plan.discountPercentage}%</td>
                <td className="p-2 border">{plan.duration}</td>
                <td className="p-2 border">
                  <details>
                    <summary className="cursor-pointer text-blue-600">View</summary>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {plan.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </details>
                </td>
                <td className="p-2 border text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEdit(plan)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(plan._id)}
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
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Edit Plan</h3>
            <div>
              <label className="block mb-2">Plan Name</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div>
              <label className="block mb-2">Offer Price</label>
              <input
                type="number"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div>
              <label className="block mb-2">Features (comma separated)</label>
              <input
                type="text"
                value={planFeatures}
                onChange={(e) => setPlanFeatures(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
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
};

export default PlanList;
