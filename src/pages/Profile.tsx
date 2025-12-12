import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Edit2, Trophy, Check, X, Ban, Trash2, History, Clock, Crown, UserMinus, UserPlus, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Profile = () => {
  const { user, updateUser, unblockUser } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'blocked' | 'history'>('stats');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Curated Avatar Seeds for better aesthetics
  const AVATAR_SEEDS = [
      'Alexander', 'Sophia', 'Liam', 'Emma', 'Noah', 
      'Olivia', 'Ethan', 'Ava', 'Mason', 'Isabella', 
      'William', 'Mia', 'James', 'Charlotte', 'Benjamin',
      'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn'
  ];

  // Edit Form State
  const [editForm, setEditForm] = useState({
      name: user.name,
      age: user.age,
      gender: user.gender,
      avatar: user.avatar
  });

  const [avatarIndex, setAvatarIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Sync avatar index when modal opens
  useEffect(() => {
      if (showEditModal) {
          // Try to find current seed or default to 0
          const currentSeedMatch = editForm.avatar.match(/seed=([^&]+)/);
          const currentSeed = currentSeedMatch ? currentSeedMatch[1] : '';
          const idx = AVATAR_SEEDS.indexOf(currentSeed);
          setAvatarIndex(idx !== -1 ? idx : 0);
      }
  }, [showEditModal]);

  // Update form when index changes
  useEffect(() => {
      const seed = AVATAR_SEEDS[avatarIndex];
      // Enforce nice features: smile/default mouth, happy/default eyes
      const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&mouth=smile,default&eyes=default,happy&eyebrows=default,up`;
      setEditForm(prev => ({ ...prev, avatar: avatarUrl }));
  }, [avatarIndex]);

  const handleSaveProfile = () => {
    updateUser(editForm);
    setShowEditModal(false);
  };

  const nextAvatar = () => {
      setDirection(1);
      setAvatarIndex((prev) => (prev + 1) % AVATAR_SEEDS.length);
  };

  const prevAvatar = () => {
      setDirection(-1);
      setAvatarIndex((prev) => (prev - 1 + AVATAR_SEEDS.length) % AVATAR_SEEDS.length);
  };

  // Mock Leaderboard Data
  const leaderboardData = [
      { rank: 1, name: 'سلطان حکم', wins: 450, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=King&mouth=smile,default' },
      { rank: 2, name: 'مریم گلی', wins: 380, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maryam&mouth=smile,default' },
      { rank: 3, name: 'علی تک', wins: 310, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ali&mouth=smile,default' },
      { rank: 42, name: user.name, wins: user.wins, avatar: user.avatar, isMe: true },
      { rank: 43, name: 'رضا', wins: user.wins - 5, avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Reza&mouth=smile,default' },
  ].sort((a, b) => a.rank - b.rank);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <div className="min-h-full bg-slate-950 flex flex-col pb-24">
      <div className="h-20 bg-gradient-to-b from-blue-900 to-slate-950 relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="px-6 -mt-10 relative z-10 flex flex-col">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-[4px] border-slate-950 bg-slate-800 shadow-2xl" />
          </div>
          <div className="text-center mt-2">
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-medium mt-1">
                <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">سطح {user.level}</span>
                <span>•</span>
                <span>{user.age} ساله</span>
            </div>
            
            <button 
                onClick={() => {
                    setEditForm({ name: user.name, age: user.age, gender: user.gender, avatar: user.avatar });
                    setShowEditModal(true);
                }}
                className="mt-3 text-xs bg-slate-800 text-slate-300 px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-1 mx-auto hover:bg-slate-700 hover:text-white transition"
            >
                <Edit2 size={12} /> ویرایش پروفایل
            </button>
          </div>
        </div>

        <div className="flex p-1.5 bg-slate-900 rounded-2xl mt-5 border border-slate-800 shadow-inner shrink-0 overflow-x-auto no-scrollbar gap-1 sticky top-0 z-20">
            <button onClick={() => setActiveTab('stats')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'stats' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>آمار</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>تاریخچه</button>
            <button onClick={() => setActiveTab('blocked')} className={`flex-1 min-w-[60px] py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'blocked' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>مسدود</button>
        </div>

        <div className="mt-4">
            {activeTab === 'stats' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900 p-4 rounded-2xl text-center border border-slate-800 relative overflow-hidden flex flex-col justify-center min-h-[100px]">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-gold-500/10 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-gold-500 font-black text-2xl mb-1">{user.wins}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">بردها</div>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-2xl text-center border border-slate-800 relative overflow-hidden flex flex-col justify-center min-h-[100px]">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/10 rounded-bl-full -mr-2 -mt-2"></div>
                        <div className="text-red-500 font-black text-2xl mb-1">{user.losses}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">باخت‌ها</div>
                    </div>
                    
                    <div 
                        onClick={() => setShowLeaderboard(true)}
                        className="col-span-2 bg-slate-900 p-4 rounded-2xl flex items-center justify-between border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Trophy size={18} />
                            </div>
                            <div className="text-left">
                                <div className="text-white font-bold text-sm">رتبه جهانی</div>
                                <div className="text-[10px] text-slate-500">مشاهده برترین‌ها</div>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white">#۴۲</div>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                    {user.history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <History size={32} className="mb-3 opacity-20" />
                            <p className="text-xs">هنوز بازی انجام نداده‌اید</p>
                        </div>
                    ) : (
                        user.history.map((game) => (
                            <div key={game.id} className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${game.result === 'win' ? 'bg-gold-500/10 border-gold-500/30 text-gold-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                        {game.result === 'win' ? <Trophy size={18} /> : <X size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black ${game.result === 'win' ? 'text-white' : 'text-slate-400'}`}>
                                                {game.result === 'win' ? 'پیروزی' : 'شکست'}
                                            </span>
                                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded">{game.score}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <span>مقابل {game.opponentName}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${game.coins > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {game.coins > 0 ? '+' : ''}{game.coins} سکه
                                    </div>
                                    <div className="text-[9px] text-slate-600 flex items-center justify-end gap-1 mt-1">
                                        <Clock size={8} />
                                        {new Date(parseInt(game.date)).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'blocked' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                    {user.blocked.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <Ban size={32} className="mb-3 opacity-20" />
                            <p className="text-xs">هیچ کاربری مسدود نشده است</p>
                        </div>
                    ) : (
                        user.blocked.map((blockedId) => (
                            <div key={blockedId} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center">
                                        <Ban size={16} className="text-slate-500" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300">کاربر مسدود شده</span>
                                </div>
                                <button 
                                    onClick={() => unblockUser(blockedId)}
                                    className="text-red-400 p-2 border border-red-900/30 bg-red-900/10 rounded-xl hover:bg-red-900/20 transition-colors"
                                    title="حذف از لیست مسدودی"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Edit Profile Modal - Increased Z-Index to 100 to cover BottomNav */}
      <AnimatePresence>
        {showEditModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setShowEditModal(false)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative will-change-transform max-h-[85vh] overflow-y-auto custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    
                    <h3 className="text-lg font-bold text-white mb-6 text-center">ویرایش پروفایل</h3>
                    
                    <div className="space-y-6">
                        {/* Avatar Slider */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 text-center block mb-2">انتخاب آواتار</label>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={prevAvatar} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition">
                                    <ChevronRight size={20} />
                                </button>
                                
                                <div className="w-32 h-32 relative overflow-hidden rounded-full border-4 border-gold-500 bg-slate-800 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                    <AnimatePresence initial={false} custom={direction}>
                                        <motion.img
                                            key={avatarIndex}
                                            src={editForm.avatar}
                                            custom={direction}
                                            variants={variants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2 }
                                            }}
                                            className="absolute w-full h-full object-cover"
                                            drag="x"
                                            dragConstraints={{ left: 0, right: 0 }}
                                            dragElastic={1}
                                            onDragEnd={(e, { offset, velocity }) => {
                                                const swipe = offset.x;
                                                if (swipe < -50) nextAvatar();
                                                else if (swipe > 50) prevAvatar();
                                            }}
                                        />
                                    </AnimatePresence>
                                </div>

                                <button onClick={nextAvatar} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition">
                                    <ChevronLeft size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">نام نمایشی</label>
                            <input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">سن</label>
                            <input 
                                type="number"
                                value={editForm.age}
                                onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400">جنسیت</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setEditForm({...editForm, gender: 'male'})}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${editForm.gender === 'male' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    آقا
                                </button>
                                <button 
                                    onClick={() => setEditForm({...editForm, gender: 'female'})}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${editForm.gender === 'female' ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    خانم
                                </button>
                            </div>
                        </div>
                    </div>

                    <button onClick={handleSaveProfile} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:bg-green-500 transition shadow-lg">
                        ذخیره تغییرات
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal - Increased Z-Index */}
      <AnimatePresence>
        {showLeaderboard && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setShowLeaderboard(false)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[80vh] flex flex-col will-change-transform"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setShowLeaderboard(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    
                    <div className="text-center mb-6 shrink-0">
                        <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-gold-500 border border-gold-500/20">
                            <Trophy size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">برترین‌های جهان</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {leaderboardData.map((player) => (
                            <div key={player.rank} className={`flex items-center justify-between p-3 rounded-xl border ${player.isMe ? 'bg-gold-500/10 border-gold-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 flex items-center justify-center font-black text-sm ${player.rank <= 3 ? 'text-gold-500' : 'text-slate-500'}`}>
                                        {player.rank <= 3 ? <Crown size={20} className={player.rank === 1 ? 'fill-gold-500' : ''} /> : `#${player.rank}`}
                                    </div>
                                    <img src={player.avatar} className="w-10 h-10 rounded-full bg-slate-800" />
                                    <div className="text-sm font-bold text-white">
                                        {player.name}
                                        {player.isMe && <span className="mr-2 text-[9px] bg-gold-500 text-black px-1.5 py-0.5 rounded">شما</span>}
                                    </div>
                                </div>
                                <div className="text-xs font-bold text-slate-400">
                                    {player.wins} برد
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
