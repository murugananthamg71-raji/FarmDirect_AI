import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 text-sm text-darktext bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
      <Globe className="w-4 h-4 text-primary" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ta' | 'hi')}
        className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
      >
        <option value="en">English</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="hi">हिन्दी (Hindi)</option>
      </select>
    </div>
  );
};

