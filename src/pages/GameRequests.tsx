import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowRight, Check, X, MessageCircle } from 'lucide-react';

export const GameRequests = () => {
  const { user, acceptGameRequest, rejectGameRequest } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="p-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700">
          <ArrowRight size={18} />
        </Link>
        <h1 className="text-lg font-bold">درخواست‌های بازی</h1>
      </div>

      <div className="space-y-4">
        {user.gameRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p>هیچ درخواستی ندارید</p>
            </div>
        ) : (
            user.gameRequests.map(req => (
                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={req.sender.avatar} alt={req.sender.name} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700" />
                        <div>
                            <h3 className="font-bold text-white">{req.sender.name}</h3>
                            <p className="text-xs text-slate-400">سطح {req.sender.level}</p>
                        </div>
                        <span className="mr-auto text-[10px] text-slate-500">
                            {new Date(req.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    
                    <div className="bg-slate-950 rounded-xl p-3 mb-4 text-sm text-slate-300 border border-slate-800/50">
                        {req.message}
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => {
                                acceptGameRequest(req.id);
                                navigate('/game?mode=friends');
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                            <Check size={16} /> قبول
                        </button>
                        <button 
                            onClick={() => rejectGameRequest(req.id)}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                            <X size={16} /> رد کردن
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
