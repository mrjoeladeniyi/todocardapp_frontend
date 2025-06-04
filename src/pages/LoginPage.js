import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, loading } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate('/todos'); // Redirect to main page if already logged in
    }
  }, [isLoggedIn, navigate, loading]);

  // If still checking authentication status, show loading
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axiosInstance.post('/auth/login', values);
      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        login(response.data.token, response.data.user); // Store token and user data
        navigate('/todos');
      }
    } catch (err) {
      setStatus(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white min-h-screen">
      <div className="w-96 p-8 rounded-3xl bg-white shadow-lg">
        <h2 className="text-3xl font-martian mb-8">sign in</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form className="space-y-4">
              {status && (
                <div className="p-3 text-red-500 text-sm">
                  {status}
                </div>
              )}

              {['email', 'password'].map((fieldName) => (
                <div key={fieldName} className="relative">
                  <label
                    htmlFor={fieldName}
                    className="absolute -top-2 left-3 px-1 bg-white text-red-500 text-xs font-martian"
                  >
                    {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                  </label>
                  <Field
                    type={fieldName === 'password' ? 'password' : 'text'}
                    name={fieldName}
                    id={fieldName}
                    className="w-full p-3 border border-gray-200 rounded-3xl focus:outline-none focus:border-gray-300 font-martian shadow-inner bg-white text-sm"
                  />
                  {errors[fieldName] && touched[fieldName] && (
                    <div className="text-red-500 text-xs mt-1 font-mono">
                      {errors[fieldName]}
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[70%] bg-zinc-800 text-white font-mono py-3 px-4 rounded-3xl 
                  hover:bg-zinc-700 transition-colors duration-200 mt-6"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;