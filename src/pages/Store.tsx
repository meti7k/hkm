import React from 'react';
import { useApp } from '../context/AppContext';
import { StoreService } from '../services/api';
import { Coins, ShoppingBag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const Store = () => {
  const { user, addCoins } = useApp();

  // Cache store packages for 1 hour to prevent redundant requests
  const { data, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => StoreService.listPackages(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const packages = data?.data?.packages || [];

  return (
    <div className="h-full bg-slate-950 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h1 className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag className="text-gold-500" size={20} /> فروشگاه
        </h1>
      </div>

      <div className="bg-gradient-to-r from-gold-500 to-amber-600 rounded-2xl p-6 mb-8 text-slate-900 shadow-lg shadow-amber-900/20 shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-medium opacity-80">موجودی شما</p>
            <h2 className="text-3xl font-bold mt-1">{user.coins.toLocaleString()}</h2>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Coins size={28} className="text-white" />
          </div>
        </div>
      </div>

      <h3 className="text-slate-400 text-xs font-bold mb-4 shrink-0">بسته‌های موجود</h3>
      
      {isLoading ? (
          <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="flex flex-col gap-4">
            {packages.map((pkg) => (
            <div key={pkg.id} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md hover:border-slate-700 transition-colors">
                {pkg.discount > 0 && (
                <span className="absolute -top-2.5 left-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    {pkg.discount}% تخفیف
                </span>
                )}
                
                <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gold-400 border border-slate-700">
                    <Coins size={20} className="fill-current" />
                </div>
                <div>
                    <h4 className="font-bold text-base text-white">{pkg.amount.toLocaleString()} سکه</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{pkg.title}</p>
                </div>
                </div>

                <button 
                onClick={() => addCoins(pkg.amount)} // Mock purchase
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                >
                {pkg.price.toLocaleString()} تومان
                </button>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
