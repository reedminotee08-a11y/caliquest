
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupProps {
  user: any;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user }) => {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username,
        age: parseInt(age),
        avatar_url: avatarUrl || `https://picsum.photos/seed/${username}/200`,
        onboarding_completed: true
      });

    if (!error) {
      window.location.reload(); // Refresh to update App state
    } else {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg glass-morphism p-10 space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-gaming text-emerald-400 mb-2 italic">IDENTITY SETUP</h2>
          <p className="text-slate-400">Define your presence in CaliQuest</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex justify-center">
            <img 
              src={avatarUrl || `https://picsum.photos/seed/guest/200`} 
              className="w-24 h-24 rounded-full border-2 border-emerald-500 object-cover bg-slate-800"
              alt="Avatar Preview" 
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 uppercase font-bold tracking-widest">Username / Callsign</label>
            <input 
              type="text" 
              required
              placeholder="e.g., PullUpBeast"
              className="w-full bg-slate-800/50 border border-slate-700 p-4 text-slate-100 focus:border-emerald-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 uppercase font-bold tracking-widest">Current Age</label>
            <input 
              type="number" 
              required
              className="w-full bg-slate-800/50 border border-slate-700 p-4 text-slate-100 focus:border-emerald-500 outline-none"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1 uppercase font-bold tracking-widest">Avatar Image URL (Optional)</label>
            <input 
              type="text" 
              placeholder="https://..."
              className="w-full bg-slate-800/50 border border-slate-700 p-4 text-slate-100 focus:border-emerald-500 outline-none"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 emerald-glow transition-all uppercase"
          >
            {loading ? 'INITIALIZING...' : 'BEGIN QUEST'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
