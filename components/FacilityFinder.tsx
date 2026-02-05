
import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, ExternalLink, Dumbbell, TreePine, Hospital, Loader2 } from 'lucide-react';
import { findNearbyFacilities } from '../services/geminiService';

const FacilityFinder: React.FC = () => {
  const [query, setQuery] = useState('Gyms');
  const [results, setResults] = useState<{ text: string, places: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!coords) return;
    setLoading(true);
    try {
      const res = await findNearbyFacilities(q, coords.lat, coords.lng);
      setResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">Facility Finder</h2>
          <p className="text-slate-500 dark:text-zinc-400 font-medium">Discover local health assets via Google Maps grounding.</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-slate-100 dark:border-zinc-800">
           <MapPin size={18} className="text-indigo-600 ml-2" />
           <span className="text-xs font-bold text-slate-400 uppercase mr-2">{coords ? `${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}` : 'Detecting...'}</span>
        </div>
      </header>

      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Gyms', icon: Dumbbell, color: 'text-orange-500' },
          { label: 'Public Parks', icon: TreePine, color: 'text-emerald-500' },
          { label: 'Hospitals', icon: Hospital, color: 'text-red-500' },
          { label: 'Swimming Pools', icon: Navigation, color: 'text-blue-500' },
        ].map(cat => (
          <button 
            key={cat.label}
            onClick={() => { setQuery(cat.label); handleSearch(cat.label); }}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl hover:border-indigo-200 transition-all shadow-sm"
          >
            <cat.icon size={18} className={cat.color} />
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-slate-100 dark:border-zinc-800 shadow-sm space-y-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-zinc-800 border-none rounded-3xl text-slate-800 dark:text-zinc-100 font-bold focus:ring-2 focus:ring-indigo-500"
            placeholder="Search for something specific..."
          />
          <button 
            onClick={() => handleSearch()}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
          >
            Find
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="animate-spin text-indigo-500" size={32} />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Grounding Map Data...</p>
          </div>
        ) : results && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-zinc-400">
                {results.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.places.filter(p => p.maps).map((place, i) => (
                   <a 
                    key={i}
                    href={place.maps.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-6 bg-slate-50 dark:bg-zinc-800 rounded-3xl group hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-100"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                           <MapPin size={18} />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[200px]">{place.maps.title}</span>
                     </div>
                     <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                   </a>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityFinder;
