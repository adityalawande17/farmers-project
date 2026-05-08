import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

export default function MandiPrices() {
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [advice, setAdvice] = useState('');
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');
  const [searchState, setSearchState] = useState(user?.location?.state || 'Maharashtra');

  const STATES = ['Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Karnataka'];

  const fetchPrices = async () => {
    setLoading(true);
    setError('');
    setPrices([]);
    setSelected(null);
    setAdvice('');
    try {
      const { data } = await axios.get(`${API}/prices`, {
        params: { state: searchState, commodity: searchCrop || undefined }
      });
      if (data.length === 0) {
        setError('No price data found for this search. Try a different crop or state.');
      } else {
        setPrices(data);
        setSelected(data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, []);

  const getAdvice = async () => {
    if (!selected) return;
    setAdviceLoading(true);
    setAdvice('');
    try {
      const { data } = await axios.post(`${API}/ai/sell-advice`, {
        crop: selected.commodity,
        quantity: 50,
        currentPrice: selected.modal_price,
        minPrice: selected.min_price,
        maxPrice: selected.max_price,
        location: `${selected.market}, ${selected.district}, ${selected.state}`,
        priceHistory: [],
      });
      setAdvice(data.advice);
    } catch {
      setAdvice('Unable to generate advice. Please try again.');
    } finally {
      setAdviceLoading(false);
    }
  };

  const formatPrice = (p) => p ? `₹${Number(p).toLocaleString('en-IN')}` : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium text-gray-900">Mandi Price Tracker</h1>
        <p className="text-sm text-gray-400 mt-1">Real prices from Government of India · data.gov.in</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-500 mb-1.5">Crop Name</label>
          <input
            value={searchCrop}
            onChange={e => setSearchCrop(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPrices()}
            placeholder="e.g. Tomato, Wheat, Onion"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs text-gray-500 mb-1.5">State</label>
          <select
            value={searchState}
            onChange={e => setSearchState(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white"
          >
            {STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search Prices'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-gray-100" />)}
        </div>
      ) : prices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price list */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700">Results ({prices.length})</h2>
              <span className="text-xs text-gray-400">{searchState}</span>
            </div>
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {prices.map((p, i) => (
                <button key={i} onClick={() => { setSelected(p); setAdvice(''); }}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selected?._id === p._id || (selected?.commodity === p.commodity && selected?.market === p.market)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{p.commodity}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.market}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatPrice(p.modal_price)}/q</div>
                      <div className="text-xs text-gray-400">{p.arrival_date}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail + AI Advisor */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {selected && (
              <>
                {/* Price detail card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selected.commodity}</h2>
                      <p className="text-sm text-gray-400">{selected.market}, {selected.district}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{selected.arrival_date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-red-500 mb-1">Min Price</div>
                      <div className="text-base font-semibold text-red-700">{formatPrice(selected.min_price)}</div>
                      <div className="text-xs text-gray-400">per quintal</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-green-600 mb-1">Modal Price</div>
                      <div className="text-base font-semibold text-green-700">{formatPrice(selected.modal_price)}</div>
                      <div className="text-xs text-gray-400">per quintal</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-blue-500 mb-1">Max Price</div>
                      <div className="text-base font-semibold text-blue-700">{formatPrice(selected.max_price)}</div>
                      <div className="text-xs text-gray-400">per quintal</div>
                    </div>
                  </div>
                  {selected.variety && (
                    <p className="text-xs text-gray-400 mt-3">Variety: {selected.variety}</p>
                  )}
                </div>

                {/* AI Sell Advisor */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-gray-700">AI Sell Advisor</h2>
                    <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">AI</span>
                  </div>

                  {!advice && !adviceLoading && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-4">
                        Should you sell your <span className="font-medium text-green-700">{selected.commodity}</span> now at {formatPrice(selected.modal_price)}/q or wait?
                      </p>
                      <button onClick={getAdvice}
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors">
                        Get AI Advice
                      </button>
                    </div>
                  )}

                  {adviceLoading && (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Analyzing market data...</span>
                    </div>
                  )}

                  {advice && (
                    <div>
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <p className="text-sm text-green-800 leading-relaxed whitespace-pre-line">{advice}</p>
                      </div>
                      <button onClick={getAdvice} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
                        Refresh advice
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      ) : !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="text-5xl">🌾</div>
          <p className="text-gray-500 text-sm">Search for a crop and state above to see live mandi prices</p>
        </div>
      )}

      {/* Data source note */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-300">
          Data sourced from Government of India · Agmarknet via data.gov.in
        </p>
      </div>
    </div>
  );
}
