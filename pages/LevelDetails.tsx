
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Profile, Level, Exercise } from '../types';

interface LevelDetailsProps {
  profile: Profile;
}

const LevelDetails: React.FC<LevelDetailsProps> = ({ profile }) => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (levelId) fetchData(levelId);
  }, [levelId]);

  const fetchData = async (id: string) => {
    setLoading(true);
    try {
      const { data: levelData } = await supabase.from('levels').select('*').eq('id', id).single();
      setLevel(levelData);

      const { data: exData } = await supabase.from('exercises').select('*').eq('level_id', id).order('order_index', { ascending: true });
      setExercises(exData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!level) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('user_progress').insert({
        user_id: profile.id,
        map_id: level.map_id,
        level_id: level.id
      });
      
      if (error && error.code !== '23505') { 
        alert(error.message);
      } else {
        alert('MISSION SUCCESSFUL: PROGRESS SYNCED.');
        navigate(`/map/${level.map_id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <button onClick={() => navigate(`/map/${level?.map_id}`)} className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors flex items-center gap-2 uppercase tracking-widest text-sm">
          <span className="text-xl">←</span> RETURN TO MAP
        </button>

        <header className="text-center border-b border-slate-800 pb-12">
          <h2 className="text-emerald-500 font-gaming uppercase tracking-[0.3em] mb-2 text-xs">TACTICAL BRIEFING</h2>
          <h1 className="text-4xl md:text-6xl font-black font-gaming text-white uppercase italic tracking-tighter">{level?.name}</h1>
          <p className="text-slate-400 mt-4 italic max-w-2xl mx-auto leading-relaxed">{level?.description}</p>
        </header>

        <div className="space-y-12">
          {exercises.map((ex, idx) => (
            <section key={ex.id} className="glass-morphism overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors duration-500">
              <div className="p-6 bg-slate-800/50 flex items-center gap-4 border-b border-slate-700">
                <span className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-slate-900 font-black italic text-xl skew-x-[-12deg]">
                  <span className="skew-x-[12deg]">{idx + 1}</span>
                </span>
                <h3 className="text-2xl font-gaming text-white italic uppercase">{ex.name}</h3>
              </div>
              
              <div className="p-0 aspect-video bg-black flex items-center justify-center relative">
                {ex.video_url ? (
                  <video 
                    className="w-full h-full object-contain shadow-2xl"
                    controls
                    playsInline
                    src={ex.video_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-700">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="font-gaming uppercase text-xs tracking-[0.2em]">VIDEO FEED OFFLINE</p>
                  </div>
                )}
              </div>

              <div className="p-8 space-y-4 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <h4 className="text-emerald-400 font-black text-xs tracking-[0.3em] uppercase">EXECUTION PROTOCOL</h4>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line font-medium text-sm md:text-base">
                  {ex.description}
                </p>
              </div>
            </section>
          ))}
        </div>

        {exercises.length > 0 ? (
          <div className="pt-12 flex justify-center pb-20">
            <button 
              onClick={handleComplete}
              disabled={saving}
              className="group relative px-20 py-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-2xl italic tracking-tighter emerald-glow transition-all transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10">{saving ? 'SYNCHRONIZING...' : 'STAGE CLEAR - TRANSMIT PROGRESS'}</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 glass-morphism">
             <p className="text-slate-600 font-gaming uppercase tracking-widest italic">AWAITING MISSION DATA DEPLOYMENT.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelDetails;
