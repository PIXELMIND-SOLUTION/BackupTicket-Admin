import React, { useState, useRef } from 'react';
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  Alert,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCloudUploadAlt } from 'react-icons/fa';

const CreateLogo = () => {
  const [logoName, setLogoName] = useState('');
  const [logoImage, setLogoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoName || !logoImage) {
      setErrorMessage('Logo name and image are required.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('name', logoName);
    formData.append('image', logoImage);

    try {
      await axios.post(
        'http://31.97.206.144:4061/api/admin/createlogo',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      alert('Logo created successfully!');
      setLogoName('');
      setLogoImage(null);
      setPreviewImage(null);

      setTimeout(() => {
        navigate('/logolist');
      }, 1500);
    } catch (error) {
      setErrorMessage('Error creating logo. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Card className="shadow-sm">
          <CardBody>
            <CardTitle tag="h4" className="text-center text-primary mb-4">
              Create New Logo
            </CardTitle>

            {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
            {successMessage && <Alert color="success">{successMessage}</Alert>}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="logoName">Logo Name</Label>
                <Input
                  type="text"
                  id="logoName"
                  value={logoName}
                  onChange={(e) => setLogoName(e.target.value)}
                  placeholder="Enter logo name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Upload Logo Image</Label>
                <div className="d-flex align-items-center gap-3">
                  <Button
                    type="button"
                    color="secondary"
                    onClick={triggerFileInput}
                    title="Upload Image"
                  >
                    <FaCloudUploadAlt size={20} className="me-2" />
                    Upload
                  </Button>
                  <span className="text-muted small">
                    {logoImage?.name || 'No file chosen'}
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="mt-3 rounded shadow"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                )}
              </FormGroup>

              <div className="text-end">
                <Button color="primary" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Logo'}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

export default CreateLogo;
