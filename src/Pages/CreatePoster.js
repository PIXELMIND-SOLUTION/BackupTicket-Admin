import React, { useState, useEffect, useRef } from 'react';
import {
  Form, FormGroup, Label, Input, Button, Row, Col, Card, CardBody, CardHeader,
  InputGroup, InputGroupText, UncontrolledTooltip
} from 'reactstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUpload, FaImages, FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';

const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica', 'Comic Sans MS'];
const fontWeights = ['normal', 'bold', 'lighter'];
const fontStyles = ['normal', 'italic'];
const imageShapes = ['rectangle', 'rounded', 'circle', 'ellipse'];
const textVisibilityOptions = ['visible', 'hidden'];

const CreatePoster = () => {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [bgImage, setBgImage] = useState(null);
  const [bgImageURL, setBgImageURL] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [festivalDate, setFestivalDate] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const previewRef = useRef(null);

  const [overlaySettings, setOverlaySettings] = useState({
    overlays: [{ x: 440, y: 440, width: 200, height: 200, shape: 'rectangle', borderRadius: 0 }],
  });

  const [textSettings, setTextSettings] = useState({
    nameX: 100,
    nameY: 1040,
    emailX: 360,
    emailY: 1040,
    mobileX: 770,
    mobileY: 1040,
    titleX: 450,
    titleY: 50,
    descriptionX: 50,
    descriptionY: 200,
    tagsX: 50,
    tagsY: 300,
  });

  const [textVisibility, setTextVisibility] = useState({
    name: 'visible',
    email: 'visible',
    mobile: 'visible',
    title: 'visible',
    description: 'visible',
    tags: 'visible',
  });

  const [textStyles, setTextStyles] = useState({
    name: { fontSize: 24, color: '#000000', fontFamily: 'Arial', fontWeight: 'bold', fontStyle: 'normal' },
    email: { fontSize: 18, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
    mobile: { fontSize: 18, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
    title: { fontSize: 32, color: '#000000', fontFamily: 'Arial', fontWeight: 'bold', fontStyle: 'normal' },
    description: { fontSize: 16, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
    tags: { fontSize: 14, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'italic' },
  });

  const [bgImageFilter, setBgImageFilter] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    blur: 0,
  });

  const [overlayImageFilters, setOverlayImageFilters] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!bgImage) {
      setBgImageURL(null);
      return;
    }
    const url = URL.createObjectURL(bgImage);
    setBgImageURL(url);
    return () => URL.revokeObjectURL(url);
  }, [bgImage]);

  useEffect(() => {
    axios
      .get('http://31.97.206.144:4061/api/category/getall-cateogry')
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  useEffect(() => {
    setOverlayImageFilters((prevFilters) => {
      const newFilters = [...prevFilters];
      while (newFilters.length < images.length) {
        newFilters.push({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          grayscale: 0,
          blur: 0,
        });
      }
      return newFilters.slice(0, images.length);
    });
  }, [images]);

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setBgImage(file);
  };

  const handleRemoveBgImage = () => {
    setBgImage(null);
  };

  const handleOverlayImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newPreviews]);
    setImageFiles((prevFiles) => [...prevFiles, ...files]);
    
    // Add default settings for new overlays
    const newOverlays = [...overlaySettings.overlays];
    files.forEach(() => {
      newOverlays.push({ 
        x: 100, 
        y: 100, 
        width: 200, 
        height: 200,
        shape: 'rectangle',
        borderRadius: 0
      });
    });
    setOverlaySettings({ overlays: newOverlays });
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(images[index]);

    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    const newFilters = [...overlayImageFilters];
    const newOverlays = [...overlaySettings.overlays];

    newImages.splice(index, 1);
    newImageFiles.splice(index, 1);
    newFilters.splice(index, 1);
    newOverlays.splice(index, 1);

    setImages(newImages);
    setImageFiles(newImageFiles);
    setOverlayImageFilters(newFilters);
    setOverlaySettings({ overlays: newOverlays });
  };

  const handleOverlaySettingsChange = (e, idx) => {
    const { name, value } = e.target;
    const newOverlaySettings = [...overlaySettings.overlays];
    newOverlaySettings[idx] = {
      ...newOverlaySettings[idx],
      [name]: name === 'borderRadius' || name === 'width' || name === 'height' || name === 'x' || name === 'y' 
        ? parseInt(value) || 0 
        : value,
    };
    setOverlaySettings({ overlays: newOverlaySettings });
  };

  const handleTextSettingsChange = (e) => {
    const { name, value } = e.target;
    setTextSettings((prevSettings) => ({
      ...prevSettings,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleTextStyleChange = (field, styleProp, value) => {
    setTextStyles((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [styleProp]: styleProp === 'fontSize' ? parseInt(value) || 0 : value,
      },
    }));
  };

  const handleTextVisibilityChange = (field, value) => {
    setTextVisibility((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBgImageFilterChange = (filterName, value) => {
    setBgImageFilter((prev) => ({
      ...prev,
      [filterName]: parseInt(value) || 0,
    }));
  };

  const handleOverlayImageFilterChange = (idx, filterName, value) => {
    setOverlayImageFilters((prev) => {
      const newFilters = [...prev];
      newFilters[idx] = {
        ...newFilters[idx],
        [filterName]: parseInt(value) || 0,
      };
      return newFilters;
    });
  };

  // Drag and drop functions
  const handleMouseDown = (type, index, e) => {
    const rect = previewRef.current.getBoundingClientRect();
    let x, y;
    
    if (type === 'text') {
      x = textSettings[`${index}X`] / 2;
      y = textSettings[`${index}Y`] / 2;
    } else {
      x = overlaySettings.overlays[index].x / 2;
      y = overlaySettings.overlays[index].y / 2;
    }
    
    setDragOffset({
      x: e.clientX - rect.left - x,
      y: e.clientY - rect.top - y
    });
    setDragging({ type, index });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    if (dragging.type === 'text') {
      setTextSettings(prev => ({
        ...prev,
        [`${dragging.index}X`]: x * 2,
        [`${dragging.index}Y`]: y * 2
      }));
    } else {
      const newOverlays = [...overlaySettings.overlays];
      newOverlays[dragging.index] = {
        ...newOverlays[dragging.index],
        x: x * 2,
        y: y * 2
      };
      setOverlaySettings({ overlays: newOverlays });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, dragOffset]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (isSubmitting) return;

  //   if (!name || !categoryName || !bgImage) {
  //     setErrorMessage('Please fill all required fields including background image.');
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   setErrorMessage('');

  //   const formData = new FormData();
  //   formData.append('name', name);
  //   formData.append('categoryName', categoryName);
  //   if (festivalDate) formData.append('festivalDate', festivalDate);
  //   if (description) formData.append('description', description);
  //   if (tags) formData.append('tags', tags);
  //   if (email) formData.append('email', email);
  //   if (mobile) formData.append('mobile', mobile);
  //   if (title) formData.append('title', title);
  //   formData.append('bgImage', bgImage);

  //   imageFiles.forEach((file) => formData.append('images', file));

  //   formData.append('overlaySettings', JSON.stringify(overlaySettings));
  //   formData.append('textSettings', JSON.stringify(textSettings));
  //   formData.append('textStyles', JSON.stringify(textStyles));
  //   formData.append('textVisibility', JSON.stringify(textVisibility));
  //   formData.append('bgImageFilter', JSON.stringify(bgImageFilter));
  //   formData.append('overlayImageFilters', JSON.stringify(overlayImageFilters));

  //   try {
  //     const response = await axios.post(
  //       'http://31.97.206.144:4061/api/poster/create-canvaposter',
  //       formData,
  //       { headers: { 'Content-Type': 'multipart/form-data' } }
  //     );

  //     alert('Poster created successfully!');
  //     navigate('/posterlist');

  //     // Reset form
  //     setName('');
  //     setCategoryName('');
  //     setBgImage(null);
  //     setImages([]);
  //     setImageFiles([]);
  //     setFestivalDate('');
  //     setDescription('');
  //     setTags('');
  //     setEmail('');
  //     setMobile('');
  //     setTitle('');
  //     setErrorMessage('');
  //     setTextStyles({
  //       name: { fontSize: 24, color: '#000000', fontFamily: 'Arial', fontWeight: 'bold', fontStyle: 'normal' },
  //       email: { fontSize: 18, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
  //       mobile: { fontSize: 18, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
  //       title: { fontSize: 32, color: '#000000', fontFamily: 'Arial', fontWeight: 'bold', fontStyle: 'normal' },
  //       description: { fontSize: 16, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'normal' },
  //       tags: { fontSize: 14, color: '#000000', fontFamily: 'Arial', fontWeight: 'normal', fontStyle: 'italic' },
  //     });
  //     setTextVisibility({
  //       name: 'visible',
  //       email: 'visible',
  //       mobile: 'visible',
  //       title: 'visible',
  //       description: 'visible',
  //       tags: 'visible',
  //     });
  //     setBgImageFilter({
  //       brightness: 100,
  //       contrast: 100,
  //       saturation: 100,
  //       grayscale: 0,
  //       blur: 0,
  //     });
  //     setOverlayImageFilters([]);
  //     setOverlaySettings({ overlays: [{ x: 440, y: 440, width: 200, height: 200, shape: 'rectangle', borderRadius: 0 }] });
  //     setTextSettings({
  //       nameX: 100,
  //       nameY: 1040,
  //       emailX: 360,
  //       emailY: 1040,
  //       mobileX: 770,
  //       mobileY: 1040,
  //       titleX: 450,
  //       titleY: 50,
  //       descriptionX: 50,
  //       descriptionY: 200,
  //       tagsX: 50,
  //       tagsY: 300,
  //     });
  //   } catch (error) {
  //     console.error('Error creating poster:', error);
  //     setErrorMessage('Error creating poster. Please try again.');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // Helper component for slider controls
  const SliderControl = ({ label, value, min, max, onChange, unit = '', step = 1 }) => (
    <FormGroup>
      <Label>
        {label}: {value}{unit}
      </Label>
      <Input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </FormGroup>
  );

  // Helper function to get shape styles
  const getShapeStyles = (shape, borderRadius = 0) => {
    switch (shape) {
      case 'rounded':
        return { borderRadius: `${borderRadius}px` };
      case 'circle':
        return { borderRadius: '50%' };
      case 'ellipse':
        return { borderRadius: '50%' };
      default:
        return { borderRadius: '0' };
    }
  };


const [overlayImage, setOverlayImage] = useState(null);
const [overlayImageURL, setOverlayImageURL] = useState(null);


const handleOverlayImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setOverlayImage(file);
    const url = URL.createObjectURL(file);
    setOverlayImageURL(url);
  }
};

const handleRemoveOverlayImage = () => {
  if (overlayImageURL) {
    URL.revokeObjectURL(overlayImageURL);
  }
  setOverlayImage(null);
  setOverlayImageURL(null);
};


   const capturePosterImage = async () => {
    if (!previewRef.current) return null;
    
    try {
      const canvas = await html2canvas(previewRef.current);
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    } catch (error) {
      console.error('Error capturing poster:', error);
      return null;
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  if (!name || !categoryName || !bgImage) {
    setErrorMessage('Please fill all required fields including background image.');
    return;
  }

  setIsSubmitting(true);
  setErrorMessage('');

  try {
    // Capture the poster image (canvas or other source)
    const posterImage = await capturePosterImage();
    if (!posterImage) {
      throw new Error('Failed to generate poster image');
    }

    // Debug: Check overlayImage value and type
    console.log('overlayImage:', overlayImage);
    console.log('Is overlayImage a File?', overlayImage instanceof File);

    // Create posterData object (with designData)
    const posterData = {
      name,
      categoryName,
      festivalDate: festivalDate || undefined,
      description: description || undefined,
      tags: tags || undefined,
      email: email || undefined,
      mobile: mobile || undefined,
      title: title || undefined,
      designData: {
        bgImage: null,        // backend will upload and fill this
        overlayImage: null,   // backend will upload and fill this
        bgImageSettings: {
          filters: bgImageFilter,
        },
        overlaySettings,
        textSettings,
        textStyles,
        textVisibility,
        overlayImageFilters,
      },
    };

    // Prepare FormData for multipart upload
    const formData = new FormData();

    // Append the generated poster image (required)
    formData.append('posterImage', posterImage, 'poster.jpg');

    // Append bgImage file if it's a File object
    if (bgImage instanceof File) {
      formData.append('bgImage', bgImage, bgImage.name);
    }

    // Append overlayImage file if it's a File object
       // Add all overlay images
    imageFiles.forEach((file, index) => {
      formData.append('overlayImages', file); // Changed to plural 'overlayImages'
    });

    // Append other form fields
    formData.append('name', name);
    formData.append('categoryName', categoryName);
    if (festivalDate) formData.append('festivalDate', festivalDate);
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);
    if (email) formData.append('email', email);
    if (mobile) formData.append('mobile', mobile);
    if (title) formData.append('title', title);

    // Append the designData as JSON string
    formData.append('designData', JSON.stringify(posterData.designData));

    // Debug: Log all formData entries to verify correct data
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    // Send POST request to backend API
    const response = await axios.post(
      'http://31.97.206.144:4061/api/poster/create-canvaposter',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success) {
      alert('Poster created successfully!');
      navigate('/posterlist');
    } else {
      throw new Error(response.data.message || 'Failed to create poster');
    }
  } catch (error) {
    console.error('Error creating poster:', error);
    setErrorMessage(error.message || 'Error creating poster. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};





  return (
    <div className="create-poster-container" style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <h2 className="mb-4 text-center">Create New Poster</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Poster Information</CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="name">Poster Name <span className="text-danger">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Enter poster name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="categoryName">Category <span className="text-danger">*</span></Label>
                  <Input
                    id="categoryName"
                    type="select"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                    ))}
                  </Input>
                </FormGroup>

                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="festivalDate">Festival Date</Label>
                      <Input
                        id="festivalDate"
                        type="date"
                        value={festivalDate}
                        onChange={(e) => setFestivalDate(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input
                    id="description"
                    type="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label for="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </FormGroup>
              </Form>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Contact Information</CardHeader>
            <CardBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Background Image <span className="text-danger">*</span></CardHeader>
            <CardBody>
              <FormGroup>
                <Input
                  id="bgImage"
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageChange}
                />
                {bgImageURL && (
                  <div className="mt-3 position-relative">
                    <img
                      src={bgImageURL}
                      alt="Background Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px' }}
                    />
                    <Button
                      color="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={handleRemoveBgImage}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                )}
              </FormGroup>

              {bgImageURL && (
                <>
                  <h5 className="mt-3">Background Image Filters</h5>
                  {['brightness', 'contrast', 'saturation', 'grayscale', 'blur'].map((filter) => (
                    <SliderControl
                      key={filter}
                      label={`${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                      value={bgImageFilter[filter]}
                      min={0}
                      max={filter === 'blur' ? 10 : 200}
                      onChange={(e) => handleBgImageFilterChange(filter, e.target.value)}
                      unit={filter === 'blur' ? 'px' : '%'}
                    />
                  ))}
                </>
              )}
            </CardBody>
          </Card>

          <Card className="mb-4">
            <CardHeader className="bg-primary text-white">Overlay Images</CardHeader>
            <CardBody>
              <FormGroup>
                <Input
                  id="overlayImages"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleOverlayImagesChange}
                />
              </FormGroup>

              {images.length > 0 && (
                <div className="mt-3">
                  <h5>Overlay Images ({images.length})</h5>
                  {images.map((imgSrc, idx) => (
                    <Card key={idx} className="mb-3">
                      <CardBody>
                        <div className="position-relative">
                          <img
                            src={imgSrc}
                            alt={`Overlay ${idx + 1}`}
                            className="img-fluid rounded"
                            style={{
                              maxHeight: '150px',
                              filter: `
                                brightness(${overlayImageFilters[idx]?.brightness || 100}%)
                                contrast(${overlayImageFilters[idx]?.contrast || 100}%)
                                saturate(${overlayImageFilters[idx]?.saturation || 100}%)
                                grayscale(${overlayImageFilters[idx]?.grayscale || 0}%)
                                blur(${overlayImageFilters[idx]?.blur || 0}px)
                              `,
                            }}
                          />
                          <Button
                            color="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <FaTimes />
                          </Button>
                        </div>

                        <h6 className="mt-3">Filters</h6>
                        {['brightness', 'contrast', 'saturation', 'grayscale', 'blur'].map((filter) => (
                          <SliderControl
                            key={filter}
                            label={`${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
                            value={overlayImageFilters[idx]?.[filter] || 100}
                            min={0}
                            max={filter === 'blur' ? 10 : 200}
                            onChange={(e) => handleOverlayImageFilterChange(idx, filter, e.target.value)}
                            unit={filter === 'blur' ? 'px' : '%'}
                          />
                        ))}

                        <h6 className="mt-3">Position & Size</h6>
                        <Row>
                          {['x', 'y', 'width', 'height'].map((dim) => (
                            <Col key={dim} sm={6}>
                              <SliderControl
                                label={dim.toUpperCase()}
                                value={overlaySettings.overlays[idx]?.[dim] || 0}
                                min={0}
                                max={dim === 'width' || dim === 'height' ? 1000 : 2000}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const newOverlays = [...overlaySettings.overlays];
                                  newOverlays[idx] = { ...newOverlays[idx], [dim]: val };
                                  setOverlaySettings({ overlays: newOverlays });
                                }}
                              />
                            </Col>
                          ))}
                        </Row>

                        <h6 className="mt-3">Shape Settings</h6>
                        <Row>
                          <Col sm={6}>
                            <FormGroup>
                              <Label htmlFor={`overlay-${idx}-shape`}>Shape</Label>
                              <Input
                                type="select"
                                id={`overlay-${idx}-shape`}
                                value={overlaySettings.overlays[idx]?.shape || 'rectangle'}
                                onChange={(e) => {
                                  const newOverlays = [...overlaySettings.overlays];
                                  newOverlays[idx] = { 
                                    ...newOverlays[idx], 
                                    shape: e.target.value,
                                    borderRadius: e.target.value === 'rounded' ? 20 : 0
                                  };
                                  setOverlaySettings({ overlays: newOverlays });
                                }}
                              >
                                {imageShapes.map((shape) => (
                                  <option key={shape} value={shape}>{shape}</option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          {overlaySettings.overlays[idx]?.shape === 'rounded' && (
                            <Col sm={6}>
                              <SliderControl
                                label="Border Radius"
                                value={overlaySettings.overlays[idx]?.borderRadius || 0}
                                min={0}
                                max={100}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const newOverlays = [...overlaySettings.overlays];
                                  newOverlays[idx] = { ...newOverlays[idx], borderRadius: val };
                                  setOverlaySettings({ overlays: newOverlays });
                                }}
                                unit="px"
                              />
                            </Col>
                          )}
                        </Row>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="mb-4">
            <CardHeader className="bg-primary text-white d-flex justify-content-between align-items-center">
              <span>Text Settings</span>
              <Button
                color="secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <FaEyeSlash /> : <FaEye />}
                <span className="ms-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </Button>
            </CardHeader>
            <CardBody>
              {['name', 'email', 'mobile', 'title', 'description', 'tags'].map((field) => (
                <div key={field} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5>{field.charAt(0).toUpperCase() + field.slice(1)} Settings</h5>
                    <FormGroup className="mb-0">
                      <Input
                        type="select"
                        value={textVisibility[field]}
                        onChange={(e) => handleTextVisibilityChange(field, e.target.value)}
                        style={{ width: '100px' }}
                      >
                        {textVisibilityOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </div>
                  
                  <Row>
                    <Col sm={6}>
                      <SliderControl
                        label="X Position"
                        value={textSettings[`${field}X`]}
                        min={0}
                        max={1000}
                        onChange={(e) => setTextSettings(prev => ({
                          ...prev,
                          [`${field}X`]: parseInt(e.target.value) || 0
                        }))}
                      />
                    </Col>
                    <Col sm={6}>
                      <SliderControl
                        label="Y Position"
                        value={textSettings[`${field}Y`]}
                        min={0}
                        max={1000}
                        onChange={(e) => setTextSettings(prev => ({
                          ...prev,
                          [`${field}Y`]: parseInt(e.target.value) || 0
                        }))}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={6}>
                      <SliderControl
                        label="Font Size (px)"
                        value={textStyles[field].fontSize}
                        min={8}
                        max={field === 'title' ? 72 : field === 'description' ? 24 : 36}
                        onChange={(e) => handleTextStyleChange(field, 'fontSize', e.target.value)}
                      />
                    </Col>
                    <Col sm={6}>
                      <FormGroup>
                        <Label htmlFor={`${field}-color`}>Font Color</Label>
                        <Input
                          type="color"
                          id={`${field}-color`}
                          value={textStyles[field].color}
                          onChange={(e) => handleTextStyleChange(field, 'color', e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={6}>
                      <FormGroup>
                        <Label htmlFor={`${field}-fontFamily`}>Font Family</Label>
                        <Input
                          type="select"
                          id={`${field}-fontFamily`}
                          value={textStyles[field].fontFamily}
                          onChange={(e) => handleTextStyleChange(field, 'fontFamily', e.target.value)}
                        >
                          {fontFamilies.map((ff) => (
                            <option key={ff} value={ff}>{ff}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup>
                        <Label htmlFor={`${field}-fontWeight`}>Font Weight</Label>
                        <Input
                          type="select"
                          id={`${field}-fontWeight`}
                          value={textStyles[field].fontWeight}
                          onChange={(e) => handleTextStyleChange(field, 'fontWeight', e.target.value)}
                        >
                          {fontWeights.map((fw) => (
                            <option key={fw} value={fw}>{fw}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Label htmlFor={`${field}-fontStyle`}>Font Style</Label>
                    <Input
                      type="select"
                      id={`${field}-fontStyle`}
                      value={textStyles[field].fontStyle}
                      onChange={(e) => handleTextStyleChange(field, 'fontStyle', e.target.value)}
                    >
                      {fontStyles.map((fs) => (
                        <option key={fs} value={fs}>{fs}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
              ))}
            </CardBody>
          </Card>

          {showPreview && (
            <Card className="mb-4">
              <CardHeader className="bg-primary text-white">Poster Preview</CardHeader>
              <CardBody className="d-flex justify-content-center">
                <div
                  ref={previewRef}
                  className="poster-preview"
                  style={{
                    position: 'relative',
                    width: '450px',
                    height: '600px',
                    border: '1px solid #333',
                    overflow: 'hidden',
                    transform: 'scale(0.9)',
                    transformOrigin: 'center'
                  }}
                >
                  {/* Background image */}
                  {bgImageURL ? (
                    <img
                      src={bgImageURL}
                      alt="Background"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        filter: `
                          brightness(${bgImageFilter.brightness}%)
                          contrast(${bgImageFilter.contrast}%)
                          saturate(${bgImageFilter.saturation}%)
                          grayscale(${bgImageFilter.grayscale}%)
                          blur(${bgImageFilter.blur}px)
                        `,
                        zIndex: 0,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999'
                    }}>
                      No Background Image Selected
                    </div>
                  )}

                  {/* Overlay images */}
                  {images.map((imgSrc, idx) => {
                    const overlay = overlaySettings.overlays[idx] || { 
                      x: 0, 
                      y: 0, 
                      width: 100, 
                      height: 100,
                      shape: 'rectangle',
                      borderRadius: 0
                    };
                    const filters = overlayImageFilters[idx] || {
                      brightness: 100,
                      contrast: 100,
                      saturation: 100,
                      grayscale: 0,
                      blur: 0,
                    };

                    const shapeStyles = getShapeStyles(overlay.shape, overlay.borderRadius);

                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute',
                          top: overlay.y / 2,
                          left: overlay.x / 2,
                          width: overlay.width / 2,
                          height: overlay.height / 2,
                          ...shapeStyles,
                          overflow: 'hidden',
                          cursor: 'move',
                          zIndex: 10,
                        }}
                        onMouseDown={(e) => handleMouseDown('image', idx, e)}
                      >
                        <img
                          src={imgSrc}
                          alt={`Overlay ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: `
                              brightness(${filters.brightness}%)
                              contrast(${filters.contrast}%)
                              saturate(${filters.saturation}%)
                              grayscale(${filters.grayscale}%)
                              blur(${filters.blur}px)
                            `,
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Text Overlays */}
                  {textVisibility.name === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.nameY / 2,
                        left: textSettings.nameX / 2,
                        color: textStyles.name.color,
                        fontWeight: textStyles.name.fontWeight,
                        fontStyle: textStyles.name.fontStyle,
                        fontSize: textStyles.name.fontSize / 2,
                        fontFamily: textStyles.name.fontFamily,
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'name', e)}
                    >
                      {name || 'Name'}
                    </div>
                  )}
                  
                  {textVisibility.email === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.emailY / 2,
                        left: textSettings.emailX / 2,
                        color: textStyles.email.color,
                        fontWeight: textStyles.email.fontWeight,
                        fontStyle: textStyles.email.fontStyle,
                        fontSize: textStyles.email.fontSize / 2,
                        fontFamily: textStyles.email.fontFamily,
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'email', e)}
                    >
                      {email || 'email@example.com'}
                    </div>
                  )}
                  
                  {textVisibility.mobile === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.mobileY / 2,
                        left: textSettings.mobileX / 2,
                        color: textStyles.mobile.color,
                        fontWeight: textStyles.mobile.fontWeight,
                        fontStyle: textStyles.mobile.fontStyle,
                        fontSize: textStyles.mobile.fontSize / 2,
                        fontFamily: textStyles.mobile.fontFamily,
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'mobile', e)}
                    >
                      {mobile || '+1234567890'}
                    </div>
                  )}
                  
                  {textVisibility.title === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.titleY / 2,
                        left: textSettings.titleX / 2,
                        color: textStyles.title.color,
                        fontWeight: textStyles.title.fontWeight,
                        fontStyle: textStyles.title.fontStyle,
                        fontSize: textStyles.title.fontSize / 2,
                        fontFamily: textStyles.title.fontFamily,
                        whiteSpace: 'nowrap',
                        zIndex: 20,
                        textAlign: 'center',
                        width: '80%',
                        transform: 'translateX(-50%)',
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'title', e)}
                    >
                      {title || 'Poster Title'}
                    </div>
                  )}
                  
                  {textVisibility.description === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.descriptionY / 2,
                        left: textSettings.descriptionX / 2,
                        color: textStyles.description.color,
                        fontWeight: textStyles.description.fontWeight,
                        fontStyle: textStyles.description.fontStyle,
                        fontSize: textStyles.description.fontSize / 2,
                        fontFamily: textStyles.description.fontFamily,
                        zIndex: 20,
                        width: '80%',
                        padding: '0 10px',
                        textAlign: 'left',
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'description', e)}
                    >
                      {description || 'Poster description goes here...'}
                    </div>
                  )}
                  
                  {textVisibility.tags === 'visible' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: textSettings.tagsY / 2,
                        left: textSettings.tagsX / 2,
                        color: textStyles.tags.color,
                        fontWeight: textStyles.tags.fontWeight,
                        fontStyle: textStyles.tags.fontStyle,
                        fontSize: textStyles.tags.fontSize / 2,
                        fontFamily: textStyles.tags.fontFamily,
                        zIndex: 20,
                        width: '80%',
                        padding: '0 10px',
                        textAlign: 'left',
                        cursor: 'move',
                      }}
                      onMouseDown={(e) => handleMouseDown('text', 'tags', e)}
                    >
                      Tags: {tags || 'tag1, tag2, tag3'}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {errorMessage && (
            <div className="alert alert-danger">
              {errorMessage}
            </div>
          )}

          <div className="d-grid gap-2">
            <Button
              color="success"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Poster...' : 'Create Poster'}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CreatePoster;