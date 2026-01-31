
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile, Map } from '../types';

interface GameDashboardProps {
  profile: Profile;
}

const GameDashboard: React.FC<GameDashboardProps> = ({ profile }) => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [completedMapIds, setCompletedMapIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all maps
      const { data: mapsData } = await supabase.from('maps').select('*').order('order_index', { ascending: true });
      setMaps(mapsData || []);

      // Fetch completed maps for this user
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('map_id')
        .eq('user_id', profile.id);
      
      // Fix: Ensure distinctCompletedMaps is string[] by mapping and casting map_id to string
      const distinctCompletedMaps = Array.from(new Set((progressData || []).map((p: any) => p.map_id as string)));
      setCompletedMapIds(distinctCompletedMaps);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isMapLocked = (map: Map, index: number) => {
    if (index === 0) return false; // First map is always open
    const prevMap = maps[index - 1];
    return !completedMapIds.includes(prevMap.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <img 
            src={profile.avatar_url || ''} 
            className="w-32 h-32 rounded-none border-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transform -rotate-3"
            alt="Profile"
          />
          <div>
            <h2 className="text-2xl font-gaming text-white italic">{profile.username}</h2>
            <p className="text-emerald-400 font-bold uppercase text-xs tracking-widest">RANK: RECRUIT</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-2 mt-8">
          <Link to="/game" className="p-3 bg-slate-800 text-emerald-400 border-l-4 border-emerald-500 font-bold">MAPS</Link>
          <button onClick={() => supabase.auth.signOut()} className="p-3 hover:bg-slate-800 text-slate-400 text-left">LOGOUT</button>
          {profile.is_admin && (
            <Link to="/admin" className="p-3 bg-red-900/20 text-red-400 border-l-4 border-red-500 font-bold mt-4">ADMIN PANEL</Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black font-gaming text-slate-100 uppercase italic leading-none">THE ARENA</h1>
          <div className="h-1 w-24 bg-emerald-500 mt-2"></div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
          </div>
        ) : maps.length === 0 ? (
          <div className="glass-morphism p-12 text-center border-2 border-dashed border-slate-700">
            <h3 className="text-2xl font-gaming text-slate-500 italic">NO MAPS DEPLOYED YET.</h3>
            <p className="text-slate-600 mt-2 italic">The battlefield is still under construction...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {maps.map((map, idx) => {
              const locked = isMapLocked(map, idx);
              return (
                <div key={map.id} className={`group relative transition-all duration-500 ${locked ? 'opacity-40 grayscale' : 'hover:scale-[1.02]'}`}>
                  <Link 
                    to={locked ? '#' : `/map/${map.id}`}
                    className={`block glass-morphism p-8 min-h-[200px] border-l-8 ${locked ? 'border-slate-700 cursor-not-allowed' : 'border-emerald-500 emerald-glow cursor-pointer'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-emerald-500 font-gaming text-sm">REGION 0{idx + 1}</span>
                      {locked && <span className="text-slate-500 text-2xl">🔒</span>}
                    </div>
                    <h3 className="text-3xl font-gaming text-white uppercase mt-2">{map.name}</h3>
                    <p className="text-slate-400 mt-4 line-clamp-2">{map.description}</p>
                    
                    {!locked && (
                      <div className="mt-6 flex items-center text-emerald-400 font-bold text-sm tracking-widest group-hover:translate-x-2 transition-transform">
                        ENTER MAP <span className="ml-2">→</span>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default GameDashboard;
