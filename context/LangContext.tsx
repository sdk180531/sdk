import React, { createContext, useContext, useState } from 'react';
import { I18N, Lang } from '@/constants/i18n';

interface LangContextValue {
  lang: Lang;
  t: typeof I18N['ko'];
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'ko',
  t: I18N.ko,
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko');

  const toggleLang = () => setLang(prev => (prev === 'ko' ? 'en' : 'ko'));

  return (
    <LangContext.Provider value={{ lang, t: I18N[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
