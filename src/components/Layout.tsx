import React from 'react';
import { BottomNav } from './BottomNav';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isGame = location.pathname === '/game';
  const isChat = location.pathname.startsWith('/chat');
  const shouldHideNav = isGame || isChat;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-50 font-sans">
      {/* 
         If Game or Chat: Fixed full height, no scroll on body (handled inside page).
         If Menu/Profile: Scrollable.
      */}
      <div className={cn(
        "flex-1 w-full",
        shouldHideNav ? "overflow-hidden h-full relative" : "overflow-y-auto overflow-x-hidden pb-32 scroll-smooth"
      )}>
        {children}
      </div>
      
      {!shouldHideNav && <BottomNav />}
    </div>
  );
};
