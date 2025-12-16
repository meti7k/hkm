import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import socketService from '../services/socket';
import { GameService } from '../services/api';
import { Card as CardComponent } from '../components/Card';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Card, GameState } from '../types';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { LogOut, Crown, Mic, MicOff, Copy } from 'lucide-react';
import { cn } from '../lib/utils';

const GamePreloader = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        setTimeout(onComplete, 1000); 
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[200]">
             <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <div className="text-gold-500 font-bold animate-pulse">در حال ورود به بازی...</div>
        </div>
    );
};

export const Game = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchParams] = useSearchParams();
  const gameId = parseInt(searchParams.get('id') || '0');

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  
  const [gameState, setGameState] = useState<GameState>({
    roomId: gameId,
    phase: 'waiting',
    players: [],
    tableCards: [],
    currentTurn: -1,
    hakemSeat: -1,
    hokm: null,
    tricks: { team1: 0, team2: 0 },
    matchScore: { team1: 0, team2: 0 },
    ownerId: 0
  });

  useEffect(() => {
    if (!assetsLoaded || !gameId) return;

    socketService.watchGame(gameId);

    const handleGameState = (state: GameState) => {
        setGameState(state);
    };

    socketService.on('GAME_STATE', handleGameState);

    return () => {
        socketService.off('GAME_STATE', handleGameState);
    };
  }, [assetsLoaded, gameId]);

  const handleStartGame = () => {
      socketService.startGame(gameId);
  };

  const playCard = (card: Card) => {
      socketService.playCard(card.uid);
  };
  
  const handleChangeSeat = async (seat: number) => {
      try {
          await GameService.changeSeat(gameId, seat);
      } catch (e) {
          console.error("Change seat failed", e);
      }
  };

  const handleDragEnd = (event: any, info: PanInfo, card: Card) => {
    if (info.offset.y < -100) playCard(card);
  };

  const myPlayer = gameState.players.find(p => p.user_id === user.id);
  
  const getWaitingRoomPlayer = (seat: number) => {
      return gameState.players.find(p => p.seat === seat);
  };

  const getPlayingPlayer = (pos: 'bottom' | 'left' | 'top' | 'right') => {
      const mySeat = myPlayer?.seat || 1;
      const offsets = { bottom: 0, right: 1, top: 2, left: 3 };
      const targetSeat = ((mySeat - 1 + offsets[pos]) % 4) + 1;
      return gameState.players.find(p => p.seat === targetSeat);
  };

  if (!assetsLoaded) {
      return <GamePreloader onComplete={() => setAssetsLoaded(true)} />;
  }

  if (gameState.phase === 'waiting') {
      const isOwner = gameState.ownerId === user.id;
      const filledSeats = gameState.players.length;

      return (
          <div className="fixed inset-0 bg-slate-950 flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                  <div>
                      <h1 className="text-xl font-bold text-white flex items-center gap-2">
                          <Crown className="text-gold-500" size={24} /> اتاق انتظار
                      </h1>
                      <div className="flex items-center gap-2 mt-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800 transition">
                          <span className="text-xs text-slate-400">کد اتاق:</span>
                          <span className="text-sm font-mono font-bold text-white tracking-widest">{gameId}</span>
                          <Copy size={12} className="text-slate-500" />
                      </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/lobby')} 
                    className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                  >
                      <LogOut size={16} /> خروج
                  </button>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute w-64 h-64 border border-slate-800 rotate-45 rounded-[3rem] opacity-20"></div>
                  <div className="absolute w-48 h-48 border border-slate-800 rotate-45 rounded-[2rem] opacity-20"></div>

                  <div className="absolute z-10 text-center">
                      {filledSeats < 4 ? (
                          <div className="flex flex-col items-center animate-pulse">
                              <span className="text-gold-500 font-bold text-lg">در انتظار بازیکن...</span>
                              <span className="text-slate-500 text-xs mt-1">{filledSeats}/4 نفر</span>
                          </div>
                      ) : (
                          !isOwner && (
                              <div className="flex flex-col items-center">
                                  <span className="text-blue-400 font-bold text-lg">منتظر شروع بازی توسط مالک</span>
                                  <span className="text-slate-500 text-xs mt-1">اتاق تکمیل شد</span>
                              </div>
                          )
                      )}
                  </div>

                  <PlayerAvatar 
                    player={getWaitingRoomPlayer(3)} 
                    isActive={false} 
                    position="top" 
                    isHakem={false} 
                    isOwner={gameState.ownerId === getWaitingRoomPlayer(3)?.user_id} 
                    onSit={() => handleChangeSeat(3)}
                  />
                  
                  <PlayerAvatar 
                    player={getWaitingRoomPlayer(2)} 
                    isActive={false} 
                    position="right" 
                    isHakem={false} 
                    isOwner={gameState.ownerId === getWaitingRoomPlayer(2)?.user_id} 
                    onSit={() => handleChangeSeat(2)}
                  />
                  
                  <PlayerAvatar 
                    player={getWaitingRoomPlayer(4)} 
                    isActive={false} 
                    position="left" 
                    isHakem={false} 
                    isOwner={gameState.ownerId === getWaitingRoomPlayer(4)?.user_id} 
                    onSit={() => handleChangeSeat(4)}
                  />
                  
                  <PlayerAvatar 
                    player={getWaitingRoomPlayer(1)} 
                    isActive={false} 
                    position="bottom" 
                    isHakem={false} 
                    isOwner={gameState.ownerId === getWaitingRoomPlayer(1)?.user_id} 
                    onSit={() => handleChangeSeat(1)}
                  />
              </div>

              <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20 px-6">
                  {isOwner && (
                      <button 
                        onClick={handleStartGame}
                        disabled={filledSeats < 4}
                        className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-amber-600 text-slate-900 font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                          {filledSeats < 4 ? `منتظر بازیکنان (${filledSeats}/4)` : 'شروع بازی'}
                      </button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden flex flex-col select-none touch-none font-sans" dir="rtl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#051a12] to-black pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 right-0 p-4 z-30 pointer-events-none h-32">
         <div className="absolute top-4 left-4 pointer-events-auto">
            <button onClick={() => navigate('/')} className="w-10 h-10 bg-slate-800/90 backdrop-blur-sm rounded-xl text-slate-400 flex items-center justify-center border border-white/10 hover:bg-red-900/50 hover:text-red-400 transition-colors shadow-lg">
                <LogOut size={18} className="rotate-180" /> 
            </button>
         </div>

         <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-auto">
             <div className="flex flex-col items-center bg-slate-900/80 px-4 py-1 rounded-xl border border-slate-800">
                 <span className="text-[10px] text-blue-400 font-bold">ما</span>
                 <span className="text-xl font-black text-white">{gameState.tricks.team1}</span>
             </div>
             
             <div className="h-12 w-12 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-lg relative">
                {gameState.hokm ? (
                    <span className={cn("text-2xl", 
                        (gameState.hokm === 'hearts' || gameState.hokm === 'diamonds') ? "text-red-500" : "text-slate-200"
                    )}>
                        {gameState.hokm === 'hearts' && '♥'}
                        {gameState.hokm === 'diamonds' && '♦'}
                        {gameState.hokm === 'clubs' && '♣'}
                        {gameState.hokm === 'spades' && '♠'}
                    </span>
                ) : <span className="text-slate-500 font-bold">?</span>}
             </div>

             <div className="flex flex-col items-center bg-slate-900/80 px-4 py-1 rounded-xl border border-slate-800">
                 <span className="text-[10px] text-red-400 font-bold">آنها</span>
                 <span className="text-xl font-black text-white">{gameState.tricks.team2}</span>
             </div>
         </div>

         <div className="absolute top-4 right-4 pointer-events-auto">
             <button 
                onClick={() => setIsMicOn(!isMicOn)} 
                className={cn(
                    "w-10 h-10 backdrop-blur-sm rounded-xl flex items-center justify-center border transition-colors shadow-lg",
                    isMicOn ? "bg-green-600 text-white border-green-500" : "bg-slate-800/90 text-slate-400 border-white/10 hover:text-white"
                )}
             >
                {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
             </button>
         </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center perspective-1000 pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto">
             <PlayerAvatar 
                player={getPlayingPlayer('top')} 
                isActive={gameState.currentTurn === getPlayingPlayer('top')?.seat} 
                position="top" 
                isHakem={gameState.hakemSeat === getPlayingPlayer('top')?.seat}
                isOwner={gameState.ownerId === getPlayingPlayer('top')?.user_id}
             />
             <PlayerAvatar 
                player={getPlayingPlayer('left')} 
                isActive={gameState.currentTurn === getPlayingPlayer('left')?.seat} 
                position="left" 
                isHakem={gameState.hakemSeat === getPlayingPlayer('left')?.seat}
                isOwner={gameState.ownerId === getPlayingPlayer('left')?.user_id}
             />
             <PlayerAvatar 
                player={getPlayingPlayer('right')} 
                isActive={gameState.currentTurn === getPlayingPlayer('right')?.seat} 
                position="right" 
                isHakem={gameState.hakemSeat === getPlayingPlayer('right')?.seat}
                isOwner={gameState.ownerId === getPlayingPlayer('right')?.user_id}
             />
        </div>

        <div className="relative w-64 h-64 z-10 flex items-center justify-center">
          <AnimatePresence>
            {gameState.tableCards.map((play) => {
              return (
                <motion.div
                  key={`${play.card.uid}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 0.7, opacity: 1 }}
                  className="absolute drop-shadow-xl origin-center"
                >
                  <CardComponent card={play.card} size="md" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex flex-col items-center justify-end pointer-events-auto pb-6 px-2 z-20 -translate-x-2">
            <div className="flex items-end justify-center w-full z-20 h-32">
                {myPlayer?.cards?.map((card, i) => (
                    <motion.div 
                        key={card.uid}
                        className="relative transition-transform shrink-0"
                        style={{ marginRight: '-2rem', zIndex: 10 + i }}
                        drag={gameState.currentTurn === myPlayer?.seat}
                        dragSnapToOrigin
                        onDragEnd={(e, info) => handleDragEnd(e, info, card)}
                        whileHover={{ marginBottom: '1rem' }}
                    >
                        <CardComponent card={card} size="md" onClick={() => playCard(card)} />
                    </motion.div>
                ))}
            </div>
      </div>
    </div>
  );
};
