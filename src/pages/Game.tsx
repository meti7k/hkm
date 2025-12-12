import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card as CardComponent } from '../components/Card';
import { Card, Player, Suit, GamePhase, PlayedCard, ChatMessage } from '../types';
import { generateDeck, shuffleDeck, isValidMove, determineTrickWinner, getBotMove, sortHand } from '../lib/hokmRules';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Trophy, X, LogOut, Crown, AlertTriangle, RefreshCw, UserPlus, Ban, CheckCircle, UserMinus, MessageCircle, Send, Smile } from 'lucide-react';
import { cn } from '../lib/utils';

// --- Improved Preloader ---
const GamePreloader = ({ onComplete }: { onComplete: () => void }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const criticalImages = [
            'https://deckofcardsapi.com/static/img/back.png',
            'https://www.transparenttextures.com/patterns/felt.png'
        ];
        const suits = ['H', 'D', 'C', 'S'];
        const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
        
        ranks.forEach(r => suits.forEach(s => criticalImages.push(`https://deckofcardsapi.com/static/img/${r}${s}.png`)));
        
        let loadedCount = 0;
        const total = criticalImages.length;
        let isMounted = true;

        const checkComplete = () => {
            if (!isMounted) return;
            loadedCount++;
            const pct = Math.round((loadedCount / total) * 100);
            setProgress(pct);
            if (loadedCount >= total) {
                setTimeout(onComplete, 300); 
            }
        };

        criticalImages.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onload = checkComplete;
            img.onerror = checkComplete;
        });
        
        const timeout = setTimeout(() => {
            if (isMounted) onComplete();
        }, 5000);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[200]">
            <div className="relative w-full max-w-xs px-10">
                 <div className="flex justify-between text-xs font-bold text-gold-500 mb-2">
                    <span>در حال آماده‌سازی میز...</span>
                    <span>{progress}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-gold-600 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                    />
                 </div>
            </div>
        </div>
    );
};

// --- Player Avatar Component ---
const PlayerAvatar = React.memo(({ player, isActive, position, timer, isHakem, onClick }: { player: Player | undefined, isActive: boolean, position: string, timer: number, isHakem: boolean, onClick: () => void }) => {
  if (!player) return null;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "absolute flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer z-30",
        position === 'top' ? "top-32 left-1/2 -translate-x-1/2" :
        position === 'left' ? "left-2 top-[40%] -translate-y-1/2 items-center" : 
        position === 'right' ? "right-2 top-[40%] -translate-y-1/2 items-center" : ""
      )}
    >
      <div className="relative">
        <div className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full border-[3px] overflow-hidden shadow-lg transition-all relative z-10 bg-slate-800",
          isActive ? "border-gold-500 scale-110 shadow-[0_0_15px_rgba(234,179,8,0.5)]" : "border-slate-700"
        )}>
          <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
        </div>
        
        {isHakem && (
            <div className="absolute -top-3 -right-2 bg-slate-900 rounded-full p-1 border border-gold-500 z-20 shadow-md">
                <Crown size={12} className="fill-gold-500 text-gold-500" />
            </div>
        )}

        {isActive && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-gold-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-gold-500/50 z-20 whitespace-nowrap">
                {timer}s
            </div>
        )}
      </div>
      
      <div className={cn(
          "bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-slate-700 text-center shadow-md min-w-[3.5rem]",
          isActive ? "border-gold-500/50" : ""
      )}>
        <div className="text-[10px] font-bold text-white whitespace-nowrap">{player.name}</div>
      </div>
    </div>
  );
});

const BOT_NAMES = ['سارا', 'علی', 'رضا'];
const TURN_DURATION = 15; 
const WINNING_SCORE = 7; 

const DELAYS = {
    BOT_THINK: 1500, 
    TRICK_RESULT: 1500, 
    DEALING: 100, 
    NEXT_ROUND: 1000     
};

export const Game = () => {
  const navigate = useNavigate();
  const { user, spendCoins, updateUser, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useApp();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'online';
  const targetScoreParam = parseInt(searchParams.get('target') || '3');
  const TARGET_MATCH_SCORE = isNaN(targetScoreParam) ? 3 : targetScoreParam;

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('initializing');
  const [players, setPlayers] = useState<Player[]>([]);
  const [hokm, setHokm] = useState<Suit | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [hakemIndex, setHakemIndex] = useState<number>(-1);
  const [tableCards, setTableCards] = useState<PlayedCard[]>([]);
  
  const [tricks, setTricks] = useState({ team1: 0, team2: 0 });
  const [matchScore, setMatchScore] = useState({ team1: 0, team2: 0 }); 
  
  const [timer, setTimer] = useState(TURN_DURATION);
  const [showResult, setShowResult] = useState(false);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<1 | 2 | null>(null);
  const [matchWinnerTeam, setMatchWinnerTeam] = useState<1 | 2 | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false); // Chat Modal State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [lastTrickWinner, setLastTrickWinner] = useState<string | null>(null);
  const [cutEffect, setCutEffect] = useState<string | null>(null);
  const [winningCardId, setWinningCardId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [roundPoints, setRoundPoints] = useState<number>(1); 
  const [isShaking, setIsShaking] = useState(false); 
  
  const processingTrickRef = useRef(false);
  const turnLockRef = useRef(false); 
  const deckRef = useRef<Card[]>([]); 
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dealingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameInitializedRef = useRef(false); 
  
  const playersRef = useRef(players);
  const tableCardsRef = useRef(tableCards);
  const phaseRef = useRef(phase);
  const currentTurnRef = useRef(currentTurn);
  const hokmRef = useRef(hokm);
  const tricksRef = useRef(tricks);
  const hakemIndexRef = useRef(hakemIndex);
  const matchScoreRef = useRef(matchScore);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { tableCardsRef.current = tableCards; }, [tableCards]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  useEffect(() => { hokmRef.current = hokm; }, [hokm]);
  useEffect(() => { tricksRef.current = tricks; }, [tricks]);
  useEffect(() => { hakemIndexRef.current = hakemIndex; }, [hakemIndex]);
  useEffect(() => { matchScoreRef.current = matchScore; }, [matchScore]);

  useEffect(() => {
    if (mode === 'online') {
        if (user.coins < 2) {
            navigate('/store');
            return;
        }
        spendCoins(2); 
    }
    return () => clearAllTimeouts();
  }, []);

  const onAssetsLoaded = () => {
      setAssetsLoaded(true);
      if (!gameInitializedRef.current) {
          gameInitializedRef.current = true;
          initializeGame();
      }
  };

  const clearAllTimeouts = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    if (dealingTimeoutRef.current) clearTimeout(dealingTimeoutRef.current);
  };

  const clearTurnTimeouts = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
  };

  const initializeGame = () => {
    const bot1Stats = { wins: Math.floor(Math.random() * 50) + 10, losses: Math.floor(Math.random() * 30) + 5 };
    const bot2Stats = { wins: Math.floor(Math.random() * 50) + 10, losses: Math.floor(Math.random() * 30) + 5 };
    const bot3Stats = { wins: Math.floor(Math.random() * 50) + 10, losses: Math.floor(Math.random() * 30) + 5 };

    const p: Player[] = [
      { id: 'me', name: user.name, avatar: user.avatar, cards: [], team: 1, isBot: false, stats: { wins: user.wins, losses: user.losses } },
      { id: 'bot1', name: BOT_NAMES[0], avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${BOT_NAMES[0]}`, cards: [], team: 2, isBot: true, stats: bot1Stats },
      { id: 'bot2', name: BOT_NAMES[1], avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${BOT_NAMES[1]}`, cards: [], team: 1, isBot: true, stats: bot2Stats },
      { id: 'bot3', name: BOT_NAMES[2], avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${BOT_NAMES[2]}`, cards: [], team: 2, isBot: true, stats: bot3Stats },
    ];
    setPlayers(p);
    determineFirstHakem(p);
  };

  const determineFirstHakem = (currentPlayers: Player[]) => {
    setPhase('initializing');
    setTimeout(() => {
        const hIndex = 0; 
        setHakemIndex(hIndex);
        startRound(hIndex, currentPlayers);
    }, 300); 
  };

  const startRound = (hIndex: number, currentPlayers: Player[]) => {
    const newDeck = shuffleDeck(generateDeck());
    deckRef.current = newDeck; 

    setTricks({ team1: 0, team2: 0 });
    setTableCards([]);
    setHokm(null);
    setPhase('dealing_1');
    setHakemIndex(hIndex);
    processingTrickRef.current = false;
    turnLockRef.current = false;
    setLastTrickWinner(null);
    setShowResult(false);
    setWinnerTeam(null);
    setWinningCardId(null);
    setRoundPoints(1);
    
    const resetPlayers = currentPlayers.map(p => ({ ...p, cards: [] }));
    setPlayers(resetPlayers);

    if (dealingTimeoutRef.current) clearTimeout(dealingTimeoutRef.current);
    dealingTimeoutRef.current = setTimeout(() => dealPhase1(resetPlayers, hIndex), DELAYS.DEALING);
  };

  const dealPhase1 = (currentPlayers: Player[], hIndex: number) => {
    const deck = deckRef.current;
    const updatedPlayers = [...currentPlayers];
    
    for (let i = 0; i < 4; i++) {
        const rawCards = deck.slice(i * 5, (i + 1) * 5);
        updatedPlayers[i].cards = sortHand(rawCards); 
    }
    
    setPlayers(updatedPlayers);
    setPhase('bidding'); 

    if (hIndex === 0) {
        return; 
    }

    if (updatedPlayers[hIndex].isBot) {
        dealingTimeoutRef.current = setTimeout(() => {
            const botHand = updatedPlayers[hIndex].cards;
            const suits: Record<string, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            botHand.forEach(c => suits[c.suit]++);
            const bestSuit = Object.entries(suits).sort((a, b) => b[1] - a[1])[0][0] as Suit;
            selectHokm(bestSuit, updatedPlayers, hIndex);
        }, DELAYS.BOT_THINK); 
    }
  };

  const selectHokm = (suit: Suit, currentPlayers = players, hIndex = hakemIndex) => {
    setHokm(suit);
    setPhase('dealing_2');
    
    if (dealingTimeoutRef.current) clearTimeout(dealingTimeoutRef.current);

    dealingTimeoutRef.current = setTimeout(() => {
        const deck = deckRef.current;
        const updatedPlayers = [...currentPlayers];
        
        for (let i = 0; i < 4; i++) {
            const startIdx = 20 + (i * 8);
            const newCards = deck.slice(startIdx, startIdx + 8);
            const fullHand = [...updatedPlayers[i].cards, ...newCards];
            updatedPlayers[i].cards = sortHand(fullHand); 
        }
        
        setPlayers(updatedPlayers);
        setPhase('playing');
        setCurrentTurn(hIndex); 
        setTimer(TURN_DURATION);
        turnLockRef.current = false;
    }, DELAYS.DEALING);
  };

  useEffect(() => {
    if (phase !== 'playing') {
        clearTurnTimeouts();
        return;
    }

    if (processingTrickRef.current || showResult || showMatchResult) {
        clearTurnTimeouts();
        return;
    }

    const cTurn = currentTurn;
    const currentPlayer = players[cTurn];
    
    if (!currentPlayer) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(TURN_DURATION);
    
    timerRef.current = setInterval(() => {
        setTimer(prev => {
            if (prev <= 1) {
                clearInterval(timerRef.current!);
                handleTimeout(); 
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    if (currentPlayer.isBot) {
        if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
        
        const attemptBotMove = () => {
            if (phaseRef.current !== 'playing' || currentTurnRef.current !== cTurn) return;

            if (turnLockRef.current || processingTrickRef.current) {
                botTimeoutRef.current = setTimeout(attemptBotMove, 100); 
                return;
            }

            executeBotMove();
        };

        botTimeoutRef.current = setTimeout(attemptBotMove, DELAYS.BOT_THINK);
    }

    return () => {
        clearTurnTimeouts();
    };
  }, [currentTurn, phase, processingTrickRef.current]);

  const handleTimeout = () => {
    if (turnLockRef.current || processingTrickRef.current || phaseRef.current !== 'playing') return;
    
    const cTurn = currentTurnRef.current;
    const currentPlayer = playersRef.current[cTurn];
    if (!currentPlayer) return;
    
    turnLockRef.current = true;

    const cardToPlay = getBotMove(
        currentPlayer.cards, 
        tableCardsRef.current, 
        hokmRef.current, 
        currentPlayer.id, 
        playersRef.current
    );

    if (cardToPlay) {
        playCard(cardToPlay, true); 
    } else {
        turnLockRef.current = false; 
    }
  };

  const executeBotMove = () => {
    if (turnLockRef.current || processingTrickRef.current || phaseRef.current !== 'playing') return;

    const cTurn = currentTurnRef.current;
    const currentPlayer = playersRef.current[cTurn];
    
    if (!currentPlayer || !currentPlayer.isBot) return;

    const card = getBotMove(currentPlayer.cards, tableCardsRef.current, hokmRef.current, currentPlayer.id, playersRef.current);
    playCard(card);
  };

  const playCard = useCallback((card: Card, isForced = false) => {
    if (!isForced && (turnLockRef.current || processingTrickRef.current || phaseRef.current !== 'playing')) return;
    
    turnLockRef.current = true; 
    clearTurnTimeouts();

    const currentTable = tableCardsRef.current;
    const cTurn = currentTurnRef.current;
    const currentPlayerId = playersRef.current[cTurn].id;

    // Optimistic update
    setPlayers(prev => prev.map((p, idx) => {
      if (idx === cTurn) {
        return { ...p, cards: p.cards.filter(c => c.uid !== card.uid) };
      }
      return p;
    }));

    const playedCardObj = { playerId: currentPlayerId, card, order: currentTable.length };
    const newTableCards = [...currentTable, playedCardObj];
    setTableCards(newTableCards);
    
    if (currentTable.length > 0) {
        const leadSuit = currentTable[0].card.suit;
        if (card.suit === hokmRef.current && leadSuit !== hokmRef.current) {
            setCutEffect(card.uid);
            setIsShaking(true); 
            setTimeout(() => setIsShaking(false), 500);
        }
    }

    if (newTableCards.length === 4) {
       processingTrickRef.current = true;
       setPhase('trick_resolution');
    } else {
       setCurrentTurn((prev) => (prev + 1) % 4);
       setTimeout(() => { turnLockRef.current = false; }, 50); 
    }
  }, []);

  useEffect(() => {
    if (tableCards.length === 4 && phase === 'trick_resolution') {
      const timeout = setTimeout(() => resolveTrick(), DELAYS.TRICK_RESULT);
      return () => clearTimeout(timeout);
    }
  }, [tableCards, phase]);

  const resolveTrick = () => {
    const winnerId = determineTrickWinner(tableCards, hokm);
    const winningCard = tableCards.find(c => c.playerId === winnerId)?.card;
    if (winningCard) setWinningCardId(winningCard.uid);

    setLastTrickWinner(winnerId);
    setCutEffect(null); 
    
    const winnerIndex = players.findIndex(p => p.id === winnerId);
    if (winnerIndex === -1) return;
    const winnerPlayer = players[winnerIndex];

    let newTricks = { ...tricks };
    if (winnerPlayer.team === 1) newTricks.team1 += 1;
    else newTricks.team2 += 1;
    
    setTimeout(() => {
        setTricks(newTricks);
        setTableCards([]);
        setWinningCardId(null);
        
        if (newTricks.team1 >= WINNING_SCORE || newTricks.team2 >= WINNING_SCORE) {
          endRound(newTricks);
        } else {
          setPhase('playing');
          setCurrentTurn(winnerIndex); 
          processingTrickRef.current = false;
          turnLockRef.current = false; 
        }
        setLastTrickWinner(null);
    }, 500); 
  };

  const endRound = (finalTricks: { team1: number, team2: number }) => {
    const roundWinnerTeam = finalTricks.team1 >= WINNING_SCORE ? 1 : 2;
    const currentHakemIndex = hakemIndexRef.current;
    const currentHakem = playersRef.current[currentHakemIndex];
    const hakemTeam = currentHakem.team;

    let points = 1;
    const losingTeamScore = roundWinnerTeam === 1 ? finalTricks.team2 : finalTricks.team1;

    if (losingTeamScore === 0) {
        if (roundWinnerTeam !== hakemTeam) {
            points = 3;
        } else {
            points = 2;
        }
    }
    setRoundPoints(points);

    const newMatchScore = { ...matchScore };
    if (roundWinnerTeam === 1) newMatchScore.team1 += points;
    else newMatchScore.team2 += points;
    setMatchScore(newMatchScore);

    if (newMatchScore.team1 >= TARGET_MATCH_SCORE || newMatchScore.team2 >= TARGET_MATCH_SCORE) {
        setMatchWinnerTeam(newMatchScore.team1 >= TARGET_MATCH_SCORE ? 1 : 2);
        setPhase('game_end');
        processingTrickRef.current = true;
        
        if (newMatchScore.team1 >= TARGET_MATCH_SCORE) {
            updateUser({ wins: user.wins + 1, coins: user.coins + 10 }); 
        } else {
            updateUser({ losses: user.losses + 1 });
        }
        setShowMatchResult(true);
        return;
    }

    let nextHakem = currentHakemIndex;
    if (currentHakem.team !== roundWinnerTeam) {
        nextHakem = (currentHakemIndex + 1) % 4;
    }

    setWinnerTeam(roundWinnerTeam as 1 | 2);
    setPhase('round_end');
    processingTrickRef.current = true;
    
    setHakemIndex(nextHakem);
    setShowResult(true);
  };

  const startNextRound = () => {
      startRound(hakemIndex, players);
  };

  const handleDragEnd = useCallback((event: any, info: PanInfo, card: Card) => {
    if (phaseRef.current !== 'playing' || playersRef.current[currentTurnRef.current].id !== 'me' || processingTrickRef.current || turnLockRef.current) return;
    
    // Increased threshold to -120px to prevent accidental drops
    // If the user drags up (negative Y) more than 120px, play the card.
    // If they drag up and then back down (so offset is small), it won't trigger.
    if (info.offset.y < -120) { 
        if (!isValidMove(card, playersRef.current[0].cards, tableCardsRef.current, hokmRef.current)) {
            return;
        }
        playCard(card);
    }
    // If not triggered, framer-motion's dragSnapToOrigin handles the return animation.
  }, [playCard]);

  const handleCardClick = useCallback((card: Card) => {
    if (phaseRef.current !== 'playing' || playersRef.current[currentTurnRef.current].id !== 'me' || processingTrickRef.current || turnLockRef.current) return;
    
    if (!isValidMove(card, playersRef.current[0].cards, tableCardsRef.current, hokmRef.current)) {
        return;
    }
    playCard(card);
  }, [playCard]);

  const sendChatMessage = () => {
      if (!chatInput.trim()) return;
      setChatMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'me', text: chatInput }]);
      setChatInput('');
  };

  const sendQuickChat = (text: string) => {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), senderId: 'me', text }]);
  };

  const getPlayerByPos = (pos: 'left' | 'top' | 'right') => {
    if (players.length < 4) return undefined;
    if (pos === 'left') return players[1];
    if (pos === 'top') return players[2];
    if (pos === 'right') return players[3];
    return players[0];
  };

  const myCards = players[0]?.cards || [];
  
  const { row1, row2, row1Spacing, row2Spacing } = useMemo(() => {
      const isSingleRow = myCards.length <= 4;
      const rowSplitIndex = isSingleRow ? myCards.length : Math.ceil(myCards.length / 2);
      
      const r1 = isSingleRow ? [] : myCards.slice(0, rowSplitIndex);
      const r2 = isSingleRow ? myCards : myCards.slice(rowSplitIndex);

      const calculateSpacing = (count: number) => {
          if (count <= 3) return '0.75rem'; 
          if (count <= 5) return '-0.5rem'; 
          if (count <= 8) return '-1.5rem'; 
          return '-2rem'; 
      };

      return {
          row1: r1,
          row2: r2,
          row1Spacing: calculateSpacing(r1.length),
          row2Spacing: calculateSpacing(r2.length)
      };
  }, [myCards]);

  const isSingleRow = myCards.length <= 4;

  const getExitProps = () => {
      if (!lastTrickWinner) return { opacity: 0, scale: 0.5 };
      if (lastTrickWinner === 'me') return { y: 300, opacity: 0, scale: 0.5 };
      if (lastTrickWinner === 'bot2') return { y: -300, opacity: 0, scale: 0.5 };
      if (lastTrickWinner === 'bot1') return { x: -300, opacity: 0, scale: 0.5 };
      if (lastTrickWinner === 'bot3') return { x: 300, opacity: 0, scale: 0.5 };
      return { opacity: 0, scale: 0 };
  };

  const isMyTurn = phase === 'playing' && currentTurn === 0 && !processingTrickRef.current && !turnLockRef.current;

  if (!assetsLoaded) {
      return <GamePreloader onComplete={onAssetsLoaded} />;
  }

  return (
    <div className={cn("fixed inset-0 bg-slate-950 overflow-hidden flex flex-col select-none touch-none font-sans", isShaking ? "animate-shake" : "")} dir="rtl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#051a12] to-black pointer-events-none"></div>
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30 pointer-events-none h-32">
         
         {/* Left: Exit & Our Score */}
         <div className="absolute top-4 left-4 flex flex-col items-center gap-2 pointer-events-auto">
            <button onClick={() => setShowExitModal(true)} className="w-12 h-12 bg-slate-800/90 backdrop-blur-sm rounded-2xl text-slate-400 flex items-center justify-center border border-white/10 hover:bg-red-900/50 hover:text-red-400 transition-colors shadow-lg">
                <LogOut size={20} className="rotate-180" /> 
            </button>
            <div className="w-12 py-1.5 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center shadow-lg gap-0.5">
                <span className="text-[9px] text-blue-300 font-bold">ما</span>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-xl font-black text-white">{tricks.team1}</span>
                    <span className="text-[8px] text-slate-500">دست</span>
                </div>
                <div className="w-8 h-px bg-white/10 my-0.5"></div>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-xs text-slate-300 font-mono font-bold" dir="ltr">{matchScore.team1}/{TARGET_MATCH_SCORE}</span>
                    <span className="text-[8px] text-slate-500">ست</span>
                </div>
            </div>
         </div>

         {/* Center: Hokm */}
         <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
             {hokm ? (
                <div className="h-12 px-3 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-lg gap-2 min-w-[3rem]">
                    <span className="text-[10px] text-gold-500 font-bold whitespace-nowrap">حکم:</span>
                    <div className="flex items-center justify-center">
                        {hokm === 'hearts' && <span className="text-red-500 text-2xl leading-none">♥</span>}
                        {hokm === 'diamonds' && <span className="text-red-500 text-2xl leading-none">♦</span>}
                        {hokm === 'clubs' && <span className="text-slate-200 text-2xl leading-none">♣</span>}
                        {hokm === 'spades' && <span className="text-slate-200 text-2xl leading-none">♠</span>}
                    </div>
                </div>
             ) : (
                 <div className="h-12 px-3 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-lg border-dashed gap-2 min-w-[3rem]">
                     <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">حکم:</span>
                     <span className="text-slate-500 text-lg">?</span>
                 </div> 
             )}
         </div>

         {/* Right: Chat & Their Score */}
         <div className="absolute top-4 right-4 flex flex-col items-center gap-2 pointer-events-auto">
             <button onClick={() => setShowChatModal(true)} className="w-12 h-12 bg-slate-800/90 backdrop-blur-sm rounded-2xl text-slate-400 flex items-center justify-center border border-white/10 hover:bg-blue-900/50 hover:text-blue-400 transition-colors shadow-lg">
                <MessageCircle size={20} />
             </button>
             <div className="w-12 py-1.5 bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col items-center shadow-lg gap-0.5">
                <span className="text-[9px] text-red-300 font-bold">حریف</span>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-xl font-black text-white">{tricks.team2}</span>
                    <span className="text-[8px] text-slate-500">دست</span>
                </div>
                <div className="w-8 h-px bg-white/10 my-0.5"></div>
                <div className="flex flex-col items-center leading-none">
                    <span className="text-xs text-slate-300 font-mono font-bold" dir="ltr">{matchScore.team2}/{TARGET_MATCH_SCORE}</span>
                    <span className="text-[8px] text-slate-500">ست</span>
                </div>
            </div>
         </div>
      </div>

      {/* Game Table */}
      <div className="absolute inset-0 flex items-center justify-center perspective-1000 pointer-events-none">
        <div className="absolute inset-0 pointer-events-auto">
             <PlayerAvatar 
                player={getPlayerByPos('top')} 
                isActive={currentTurn === 2} 
                position="top" 
                timer={timer} 
                isHakem={hakemIndex === 2} 
                onClick={() => setSelectedPlayer(getPlayerByPos('top')!)}
             />
             <PlayerAvatar 
                player={getPlayerByPos('left')} 
                isActive={currentTurn === 1} 
                position="left" 
                timer={timer} 
                isHakem={hakemIndex === 1} 
                onClick={() => setSelectedPlayer(getPlayerByPos('left')!)}
             />
             <PlayerAvatar 
                player={getPlayerByPos('right')} 
                isActive={currentTurn === 3} 
                position="right" 
                timer={timer} 
                isHakem={hakemIndex === 3} 
                onClick={() => setSelectedPlayer(getPlayerByPos('right')!)}
             />
        </div>

        <div className="relative w-64 h-64 z-10 flex items-center justify-center">
          <AnimatePresence>
            {tableCards.map((play) => {
              let x = 0, y = 0, rotate = 0;
              let initX = 0, initY = 0;

              // Ensure these IDs match the ones in initializeGame
              if (play.playerId === 'me') { 
                  y = 70; rotate = -2; 
                  initY = 200; 
              }
              else if (play.playerId === 'bot2') { // Top
                  y = -70; rotate = 2; 
                  initY = -200; 
              } 
              else if (play.playerId === 'bot1') { // Left
                  x = -90; rotate = 5; 
                  initX = -200; 
              } 
              else if (play.playerId === 'bot3') { // Right
                  x = 90; rotate = -5; 
                  initX = 200; 
              } 

              return (
                <motion.div
                  key={`${play.card.uid}`}
                  initial={{ scale: 0.8, opacity: 0, x: initX, y: initY }}
                  animate={{ scale: 0.7, opacity: 1, x, y, rotate }} // Reduced scale to 0.7
                  exit={{ 
                      ...getExitProps(),
                      transition: { duration: 0.2, ease: "backIn" } 
                  }}
                  transition={{ duration: 0.3, ease: "backOut" }} 
                  className="absolute drop-shadow-xl origin-center will-change-transform"
                >
                  <CardComponent 
                      card={play.card} 
                      size="md" 
                      isCut={cutEffect === play.card.uid} 
                      isWinner={winningCardId === play.card.uid}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          <AnimatePresence>
             {lastTrickWinner && (
                 <motion.div 
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute top-[60%] left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-gold-400 px-4 py-1.5 rounded-full font-bold text-xs shadow-xl border border-gold-500/30 flex items-center gap-2 whitespace-nowrap backdrop-blur-sm"
                 >
                    <Trophy size={12} />
                    {players.find(p => p.id === lastTrickWinner)?.name}
                 </motion.div>
             )}
          </AnimatePresence>
          
          {phase === 'bidding' && hakemIndex !== 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <div className="text-gold-500 font-bold text-sm bg-slate-900/80 px-4 py-2 rounded-full border border-gold-500/30 backdrop-blur-sm">
                     حاکم در حال انتخاب حکم...
                 </div>
             </div>
          )}
        </div>
      </div>

      <AnimatePresence>
      {phase === 'bidding' && hakemIndex === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/80">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900 p-6 rounded-[2rem] border border-gold-500/50 text-center shadow-2xl w-[90%] max-w-sm relative z-[60] will-change-transform"
            >
              <h3 className="text-gold-400 font-bold mb-6 flex items-center justify-center gap-2 text-xl">
                <Crown size={24} className="fill-gold-400" />
                حکم را انتخاب کنید
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {['hearts', 'diamonds', 'clubs', 'spades'].map((s) => (
                  <button 
                     key={s}
                     onClick={() => selectHokm(s as Suit)} 
                     className="aspect-square bg-slate-800 rounded-2xl hover:bg-slate-700 hover:scale-105 transition-all shadow-lg flex items-center justify-center group ring-2 ring-transparent hover:ring-gold-400"
                  >
                    <div className={`text-4xl ${s === 'hearts' || s === 'diamonds' ? 'text-red-500' : 'text-slate-200'}`}>
                      {s === 'hearts' ? '♥' : s === 'diamonds' ? '♦' : s === 'clubs' ? '♣' : '♠'}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>

      <div className={cn(
             "fixed bottom-0 left-0 right-0 flex flex-col items-center justify-end pointer-events-auto pb-4 px-2 z-20 -translate-x-2", 
             phase === 'bidding' && hakemIndex === 0 ? "z-[70]" : "z-20",
             !isMyTurn && phase !== 'bidding' ? "pointer-events-none" : ""
         )}>
            
            {!isSingleRow && row1.length > 0 && (
                <div className="flex items-end justify-center w-full mb-[-2.5rem] z-10">
                    {row1.map((card, i) => {
                         const isBidding = phase === 'bidding' && hakemIndex === 0;
                         const isPlayable = isBidding || (phase === 'playing' && currentTurn === 0 && isValidMove(card, players[0].cards, tableCards, hokm));
                         const zIndex = row1.length - i;
                         
                         return (
                            <motion.div 
                                key={card.uid}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.2, delay: i * 0.02 }}
                                className={cn("relative transition-transform shrink-0 will-change-transform touch-none")}
                                style={{ 
                                    marginRight: row1Spacing,
                                    marginLeft: i === row1.length - 1 ? 0 : undefined,
                                    zIndex: zIndex
                                }}
                                drag={isPlayable} 
                                dragConstraints={false} 
                                dragSnapToOrigin
                                dragElastic={0} // Changed to 0 for instant 1:1 movement
                                dragTransition={{ bounceStiffness: 800, bounceDamping: 20 }} // Snappy return
                                dragMomentum={false} 
                                onDragEnd={(e, info) => handleDragEnd(e, info, card)}
                                whileDrag={{ scale: 1.15, zIndex: 100, cursor: 'grabbing' }}
                            >
                                <CardComponent 
                                    card={card} 
                                    size="sm"
                                    playable={isPlayable}
                                    onClick={handleCardClick}
                                    className={cn("shadow-lg", isPlayable ? "brightness-100" : "brightness-[0.6] opacity-90")}
                                />
                            </motion.div>
                         );
                    })}
                </div>
            )}

            <div className="flex items-end justify-center w-full z-20">
                {row2.map((card, i) => {
                        const isBidding = phase === 'bidding' && hakemIndex === 0;
                        const isPlayable = isBidding || (phase === 'playing' && currentTurn === 0 && isValidMove(card, players[0].cards, tableCards, hokm));
                        const zIndex = row2.length - i;

                        return (
                        <motion.div 
                            key={card.uid}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.2, delay: (row1.length + i) * 0.02 }}
                            className={cn("relative transition-transform shrink-0 will-change-transform touch-none")}
                            style={{ 
                                marginRight: row2Spacing,
                                marginLeft: i === row2.length - 1 ? 0 : undefined,
                                zIndex: zIndex
                            }} 
                            drag={isPlayable} 
                            dragConstraints={false} 
                            dragSnapToOrigin
                            dragElastic={0} // Changed to 0 for instant 1:1 movement
                            dragTransition={{ bounceStiffness: 800, bounceDamping: 20 }} // Snappy return
                            dragMomentum={false}
                            onDragEnd={(e, info) => handleDragEnd(e, info, card)}
                            whileDrag={{ scale: 1.15, zIndex: 100, cursor: 'grabbing' }}
                        >
                            <CardComponent 
                                card={card} 
                                size="sm"
                                playable={isPlayable}
                                onClick={handleCardClick}
                                className={cn("shadow-lg", isPlayable ? "brightness-100" : "brightness-[0.6] opacity-90")}
                            />
                        </motion.div>
                        );
                })}
            </div>
         </div>

      {/* Optimized Modals - Removed Backdrop Blur */}
      <AnimatePresence>
        {selectedPlayer && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6" onClick={() => setSelectedPlayer(null)}>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl relative will-change-transform"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                    <div className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-800 mx-auto mb-4 shadow-xl overflow-hidden">
                        <img src={selectedPlayer.avatar} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{selectedPlayer.name}</h3>
                    <p className="text-slate-400 text-xs font-bold mb-6">
                        {selectedPlayer.isBot ? 'هوش مصنوعی' : 'بازیکن آنلاین'}
                    </p>
                    <div className="flex justify-center gap-4 mb-6">
                        <div className="bg-slate-800 p-3 rounded-xl w-20">
                            <div className="text-gold-500 font-black text-xl">
                                {selectedPlayer.stats?.wins || 0}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold">بردها</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-xl w-20">
                            <div className="text-red-500 font-black text-xl">
                                {selectedPlayer.stats?.losses || 0}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold">باخت‌ها</div>
                        </div>
                    </div>
                    
                    {!selectedPlayer.isBot || selectedPlayer.id !== 'me' ? (
                        <div className="flex gap-2">
                            {isFriend(selectedPlayer.id) ? (
                                <>
                                    <button 
                                        onClick={() => {
                                            removeFriend(selectedPlayer.id);
                                            setSelectedPlayer(null);
                                        }}
                                        className="flex-1 bg-slate-800 text-red-500 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700"
                                    >
                                        <UserMinus size={16} /> حذف دوست
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => addFriend(selectedPlayer)} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-500 transition flex items-center justify-center gap-2">
                                    <UserPlus size={16} /> افزودن
                                </button>
                            )}
                            
                            {isBlocked(selectedPlayer.id) ? (
                                <button 
                                    onClick={() => unblockUser(selectedPlayer.id)}
                                    className="flex-1 bg-slate-800 text-green-500 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700"
                                >
                                    <CheckCircle size={16} /> رفع مسدودی
                                </button>
                            ) : (
                                <button onClick={() => blockUser(selectedPlayer.id)} className="flex-1 bg-slate-800 text-red-400 py-3 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center justify-center gap-2">
                                    <Ban size={16} /> مسدود
                                </button>
                            )}
                        </div>
                    ) : null}
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-xs text-center shadow-2xl will-change-transform"
                >
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">خروج از بازی؟</h3>
                    <p className="text-red-400 text-xs mb-4">در صورت خروج ۵ سکه جریمه می‌شوید.</p>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowExitModal(false)} className="flex-1 bg-slate-800 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition">
                            ادامه بازی
                        </button>
                        <button onClick={() => { spendCoins(5); navigate('/'); }} className="flex-1 bg-red-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20">
                            خروج
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChatModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6" onClick={() => setShowChatModal(false)}>
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm h-[60vh] flex flex-col shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><MessageCircle size={18} className="text-gold-500" /> چت بازی</h3>
                        <button onClick={() => setShowChatModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {chatMessages.length === 0 ? (
                            <div className="text-center text-slate-500 text-xs mt-10">هنوز پیامی ارسال نشده است.</div>
                        ) : (
                            chatMessages.map(msg => (
                                <div key={msg.id} className={cn("flex", msg.senderId === 'me' ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "px-3 py-2 rounded-xl max-w-[85%] text-xs",
                                        msg.senderId === 'me' ? "bg-blue-600 text-white rounded-tl-none" : "bg-slate-800 text-slate-200 rounded-tr-none"
                                    )}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-800 space-y-3">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {['سلام', 'خسته نباشید', 'عالی بود', 'سریع بازی کن', '😂', '👍', '❤️'].map(txt => (
                                <button key={txt} onClick={() => sendQuickChat(txt)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap hover:bg-slate-700 border border-slate-700">
                                    {txt}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                                placeholder="پیام..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-gold-500 outline-none"
                            />
                            <button onClick={sendChatMessage} className="bg-gold-500 text-slate-900 p-2.5 rounded-xl hover:bg-gold-400">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && !showMatchResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden will-change-transform"
            >
              <div className={`absolute top-0 left-0 w-full h-full opacity-10 ${winnerTeam === 1 ? 'bg-gold-500' : 'bg-red-500'} blur-3xl`}></div>
              
              <div className="relative z-10">
                  {winnerTeam === 1 ? (
                    <>
                      <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-28 h-28 bg-gradient-to-br from-gold-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-xl shadow-gold-500/20"
                      >
                        <Trophy size={56} className="fill-current" />
                      </motion.div>
                      <h2 className="text-4xl font-black text-white mb-2">پیروزی!</h2>
                      <p className="text-slate-400 mb-2 font-medium">تیم شما برنده این دست شد.</p>
                      {roundPoints > 1 && (
                          <div className="mb-6 inline-block bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full text-xs font-bold border border-gold-500/30">
                              {roundPoints === 2 ? 'کُت (۲ امتیاز)' : 'حاکم کُت (۳ امتیاز)'}
                          </div>
                      )}
                      {roundPoints === 1 && <div className="mb-6"></div>}
                    </>
                  ) : (
                    <>
                      <div className="w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border-4 border-red-500/20 shadow-xl">
                        <X size={56} />
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2">شکست</h2>
                      <p className="text-slate-400 mb-2 font-medium">متاسفانه بازی را واگذار کردید.</p>
                      {roundPoints > 1 && (
                          <div className="mb-6 inline-block bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                              {roundPoints === 2 ? 'کُت (۲ امتیاز)' : 'حاکم کُت (۳ امتیاز)'}
                          </div>
                      )}
                      {roundPoints === 1 && <div className="mb-6"></div>}
                    </>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => navigate('/')} className="flex-1 bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-700 transition text-sm border border-white/10">
                      خروج
                    </button>
                    <button onClick={startNextRound} className="flex-[2] bg-gold-500 text-slate-900 py-4 rounded-xl font-bold hover:bg-gold-400 transition text-base shadow-lg flex items-center justify-center gap-2">
                      <RefreshCw size={20} /> دست بعدی
                    </button>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMatchResult && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-gold-500 rounded-[2rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden will-change-transform"
            >
              <div className={`absolute top-0 left-0 w-full h-full opacity-20 ${matchWinnerTeam === 1 ? 'bg-gold-500' : 'bg-red-500'} blur-3xl`}></div>
              
              <div className="relative z-10">
                  {matchWinnerTeam === 1 ? (
                    <>
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="w-32 h-32 bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-2xl shadow-gold-500/40"
                      >
                        <Crown size={64} className="fill-current" />
                      </motion.div>
                      <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-300 to-amber-600 mb-2">قهرمان!</h2>
                      <p className="text-slate-300 mb-4 font-bold text-lg">تبریک! شما برنده نهایی بازی شدید.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border-4 border-red-500 shadow-2xl">
                        <Ban size={64} />
                      </div>
                      <h2 className="text-5xl font-black text-red-500 mb-2">باخت نهایی</h2>
                      <p className="text-slate-400 mb-4 font-bold text-lg">متاسفانه حریف برنده کل بازی شد.</p>
                    </>
                  )}

                  <div className="bg-slate-800/50 rounded-xl p-4 mb-8 border border-white/10 flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1 font-bold">نتیجه نهایی</span>
                      <div className="text-3xl font-black text-white tracking-widest">
                          {matchScore.team1} - {matchScore.team2}
                      </div>
                      {matchWinnerTeam === 1 && <span className="text-gold-400 font-mono text-xs font-bold mt-2">+۱۰ سکه جایزه</span>}
                  </div>

                  <button onClick={() => navigate('/')} className="w-full bg-white text-slate-950 py-4 rounded-xl font-black hover:bg-slate-200 transition text-lg shadow-xl">
                    بازگشت به خانه
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
