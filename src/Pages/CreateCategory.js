import React, { useState } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Container,
  Card,
  CardBody,
  CardTitle,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateCategory = () => {
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!categoryName.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        'http://31.97.206.144:4061/api/category/create-cateogry',
        { categoryName: categoryName.trim() }
      );

      alert('Category created successfully!');
      setTimeout(() => {
        navigate('/categorylist');
      }, 1500);
    } catch (err) {
      console.error('Error creating category:', err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="my-5 d-flex justify-content-center">
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <Card className="shadow-sm">
          <CardBody>
            <CardTitle tag="h4" className="text-center text-primary mb-4">
              Create New Category
            </CardTitle>

            {errorMessage && (
              <Alert
                color="danger"
                className="text-center"
                toggle={() => setErrorMessage('')}
                isOpen={!!errorMessage}
                fade={true}
              >
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert
                color="success"
                className="text-center"
                toggle={() => setSuccessMessage('')}
                isOpen={!!successMessage}
                fade={true}
              >
                {successMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </FormGroup>

              <div className="text-end">
                <Button
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
};

export default CreateCategory;
