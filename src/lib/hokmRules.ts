import { Card, Suit, PlayedCard, Player } from '../types';

// --- Constants ---
export const SUIT_ORDER = ['hearts', 'spades', 'diamonds', 'clubs'] as const;
export const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

// --- Helpers ---
export const getCardValue = (rank: string): number => {
  return RANK_ORDER.indexOf(rank as any) + 2;
};

// Generate a deck with UNIQUE IDs
export const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUIT_ORDER) {
    for (const rank of RANK_ORDER) {
      deck.push({
        uid: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
        id: `${rank}-${suit}`,
        suit,
        rank,
        value: getCardValue(rank)
      });
    }
  }
  return deck;
};

// Improved Shuffle
export const shuffleDeck = (deck: Card[]): Card[] => {
  let newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

// Sort Hand: Group by Suit, then Big to Small (A -> 2)
export const sortHand = (hand: Card[]): Card[] => {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    }
    return b.value - a.value;
  });
};

// --- Game Logic ---

export const isValidMove = (
  card: Card,
  hand: Card[],
  tableCards: PlayedCard[],
  hokm: Suit | null
): boolean => {
  if (tableCards.length === 0) return true;
  const leadSuit = tableCards[0].card.suit;
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);
  if (hasLeadSuit) return card.suit === leadSuit;
  return true;
};

const getCardStrength = (card: Card, leadSuit: Suit, hokm: Suit | null): number => {
  if (card.suit === hokm) return card.value + 200; 
  if (card.suit === leadSuit) return card.value + 100;
  return card.value;
};

export const determineTrickWinner = (
  tableCards: PlayedCard[],
  hokm: Suit | null
): string => {
  if (tableCards.length === 0) return '';
  const leadSuit = tableCards[0].card.suit;
  let highestCard = tableCards[0];
  let highestVal = getCardStrength(tableCards[0].card, leadSuit, hokm);

  for (let i = 1; i < tableCards.length; i++) {
    const current = tableCards[i];
    const val = getCardStrength(current.card, leadSuit, hokm);
    if (val > highestVal) {
      highestVal = val;
      highestCard = current;
    }
  }
  return highestCard.playerId;
};

// --- PRO BOT LOGIC v2.0 ---
export const getBotMove = (
  hand: Card[],
  tableCards: PlayedCard[],
  hokm: Suit | null,
  botId: string,
  players: Player[]
): Card => {
  const validCards = hand.filter(c => isValidMove(c, hand, tableCards, hokm));
  if (validCards.length === 0) return hand[0]; // Should not happen
  if (validCards.length === 1) return validCards[0];

  const myTeam = players.find(p => p.id === botId)?.team;
  
  // Sort cards for easier logic
  const sortedValid = [...validCards].sort((a, b) => b.value - a.value); // High to Low

  // --- SCENARIO 1: LEADING (Table Empty) ---
  if (tableCards.length === 0) {
    // 1. Play Ace of any non-Hokm suit
    const aces = sortedValid.filter(c => c.value === 14 && c.suit !== hokm);
    if (aces.length > 0) return aces[0];

    // 2. Play King if I have King+Queen of same suit (Solid sequence)
    const kings = sortedValid.filter(c => c.value === 13 && c.suit !== hokm);
    for (const king of kings) {
        if (hand.some(c => c.suit === king.suit && c.value === 12)) return king;
    }

    // 3. Play Singleton (Only 1 card in suit) to cut later - RISKY but PRO
    // Only if it's a low card (don't throw away a King singleton early)
    const suitsInHand = hand.reduce((acc, c) => { acc[c.suit] = (acc[c.suit] || 0) + 1; return acc; }, {} as Record<string, number>);
    const singletons = sortedValid.filter(c => suitsInHand[c.suit] === 1 && c.suit !== hokm && c.value < 10);
    if (singletons.length > 0) return singletons[0];

    // 4. Play highest card of my longest suit (excluding Hokm if possible)
    const bestSuit = Object.entries(suitsInHand)
        .filter(([s]) => s !== hokm)
        .sort((a, b) => b[1] - a[1])[0]; // Longest non-hokm suit
    
    if (bestSuit) {
        const suitCards = sortedValid.filter(c => c.suit === bestSuit[0]);
        if (suitCards.length > 0) return suitCards[0];
    }

    // 5. Fallback: Play highest non-hokm
    const nonHokm = sortedValid.filter(c => c.suit !== hokm);
    if (nonHokm.length > 0) return nonHokm[0];

    // 6. Only Hokm left? Play highest to draw trumps
    return sortedValid[0];
  }

  // --- SCENARIO 2: FOLLOWING / CUTTING ---
  const leadSuit = tableCards[0].card.suit;
  const currentWinnerId = determineTrickWinner(tableCards, hokm);
  const currentWinner = players.find(p => p.id === currentWinnerId);
  const isTeammateWinning = currentWinner?.team === myTeam;
  const winnerCard = tableCards.find(tc => tc.playerId === currentWinnerId)?.card;
  
  // Safety check
  if (!winnerCard) return sortedValid[0];

  // Do I have the lead suit?
  const followCards = sortedValid.filter(c => c.suit === leadSuit);

  if (followCards.length > 0) {
    // MUST FOLLOW SUIT
    if (isTeammateWinning) {
        // Partner is winning.
        // If partner's card is very strong (A, K, or high Hokm), play LOWEST (save strength).
        // Or if I'm the last player, play LOWEST.
        if (winnerCard.value >= 12 || tableCards.length === 3) {
             return followCards[followCards.length - 1]; // Lowest
        }
        // Partner has a mid card (e.g. 10). Can I boost? 
        // If I have A or K, play it to secure the trick.
        if (followCards[0].value > winnerCard.value) {
            return followCards[0]; // Take over if I have a clear winner
        }
        return followCards[followCards.length - 1]; // Can't help, play low
    } else {
        // Enemy is winning.
        // Can I beat the enemy?
        const winningCards = followCards.filter(c => c.value > winnerCard.value);
        if (winningCards.length > 0) {
            // Play the LOWEST card that wins (don't waste Ace if King wins)
            return winningCards[winningCards.length - 1];
        }
        // Can't win. Dump LOWEST.
        return followCards[followCards.length - 1];
    }
  } else {
    // I DON'T HAVE LEAD SUIT.
    // Can I Cut?
    const hokmCards = sortedValid.filter(c => c.suit === hokm);
    
    if (hokmCards.length > 0) {
        // I have Hokm.
        if (isTeammateWinning) {
            // Partner winning. Don't waste Hokm unless partner's card is weak and might be overcut by next player (if I'm not last).
            // Generally, if partner winning, dump trash of another suit.
            const trash = sortedValid.filter(c => c.suit !== hokm);
            if (trash.length > 0) return trash[trash.length - 1]; // Lowest trash
            return hokmCards[hokmCards.length - 1]; // Only have Hokm, play lowest
        } else {
            // Enemy winning.
            // Check if enemy already cut with a higher Hokm
            const enemyPlayedHokm = winnerCard.suit === hokm;
            if (enemyPlayedHokm) {
                // Must beat their Hokm
                const winningHokms = hokmCards.filter(c => c.value > winnerCard.value);
                if (winningHokms.length > 0) return winningHokms[winningHokms.length - 1]; // Lowest winning Hokm
                // Can't beat their Hokm. Dump trash.
                const trash = sortedValid.filter(c => c.suit !== hokm);
                if (trash.length > 0) return trash[trash.length - 1];
                return hokmCards[hokmCards.length - 1]; // Forced to play low Hokm
            } else {
                // Enemy didn't cut (or played lead suit). Any Hokm wins.
                return hokmCards[hokmCards.length - 1]; // Play lowest Hokm to win
            }
        }
    } else {
        // No Hokm either. Just dump lowest card (trash).
        // Prefer dumping low cards of suits I have few of.
        return sortedValid[sortedValid.length - 1];
    }
  }
};
