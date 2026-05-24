import React, { useState } from 'react';
import { generateIntelligence, IntelligenceResponse } from '../services/intelligenceApi';

const IntelligenceGenerator: React.FC = () => {
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('Global');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IntelligenceResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateIntelligence({
        company_name: companyName.trim(),
        country: country.trim() || 'Global'
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during research.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Company Intelligence Generator</h2>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. NVIDIA"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              placeholder="e.g. United States"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !companyName}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Researching...' : 'Generate Intelligence'}
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results State */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-4 border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">{result.company_name}</h3>
            <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Research Complete</span>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Golden Record Data (163 Fields)</h4>
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
              <pre className="text-blue-400 font-mono text-xs leading-relaxed">
                {JSON.stringify(result.golden_record, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligenceGenerator;