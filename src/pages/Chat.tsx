import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, Send, User, ChevronLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import { cn } from '../lib/utils';

export const Chat = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const { user, isFriend } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const friend = user.friends.find(f => f.id === friendId);

  useEffect(() => {
    if (!friend) {
        navigate('/friends');
    }
  }, [friend, navigate]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const sendMessage = () => {
      if (!input.trim()) return;
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'me',
          text: input.trim()
      };
      setMessages(prev => [...prev, newMsg]);
      setInput('');

      // Mock reply
      setTimeout(() => {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              senderId: friendId || 'other',
              text: 'سلام! الان نمیتونم صحبت کنم، بعدا پیام میدم.'
          }]);
      }, 2000);
  };

  if (!friend) return null;

  return (
    <div className="h-full flex flex-col bg-slate-950 pb-0 md:pb-0">
      {/* Header - Back button on Left */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
            <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div>
                <h1 className="font-bold text-white text-sm">{friend.name}</h1>
                <p className="text-[10px] text-slate-400">آنلاین</p>
            </div>
        </div>

        <button onClick={() => navigate(-1)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700">
          <ArrowRight size={20} className="rotate-180" /> 
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 custom-scrollbar" ref={scrollRef}>
         <div className="text-center text-[10px] text-slate-600 my-4">امروز</div>
         
         <div className="flex justify-start">
             <div className="bg-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] text-sm shadow-sm border border-slate-800">
                 سلام {user.name}، چطوری؟
             </div>
         </div>

         {messages.map(msg => (
             <div key={msg.id} className={cn("flex", msg.senderId === 'me' ? "justify-end" : "justify-start")}>
                 <div className={cn(
                     "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm",
                     msg.senderId === 'me' 
                        ? "bg-blue-600 text-white rounded-tl-none" 
                        : "bg-slate-800 text-slate-200 rounded-tr-none border border-slate-800"
                 )}>
                     {msg.text}
                 </div>
             </div>
         ))}
      </div>

      {/* Input - Added pb-8 for mobile safe area */}
      <div className="p-3 pb-8 md:pb-3 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-gold-500 outline-none transition-colors"
              />
              <button 
                onClick={sendMessage}
                className="bg-gold-500 text-slate-950 p-3 rounded-xl hover:bg-gold-400 active:scale-95 transition-all shadow-lg"
              >
                  <Send size={20} className={input.trim() ? "fill-slate-900" : ""} />
              </button>
          </div>
      </div>
    </div>
  );
};
