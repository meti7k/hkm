import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Coins, Users, RefreshCw, Swords, Plus, Lock, Globe, X, Search, Layers } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GameService } from '../services/api';
import { GameType } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';

export const Lobby = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [sets, setSets] = useState(3);
  const [gameType, setGameType] = useState<GameType>('public');
  const [searchRoomId, setSearchRoomId] = useState('');
  
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
      if (searchParams.get('mode') === 'private') {
          setGameType('private');
          setShowCreateModal(true);
      }
  }, [searchParams]);

  const { data: gamesData, isLoading: loadingGames, refetch } = useQuery({
    queryKey: ['games'],
    queryFn: () => GameService.list(50, 0),
  });

  const games = gamesData?.data?.games?.filter(g => g.status === 'waiting') || [];

  const createGameMutation = useMutation({
    mutationFn: (data: { bet: number, sets: number, type: GameType }) => GameService.create(data),
    onSuccess: (res) => {
        if (res.status === 200 && res.data && res.data.game) {
            showToast('بازی با موفقیت ساخته شد', 'success');
            navigate(`/game?id=${res.data.game.id}`);
        }
        queryClient.invalidateQueries({ queryKey: ['games'] });
    },
    onError: (err: any) => {
        if (err.response?.status === 400) {
             showToast("موجودی کافی نیست", 'error');
        } else {
             showToast("خطا در ساخت بازی", 'error');
        }
    }
  });

  const joinGameMutation = useMutation({
    mutationFn: (gameId: number) => GameService.join(gameId),
    onSuccess: (res, gameId) => {
        if (res.status === 200) {
            showToast('وارد بازی شدید', 'success');
            navigate(`/game?id=${gameId}`);
        }
    },
    onError: (err: any) => {
        if (err.response?.status === 404) {
             showToast("بازی پیدا نشد", 'error');
        } else if (err.response?.status === 400) {
             showToast("اتاق پر است یا مشکلی وجود دارد", 'error');
        } else {
             showToast("خطا در پیوستن به بازی", 'error');
        }
    }
  });

  const handleCreateGame = () => {
      createGameMutation.mutate({ bet: betAmount, sets, type: gameType });
  };

  const handleJoinByCode = () => {
      if (!searchRoomId) return;
      joinGameMutation.mutate(parseInt(searchRoomId));
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 relative">
      <div className="flex items-center justify-between p-6 bg-slate-900 border-b border-slate-800 shrink-0 z-10">
        <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700 border border-slate-700"><ArrowRight size={18}/></Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
                <Swords className="text-gold-500" size={20} /> لابی بازی
            </h1>
        </div>
        <button onClick={() => refetch()} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-700">
            <RefreshCw size={18} className={loadingGames ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="p-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
          <div className="relative">
              <input 
                  type="number" 
                  value={searchRoomId}
                  onChange={(e) => setSearchRoomId(e.target.value)}
                  placeholder="کد اتاق را وارد کنید..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-gold-500 outline-none"
              />
              <button 
                onClick={handleJoinByCode}
                disabled={!searchRoomId || joinGameMutation.isPending}
                className="absolute left-1.5 top-1.5 bottom-1.5 bg-gold-500 text-slate-900 px-4 rounded-lg text-xs font-bold disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
              >
                  {joinGameMutation.isPending ? '...' : 'ورود'}
              </button>
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-24">
        {games.length === 0 && !loadingGames ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Swords size={64} className="mb-6 opacity-20" />
                <p className="text-base font-bold">هیچ اتاق عمومی خالی پیدا نشد</p>
                <p className="text-xs mt-2 opacity-60">اولین نفر باشید که بازی می‌سازد!</p>
            </div>
        ) : (
            <div className="space-y-3">
                {games.map(game => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={game.id} 
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 text-gold-500 shadow-inner relative">
                                <Coins size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white mb-1">شرط: {game.bet.toLocaleString()} سکه</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                    <Users size={10} /> {game.players?.length || 0}/4 بازیکن
                                    <span className="mx-1">•</span>
                                    <span className="font-mono">ID: {game.id}</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => joinGameMutation.mutate(game.id)}
                            disabled={joinGameMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                        >
                            {joinGameMutation.isPending ? '...' : 'پیوستن'}
                        </button>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      <div className="absolute bottom-24 left-0 right-0 p-6 z-20 pointer-events-none flex justify-center">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="pointer-events-auto bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-4 px-10 rounded-2xl shadow-xl shadow-amber-900/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all border-2 border-white/10 w-full max-w-sm"
          >
              <Plus size={24} />
              <span className="text-lg">ساخت بازی جدید</span>
          </button>
      </div>

      <AnimatePresence>
        {showCreateModal && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 500 }}
                    className="bg-slate-900 border-t border-slate-700 rounded-t-[2rem] md:rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative pb-10 md:pb-6 min-h-[60vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                     <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 opacity-50 shrink-0"></div>
                     
                     <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-lg font-bold text-white">ساخت اتاق جدید</h3>
                        <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X size={18}/></button>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                         <div>
                            <label className="text-xs text-slate-400 mb-2 block font-bold">نوع بازی</label>
                            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                <button 
                                    onClick={() => setGameType('public')}
                                    className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${gameType === 'public' ? 'bg-slate-800 text-white shadow ring-1 ring-white/10' : 'text-slate-500'}`}
                                >
                                    <Globe size={16} /> عمومی
                                </button>
                                <button 
                                    onClick={() => setGameType('private')}
                                    className={`flex-1 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${gameType === 'private' ? 'bg-slate-800 text-white shadow ring-1 ring-white/10' : 'text-slate-500'}`}
                                >
                                    <Lock size={16} /> خصوصی
                                </button>
                            </div>
                         </div>

                         <div>
                            <label className="text-xs text-slate-400 mb-2 block font-bold">تعداد دست‌ها</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[3, 5, 7].map(count => (
                                    <button 
                                        key={count}
                                        onClick={() => setSets(count)}
                                        className={`py-3 rounded-xl font-bold text-xs border transition-all flex flex-col items-center justify-center gap-1 ${sets === count ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                    >
                                        <Layers size={16} className={sets === count ? "text-blue-500" : "text-slate-600"} />
                                        {count} دست
                                    </button>
                                ))}
                            </div>
                         </div>

                         <div>
                            <label className="text-xs text-slate-400 mb-2 block font-bold">مبلغ شرط بندی</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[100, 500, 1000, 5000].map(amount => (
                                    <button 
                                        key={amount}
                                        onClick={() => setBetAmount(amount)}
                                        className={`py-3 rounded-xl font-bold text-xs border transition-all flex flex-col items-center justify-center gap-1 ${betAmount === amount ? 'bg-gold-500/10 border-gold-500 text-gold-500' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                                    >
                                        <Coins size={16} className={betAmount === amount ? "fill-gold-500" : ""} />
                                        {amount >= 1000 ? `${amount/1000}k` : amount}
                                    </button>
                                ))}
                            </div>
                         </div>
                     </div>

                     <div className="mt-6 shrink-0">
                         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 flex justify-between items-center">
                            <span className="text-xs text-slate-400">موجودی شما:</span>
                            <span className="text-sm font-bold text-white flex items-center gap-1">
                                <Coins size={14} className="text-gold-500" />
                                {user.coins.toLocaleString()}
                            </span>
                         </div>

                         <button 
                            onClick={handleCreateGame} 
                            disabled={user.coins < betAmount || createGameMutation.isPending}
                            className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {createGameMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Play size={18} className="fill-slate-900" /> 
                                    {user.coins < betAmount ? 'موجودی کافی نیست' : 'تایید و شروع'}
                                </>
                            )}
                         </button>
                     </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
