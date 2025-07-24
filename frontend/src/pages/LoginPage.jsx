import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/user/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id);
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-2 border rounded" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
