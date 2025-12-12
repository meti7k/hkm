import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { User, Calendar, ArrowLeft } from 'lucide-react';

export const Onboarding = () => {
  const { registerUser } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age) {
      registerUser(formData.name, formData.age, formData.gender);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-2">
              <User size={16} /> نام شما
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-left dir-ltr placeholder:text-right"
              placeholder="نام کاربری"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300 flex items-center gap-2">
              <Calendar size={16} /> سن
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={e => setFormData({...formData, age: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors text-left dir-ltr placeholder:text-right"
              placeholder="سن شما"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">جنسیت</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, gender: 'male'})}
                className={`p-3 rounded-xl border transition-all ${formData.gender === 'male' ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
              >
                آقا
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, gender: 'female'})}
                className={`p-3 rounded-xl border transition-all ${formData.gender === 'female' ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}
              >
                خانم
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gold-500 to-amber-600 text-slate-950 font-bold py-4 rounded-xl shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transition-all active:scale-95 mt-4"
          >
            شروع ماجراجویی
          </button>
        </form>
      </motion.div>
    </div>
  );
};
