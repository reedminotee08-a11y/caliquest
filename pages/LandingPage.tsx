
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900">
      <div className="max-w-4xl space-y-8 animate-fade-in py-20">
        <h1 className="text-6xl md:text-8xl font-black font-gaming text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter uppercase italic">
          CaliQuest
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The ultimate gamified arena for Calisthenics masters. Conquer maps, unlock levels, and forge your body into a living weapon. 
          <span className="block mt-4 text-emerald-400 font-bold uppercase tracking-widest">100% Free. No Excuses.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Link 
            to="/auth" 
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-none skew-x-[-12deg] transition-all duration-300 emerald-glow transform hover:scale-105"
          >
            <span className="inline-block skew-x-[12deg]">START YOUR QUEST</span>
          </Link>
          <a 
            href="#about"
            className="px-10 py-4 border-2 border-slate-700 hover:border-emerald-500 text-slate-300 font-bold rounded-none skew-x-[-12deg] transition-all"
          >
             <span className="inline-block skew-x-[12deg]">HOW IT WORKS</span>
          </a>
        </div>
      </div>

      <div id="about" className="mt-12 max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {[
          { title: "MAP SYSTEM", desc: "Progression through thematic zones designed for every skill level." },
          { title: "LEVEL UP", desc: "Unlock advanced moves as you prove your strength in previous phases." },
          { title: "VISUAL GUIDES", desc: "High-definition video instruction for every single rep." }
        ].map((item, idx) => (
          <div key={idx} className="glass-morphism p-8 text-left border-l-4 border-emerald-500">
            <h3 className="font-gaming text-emerald-400 text-xl mb-2">{item.title}</h3>
            <p className="text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      <footer className="w-full mt-auto py-12 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <p className="font-gaming text-[10px] md:text-xs text-slate-600 uppercase tracking-[0.4em] italic leading-relaxed">
            i give this work to my wonderful daria 2026 c
          </p>
          
          <div className="flex flex-col items-center gap-2">
            <a 
              href="https://www.instagram.com/0.ab._.dou.0/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-slate-500 hover:text-emerald-400 transition-all duration-300"
            >
              <svg 
                className="w-5 h-5 group-hover:scale-110 transition-transform" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="font-bold text-sm tracking-widest uppercase italic">0.ab._.dou.0</span>
            </a>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            <div className="h-px w-8 bg-slate-800"></div>
            <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse"></div>
            <div className="h-px w-8 bg-slate-800"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
