declare module 'react-playing-cards' {
  import React from 'react';

  interface PlayingCardProps {
    rank: string;
    suit: string;
    style?: React.CSSProperties;
    className?: string;
    onClick?: () => void;
  }

  export const PlayingCard: React.FC<PlayingCardProps>;
}
