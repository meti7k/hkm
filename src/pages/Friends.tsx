import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageCircle, Trash2, X, UserMinus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Friend } from '../types';
import { useNavigate } from 'react-router-dom';

export const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  
  const { user, removeFriend } = useApp();
  const navigate = useNavigate();

  const filteredFriends = user.friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChat = (friendId: string) => {
      navigate(`/chat/${friendId}`);
  };

  return (
    <div className="min-h-full flex flex-col p-6 relative">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-gold-500" size={24} /> لیست دوستان
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-auto min-h-[200px] shadow-lg">
        <div className="relative mb-4 shrink-0">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در دوستان..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-3 text-xs text-white focus:border-gold-500 outline-none"
            />
        </div>
        
        <div className="space-y-2">
            {filteredFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <Users size={48} className="mb-4 opacity-20" />
                    <p className="text-sm">دوستی یافت نشد</p>
                </div>
            ) : (
                filteredFriends.map(friend => (
                    <div key={friend.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setSelectedFriend(friend)}>
                            <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-800" />
                            <div>
                                <div className="text-sm font-bold text-white">{friend.name}</div>
                                <div className="text-[10px] text-slate-500">سطح {friend.level}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleChat(friend.id)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-colors">
                                <MessageCircle size={18} />
                            </button>
                            <button onClick={() => removeFriend(friend.id)} className="p-2.5 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600/20 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Friend Detail Modal - Optimized: No Blur, Simple Fade */}
      <AnimatePresence>
        {selectedFriend && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setSelectedFriend(null)}>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setSelectedFriend(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-800 mx-auto mb-4 shadow-xl overflow-hidden">
                        <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{selectedFriend.name}</h3>
                    <p className="text-slate-400 text-xs font-bold mb-6">سطح {selectedFriend.level}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <div className="text-gold-500 font-black text-xl">
                                {Math.floor(Math.random() * 50) + 10}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold">بردها</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-xl">
                            <div className="text-red-500 font-black text-xl">
                                {Math.floor(Math.random() * 30) + 5}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold">باخت‌ها</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => handleChat(selectedFriend.id)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-500 transition flex items-center justify-center gap-2">
                            <MessageCircle size={16} /> پیام
                        </button>
                        <button onClick={() => { removeFriend(selectedFriend.id); setSelectedFriend(null); }} className="flex-1 bg-slate-800 text-red-400 py-3 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2">
                            <UserMinus size={16} /> حذف
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
