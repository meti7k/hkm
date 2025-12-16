import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageCircle, X, UserMinus, UserPlus, Check, Clock, Loader2, Ban } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Friend, User } from '../types';
import socketService from '../services/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { 
  useFriendsList, 
  useFriendRequests, 
  useOutgoingRequests, 
  useSearchUsers, 
  useSocialActions 
} from '../hooks/useSocial';

export const Friends = () => {
  const [activeTab, setActiveTab] = useState<'friends' | 'search' | 'requests'>('friends');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const { user } = useApp();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const { data: friendsData, isLoading: loadingFriends } = useFriendsList(activeTab === 'friends');
  const { data: requestsData, isLoading: loadingRequests } = useFriendRequests(activeTab === 'requests');
  const { data: outgoingData } = useOutgoingRequests(activeTab === 'search');
  const { data: searchData, isFetching: isSearching } = useSearchUsers(searchQuery);
  const { sendRequest, acceptRequest, rejectRequest, removeFriend, blockUser } = useSocialActions();

  const friends = friendsData?.data?.friends || [];
  const incomingRequests = requestsData?.data?.friends || [];
  const outgoingRequests = outgoingData?.data?.friends || [];
  const searchResults = searchData?.data?.users || [];

  useEffect(() => {
    const handleFriendRequest = (data: { event: string, user: User }) => {
        showToast(`درخواست دوستی جدید از ${data.user.name || 'کاربر'}`, 'info');
        queryClient.invalidateQueries({ queryKey: ['friends', 'incoming'] });
    };

    const handleAccepted = (data: { event: string, friend: Friend }) => {
        showToast(`${data.friend.user.name} درخواست دوستی شما را پذیرفت`, 'success');
        queryClient.invalidateQueries({ queryKey: ['friends', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['friends', 'outgoing'] });
    };

    const handleRejected = (data: { event: string, friend: Friend }) => {
        showToast(`${data.friend.user.name} درخواست دوستی شما را رد کرد`, 'info');
        queryClient.invalidateQueries({ queryKey: ['friends', 'outgoing'] });
    };

    const handleUserStatus = (data: { event: string; user: User; status: string }) => {
        queryClient.setQueryData(['friends', 'list'], (oldData: any) => {
            if (!oldData?.data?.friends) return oldData;
            return {
                ...oldData,
                data: {
                    ...oldData.data,
                    friends: oldData.data.friends.map((f: Friend) => {
                        if (f.user.id === data.user.id) {
                            return {
                                ...f,
                                user: {
                                    ...f.user,
                                    last_seen_at: data.status === 'online' ? new Date().toISOString() : new Date().toISOString()
                                }
                            };
                        }
                        return f;
                    })
                }
            };
        });
    };

    socketService.on('friend_request', handleFriendRequest);
    socketService.on('accepted', handleAccepted);
    socketService.on('rejected', handleRejected);
    socketService.on('user_status', handleUserStatus);

    return () => {
        socketService.off('friend_request', handleFriendRequest);
        socketService.off('accepted', handleAccepted);
        socketService.off('rejected', handleRejected);
        socketService.off('user_status', handleUserStatus);
    };
  }, [queryClient, showToast]);

  const handleChat = (username?: string | null) => {
      if (!username) {
          // @ts-ignore
          if (window.Telegram?.WebApp) {
             // @ts-ignore
             window.Telegram.WebApp.openTelegramLink(`https://t.me/hokmzonebot`);
          } else {
             window.open(`https://t.me/hokmzonebot`, '_blank');
          }
          return;
      }
      
      const url = `https://t.me/${username}`;
      // @ts-ignore
      if (window.Telegram?.WebApp) {
          // @ts-ignore
          window.Telegram.WebApp.openTelegramLink(url);
      } else {
          window.open(url, '_blank');
      }
  };

  const handleSearch = () => {
      if (searchInput.length >= 4) {
          setSearchQuery(searchInput);
      } else {
          showToast('لطفا حداقل ۴ کاراکتر وارد کنید', 'error');
      }
  };

  const handleAccept = (reqId: number) => {
      setProcessingId(reqId);
      acceptRequest.mutate(reqId, {
          onSettled: () => setProcessingId(null)
      });
  };

  const handleReject = (reqId: number) => {
      setProcessingId(reqId);
      rejectRequest.mutate(reqId, {
          onSettled: () => setProcessingId(null)
      });
  };

  const getFriendStatus = (targetUserId: number) => {
      if (friends.some(f => f.user.id === targetUserId)) return 'friend';
      if (outgoingRequests.some(f => f.user.id === targetUserId)) return 'sent';
      if (incomingRequests.some(f => f.user.id === targetUserId)) return 'received';
      if (targetUserId === user.id) return 'me';
      return 'none';
  };

  const formatLastSeen = (dateString?: string) => {
      if (!dateString) return { text: 'آفلاین', isOnline: false };
      
      const lastSeen = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

      if (diffMinutes < 2) return { text: 'آنلاین', isOnline: true };
      if (diffMinutes < 60) return { text: `${diffMinutes} دقیقه پیش`, isOnline: false };
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return { text: `${diffHours} ساعت پیش`, isOnline: false };

      return { text: 'مدتی پیش', isOnline: false };
  };

  return (
    <div className="min-h-full flex flex-col p-6 relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-gold-500" size={24} /> لیست دوستان
        </h1>
      </div>

      <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'friends' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
          >
              دوستان
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'requests' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
          >
              درخواست‌ها
              {incomingRequests.length > 0 && (
                  <span className="mr-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{incomingRequests.length}</span>
              )}
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'search' ? 'bg-slate-800 text-white shadow' : 'text-slate-500'}`}
          >
              جستجو
          </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col flex-1 min-h-[300px] shadow-lg overflow-y-auto custom-scrollbar">
        
        {activeTab === 'friends' && (
            <div className="space-y-2">
                {loadingFriends ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500" /></div>
                ) : friends.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <Users size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">هنوز دوستی ندارید</p>
                    </div>
                ) : (
                    friends.map(friend => {
                        const status = formatLastSeen(friend.user.last_seen_at);
                        return (
                            <div key={friend.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setSelectedFriend(friend)}>
                                    <div className="relative">
                                        <img 
                                            src={friend.user.profile_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${friend.user.id}`} 
                                            alt={friend.user.name || 'User'} 
                                            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" 
                                        />
                                        {status.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">{friend.user.name || 'کاربر بدون نام'}</div>
                                        <div className={`text-[10px] ${status.isOnline ? 'text-green-500' : 'text-slate-500'}`}>
                                            {status.text}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleChat(friend.user.username)} className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600/20 transition-colors">
                                        <MessageCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        )}

        {activeTab === 'requests' && (
            <div className="space-y-2">
                {loadingRequests ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gold-500" /></div>
                ) : incomingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">درخواستی ندارید</p>
                    </div>
                ) : (
                    incomingRequests.map(req => (
                        <div key={req.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={req.user.profile_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${req.user.id}`} 
                                    alt={req.user.name || 'User'} 
                                    className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" 
                                />
                                <div>
                                    <div className="text-sm font-bold text-white">{req.user.name}</div>
                                    <div className="text-[10px] text-slate-500">@{req.user.username}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAccept(req.id)} 
                                    disabled={processingId === req.id}
                                    className="p-2 bg-green-600/10 text-green-500 rounded-lg hover:bg-green-600/20 transition-colors"
                                >
                                    {processingId === req.id ? <Loader2 size={16} className="animate-spin"/> : <Check size={16} />}
                                </button>
                                <button 
                                    onClick={() => handleReject(req.id)} 
                                    disabled={processingId === req.id}
                                    className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600/20 transition-colors"
                                >
                                    {processingId === req.id ? <Loader2 size={16} className="animate-spin"/> : <X size={16} />}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {activeTab === 'search' && (
            <div className="flex flex-col h-full">
                <div className="relative mb-4 shrink-0">
                    <input 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="نام کاربری را وارد کنید..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-14 py-3 text-xs text-white focus:border-gold-500 outline-none"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="absolute left-1.5 top-1.5 bottom-1.5 bg-gold-500 text-slate-900 px-3 rounded-lg text-xs font-bold shadow-lg disabled:opacity-50 flex items-center justify-center"
                    >
                        {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={18} />}
                    </button>
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {searchResults.map(u => {
                        const status = getFriendStatus(u.id);
                        
                        return (
                            <div key={u.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <img 
                                        src={u.profile_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.id}`} 
                                        alt={u.name || 'User'} 
                                        className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" 
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-white">{u.name}</div>
                                        <div className="text-[10px] text-slate-500">@{u.username}</div>
                                    </div>
                                </div>
                                
                                {status === 'friend' && (
                                    <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><Check size={12}/> دوست شما</span>
                                )}
                                {status === 'me' && (
                                    <span className="text-[10px] text-slate-500 font-bold">شما</span>
                                )}
                                {status === 'sent' && (
                                    <button disabled className="p-2 bg-slate-800/50 text-slate-400 rounded-lg cursor-not-allowed flex items-center gap-1">
                                        <Check size={16} />
                                        <span className="text-[10px]">ارسال شد</span>
                                    </button>
                                )}
                                {status === 'received' && (
                                    <span className="text-[10px] text-gold-500 font-bold">درخواست داده</span>
                                )}
                                {status === 'none' && (
                                    <button 
                                        onClick={() => sendRequest.mutate(u.id)} 
                                        disabled={sendRequest.isPending}
                                        className="p-2 bg-gold-500/10 text-gold-500 rounded-lg hover:bg-gold-500/20 transition-colors"
                                    >
                                        {sendRequest.isPending ? <Loader2 size={16} className="animate-spin"/> : <UserPlus size={16} />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {searchResults.length === 0 && !isSearching && searchQuery.length >= 4 && (
                        <div className="text-center text-slate-500 text-xs mt-4">کاربری یافت نشد</div>
                    )}
                </div>
            </div>
        )}
      </div>

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
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-800 mx-auto mb-4 shadow-xl overflow-hidden relative">
                        <img 
                            src={selectedFriend.user.profile_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedFriend.user.id}`} 
                            alt={selectedFriend.user.name || ''} 
                            className="w-full h-full object-cover" 
                        />
                         {formatLastSeen(selectedFriend.user.last_seen_at).isOnline && (
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-900"></div>
                        )}
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{selectedFriend.user.name}</h3>
                    <p className="text-slate-400 text-xs font-bold mb-2">@{selectedFriend.user.username}</p>
                    
                    <div className={`text-xs font-bold mb-6 ${formatLastSeen(selectedFriend.user.last_seen_at).isOnline ? 'text-green-500' : 'text-slate-500'}`}>
                        {formatLastSeen(selectedFriend.user.last_seen_at).text}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button onClick={() => handleChat(selectedFriend.user.username)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-500 transition flex items-center justify-center gap-2">
                                <MessageCircle size={16} /> چت تلگرام
                            </button>
                            <button 
                                onClick={() => {
                                    if(confirm('آیا از حذف این دوست اطمینان دارید؟')) {
                                        removeFriend.mutate(selectedFriend.user.id);
                                        setSelectedFriend(null);
                                    }
                                }} 
                                className="flex-1 bg-slate-800 text-red-400 py-3 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2"
                            >
                                <UserMinus size={16} /> حذف
                            </button>
                        </div>
                        <button 
                            onClick={() => {
                                if(confirm('آیا از مسدود کردن این کاربر اطمینان دارید؟')) {
                                    blockUser.mutate(selectedFriend.user.id);
                                    setSelectedFriend(null);
                                }
                            }}
                            className="w-full bg-red-900/20 text-red-500 py-3 rounded-xl text-xs font-bold hover:bg-red-900/40 transition flex items-center justify-center gap-2 border border-red-900/30"
                        >
                            <Ban size={16} /> مسدود کردن
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
