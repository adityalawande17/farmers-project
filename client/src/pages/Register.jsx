import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CROP_OPTIONS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Chilli'];
const STATES = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Telangana'];
const LANGUAGES = [{ value: 'en', label: 'English' }, { value: 'hi', label: 'हिंदी' }, { value: 'mr', label: 'मराठी' }, { value: 'pa', label: 'ਪੰਜਾਬੀ' }];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    location: { state: 'Maharashtra', district: '', village: '' },
    farmSize: '', crops: [], preferredLanguage: 'en',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateLocation = (field, value) => setForm(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
  const toggleCrop = (crop) => {
    setForm(prev => ({
      ...prev,
      crops: prev.crops.includes(crop) ? prev.crops.filter(c => c !== crop) : [...prev.crops, crop],
    }));
  };

  // Gets GPS coordinates — resolves silently if denied
  const getCoordinates = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: null, lon: null });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({ lat: null, lon: null }), // silent fail if denied
        { timeout: 5000 }
      );
    });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // Capture GPS before submitting — won't block if denied
      const coordinates = await getCoordinates();

      await register({
        ...form,
        farmSize: parseFloat(form.farmSize) || 0,
        coordinates, // saved to DB — { lat, lon } or { lat: null, lon: null }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-tl-full rounded-tr-full rounded-br-full mx-auto mb-3 flex items-center justify-center text-2xl">🌿</div>
          <h1 className="text-3xl font-serif text-green-800 font-medium">FarmSense</h1>
          <p className="text-gray-500 text-sm mt-1">Create your farmer account</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-green-500' : s < step ? 'w-4 bg-green-300' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 border border-red-100">{error}</div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                <input value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Ramesh Kumar" required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="10-digit mobile number" required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                  placeholder="Create a password" required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Preferred Language</label>
                <select value={form.preferredLanguage} onChange={e => update('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white transition-colors">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <button onClick={() => form.name && form.phone && form.password ? setStep(2) : null}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors mt-2">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Location & Farm */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Farm Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">State</label>
                <select value={form.location.state} onChange={e => updateLocation('state', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white transition-colors">
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">District</label>
                <input value={form.location.district} onChange={e => updateLocation('district', e.target.value)}
                  placeholder="e.g. Pune" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Village / Town</label>
                <input value={form.location.village} onChange={e => updateLocation('village', e.target.value)}
                  placeholder="e.g. Shirur" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Farm Size (acres)</label>
                <input type="number" value={form.farmSize} onChange={e => update('farmSize', e.target.value)}
                  placeholder="e.g. 5.5" min="0" step="0.1"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors">Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Crops */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Your Crops</h2>
              <p className="text-sm text-gray-500 -mt-2">Select crops you grow (pick all that apply)</p>
              <div className="grid grid-cols-2 gap-2">
                {CROP_OPTIONS.map(crop => (
                  <button key={crop} onClick={() => toggleCrop(crop)}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-colors text-left ${
                      form.crops.includes(crop)
                        ? 'bg-green-50 border-green-300 text-green-800 font-medium'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                    {crop}
                  </button>
                ))}
              </div>

              {/* GPS notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700">
                  We'll ask for your location when you tap Create Account — this lets us give you accurate weather and market data. You can deny it and it will still work.
                </p>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">← Back</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
                  {loading ? 'Getting location...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
