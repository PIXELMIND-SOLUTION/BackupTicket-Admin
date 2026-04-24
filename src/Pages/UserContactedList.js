import { useState, useEffect } from "react";
import { utils, writeFile } from "xlsx";
import axios from "axios";

export default function UserContactedList() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 5;

  useEffect(() => {
    fetchContactMessages();
  }, []);

  const fetchContactMessages = () => {
    axios
      .get("http://31.97.206.144:4061/api/users/getallcontactus")
      .then((res) => {
        if (res.data && res.data.contactUsMessages) {
          setContacts(res.data.contactUsMessages);
        }
      })
      .catch((error) => {
        console.error("Error fetching contact messages:", error);
      });
  };

  const exportData = (type) => {
    const exportContacts = filteredContacts.map(({ name, email, phone, message, createdAt }) => ({
      name: name || "N/A",
      email: email || "N/A",
      phone: phone || "N/A",
      message: message || "N/A",
      contactedOn: new Date(createdAt).toLocaleDateString(),
    }));
    const ws = utils.json_to_sheet(exportContacts);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "ContactMessages");
    writeFile(wb, `contact-messages.${type}`);
  };

  const filteredContacts = contacts.filter((contact) =>
    (contact.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  return (
    <div className="p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-900">User Contacted List</h2>
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
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Message</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {currentContacts.map((contact, index) => (
              <tr key={contact._id} className="border-b">
                <td className="p-2 border">{index + 1 + indexOfFirstContact}</td>
                <td className="p-2 border">{contact.name || "N/A"}</td>
                <td className="p-2 border">{contact.email || "N/A"}</td>
                <td className="p-2 border">{contact.phone || "N/A"}</td>
                <td className="p-2 border">{contact.message || "N/A"}</td>
                <td className="p-2 border">
                  {new Date(contact.createdAt).toLocaleDateString()}
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
    </div>
  );
}
