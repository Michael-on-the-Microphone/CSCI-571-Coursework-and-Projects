import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [serverError, setServerError] = useState('');
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email must be valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear server error when user types
    if (serverError) {
      setServerError('');
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate the field that just lost focus
    const newErrors = { ...errors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name === 'email') {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email must be valid';
      } else {
        delete newErrors.email;
      }
    }

    if (name === 'password') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('%c Login form submitted', 'background: #222; color: #bada55');

    if (!validateForm()) return;

    // Clear any previous errors
    setErrors({});
    setServerError('');

    try {
      // Direct fetch to see the raw response
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      console.log('%c Raw login response status:', 'background: #222; color: #bada55', response.status);
      const data = await response.json();
      console.log('%c Raw login response data:', 'background: #222; color: #bada55', data);

      if (!response.ok) {
        console.log('%c Login failed with status ' + response.status, 'background: red; color: white');
        console.log('Error from server:', data.error);

        // Handle authentication errors
        if (response.status === 401 ||
            (data.error && (data.error.includes('Invalid email') ||
                          data.error.includes('Invalid credentials') ||
                          data.error.includes('password') ||
                          data.error.includes('Login failed')))) {
          console.log('%c Setting password error directly', 'background: blue; color: white');
          setErrors(prev => ({
            ...prev,
            password: 'Email or password is incorrect'
          }));
          setTouched(prev => ({
            ...prev,
            password: true
          }));
          return; // Stop execution here
        } else {
          setServerError(data.error || 'Login failed');
          return; // Stop execution here
        }
      }

      // Success case
      console.log('Login successful, setting user data and navigating to home page');
      // Update the user context with the data from the response
      setUser(data);
      navigate('/');

    } catch (err) {
      console.error('%c Fetch error:', 'background: red; color: white', err);
      setServerError('Network error: ' + err.message);
    }
  };

  const isFormValid = formData.email && formData.password && !Object.values(errors).some(error => error);

  return (
    <Container className="my-5 px-4">
      <div className="mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="mb-4 text-center">Login</h2>

        {serverError && (
          <Alert variant="danger">{serverError}</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={!!errors.email && touched.email}
              required
            />
            {errors.email && touched.email && (
              <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                {errors.email}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={!!errors.password && touched.password}
              required
            />
            {errors.password && touched.password && (
              <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                {errors.password}
              </div>
            )}
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={!isFormValid}
            >
              Login
            </Button>
          </div>

          <div className="mt-3 text-center">
            <p>Don't have an account? <Link to="/register">Register</Link></p>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;
