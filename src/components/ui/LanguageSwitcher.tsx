import React from 'react';
import { Languages } from 'lucide-react';
import { supportedLanguages, useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
    const { language, setLanguage, t } = useLanguage();
    return (
        <label className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 ${compact ? 'h-9 px-2.5' : 'h-10 px-3'}`}>
            <Languages size={compact ? 14 : 15} className="text-primary-700" aria-hidden="true" />
            <span className="sr-only">{t('language')}</span>
            <select
                value={language}
                onChange={event => setLanguage(event.target.value as typeof language)}
                aria-label={t('language')}
                className="max-w-[92px] cursor-pointer appearance-none bg-transparent outline-none"
            >
                {supportedLanguages.map(option => <option key={option.code} value={option.code}>{option.nativeLabel}</option>)}
            </select>
        </label>
    );
};
