import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const INTERESTS = [
  "Nature & Mountains",
  "Culture & Heritage",
  "Spirituality & Wellness",
  "Adventure & Outdoor Activities",
  "Local Food & Culinary Experiences",
  "Arts, Music & Handicrafts",
  "Wildlife & Ecology",
  "City Life & Urban Exploration",
  "Community & Rural Life",
  "Festivals & Events"
];
const API_URL = 'http://localhost:3000'; // Change if backend runs elsewhere

export default function InterestsPage() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleToggle = interest => {
    setSelected(selected.includes(interest)
      ? selected.filter(i => i !== interest)
      : [...selected, interest]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('User not authenticated');
      return;
    }
    try {
      await axios.post(`${API_URL}/api/preference/create`, { user: userId, interest: selected }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save interests');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Select Your Interests</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {INTERESTS.map(interest => (
            <label key={interest} className="flex items-center">
              <input
                type="checkbox"
                checked={selected.includes(interest)}
                onChange={() => handleToggle(interest)}
                className="mr-2"
              />
              {interest}
            </label>
          ))}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Save Interests</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
} 