import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axios';

const CreateTodoModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    // Define validation schema with Yup
    const TodoSchema = Yup.object().shape({
        title: Yup.string()
            .required('Title is required')
            .min(3, 'Title must be at least 3 characters'),
        description: Yup.string(),
        dueDate: Yup.date().nullable(),
        priority: Yup.string()
            .oneOf(['low', 'medium', 'high'], 'Invalid priority level')
            .required('Priority is required'),
        status: Yup.string()
            .oneOf(['pending', 'inprogress', 'completed'], 'Invalid status')
            .required('Status is required')
    });

    const initialValues = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending'
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setLoading(true);
        setError(null);

        try {
            // Format status to match what the backend expects
            let formattedStatus = values.status;
            if (values.status === 'inprogress') {
                formattedStatus = 'in-progress';
            }
            
            await axiosInstance.post('/todos', {
                ...values,
                status: formattedStatus,
                // Keep completed for backward compatibility if needed
                completed: values.status === 'completed'
            });
            resetForm();
            onSuccess(); // Call onSuccess to trigger refresh
            onClose(); // Close modal after successful creation
        } catch (err) {
            setError('Failed to create todo. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
            <div 
                className="relative w-full max-w-[320px] sm:max-w-sm bg-gray-100 rounded-lg shadow-md p-3 max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button - Smaller and more compact */}
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* Compact heading */}
                <h1 className="text-2xl font-extrabold font-martian text-gray-800 mb-8 pb-1 inline-block">
                    Create New Task
                </h1>
                
                {error && <div className="p-1.5 mb-2 font-mono text-red-700 bg-red-100 rounded-lg text-xs">{error}</div>}
                
                <Formik
                    initialValues={initialValues}
                    validationSchema={TodoSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-2 font-martian">
                            <div>
                                <label htmlFor="title" className="block font-medium text-gray-800 mb-0.5 text-sm">Title</label>
                                <Field
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono text-sm"
                                    placeholder="Enter title"
                                />
                                <ErrorMessage name="title" component="div" className="mt-0.5 text-xs text-red-600" />
                            </div>

                            <div>
                                <label htmlFor="description" className="block font-medium text-gray-800 mb-0.5 text-sm">Description</label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    rows="2"
                                    className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono text-sm"
                                    placeholder="Enter description"
                                />
                                <ErrorMessage name="description" component="div" className="mt-0.5 text-xs text-red-600" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="priority" className="block font-medium text-gray-800 mb-0.5 text-sm">Priority</label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            id="priority"
                                            name="priority"
                                            className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono appearance-none text-sm"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </Field>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                                            <span className="text-xs">▼</span>
                                        </div>
                                    </div>
                                    <ErrorMessage name="priority" component="div" className="mt-0.5 text-xs text-red-600" />
                                </div>
                                
                                <div>
                                    <label htmlFor="status" className="block font-medium text-gray-800 mb-0.5 text-sm">Status</label>
                                    <div className="relative">
                                        <Field
                                            as="select"
                                            id="status"
                                            name="status"
                                            className="w-full px-2 py-1.5 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 font-mono appearance-none text-sm"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="inprogress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </Field>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-700">
                                            <span className="text-xs">▼</span>
                                        </div>
                                    </div>
                                    <ErrorMessage name="status" component="div" className="mt-0.5 text-xs text-red-600" />
                                </div>
                            </div>
                            
                            <div className="flex justify-between pt-3 gap-2">
                                <button 
                                    type="button" 
                                    onClick={onClose}
                                    className="bg-gray-800 text-white px-3 py-1 rounded-full font-medium text-sm hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || loading} 
                                    className="bg-amber-400 text-white px-3 py-1 rounded-full font-medium text-sm hover:bg-amber-500 transition disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateTodoModal;