import React, { useState, useEffect } from 'react';
import {
  Row, Col, Form, FormGroup, Label, Input, Button, Table, Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import axios from 'axios';
import { FaTrash, FaEdit, FaUpload, FaPlay, FaHeart, FaRegHeart } from 'react-icons/fa';

const ManageReels = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [reels, setReels] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    likeCount: 0,
    isLiked: false
  });

  const reelsPerPage = 5;
  const totalPages = Math.ceil(reels.length / reelsPerPage);
  const paginatedReels = reels.slice(
    (currentPage - 1) * reelsPerPage,
    currentPage * reelsPerPage
  );

  const fetchReels = async () => {
    try {
      const res = await axios.post('http://31.97.206.144:4061/api/admin/getallreels');
      setReels(res.data.reels || []);
    } catch (err) {
      console.error('Error fetching reels:', err);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('video/')) {
      alert('Please select a video file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size should be less than 50MB');
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return alert("Please upload a video");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      await axios.post('http://31.97.206.144:4061/api/admin/createreel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Reel created successfully');
      setVideoFile(null);
      setVideoPreview(null);
      fetchReels();
    } catch (err) {
      console.error('Reel creation error:', err);
      alert('❌ Error creating reel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (reel) => {
    setEditId(reel._id);
    setEditForm({
      likeCount: reel.likeCount || 0,
      isLiked: reel.isLiked || false
    });
    setVideoFile(null);
    setVideoPreview(null);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!videoFile && !editForm.likeCount && !editForm.isLiked) {
      return alert("Please select new video or update like status");
    }

    const formData = new FormData();
    
    // Add video if selected
    if (videoFile) {
      formData.append('video', videoFile);
    }
    
    // Add like data
    formData.append('likeCount', editForm.likeCount);
    formData.append('isLiked', editForm.isLiked);

    try {
      await axios.put(`http://31.97.206.144:4061/api/admin/updatereel/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Reel updated successfully');
      setModalOpen(false);
      setVideoFile(null);
      setVideoPreview(null);
      fetchReels();
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Error updating reel');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deletereel/${id}`);
      alert('✅ Reel deleted successfully');
      fetchReels();
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Error deleting reel');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleLikeToggle = async (reel) => {
    try {
      const formData = new FormData();
      const newLikeStatus = !reel.isLiked;
      const newLikeCount = newLikeStatus ? reel.likeCount + 1 : Math.max(0, reel.likeCount - 1);
      
      formData.append('isLiked', newLikeStatus);
      formData.append('likeCount', newLikeCount);

      await axios.put(`http://31.97.206.144:4061/api/admin/updatereel/${reel._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      fetchReels();
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container my-5">
      <Row>
        {/* Upload Form */}
        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="text-primary mb-3">Create New Reel</h5>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-semibold">Upload Reel Video</Label>
                  <div className="d-flex align-items-center gap-2">
                    <label className="btn btn-sm btn-outline-primary">
                      <FaUpload className="me-2" /> Select Video
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        hidden
                      />
                    </label>
                    <span className="text-muted small">Max 50MB</span>
                  </div>
                  {videoFile && (
                    <div className="mt-2 text-muted small">
                      Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </FormGroup>
                
                {videoPreview && (
                  <div className="my-3">
                    <Label>Preview:</Label>
                    <div className="video-preview-container mt-2">
                      <video
                        src={videoPreview}
                        controls
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                        className="rounded border"
                      />
                    </div>
                  </div>
                )}

                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Create Reel'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Reels Table */}
        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="text-dark mb-3">All Reels</h5>
              <Table bordered responsive className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Video</th>
                    <th>Likes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReels.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No reels found</td>
                    </tr>
                  ) : (
                    paginatedReels.map((reel, idx) => (
                      <tr key={reel._id}>
                        <td>{(currentPage - 1) * reelsPerPage + idx + 1}</td>
                        <td>
                          <div className="video-thumbnail" style={{ position: 'relative' }}>
                            <video
                              src={reel.videoUrl}
                              style={{ width: '120px', height: '80px', objectFit: 'cover' }}
                              className="rounded"
                            />
                            <FaPlay 
                              className="text-white" 
                              style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '24px',
                                opacity: '0.8'
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              size="sm"
                              color="link"
                              className="p-0"
                              onClick={() => handleLikeToggle(reel)}
                              title={reel.isLiked ? "Unlike" : "Like"}
                            >
                              {reel.isLiked ? (
                                <FaHeart className="text-danger" />
                              ) : (
                                <FaRegHeart className="text-secondary" />
                              )}
                            </Button>
                            <span className="fw-semibold">{reel.likeCount || 0}</span>
                          </div>
                        </td>
                        <td>
                          <small className="text-muted">
                            {reel.createdAt ? formatDate(reel.createdAt) : 'N/A'}
                          </small>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="primary"
                            className="me-2"
                            title="Edit Reel"
                            onClick={() => openEditModal(reel)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            title="Delete Reel"
                            onClick={() => handleDelete(reel._id)}
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
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="lg">
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Update Reel</ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Upload New Video (Optional)</Label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                />
                {videoFile && (
                  <div className="mt-2 text-muted small">
                    New video: {videoFile.name}
                  </div>
                )}
              </FormGroup>
              
              {videoPreview && (
                <div className="mt-3">
                  <Label>New Video Preview:</Label>
                  <video
                    src={videoPreview}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                    className="rounded border mt-2"
                  />
                </div>
              )}
            </Col>
            
            <Col md={6}>
              <FormGroup>
                <Label>Like Count</Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.likeCount}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    likeCount: parseInt(e.target.value) || 0
                  })}
                />
              </FormGroup>
              
              <FormGroup check className="mt-3">
                <Label check>
                  <Input
                    type="checkbox"
                    checked={editForm.isLiked}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      isLiked: e.target.checked
                    })}
                  />{' '}
                  Mark as Liked
                </Label>
              </FormGroup>
              
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Note:</strong> If you upload a new video, it will replace the existing one. 
                  The "EDITEZY" watermark will be automatically added.
                </small>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate}>Update Reel</Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ManageReels;