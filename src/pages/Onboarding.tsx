import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { User, AtSign, Calendar, Users } from 'lucide-react';
import { Gender } from '../types';

export const Onboarding = () => {
  const { user, registerUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    age: '',
    gender: 'male' as Gender
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user.isRegistered) {
      return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.username || !formData.age) {
        setError('لطفا تمام فیلدها را پر کنید');
        return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 99) {
        setError('سن باید بین ۱۰ تا ۹۹ باشد');
        return;
    }

    setLoading(true);
    const success = await registerUser(formData.name, formData.username, ageNum, formData.gender);
    setLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError('خطا در ثبت نام. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600 mb-2">
            به حکم رویال خوش آمدید
          </h1>
          <p className="text-slate-400 text-sm">لطفا مشخصات خود را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-slate-300 flex items-center gap-2">
              <User size={14} /> نام نمایشی
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-left dir-ltr placeholder:text-right text-white text-sm"
              placeholder="نام شما"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 flex items-center gap-2">
              <AtSign size={14} /> نام کاربری
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-left dir-ltr placeholder:text-right text-white text-sm"
              placeholder="username"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                <Calendar size={14} /> سن
                </label>
                <input
                type="number"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-center text-white text-sm"
                placeholder="۲۰"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs text-slate-300 flex items-center gap-2">
                <Users size={14} /> جنسیت
                </label>
                <div className="flex bg-slate-800/50 rounded-xl p-1 border border-slate-700">
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'male'})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.gender === 'male' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        آقا
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, gender: 'female'})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.gender === 'female' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        خانم
                    </button>
                </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-all active:scale-95 mt-4 disabled:opacity-50 text-sm"
          >
            {loading ? 'در حال ثبت...' : 'شروع ماجراجویی'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
