import React, { useState, useEffect } from 'react';
import {
  Row, Col, Form, FormGroup, Label, Input, Button, Table, Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import axios from 'axios';
import { FaTrash, FaEdit, FaUpload } from 'react-icons/fa';

const CreateBanner = () => {
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const bannersPerPage = 5;
  const totalPages = Math.ceil(banners.length / bannersPerPage);
  const paginatedBanners = banners.slice(
    (currentPage - 1) * bannersPerPage,
    currentPage * bannersPerPage
  );

  const fetchBanners = async () => {
    try {
      const res = await axios.get('http://31.97.206.144:4061/api/poster/getbanners');
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewImages(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!images.length) return alert("Please upload at least one image");

    setIsSubmitting(true);
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));

    try {
      await axios.post('http://31.97.206.144:4061/api/poster/createbanner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Banner created successfully');
      setImages([]);
      setPreviewImages([]);
      fetchBanners();
    } catch (err) {
      console.error('Banner creation error:', err);
      alert('❌ Error creating banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (id) => {
    setEditId(id);
    setImages([]);
    setPreviewImages([]);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!images.length) return alert("Please select new images to update");

    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));

    try {
      await axios.put(`http://31.97.206.144:4061/api/poster/updatebanner/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Banner updated successfully');
      setModalOpen(false);
      setImages([]);
      setPreviewImages([]);
      fetchBanners();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await axios.delete(`http://31.97.206.144:4061/api/poster/deletebanner/${id}`);
      fetchBanners();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="container my-5">
      <Row>
        {/* Form */}
        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="text-primary mb-3">Create New Banner</h5>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-semibold">Upload Banner Images</Label>
                  <div className="d-flex align-items-center gap-2">
                    <label className="btn btn-sm btn-outline-primary">
                      <FaUpload className="me-2" /> Select Images
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>
                </FormGroup>
                <div className="d-flex flex-wrap gap-2 my-3">
                  {previewImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="preview"
                      width="70"
                      height="70"
                      className="rounded border"
                    />
                  ))}
                </div>
                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Create Banner'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Table */}
        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="text-dark mb-3">All Banners</h5>
              <Table bordered responsive className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Images</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBanners.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center text-muted">No banners found</td>
                    </tr>
                  ) : (
                    paginatedBanners.map((banner, idx) => (
                      <tr key={banner._id}>
                        <td>{(currentPage - 1) * bannersPerPage + idx + 1}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {banner.images.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="banner"
                                width="60"
                                height="40"
                                className="rounded"
                              />
                            ))}
                          </div>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="primary"
                            className="me-2"
                            title="Edit Banner"
                            onClick={() => openEditModal(banner._id)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            title="Delete Banner"
                            onClick={() => handleDelete(banner._id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination className="justify-content-center">
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink first onClick={() => handlePageChange(1)} />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i} active={i + 1 === currentPage}>
                      <PaginationLink onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink last onClick={() => handlePageChange(totalPages)} />
                  </PaginationItem>
                </Pagination>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Update Banner</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Upload New Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
          </FormGroup>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {previewImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="preview"
                width="70"
                height="70"
                className="rounded border"
              />
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate}>Update</Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CreateBanner;
