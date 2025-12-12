import React from 'react';
import { Card as CardType } from '../types';
import { cn } from '../lib/utils';
import { Axe } from 'lucide-react';

interface CardProps {
  card?: CardType;
  hidden?: boolean;
  onClick?: (card: CardType) => void;
  className?: string;
  playable?: boolean;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
  isCut?: boolean;
  isWinner?: boolean;
}

export const Card: React.FC<CardProps> = React.memo(({ 
  card, 
  hidden, 
  onClick, 
  className, 
  playable, 
  style, 
  size = 'md', 
  isCut, 
  isWinner 
}) => {
  
  const sizeClasses = {
    sm: "w-[4.8rem] h-[6.8rem] md:w-[5.8rem] md:h-[8.2rem]", 
    md: "w-[6.8rem] h-[9.5rem] md:w-[8.5rem] md:h-[11.8rem]", 
    lg: "w-32 h-44"
  };

  const getCardImageUrl = (c: CardType) => {
      let r = c.rank === '10' ? '0' : c.rank.charAt(0); 
      const s = c.suit.charAt(0).toUpperCase(); 
      return `https://deckofcardsapi.com/static/img/${r}${s}.png`;
  };

  return (
    <div
      onClick={() => onClick && card && onClick(card)}
      style={{
          ...style,
          transform: 'translate3d(0,0,0)', // Force GPU layer
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased'
      }}
      className={cn(
        "relative select-none transition-transform duration-100 ease-out will-change-transform", 
        sizeClasses[size],
        !playable && !hidden ? "cursor-default opacity-90" : "cursor-grab active:cursor-grabbing", 
        isCut ? "z-30" : "",
        isWinner ? "z-30 scale-110" : "",
        className
      )}
    >
      {hidden ? (
        <div className="w-full h-full rounded-[4%] overflow-hidden shadow-md relative bg-blue-900 border border-white/10">
            <img 
                src="https://deckofcardsapi.com/static/img/back.png" 
                alt="Card Back" 
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
            />
        </div>
      ) : card ? (
        <div className="relative w-full h-full rounded-[4%] shadow-sm">
            <img 
                src={getCardImageUrl(card)} 
                alt={`${card.rank} of ${card.suit}`}
                className="w-full h-full object-contain drop-shadow-sm pointer-events-none" 
                draggable={false}
                loading="eager"
                decoding="sync" // Force sync decoding for immediate display
                style={{ 
                    imageRendering: 'high-quality', // Ensure best quality
                    transform: 'translateZ(0)' // Prevent blur on some browsers
                }} 
            />
          
          {isCut && (
             <div className="absolute inset-0 z-50 flex items-center justify-center animate-in zoom-in duration-200 pointer-events-none">
                 <div className="bg-slate-900/90 text-red-500 rounded-full p-2 shadow-2xl border-2 border-red-500 backdrop-blur-sm">
                    <Axe size={24} strokeWidth={2.5} />
                 </div>
             </div>
          )}
        </div>
      ) : null}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.card?.uid === nextProps.card?.uid &&
    prevProps.hidden === nextProps.hidden &&
    prevProps.playable === nextProps.playable &&
    prevProps.isCut === nextProps.isCut &&
    prevProps.isWinner === nextProps.isWinner &&
    prevProps.className === nextProps.className &&
    prevProps.style?.zIndex === nextProps.style?.zIndex &&
    prevProps.style?.marginLeft === nextProps.style?.marginLeft &&
    prevProps.style?.marginRight === nextProps.style?.marginRight
  );
});

Card.displayName = 'Card';
