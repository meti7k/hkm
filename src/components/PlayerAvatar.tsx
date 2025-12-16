import React from 'react';
import { Player } from '../types';
import { cn } from '../lib/utils';
import { Crown, User } from 'lucide-react';

interface PlayerAvatarProps {
  player: Player | undefined;
  isActive: boolean;
  position: 'bottom' | 'top' | 'left' | 'right';
  isHakem: boolean;
  isOwner: boolean;
  showName?: boolean;
  onSit?: () => void;
}

export const PlayerAvatar = React.memo(({ 
  player, 
  isActive, 
  position, 
  isHakem, 
  isOwner, 
  showName = true, 
  onSit 
}: PlayerAvatarProps) => {
  
  const positionClasses = {
      bottom: "bottom-8 left-1/2 -translate-x-1/2",
      top: "top-24 left-1/2 -translate-x-1/2",
      left: "left-4 top-1/2 -translate-y-1/2",
      right: "right-4 top-1/2 -translate-y-1/2"
  };

  if (!player) {
      return (
        <div className={cn(
            "absolute flex flex-col items-center gap-1 z-30 transition-all",
            positionClasses[position]
        )}>
            <button 
                onClick={onSit}
                className="w-14 h-14 rounded-full border-2 border-dashed border-slate-600 bg-slate-900/30 flex items-center justify-center hover:border-gold-500 hover:bg-gold-500/10 transition-colors group"
            >
                <User size={24} className="text-slate-600 group-hover:text-gold-500" />
            </button>
            {showName && <span className="text-[10px] text-slate-500 font-bold">خالی</span>}
        </div>
      );
  }

  const avatarUrl = player.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${player.user_id}`;

  return (
    <div 
      className={cn(
        "absolute flex flex-col items-center gap-2 transition-all duration-300 z-30",
        positionClasses[position]
      )}
    >
      <div className="relative">
        <div className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full border-[3px] overflow-hidden shadow-2xl transition-all relative z-10 bg-slate-800",
          isActive ? "border-gold-500 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.6)]" : "border-slate-700"
        )}>
          <img 
            src={avatarUrl} 
            alt="Player" 
            className="w-full h-full object-cover" 
            loading="eager"
          />
        </div>
        
        {isHakem && (
            <div className="absolute -top-3 -right-2 bg-slate-900 rounded-full p-1 border border-gold-500 z-20 shadow-md">
                <Crown size={14} className="fill-gold-500 text-gold-500" />
            </div>
        )}
        {isOwner && !isHakem && (
            <div className="absolute -top-3 -right-2 bg-slate-900 rounded-full p-1 border border-blue-500 z-20 shadow-md">
                <User size={14} className="text-blue-500" />
            </div>
        )}
      </div>
      
      {showName && (
        <div className={cn(
            "bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 text-center shadow-lg min-w-[4rem]",
            isActive ? "border-gold-500/50 text-gold-400" : "text-slate-200"
        )}>
            <div className="text-[10px] font-bold whitespace-nowrap">{player.name || `User ${player.user_id}`}</div>
        </div>
      )}
    </div>
  );
});
