import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { User, Globe, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-extrabold text-darktext">Account & Language Settings</h1>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
        <div className="flex items-center space-x-4 border-b pb-4">
          <div className="w-12 h-12 rounded-full bg-lightbg text-primary font-extrabold flex items-center justify-center text-xl">
            {user?.full_name?.[0] || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-darktext text-base">{user?.full_name}</h3>
            <p className="text-xs text-gray-500">{user?.email} • Role: {user?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-700 uppercase">Preferred Language</h4>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border">
            <span className="text-xs text-gray-700 font-semibold">Select Application Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

