import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserService } from '../services/api';
import { Edit2, Trophy, X, Ban, Trash2, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_AVATARS = [
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Bella',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Molly',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
];

export const Profile = () => {
  const { user, updateUser, unblockUser, refreshProfile } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'blocked' | 'history'>('stats');

  const [editForm, setEditForm] = useState({
      name: user.name || '',
      age: user.age || 18,
      gender: user.gender || 'unspecified',
  });

  const handleSaveProfile = () => {
    updateUser(editForm);
    setShowEditModal(false);
  };

  const handleSelectAvatar = async (url: string) => {
      try {
          // Fetch the SVG/Image from the URL
          const response = await fetch(url);
          const blob = await response.blob();
          
          // Create a File object from the blob
          const file = new File([blob], "avatar.svg", { type: "image/svg+xml" });
          
          // Upload using the API service which handles FormData
          await UserService.updateAvatar(file);
          await refreshProfile();
          setShowAvatarModal(false);
      } catch (err) {
          console.error("Avatar update failed", err);
          alert("خطا در تغییر آواتار");
      }
  };

  return (
    <div className="min-h-full bg-slate-950 flex flex-col pb-24">
      <div className="h-24 bg-gradient-to-b from-blue-900 to-slate-950 relative shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="px-6 -mt-12 relative z-10 flex flex-col">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative group">
            <img 
                src={user.avatar} 
                alt={user.name || 'User'} 
                className="w-28 h-28 rounded-full border-[4px] border-slate-950 bg-slate-800 shadow-2xl object-cover" 
            />
            <button 
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-gold-500 p-2 rounded-full border-2 border-slate-900 text-slate-900 shadow-lg hover:scale-110 transition-transform"
            >
                <Edit2 size={14} />
            </button>
          </div>
          <div className="text-center mt-3">
            <h1 className="text-2xl font-black text-white">{user.name}</h1>
            <div className="flex items-center justify-center gap-3 text-slate-400 text-[11px] font-bold mt-2">
                <span className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shadow-sm flex items-center gap-1">
                    <Crown size={12} className="text-gold-500" />
                    سطح {user.level}
                </span>
                
                <span className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 shadow-sm flex items-center gap-1">
                    {user.gender === 'female' ? <span className="text-pink-400">👩</span> : <span className="text-blue-400">👨</span>}
                    {user.age} ساله
                </span>
            </div>
            
            <button 
                onClick={() => setShowEditModal(true)}
                className="mt-4 text-xs bg-slate-800 text-slate-300 px-6 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 mx-auto hover:bg-slate-700 hover:text-white transition shadow-sm"
            >
                ویرایش اطلاعات
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-slate-900 rounded-2xl mt-8 border border-slate-800 shadow-inner shrink-0 gap-1">
            <button onClick={() => setActiveTab('stats')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'stats' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>آمار</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>تاریخچه</button>
            <button onClick={() => setActiveTab('blocked')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'blocked' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}>مسدود</button>
        </div>

        <div className="mt-6">
            {activeTab === 'stats' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900 p-5 rounded-2xl text-center border border-slate-800 flex flex-col justify-center min-h-[110px]">
                        <div className="text-gold-500 font-black text-3xl mb-1">{user.wins}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">بردها</div>
                    </div>
                    <div className="bg-slate-900 p-5 rounded-2xl text-center border border-slate-800 flex flex-col justify-center min-h-[110px]">
                        <div className="text-red-500 font-black text-3xl mb-1">{user.losses}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">باخت‌ها</div>
                    </div>
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
                                <span className="text-xs font-bold text-slate-300">کاربر #{blockedId}</span>
                                <button onClick={() => unblockUser(blockedId)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setShowEditModal(false)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    <h3 className="text-lg font-bold text-white mb-6 text-center">ویرایش پروفایل</h3>
                    
                    <div className="space-y-4">
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
                                onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
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

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setShowAvatarModal(false)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative max-h-[80vh] overflow-y-auto custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setShowAvatarModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    <h3 className="text-lg font-bold text-white mb-6 text-center">انتخاب آواتار</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {PRESET_AVATARS.map((url, index) => (
                            <button 
                                key={index}
                                onClick={() => handleSelectAvatar(url)}
                                className="relative aspect-square rounded-full overflow-hidden border-2 border-slate-700 hover:border-gold-500 hover:scale-105 transition-all group"
                            >
                                <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover bg-slate-800" />
                                {user.avatar === url && (
                                    <div className="absolute inset-0 bg-gold-500/50 flex items-center justify-center">
                                        <Check className="text-white" size={24} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
