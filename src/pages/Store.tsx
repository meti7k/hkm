import React from 'react';
import { useApp } from '../context/AppContext';
import { Coins } from 'lucide-react';

export const Store = () => {
  const { user, addCoins } = useApp();

  const packages = [
    { amount: 100, price: '۲۰,۰۰۰ تومان', bonus: 0 },
    { amount: 500, price: '۹۰,۰۰۰ تومان', bonus: 50, popular: true },
    { amount: 1000, price: '۱۷۰,۰۰۰ تومان', bonus: 150 },
  ];

  return (
    <div className="h-full bg-slate-950 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <h1 className="text-lg font-bold">فروشگاه سکه</h1>
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

      <h3 className="text-slate-400 text-xs font-bold mb-4 shrink-0">بسته‌های پیشنهادی</h3>
      
      <div className="flex flex-col gap-4">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`relative bg-slate-900 border ${pkg.popular ? 'border-gold-500' : 'border-slate-800'} rounded-2xl p-4 flex items-center justify-between shadow-md`}>
            {pkg.popular && (
              <span className="absolute -top-2.5 left-4 bg-gold-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">محبوب</span>
            )}
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-gold-400 border border-slate-700">
                <Coins size={20} className="fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{pkg.amount} سکه</h4>
                {pkg.bonus > 0 && <p className="text-green-500 text-[10px] mt-0.5">+{pkg.bonus} هدیه</p>}
              </div>
            </div>

            <button 
              onClick={() => addCoins(pkg.amount)}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              {pkg.price}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
