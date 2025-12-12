import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Coins, Zap, Trophy, X } from 'lucide-react';

export const MainMenu = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [targetScore, setTargetScore] = useState(3);

  const startGame = () => {
    navigate(`/game?mode=online&target=${targetScore}`);
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
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-amber-600 tracking-tight drop-shadow-sm">حکم رویال</h1>
        </div>

        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowSettings(true)}
          className="relative flex-1 min-h-[200px] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/20 group cursor-pointer border border-white/5"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511193311914-0346f16efe90?q=80&w=1000')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          
          <div className="absolute inset-0 p-6 flex flex-col justify-end items-start">
            <div className="mb-auto flex justify-between w-full">
                <span className="bg-gold-500 text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg shadow-gold-500/20">
                    <Zap size={12} className="fill-black" /> آنلاین
                </span>
                <span className="bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
                    ۲ سکه
                </span>
            </div>

            <h2 className="text-3xl font-black text-white mb-1 drop-shadow-lg">شروع بازی</h2>
            <p className="text-slate-200 text-xs mb-5 max-w-[200px] leading-relaxed opacity-90 font-medium">
                رقابت با حریفان واقعی در محیطی حرفه‌ای
            </p>
            
            <button className="w-full bg-white text-slate-950 h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors shadow-xl text-base">
              <Play size={20} className="fill-current" />
              بازی کن
            </button>
          </div>
        </motion.div>

        <Link to="/lobby" className="block shrink-0">
            <motion.div 
            whileTap={{ scale: 0.98 }}
            className="relative h-24 rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-800 group cursor-pointer bg-slate-900 flex items-center px-5"
            >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-transparent"></div>
            
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 ml-4 border border-indigo-500/20 shrink-0 relative">
                <Users size={24} />
                {user.gameRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
            </div>
            
            <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-0.5">بازی دوستانه</h3>
                <p className="text-slate-400 text-[10px]">ساخت اتاق و مدیریت درخواست‌ها</p>
            </div>

            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <Play size={14} className="ml-0.5" />
            </div>
            </motion.div>
        </Link>
      </div>

      <AnimatePresence>
        {showSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                >
                    <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-gold-500 border border-gold-500/20">
                            <Trophy size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">تنظیمات بازی</h3>
                        <p className="text-slate-400 text-xs mt-1">تعداد ست‌های مورد نیاز برای برد را انتخاب کنید</p>
                    </div>

                    <div className="flex gap-3 mb-8">
                        {[3, 5, 7].map(score => (
                            <button 
                                key={score}
                                onClick={() => setTargetScore(score)}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg border-2 transition-all ${targetScore === score ? 'bg-gold-500 border-gold-500 text-slate-900 shadow-lg shadow-gold-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                            >
                                {score}
                            </button>
                        ))}
                    </div>

                    <button onClick={startGame} className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 text-base">
                        شروع بازی
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
