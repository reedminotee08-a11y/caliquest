
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile, Level, Map } from '../types';

interface MapDetailsProps {
  profile: Profile;
}

const MapDetails: React.FC<MapDetailsProps> = ({ profile }) => {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const [map, setMap] = useState<Map | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mapId) fetchData(mapId);
  }, [mapId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const { data: mapData } = await supabase.from('maps').select('*').eq('id', id).single();
      setMap(mapData);

      const { data: levelsData } = await supabase.from('levels').select('*').eq('map_id', id).order('order_index', { ascending: true });
      setLevels(levelsData || []);

      const { data: progressData } = await supabase.from('user_progress').select('level_id').eq('user_id', profile.id).eq('map_id', id);
      setCompletedLevelIds(progressData?.map(p => p.level_id) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLevelLocked = (level: Level, index: number) => {
    if (index === 0) return false;
    const prevLevel = levels[index - 1];
    return !completedLevelIds.includes(prevLevel.id);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/game')} className="text-emerald-500 hover:text-emerald-400 mb-8 font-bold flex items-center gap-2">
          ← BACK TO ARENA
        </button>

        <header className="mb-12 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black font-gaming text-white uppercase italic">{map?.name}</h1>
          <p className="text-xl text-slate-400 max-w-2xl">{map?.description}</p>
        </header>

        {levels.length === 0 ? (
          <div className="glass-morphism p-12 text-center border-2 border-dashed border-slate-700">
            <h3 className="text-2xl font-gaming text-slate-500 italic">THIS REGION HAS NO STAGES YET.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level, idx) => {
              const locked = isLevelLocked(level, idx);
              const completed = completedLevelIds.includes(level.id);
              
              return (
                <div key={level.id} className={`relative group ${locked ? 'opacity-40' : 'hover:-translate-y-2'} transition-all duration-300`}>
                  <Link 
                    to={locked ? '#' : `/level/${level.id}`}
                    className={`block p-8 border-2 ${completed ? 'border-emerald-500 bg-emerald-500/5' : locked ? 'border-slate-800' : 'border-slate-700 hover:border-emerald-400'} bg-slate-900 h-full`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-gaming text-emerald-500">STAGE {idx + 1}</span>
                      {locked ? <span>🔒</span> : completed ? <span className="text-emerald-400">✓ COMPLETED</span> : null}
                    </div>
                    <h3 className="text-2xl font-gaming text-white mb-4 italic">{level.name}</h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-6">{level.description}</p>
                    
                    {!locked && (
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 py-2 border-t border-slate-800 mt-auto">
                        {completed ? 'REPLAY MISSION' : 'START MISSION'}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapDetails;
