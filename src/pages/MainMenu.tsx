import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Play, Users, Coins, Zap } from 'lucide-react';

export const MainMenu = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/lobby');
  };

  const handleFriendlyGame = () => {
      navigate('/lobby?mode=private');
  };

  return (
    <div className="h-full flex flex-col px-6 pt-6 pb-24 overflow-hidden">
      <div className="flex justify-between items-start mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
             <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-gold-500 bg-slate-800 shadow-lg shadow-gold-500/10" />
             <div className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] border border-slate-700 px-1.5 rounded-md font-bold text-gold-400">
               Lv.{user.level}
             </div>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-base text-white">{user.name}</h2>
            <div className="text-xs text-slate-400">خوش آمدید</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-lg">
            <Coins size={16} className="text-gold-400 fill-gold-400" />
            <span className="text-gold-100 text-sm font-mono font-bold pt-0.5">{user.coins.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="text-center mb-2 shrink-0">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-amber-600 tracking-tight drop-shadow-sm">حکم زون</h1>
        </div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={handleStartGame}
          className="relative flex-1 min-h-[200px] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/20 group cursor-pointer border border-white/5"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=1000')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          
          <div className="absolute inset-0 p-6 flex flex-col justify-end items-start">
            <div className="mb-auto flex justify-between w-full">
                <span className="bg-gold-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-gold-500/20">
                    <Zap size={12} className="fill-black" /> آنلاین
                </span>
            </div>

            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-lg">شروع بازی</h2>
            <p className="text-slate-200 text-xs mb-5 max-w-[200px] leading-relaxed opacity-90 font-medium">
                ورود به لابی و رقابت با حریفان واقعی
            </p>
            
            <button className="w-full bg-white text-slate-950 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-xl text-base">
              <Play size={20} className="fill-current" />
              ورود به لابی
            </button>
          </div>
        </motion.div>

        <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={handleFriendlyGame}
            className="relative h-24 rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-800 group cursor-pointer bg-slate-900 flex items-center px-5 shrink-0"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent"></div>
            
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 ml-4 border border-indigo-500/20 shrink-0 relative">
                <Users size={24} />
            </div>
            
            <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-0.5">بازی دوستانه</h3>
                <p className="text-slate-400 text-[10px]">ساخت اتاق خصوصی یا پیوستن با کد</p>
            </div>

            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <Play size={14} className="ml-0.5" />
            </div>
        </motion.div>
      </div>
    </div>
  );
};
