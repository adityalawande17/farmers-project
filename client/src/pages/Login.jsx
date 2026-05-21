import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FarmSlideshow from '../components/FarmSlideshow';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.phone, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Left — form */}
      <div className="w-full md:w-[520px] shrink-0 flex items-center justify-center px-10 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-green-500 rounded-tl-full rounded-tr-full rounded-br-full mx-auto mb-3 flex items-center justify-center text-2xl">🌿</div>
            <h1 className="text-3xl font-serif text-green-800 font-medium">FarmSense</h1>
            <p className="text-gray-500 text-sm mt-1">AI-Powered Smart Farming</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Welcome back</h2>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-60 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              New farmer?{' '}
              <Link to="/register" className="text-green-600 font-medium hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:flex items-center justify-center px-1 shrink-0">
        <div className="h-40 w-px bg-gray-300" />
      </div>

      {/* Right — slideshow */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <FarmSlideshow />
      </div>
    </div>
  );
}
