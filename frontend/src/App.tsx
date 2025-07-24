import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';
import InterestsPage from './pages/InterestsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
  );
}