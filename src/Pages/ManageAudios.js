import React, { useState, useEffect } from 'react';
import {
  Row, Col, Form, FormGroup, Label, Input, Button, Table, Card, CardBody,
  Modal, ModalHeader, ModalBody, ModalFooter, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import axios from 'axios';
import { FaTrash, FaEdit, FaUpload, FaPlay, FaPause, FaMusic } from 'react-icons/fa';

const ManageAudios = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [audios, setAudios] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    duration: 0
  });
  const [currentPlaying, setCurrentPlaying] = useState(null);

  const audiosPerPage = 5;
  const totalPages = Math.ceil(audios.length / audiosPerPage);
  const paginatedAudios = audios.slice(
    (currentPage - 1) * audiosPerPage,
    currentPage * audiosPerPage
  );

  const fetchAudios = async () => {
    try {
      const res = await axios.get('http://31.97.206.144:4061/api/admin/getallaudios');
      setAudios(res.data.audios || []);
    } catch (err) {
      console.error('Error fetching audios:', err);
    }
  };

  useEffect(() => {
    fetchAudios();
  }, []);

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('audio/')) {
      alert('Please select an audio file');
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('Audio file size should be less than 20MB');
      return;
    }

    setAudioFile(file);
    
    // Create audio preview
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = () => {
      setAudioPreview({
        url: audioUrl,
        duration: audio.duration
      });
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return alert("Please upload an audio file");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('audio', audioFile);
    if (editForm.title) formData.append('title', editForm.title);
    if (editForm.artist) formData.append('artist', editForm.artist);

    try {
      await axios.post('http://31.97.206.144:4061/api/admin/createaudio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Audio uploaded successfully');
      setAudioFile(null);
      setAudioPreview(null);
      setEditForm({ title: '', artist: '', duration: 0 });
      fetchAudios();
    } catch (err) {
      console.error('Audio upload error:', err);
      alert('❌ Error uploading audio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (audio) => {
    setEditId(audio._id);
    setEditForm({
      title: audio.title || '',
      artist: audio.artist || '',
      duration: audio.duration || 0
    });
    setAudioFile(null);
    setAudioPreview(null);
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    
    // Add audio if selected
    if (audioFile) {
      formData.append('audio', audioFile);
    }
    
    // Add audio data
    formData.append('title', editForm.title);
    formData.append('artist', editForm.artist);

    try {
      await axios.put(`http://31.97.206.144:4061/api/admin/updateaudio/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('✅ Audio updated successfully');
      setModalOpen(false);
      setAudioFile(null);
      setAudioPreview(null);
      fetchAudios();
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Error updating audio');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this audio?')) return;
    try {
      await axios.delete(`http://31.97.206.144:4061/api/admin/deleteaudio/${id}`);
      alert('✅ Audio deleted successfully');
      fetchAudios();
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Error deleting audio');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const togglePlayPause = (audioId, audioUrl) => {
    if (currentPlaying === audioId) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(audioId);
      // Play audio logic can be implemented here
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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
              <h5 className="text-primary mb-3">Upload New Audio</h5>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-semibold">Select Audio File</Label>
                  <div className="d-flex align-items-center gap-2">
                    <label className="btn btn-sm btn-outline-primary">
                      <FaUpload className="me-2" /> Choose Audio
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        hidden
                      />
                    </label>
                    <span className="text-muted small">Max 20MB</span>
                  </div>
                  {audioFile && (
                    <div className="mt-2 text-muted small">
                      Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Title (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="Enter audio title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Artist (Optional)</Label>
                  <Input
                    type="text"
                    placeholder="Enter artist name"
                    value={editForm.artist}
                    onChange={(e) => setEditForm({...editForm, artist: e.target.value})}
                  />
                </FormGroup>
                
                {audioPreview && (
                  <div className="my-3 p-3 bg-light rounded">
                    <Label>Audio Preview:</Label>
                    <div className="d-flex align-items-center gap-3 mt-2">
                      <FaMusic className="text-primary" size={24} />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">
                            {audioFile?.name || 'Audio File'}
                          </span>
                          <span className="text-muted">
                            {formatDuration(audioPreview.duration)}
                          </span>
                        </div>
                        <div className="progress mt-1" style={{ height: '5px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ width: '0%' }}
                          ></div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        color="primary"
                        onClick={() => {
                          const audio = new Audio(audioPreview.url);
                          audio.play();
                        }}
                      >
                        <FaPlay />
                      </Button>
                    </div>
                  </div>
                )}

                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Audio'}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Audios Table */}
        <Col md={6}>
          <Card className="shadow-sm">
            <CardBody>
              <h5 className="text-dark mb-3">All Audios</h5>
              <Table bordered responsive className="align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Audio</th>
                    <th>Title / Artist</th>
                    <th>Duration</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAudios.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">No audios found</td>
                    </tr>
                  ) : (
                    paginatedAudios.map((audio, idx) => (
                      <tr key={audio._id}>
                        <td>{(currentPage - 1) * audiosPerPage + idx + 1}</td>
                        <td>
                          <div className="audio-player" style={{ width: '100px' }}>
                            <div className="d-flex align-items-center gap-2">
                              <Button
                                size="sm"
                                color="link"
                                className="p-0"
                                onClick={() => togglePlayPause(audio._id, audio.audioUrl)}
                              >
                                {currentPlaying === audio._id ? (
                                  <FaPause className="text-primary" size={16} />
                                ) : (
                                  <FaPlay className="text-primary" size={16} />
                                )}
                              </Button>
                              <FaMusic className="text-secondary" />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex-column">
                            <div className="fw-semibold">{audio.title || 'Untitled'}</div>
                            <div className="text-muted small">{audio.artist || 'Unknown Artist'}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {formatDuration(audio.duration)}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(audio.createdAt)}
                          </small>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="primary"
                            className="me-2"
                            title="Edit Audio"
                            onClick={() => openEditModal(audio)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            title="Delete Audio"
                            onClick={() => handleDelete(audio._id)}
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
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>Update Audio</ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>Upload New Audio (Optional)</Label>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                />
                {audioFile && (
                  <div className="mt-2 text-muted small">
                    New audio: {audioFile.name}
                  </div>
                )}
              </FormGroup>
              
              {audioPreview && (
                <div className="mt-3">
                  <Label>Audio Preview:</Label>
                  <div className="d-flex align-items-center gap-3 mt-2 p-2 bg-light rounded">
                    <FaMusic className="text-primary" size={24} />
                    <div className="flex-grow-1">
                      <div className="fw-medium">{audioFile?.name}</div>
                      <div className="text-muted small">
                        Duration: {formatDuration(audioPreview.duration)}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      color="primary"
                      onClick={() => {
                        const audio = new Audio(audioPreview.url);
                        audio.play();
                      }}
                    >
                      <FaPlay />
                    </Button>
                  </div>
                </div>
              )}
            </Col>
            
            <Col md={6}>
              <FormGroup>
                <Label>Title</Label>
                <Input
                  type="text"
                  placeholder="Enter audio title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Artist</Label>
                <Input
                  type="text"
                  placeholder="Enter artist name"
                  value={editForm.artist}
                  onChange={(e) => setEditForm({...editForm, artist: e.target.value})}
                />
              </FormGroup>
              
              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted">
                  <strong>Note:</strong> If you upload a new audio file, it will replace the existing one. 
                  Leave fields blank if you don't want to change them.
                </small>
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate}>Update Audio</Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ManageAudios;