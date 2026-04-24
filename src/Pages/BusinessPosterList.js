import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { utils, writeFile } from "xlsx";
import axios from "axios";

const BusinessCardList = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editedCardData, setEditedCardData] = useState({
    name: "",
    category: "",
    price: "",
    offerPrice: "",
    description: "",
    size: "",
    inStock: false,
  });

  const cardsPerPage = 5;

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = () => {
    axios
      .get("http://31.97.206.144:4061/api/admin/getbusinesscards")
      .then((res) => {
        if (res.data) {
          setCards(res.data);
        }
      })
      .catch((err) => console.error("Error fetching cards:", err));
  };

  const exportData = (type) => {
    const exportData = filteredCards.map(
      ({ _id, name, category, price, offerPrice, description, size, inStock }) => ({
        id: _id,
        name,
        category,
        price,
        offerPrice,
        description,
        size,
        inStock: inStock ? "Yes" : "No",
      })
    );
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Business Cards");
    writeFile(wb, `business_cards.${type}`);
  };

  const filteredCards = cards.filter((card) =>
    card.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * cardsPerPage;
  const indexOfFirst = indexOfLast - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const handleEdit = (card) => {
    setSelectedCard(card);
    setEditedCardData({
      name: card.name,
      category: card.category,
      price: card.price,
      offerPrice: card.offerPrice,
      description: card.description,
      size: card.size,
      inStock: card.inStock,
    });
    setModalOpen(true);
  };

  const handleSaveChanges = () => {
    axios
      .put(`http://31.97.206.144:4061/api/admin/updatebusinesscard/${selectedCard._id}`, editedCardData)
      .then(() => {
        alert("Business Card updated successfully!");
        fetchCards();
        setModalOpen(false);
        setSelectedCard(null);
      })
      .catch((err) => {
        console.error("Update failed:", err);
        alert("Failed to update card.");
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    axios
      .delete(`http://31.97.206.144:4061/api/admin/deletebusinesscard/${id}`)
      .then(() => {
        alert("Card deleted successfully!");
        setCards(cards.filter((card) => card._id !== id));
      })
      .catch((err) => {
        console.error("Delete failed:", err);
        alert("Failed to delete card.");
      });
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">Business Cards</h2>
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
              <th className="p-2 border">Images</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Offer</th>
              <th className="p-2 border">Desc</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentCards.map((card, idx) => (
              <tr key={card._id}>
                <td className="p-2 border">{indexOfFirst + idx + 1}</td>
                <td className="p-2 border">
                  <div className="flex gap-2">
                    {card.images?.slice(0, 2).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="img"
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => (e.target.src = "/default-image.jpg")}
                      />
                    ))}
                  </div>
                </td>
                <td className="p-2 border">{card.name}</td>
                <td className="p-2 border">{card.category}</td>
                <td className="p-2 border">₹{card.price}</td>
                <td className="p-2 border">₹{card.offerPrice}</td>
                <td className="p-2 border">{card.description}</td>
                <td className="p-2 border">{card.size}</td>
                <td className="p-2 border">{card.inStock ? "Yes" : "No"}</td>
                <td className="p-2 border flex gap-1">
                  <button className="bg-blue-500 text-white p-1 rounded" onClick={() => handleEdit(card)}>
                    <FaEdit />
                  </button>
                  <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleDelete(card._id)}>
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
            <h3 className="text-xl font-semibold mb-4">Edit Business Card</h3>
            <div className="grid grid-cols-1 gap-3">
              {["name", "category", "price", "offerPrice", "description", "size"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={editedCardData[field]}
                  onChange={(e) => setEditedCardData({ ...editedCardData, [field]: e.target.value })}
                  className="p-2 border rounded"
                />
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedCardData.inStock}
                  onChange={(e) => setEditedCardData({ ...editedCardData, inStock: e.target.checked })}
                />
                <label>In Stock</label>
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={handleSaveChanges} className="bg-blue-500 text-white px-4 py-2 rounded">
                Save
              </button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCardList;
