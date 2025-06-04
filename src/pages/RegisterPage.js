import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axios';

const validationSchema = Yup.object({
    firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
    lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
        .required('Username is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .required('Password is required'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const initialValues = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axiosInstance.post('/auth/register', values);
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      setStatus(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

return (
    <div className="flex items-center justify-center bg-white">
        <div className="w-96 p-8 rounded-3xl bg-white shadow-lg">
            <h2 className="text-3xl font-martian mb-8">sign up</h2>
            
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

                        {['firstName', 'lastName', 'username', 'email', 'password'].map((fieldName) => (
                            <div key={fieldName} className="relative">
                                <label 
                                    htmlFor={fieldName}
                                    className="absolute -top-4 left-2 px-1 text-gray-500 text-xs font-martian"
                                >
                                    {fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')}
                                </label>
                                <Field
                                    type={fieldName === 'password' ? 'password' : 'text'}
                                    name={fieldName}
                                    id={fieldName}
                                    className="w-full p-2 border border-gray-200 rounded-3xl focus:outline-none focus:border-gray-300 font-martian shadow-inner bg-white text-sm"
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
                            Register
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    </div>
);
};

export default RegisterPage;