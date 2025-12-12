import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Gamepad2, Users } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { icon: Gamepad2, label: 'بازی', path: '/' },
    { icon: Users, label: 'دوستان', path: '/friends' },
    { icon: ShoppingBag, label: 'فروشگاه', path: '/store' },
    { icon: User, label: 'پروفایل', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl pb-2 pt-2 px-4 z-50 shadow-xl shadow-black/50">
      <div className="flex justify-between items-center h-14">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300 w-16 relative",
                isActive ? "text-gold-500" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "transition-all duration-300",
                isActive ? "scale-110 -translate-y-1" : "scale-100"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                  "text-[9px] font-bold transition-all", 
                  isActive ? "text-gold-500" : "text-slate-500"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                  <span className="absolute -bottom-2 w-1 h-1 bg-gold-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
