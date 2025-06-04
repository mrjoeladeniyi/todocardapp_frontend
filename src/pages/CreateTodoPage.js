import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axios';

function CreateTodoPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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
            .oneOf(['pending', 'in progress', 'completed'], 'Invalid status')
            .required('Status is required')
    });

    const initialValues = {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending'
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoading(true);
        setError(null);

        try {
            await axiosInstance.post('/todos', {
                ...values,
                completed: values.status === 'completed'
            });
            navigate('/');
        } catch (err) {
            setError('Failed to create todo. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-mono text-gray-800 mb-6 border-b border-blue-400 pb-1 inline-block">
                    Create New Task Card
                </h1>
                
                {error && <div className="p-3 mb-4 font-mono text-red-700 bg-red-100 rounded-lg">{error}</div>}
                
                <Formik
                    initialValues={initialValues}
                    validationSchema={TodoSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-5 font-mono">
                            <div>
                                <label htmlFor="title" className="block font-medium text-gray-800 mb-1">Title</label>
                                <Field
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                                    placeholder="Enter task title"
                                />
                                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                                <label htmlFor="description" className="block font-medium text-gray-800 mb-1">Description</label>
                                <Field
                                    as="textarea"
                                    id="description"
                                    name="description"
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                                    placeholder="Enter task description"
                                />
                                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                                <label htmlFor="dueDate" className="block font-medium text-gray-800 mb-1">Due Date</label>
                                <Field
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                                />
                                <ErrorMessage name="dueDate" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                                <label htmlFor="priority" className="block font-medium text-gray-800 mb-1">Priority</label>
                                <div className="relative">
                                    <Field
                                        as="select"
                                        id="priority"
                                        name="priority"
                                        className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono appearance-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </Field>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <span className="text-sm">▼</span>
                                    </div>
                                </div>
                                <ErrorMessage name="priority" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                                <label htmlFor="status" className="block font-medium text-gray-800 mb-1">Status</label>
                                <div className="relative">
                                    <Field
                                        as="select"
                                        id="status"
                                        name="status"
                                        className="w-full px-3 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono appearance-none"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </Field>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <span className="text-sm">▼</span>
                                    </div>
                                </div>
                                <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div className="flex justify-between pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/todos')}
                                    className="bg-gray-800 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || loading} 
                                    className="bg-amber-400 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-500 transition disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default CreateTodoPage;