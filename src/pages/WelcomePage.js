import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TodoCard from '../components/TodoCard';
import CreateTodoModal from '../components/CreateTodoModal';

const WelcomePage = () => {
    const [uncompletedCount, setUncompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const navigate = useNavigate();
    const { isLoggedIn, userData, loading: authLoading, setUserData } = useAuth();

    const fetchUserData = useCallback(async () => {
        try {
            // First fetch user data if it's not already loaded
            if (!userData || !userData.firstName) {
                try {
                    const userResponse = await axiosInstance.get('/auth/me');
                    setUserData(userResponse.data);
                } catch (userErr) {
                    console.error('Error fetching user data:', userErr);
                }
            }
            
            // Fetch todos count
            const todosResponse = await axiosInstance.get('/todos');
            const todos = todosResponse.data;
            
            // Count todos that don't have 'completed' status
            const uncompleted = todos.filter(todo => 
                todo.status !== 'completed' 
            ).length;
            
            setUncompletedCount(uncompleted);
            setTotalCount(todos.length);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    }, [userData, setUserData]);

    const handleTodoCreated = useCallback(() => {
        fetchUserData();
        setRefreshTrigger(prev => prev + 1);
    }, [fetchUserData]);

    useEffect(() => {
        if (authLoading) return;
        
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        fetchUserData();
    }, [isLoggedIn, navigate, fetchUserData, authLoading]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center h-screen text-lg font-medium text-gray-600">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Content container with responsive width and padding */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                {/* Header section */}
                <header className="mb-6 sm:mb-8 md:mb-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        {/* Left side: User info */}
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-gray-800">
                                Hi, {userData?.firstName || userData?.username || 'User'}
                            </h1>
                            <p className="text-sm md:text-base font-mono text-gray-600 mt-1">
                                You have {uncompletedCount}/{totalCount} uncompleted cards
                            </p>
                        </div>
                        
                        {/* Right side: Task Reports */}
                        <div className="sm:text-right">
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-mono">
                                <div className="font-medium">Task Reports</div>
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Main content */}
                <main className="mb-20 mt-40 sm:mb-24">
                    <TodoCard refreshTrigger={refreshTrigger} />
                </main>
            </div>
            
            {/* Create new todo button - Responsive positioning with safe bottom margin */}
            <div className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 z-10">
                <button 
                    onClick={openModal}
                    className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                    aria-label="Create new task"
                >
                    <span className="text-2xl">+</span>
                </button>
                <span className="block text-xs mt-1 font-mono text-center">
                    create task
                </span>
            </div>
            
            {/* Todo Creation Modal */}
            <CreateTodoModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onSuccess={handleTodoCreated}
            />
        </div>
    );
};

export default WelcomePage;