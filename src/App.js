import React from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';
import { AuthProvider } from './context/AuthContext';
import CreateTodoPage from './pages/CreateTodoPage';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen grid grid-rows-[auto_1fr] mt-6">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/todos" element={<WelcomePage />} />
          <Route path="/todos/create" element={<CreateTodoPage />} /> {/* Dynamic route for todo details */}
          <Route path='*' element={<HomePage />} /> {/* Fallback route for unmatched paths */}
          {/* Add other routes here as needed */}
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
