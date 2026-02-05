
import React, { useState, useEffect } from 'react';
import { Wind, ShieldCheck, MapPin, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { getAQIAdvice } from '../services/geminiService';
import { AQIStatus } from '../types';

const AQIAdvisor: React.FC = () => {
  const [status, setStatus] = useState<AQIStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('New York');

  const fetchAQIData = async () => {
    setLoading(true);
    try {
      const data = await getAQIAdvice(location);
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAQIData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
              <Wind size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">AQI Survival Hub</h2>
              <p className="text-slate-500 text-sm">Real-time air quality safety guidelines.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500"
                placeholder="Enter city..."
              />
            </div>
            <button 
              onClick={fetchAQIData}
              className="bg-teal-600 text-white p-2.5 rounded-xl hover:bg-teal-700 transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-100 border-t-teal-600" />
            <p className="font-medium">Fetching real-time air quality data...</p>
          </div>
        ) : status && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl flex flex-col items-center text-center">
                <p className="text-xs font-bold text-teal-600 uppercase mb-2">Health Category</p>
                <ShieldCheck size={40} className="text-teal-600 mb-3" />
                <p className="text-xl font-bold text-teal-900 capitalize">{location} Status</p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800">Survival Recommendations:</h3>
                <div className="prose prose-sm prose-teal max-w-none text-slate-600 leading-relaxed">
                  {status.recommendation.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-teal-600" />
                Grounding Sources
              </h4>
              <div className="flex flex-wrap gap-3">
                {status.sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white hover:border-teal-200 hover:text-teal-600 transition-all"
                  >
                    {source.title.substring(0, 30)}...
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-8 rounded-[40px] text-white">
        <h3 className="text-xl font-bold mb-4">Universal AQI Safety Tips</h3>
        <ul className="space-y-3">
          {[
            "Seal windows and doors using weather-stripping or damp towels during peaks.",
            "Run air purifiers with HEPA filters in 'Sleep' or 'High' mode.",
            "Avoid vacuuming or burning candles which increase indoor particulates.",
            "When outdoors, wear an N95 or P100 respirator mask tightly fitted.",
            "Hydrate well to keep mucosal membranes moist against pollutants."
          ].map((tip, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">{i+1}</span>
              <span className="opacity-90">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AQIAdvisor;
