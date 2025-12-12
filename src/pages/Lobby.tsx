import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Copy, Share2, Check, X, MessageCircle, Swords, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Lobby = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'requests'>('create');
  const [targetScore, setTargetScore] = useState(3);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { user, acceptGameRequest, rejectGameRequest } = useApp();
  const navigate = useNavigate();

  const generateCode = () => {
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  const handleCopyCode = async () => {
      if (!roomCode) return;
      
      try {
          // Try modern API first
          await navigator.clipboard.writeText(roomCode);
          setCopied(true);
      } catch (err) {
          // Fallback for iframe/restricted environments
          try {
              const textArea = document.createElement("textarea");
              textArea.value = roomCode;
              
              // Ensure it's not visible but part of DOM
              textArea.style.position = "fixed";
              textArea.style.left = "-9999px";
              textArea.style.top = "0";
              document.body.appendChild(textArea);
              
              textArea.focus();
              textArea.select();
              
              const successful = document.execCommand('copy');
              document.body.removeChild(textArea);
              
              if (successful) {
                  setCopied(true);
              } else {
                  console.error('Fallback copy failed');
              }
          } catch (fallbackErr) {
              console.error('Copy failed completely', fallbackErr);
          }
      }
      
      setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
      if (!roomCode) return;
      const shareData = {
          title: 'Hokm Royale Room',
          text: `Join my Hokm Royale room! Code: ${roomCode}`,
          url: window.location.origin
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.log('Share canceled');
          }
      } else {
          handleCopyCode();
      }
  };

  return (
    <div className="h-full flex flex-col p-6 relative">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link to="/" className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700"><ArrowRight size={18}/></Link>
        <h1 className="text-xl font-bold flex items-center gap-2">
            <Swords className="text-gold-500" size={20} /> بازی دوستانه
        </h1>
      </div>

      <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800 shrink-0">
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'create' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>ساخت اتاق</button>
        <button onClick={() => setActiveTab('join')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'join' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>عضویت</button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all relative ${activeTab === 'requests' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>
            درخواست‌ها
            {user.gameRequests.length > 0 && (
                <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'create' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                     <h3 className="text-sm font-bold text-slate-300 mb-4">تنظیمات اتاق</h3>
                     {!roomCode ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-xs text-slate-400">امتیاز هدف:</span>
                                <div className="flex gap-2">
                                    {[3, 5, 7].map(score => (
                                        <button 
                                            key={score}
                                            onClick={() => setTargetScore(score)}
                                            className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${targetScore === score ? 'bg-gold-500 border-gold-500 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                                        >
                                            {score}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={generateCode} className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm hover:shadow-xl transition-all active:scale-95">
                                <Play size={18} /> ساخت اتاق جدید
                            </button>
                        </>
                     ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-950 p-4 rounded-xl border-2 border-dashed border-slate-700 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gold-500/5 animate-pulse"></div>
                                <span className="text-2xl font-mono tracking-widest text-gold-400 relative z-10">{roomCode}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleCopyCode} className="flex-1 bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all">
                                    {copied ? <CheckCircle2 size={14} className="text-green-500"/> : <Copy size={14}/>} 
                                    {copied ? 'کپی شد' : 'کپی کد'}
                                </button>
                                <button onClick={handleShareCode} className="flex-1 bg-slate-800 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all">
                                    <Share2 size={14}/> اشتراک
                                </button>
                            </div>
                            <Link to={`/game?mode=friends&target=${targetScore}`} className="block w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg text-center text-sm hover:bg-green-500 transition-colors">
                                شروع بازی
                            </Link>
                        </div>
                     )}
                </div>
            </motion.div>
        )}

        {activeTab === 'join' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-300 mb-4">عضویت در اتاق</h3>
                    <div>
                        <label className="text-xs text-slate-500 mb-2 block">کد اتاق را وارد کنید</label>
                        <input className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:border-gold-500 outline-none text-white mb-4 uppercase placeholder:text-slate-700" placeholder="CODE" />
                    </div>
                    <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
                        جستجو و پیوستن
                    </button>
                </div>
            </motion.div>
        )}

        {activeTab === 'requests' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pb-20">
                {user.gameRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <MessageCircle size={32} className="mb-3 opacity-20" />
                        <p className="text-xs">هیچ درخواستی ندارید</p>
                    </div>
                ) : (
                    user.gameRequests.map(req => (
                        <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg h-auto">
                            <div className="flex items-center gap-3 mb-3">
                                <img src={req.sender.avatar} alt={req.sender.name} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
                                <div>
                                    <h3 className="font-bold text-white text-sm">{req.sender.name}</h3>
                                    <p className="text-[10px] text-slate-400">سطح {req.sender.level}</p>
                                </div>
                                <span className="mr-auto text-[10px] text-slate-500">
                                    {new Date(req.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <div className="bg-slate-950 rounded-xl p-2.5 mb-3 text-xs text-slate-300 border border-slate-800/50">
                                {req.message}
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        acceptGameRequest(req.id);
                                        navigate('/game?mode=friends');
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                                >
                                    <Check size={14} /> قبول
                                </button>
                                <button 
                                    onClick={() => rejectGameRequest(req.id)}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                                >
                                    <X size={14} /> رد
                                </button>
                            </div>
                        </div>
                    ))
                )}
             </motion.div>
        )}
      </div>
    </div>
  );
};
