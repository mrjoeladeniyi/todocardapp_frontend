import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axios';

const TodoCard = ({ refreshTrigger = 0 }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timers, setTimers] = useState({});
    const [activeTimers, setActiveTimers] = useState({});
    const [editingId, setEditingId] = useState(null); // Track which todo is being edited
    const [editForm, setEditForm] = useState({}); // Store edited values
    
    // Create a ref to track activeTimers for cleanup
    const activeTimersRef = useRef({});
    
    // Keep the ref updated with the latest activeTimers value
    useEffect(() => {
        activeTimersRef.current = activeTimers;
    }, [activeTimers]);

    // Add refreshTrigger to the dependency array
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/todos');
                // Convert all status values to frontend format
                const formattedTodos = response.data.map(todo => ({
                    ...todo,
                    status: formatStatusForDisplay(todo.status)
                }));
                setTodos(formattedTodos);
            } catch (err) {
                setError('Failed to fetch todos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodos();
        
        return () => {
            Object.values(activeTimersRef.current).forEach(interval => clearInterval(interval));
        };
    }, [refreshTrigger]); // Add refreshTrigger to the dependency array

    // Add a utility function at the top of your component to handle format conversion
    const formatStatusForDisplay = (backendStatus) => {
        // Convert backend format to frontend display format
        if (backendStatus === 'in-progress') return 'inprogress';
        return backendStatus;
    };

    const formatStatusForBackend = (displayStatus) => {
        // Convert frontend format to backend format
        if (displayStatus === 'inprogress') return 'in-progress';
        return displayStatus;
    };

    // Replace handleStatusToggle with a function that cycles through all three states
    const handleStatusToggle = async (id, currentStatus) => {
        try {
            // Cycle through status values: pending -> inprogress -> completed -> pending
            const nextStatus = 
                currentStatus === 'pending' ? 'inprogress' :
                currentStatus === 'inprogress' ? 'completed' : 'pending';
                
            await axiosInstance.put(`/todos/${id}`, { 
                status: formatStatusForBackend(nextStatus)
            });
            
            setTodos(todos.map(todo => 
                todo._id === id ? { ...todo, status: nextStatus } : todo
            ));
        } catch (err) {
            setError('Error updating todo: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/todos/${id}`);
            
            // Stop timer if active
            if (activeTimers[id]) {
                clearInterval(activeTimers[id]);
                const newActiveTimers = {...activeTimers};
                delete newActiveTimers[id];
                setActiveTimers(newActiveTimers);
            }
            
            setTodos(todos.filter(todo => todo._id !== id));
        } catch (err) {
            setError('Error deleting todo: ' + err.message);
        }
    };
    
    // Start edit mode (modify to use status instead of completed)
    const handleEdit = (todo) => {
        setEditingId(todo._id);
        setEditForm({
            title: todo.title,
            description: todo.description,
            priority: todo.priority || 'medium',
            status: todo.status || 'pending'
        });
    };
    
    // Cancel edit mode
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };
    
    // Save edits
    const handleSaveEdit = async (id) => {
        try {
            // Format the status before sending to backend
            const formattedEditForm = {
                ...editForm,
                status: formatStatusForBackend(editForm.status)
            };
            
            await axiosInstance.put(`/todos/${id}`, formattedEditForm);
            
            // Update local state with edited todo
            setTodos(todos.map(todo => 
                todo._id === id ? { ...todo, ...editForm } : todo
            ));
            
            // Exit edit mode
            setEditingId(null);
            setEditForm({});
        } catch (err) {
            setError('Error updating todo: ' + err.message);
        }
    };
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const toggleTimer = (id) => {
        // If timer is running, stop it
        if (activeTimers[id]) {
            clearInterval(activeTimers[id]);
            const newActiveTimers = {...activeTimers};
            delete newActiveTimers[id];
            setActiveTimers(newActiveTimers);
            return;
        }
        
        // Start the timer
        const interval = setInterval(() => {
            setTimers(prev => ({
                ...prev,
                [id]: (prev[id] || 0) + 1
            }));
        }, 1000);
        
        setActiveTimers(prev => ({
            ...prev,
            [id]: interval
        }));
    };
    
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="flex justify-center items-center p-4 text-gray-600">Loading todos...</div>;
    if (error) return <div className="p-4 text-red-500 border border-red-300 rounded bg-red-50">{error}</div>;
    if (todos.length === 0) return <div className="p-4 text-gray-500 text-center">No todos found. Create your first one!</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {todos.map(todo => (
                <div 
                    key={todo._id} 
                    className="bg-white rounded-lg shadow-md p-5 font-mono flex flex-col h-full"
                >
                    {editingId === todo._id ? (
                        // EDIT MODE - Styled to match view mode
                        <div className="flex flex-col h-full">
                            {/* Title Input - Styled like the title */}
                            <div className="mb-3">
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={editForm.title} 
                                    onChange={handleInputChange}
                                    className="w-full text-xl md:text-2xl font-martian text-gray-800 px-0 py-1 bg-transparent focus:outline-none focus:border-blue-600"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                            
                            {/* Description - Match the flex-grow and max height */}
                            <div className="mb-4 flex-grow">
                                <textarea 
                                    name="description" 
                                    value={editForm.description || ''} 
                                    onChange={handleInputChange}
                                    className="w-full h-24 max-h-24 text-gray-600 font-mono leading-relaxed bg-white rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            
                            <div className="mt-auto">
                                {/* Timer Section - Same as view mode */}
                                <div className="flex items-center mb-3">
                                    <button 
                                        className="bg-gray-800 text-white rounded-full py-1 px-3 text-xs font-medium opacity-50 cursor-not-allowed"
                                        disabled
                                    >
                                        Timer
                                    </button>
                                    <span className="ml-2 font-mono text-gray-600 text-sm">
                                        {formatTime(timers[todo._id] || 0)}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center mb-3">
                                    {/* Priority Dropdown - Styled to match view mode */}
                                    <div className="flex items-center">
                                        <select
                                            name="priority"
                                            value={editForm.priority}
                                            onChange={handleInputChange}
                                            className="bg-transparent border-0 text-sm text-gray-800 font-mono focus:outline-none focus:ring-0 p-0 pr-6 appearance-none"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <span 
                                            className={`h-3 w-3 ml-2 rounded-full inline-block ${
                                                editForm.priority?.toLowerCase() === 'high' ? 'bg-red-500' : 
                                                editForm.priority?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 
                                                'bg-green-500'
                                            }`}>
                                        </span>
                                    </div>
                                    
                                    {/* Status - Styled like the original status pill */}
                                    <div className="bg-gray-200 rounded-full py-1 px-3 inline-block cursor-pointer shadow text-sm">
                                        <div className="flex items-center">
                                            <select
                                                name="status"
                                                value={editForm.status}
                                                onChange={handleInputChange}
                                                className="bg-transparent border-0 text-sm font-mono focus:outline-none focus:ring-0 p-0 appearance-none"
                                                style={{ 
                                                    color: editForm.status === 'completed' ? 'green' : 
                                                           editForm.status === 'inprogress' ? 'blue' : 'orange' 
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="inprogress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                            <span className="ml-1 text-xs">▼</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Edit Action Buttons - Same layout as view mode */}
                                <div className="flex space-x-2">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-1 rounded-full font-medium text-sm hover:bg-green-600 transition flex-1"
                                        onClick={() => handleSaveEdit(todo._id)}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        className="bg-gray-400 text-white px-4 py-1 rounded-full font-medium text-sm hover:bg-gray-500 transition flex-1"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // VIEW MODE - Unchanged
                        <div className="flex flex-col h-full">
                            {/* Title */}
                            <h3 className="text-xl md:text-2xl font-martian text-gray-800 mb-4 pb-1 inline-block">
                                {todo.title}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 text-xs mb-4 font-martian leading-relaxed flex-grow overflow-y-auto max-h-24">
                                {todo.description}
                            </p>
                            
                            <div className="mt-auto">
                                {/* Timer Section */}
                                <div className="flex items-center mb-3">
                                    <button 
                                        className="bg-gray-800 text-white rounded-full py-1 px-3 text-xs font-medium"
                                        onClick={() => toggleTimer(todo._id)}
                                    >
                                        {activeTimers[todo._id] ? "Stop" : "Start"} Timer
                                    </button>
                                    <span className="ml-2 font-mono text-gray-600 text-sm">
                                        {formatTime(timers[todo._id] || 0)}
                                    </span>
                                </div>
                                
                                {/* Priority and Status */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <span className="font-mono text-gray-800 mr-2 text-sm">{todo.priority}</span>
                                        <span 
                                            className={`h-3 w-3 rounded-full inline-block ${
                                                todo.priority?.toLowerCase() === 'high' ? 'bg-red-500' : 
                                                todo.priority?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 
                                                'bg-green-500'
                                            }`}>
                                        </span>
                                    </div>
                                    
                                    <div 
                                        className="bg-gray-200 rounded-full py-1 px-3 inline-block cursor-pointer shadow text-sm"
                                        onClick={() => handleStatusToggle(todo._id, todo.status)}
                                    >
                                        <div className="flex items-center">
                                            <span className={`font-mono ${
                                                todo.status === 'completed' ? 'text-green-700' : 
                                                todo.status === 'inprogress' ? 'text-blue-700' : 'text-orange-700'
                                            }`}>
                                                {todo.status === 'completed' ? 'Completed' : 
                                                 todo.status === 'inprogress' ? 'In Progress' : 'Pending'}
                                            </span>
                                            <span className="ml-1 text-xs">▼</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex space-x-2">
                                    <button 
                                        className="bg-amber-400 text-white px-4 py-1 rounded-full font-medium text-sm hover:bg-amber-500 transition flex-1"
                                        onClick={() => handleEdit(todo)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-1 rounded-full font-medium text-sm hover:bg-red-600 transition flex-1"
                                        onClick={() => handleDelete(todo._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TodoCard;