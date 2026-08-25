import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';
type AppContextValue = { language: Language; theme: Theme; isArabic: boolean; colors: typeof colors.light; toggleLanguage: () => void; toggleTheme: () => void };
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({children}:{children:React.ReactNode}) {
  const [language,setLanguage] = useState<Language>('en');
  const [theme,setTheme] = useState<Theme>('light');
  useEffect(()=>{ AsyncStorage.multiGet(['agri-language','agri-theme']).then(([lang,mode])=>{ if(lang[1]==='ar') setLanguage('ar'); if(mode[1]==='dark') setTheme('dark'); }); },[]);
  const toggleLanguage=()=>setLanguage(v=>{const next=v==='en'?'ar':'en'; void AsyncStorage.setItem('agri-language',next); return next;});
  const toggleTheme=()=>setTheme(v=>{const next=v==='light'?'dark':'light'; void AsyncStorage.setItem('agri-theme',next); return next;});
  const value=useMemo(()=>({language,theme,isArabic:language==='ar',colors:colors[theme],toggleLanguage,toggleTheme}),[language,theme]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext); if(!value) throw new Error('useApp must be used inside AppProvider'); return value;}