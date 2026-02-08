
import React, { useState, useEffect, useRef } from 'react';
import { Screen, UserProfile, DailyLog, Badge, UserSettings, BladderLog } from './types.ts';
import WelcomeScreen from './screens/WelcomeScreen.tsx';
import DashboardScreen from './screens/DashboardScreen.tsx';
import DailyEntryScreen from './screens/DailyEntryScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import GuideScreen from './screens/GuideScreen.tsx';
import StatsScreen from './screens/StatsScreen.tsx';
import ReportScreen from './screens/ReportScreen.tsx';
import AchievementsScreen from './screens/AchievementsScreen.tsx';
import AiChatScreen from './screens/AiChatScreen.tsx';
import BladderDiaryScreen from './screens/BladderDiaryScreen.tsx';
import Layout from './components/Layout.tsx';

const STORAGE_KEY = 'kaptan_bulut_v1_data';

const BADGES: Badge[] = [
  { id: 'star_50', name: 'Yıldız Yolcusu', description: '50 Yıldız Biriktir', icon: 'auto_awesome', threshold: 50, type: 'total_stars', unlocked: false, color: 'text-orange-300' },
  { id: 'star_150', name: 'Gümüş Kanatlı Pilot', description: 'Gökyüzüne yükselmek için 150 Yıldız Biriktir', icon: 'airplanemode_active', threshold: 150, type: 'total_stars', unlocked: false, color: 'text-cyan-200' },
  { id: 'star_300', name: 'Altın Kaptan', description: 'Fırtınaları aşmak için 300 Yıldız Biriktir', icon: 'military_tech', threshold: 300, type: 'total_stars', unlocked: false, color: 'text-yellow-500' },
  { id: 'star_600', name: 'Gökada Komutanı', description: 'Yıldızlar arası 600 Yıldız Biriktir', icon: 'rocket_launch', threshold: 600, type: 'total_stars', unlocked: false, color: 'text-indigo-400' },
  { id: 'star_1200', name: 'Güneş İmparatoru', description: 'Efsanevi 1200 Yıldız Biriktir', icon: 'workspace_premium', threshold: 1200, type: 'total_stars', unlocked: false, color: 'text-primary' },
  { id: 'dis_3', name: 'Dürüst Kahraman', description: '3 Günlük Kayıt Disiplini', icon: 'edit_calendar', threshold: 3, type: 'total_logs', unlocked: false, color: 'text-emerald-400' },
  { id: 'dis_10', name: 'Yolculuk Lideri', description: '10 Günlük Kayıt Disiplini', icon: 'history_edu', threshold: 10, type: 'total_logs', unlocked: false, color: 'text-blue-400' },
  { id: 'dry_10', name: 'Güneş Savaşçısı', description: '10 Toplam Güneşli Gün', icon: 'wb_sunny', threshold: 10, type: 'total_dry', unlocked: false, color: 'text-orange-500' },
];

const getLocalDate = () => new Date().toLocaleDateString('en-CA');

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<{ title: string; message: string; icon: string } | null>(null);
  const lastAlarmTime = useRef<string | null>(null);
  
  // Updated initial profile with missing properties to fix store related errors
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Sevimli Kahraman',
    stars: 0,
    earnedBadgeIds: [],
    purchasedItemIds: [],
    equippedItems: {},
    settings: {
      dinnerFluidRestriction: true,
      dinnerFluidTime: '18:30',
      bedtimeBathroomReminder: true,
      bedtimeBathroomTime: '21:00'
    }
  });
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [bladderLogs, setBladderLogs] = useState<BladderLog[]>([]);
  const [lastReward, setLastReward] = useState<{ base: number, bonus: number, total: number, streak: number } | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setProfile(prev => ({
        ...prev,
        ...parsed.profile
      }));
      setLogs(parsed.logs || []);
      setBladderLogs(parsed.bladderLogs || []);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, logs, bladderLogs }));
    }
  }, [profile, logs, bladderLogs, isLoaded]);

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const playAlarmSound = (messageText: string) => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => console.log("Etkileşim bekleniyor..."));
      
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(messageText);
        utterance.lang = 'tr-TR';
        utterance.pitch = 1.1;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("Alarm sesi çalınamadı", e);
    }
  };

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (lastAlarmTime.current === currentTime) return;

      if (profile.settings.dinnerFluidRestriction && profile.settings.dinnerFluidTime === currentTime) {
        const title = 'Sıvı Sınırı Başladı!';
        const msg = 'Kaptan Bulut diyor ki: Akşam yemeği bitti, şimdi susuzlukla mücadele zamanı kahraman!';
        setActiveAlarm({ title, message: msg, icon: 'local_drink' });
        playAlarmSound("Kaptan Bulut sizi çağırıyor! Akşam yemeği bitti, sıvı sınırına dikkat edelim.");
        lastAlarmTime.current = currentTime;
      }

      if (profile.settings.bedtimeBathroomReminder && profile.settings.bedtimeBathroomTime === currentTime) {
        const title = 'Tuvalet Zamanı!';
        const msg = 'Uykuya geçmeden önce son bir durak: Tuvalete gitmeyi sakın unutma!';
        setActiveAlarm({ title, message: msg, icon: 'wc' });
        playAlarmSound("Kaptan Bulut hatırlatıyor! Haydi kahraman, uyumadan önce tuvalete gitme vakti.");
        lastAlarmTime.current = currentTime;
      }
    };

    const interval = setInterval(checkAlarms, 10000); 
    return () => clearInterval(interval);
  }, [profile.settings]);

  const handleNavigate = (screen: Screen) => setCurrentScreen(screen);
  const handleUpdateSettings = (newSettings: UserSettings) => handleUpdateProfile({ settings: newSettings });

  const handleSaveBladderLog = (log: BladderLog) => {
    setBladderLogs(prev => {
      const filtered = prev.filter(l => l.date !== log.date);
      return [...filtered, log];
    });
  };

  const handleAddLog = (status: 'dry' | 'wet') => {
    const today = getLocalDate();
    const alreadyLogged = logs.some(l => l.date === today);
    if (alreadyLogged) return;

    const updatedLogs = [...logs, { date: today, status }];
    setLogs(updatedLogs);
    
    let baseReward = status === 'dry' ? 50 : 20;
    let bonusReward = 0;
    
    let currentStreak = 0;
    const sortedLogs = [...updatedLogs].sort((a, b) => b.date.localeCompare(a.date));
    for (const log of sortedLogs) {
      if (log.status === 'dry') currentStreak++;
      else break;
    }

    if (status === 'dry') {
        if (currentStreak === 3) bonusReward = 30;
        else if (currentStreak === 7) bonusReward = 100;
        else if (currentStreak === 15) bonusReward = 250;
        else if (currentStreak === 30) bonusReward = 500;
        else if (currentStreak > 1 && currentStreak % 5 === 0) bonusReward = 50;
    }

    const totalReward = baseReward + bonusReward;
    setLastReward({ base: baseReward, bonus: bonusReward, total: totalReward, streak: currentStreak });

    const newTotalStars = profile.stars + totalReward;
    const totalDry = updatedLogs.filter(l => l.status === 'dry').length;
    const totalEntries = updatedLogs.length;

    const newEarnedIds = [...profile.earnedBadgeIds];
    BADGES.forEach(badge => {
      if (!newEarnedIds.includes(badge.id)) {
        let conditionMet = false;
        switch(badge.type) {
          case 'total_dry': conditionMet = totalDry >= badge.threshold; break;
          case 'streak_dry': conditionMet = currentStreak >= badge.threshold; break;
          case 'total_logs': conditionMet = totalEntries >= badge.threshold; break;
          case 'total_stars': conditionMet = newTotalStars >= badge.threshold; break;
        }
        if (conditionMet) newEarnedIds.push(badge.id);
      }
    });

    handleUpdateProfile({ stars: newTotalStars, earnedBadgeIds: newEarnedIds });
  };

  const isLoggedToday = logs.some(l => l.date === getLocalDate());

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Welcome: return <WelcomeScreen onStart={() => setCurrentScreen(Screen.Dashboard)} />;
      case Screen.Dashboard: return <DashboardScreen onNavigate={handleNavigate} profile={profile} logs={logs} badges={BADGES} />;
      case Screen.DailyEntry: return <DailyEntryScreen onBack={() => setCurrentScreen(Screen.Dashboard)} onLog={handleAddLog} onFinish={() => setCurrentScreen(Screen.Dashboard)} isLoggedToday={isLoggedToday} rewardData={lastReward} />;
      case Screen.Settings: return <SettingsScreen onBack={() => setCurrentScreen(Screen.Dashboard)} profile={profile} onSave={handleUpdateSettings} />;
      case Screen.Guide: return <GuideScreen onBack={() => setCurrentScreen(Screen.Dashboard)} />;
      case Screen.Stats: return <StatsScreen onBack={() => setCurrentScreen(Screen.Dashboard)} logs={logs} bladderLogs={bladderLogs} />;
      case Screen.Report: return <ReportScreen onBack={() => setCurrentScreen(Screen.Stats)} logs={logs} bladderLogs={bladderLogs} />;
      case Screen.Achievements: return <AchievementsScreen onBack={() => setCurrentScreen(Screen.Dashboard)} profile={profile} badges={BADGES} />;
      case Screen.AiChat: return <AiChatScreen onBack={() => setCurrentScreen(Screen.Dashboard)} />;
      case Screen.BladderDiary: return <BladderDiaryScreen onBack={() => setCurrentScreen(Screen.Dashboard)} onSave={handleSaveBladderLog} logs={bladderLogs} />;
      default: return <DashboardScreen onNavigate={handleNavigate} profile={profile} logs={logs} badges={BADGES} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-[#1a150c]">
      <Layout currentScreen={currentScreen} onNavigate={handleNavigate}>
        {renderScreen()}
      </Layout>

      {activeAlarm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[40px] p-8 max-sm w-full shadow-2xl space-y-6 transform animate-in zoom-in-95 duration-300 border-4 border-primary">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto animate-bounce">
              <span className="material-symbols-outlined text-5xl fill-1">local_drink</span>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{activeAlarm.title}</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeAlarm.message}
              </p>
            </div>
            <button 
              onClick={() => {
                setActiveAlarm(null);
                window.speechSynthesis.cancel();
              }}
              className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              TAMAM KAPTAN!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;