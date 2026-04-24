import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";

const GetContactUsPage = () => {
  const [contactUsData, setContactUsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state & form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMsg, setCurrentMsg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    address: "",
  });

  const fetchContactUsData = async () => {
    try {
      const response = await axios.get("http://31.97.206.144:4061/api/admin/getcontactus");
      setContactUsData(response.data);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
      setError("Failed to fetch contact messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactUsData();
  }, []);

  // Open modal and fill form data
  const openEditModal = (msg) => {
    setCurrentMsg(msg);
    setFormData({
      name: msg.name || "",
      email: msg.email || "",
      subject: msg.subject || "",
      message: msg.message || "",
      address: msg.address || "",
    });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setCurrentMsg(null);
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updated data
  const handleUpdateSubmit = async () => {
    if (!currentMsg) return;

    try {
      await axios.put(
        `http://31.97.206.144:4061/api/admin/updatecontactmessage/${currentMsg._id}`,
        formData
      );
      alert("Message updated successfully!");
      fetchContactUsData();
      closeModal();
    } catch (error) {
      console.error("Error updating message:", error);
      alert("Failed to update message.");
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletecontactmessage/${id}`);
      alert("Message deleted successfully!");
      fetchContactUsData();
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-blue-900 mb-6">Contact Us Messages</h2>

      {loading && <p>Loading contact messages...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && contactUsData.length === 0 && (
        <p className="text-gray-600">No messages found.</p>
      )}

      {!loading &&
        contactUsData.map((msg, index) => (
          <div
            key={msg._id}
            className="mb-6 p-4 border border-gray-200 rounded shadow-sm bg-gray-50"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Message {index + 1} from {msg.name}
            </h3>
            <p className="text-sm text-gray-600">Email: {msg.email}</p>
            <p className="text-sm text-gray-600">Subject: {msg.subject}</p>
            <p className="text-gray-800 my-2">Message: {msg.message}</p>
            <p className="text-xs text-gray-500">
              Submitted on: {new Date(msg.createdAt).toLocaleString()}
            </p>

            <div className="mt-3 flex gap-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => openEditModal(msg)}
              >
                Update
              </button>
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-blue-300 transition"
                onClick={() => handleDelete(msg._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>Edit Contact Message</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
              />
            </FormGroup>

            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
            </FormGroup>

            <FormGroup>
              <Label for="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                type="text"
              />
            </FormGroup>

            <FormGroup>
              <Label for="message">Message</Label>
              <Input
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                type="textarea"
              />
            </FormGroup>

            <FormGroup>
              <Label for="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                type="text"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdateSubmit}>
            Save
          </Button>{" "}
          <Button color="secondary" onClick={closeModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default GetContactUsPage;
