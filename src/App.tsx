import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { QuizModal } from './components/QuizModal';
import { PaywallModal } from './components/PaywallModal';
import { SettingsModal } from './components/SettingsModal';
import { ScreenshotReplyTab } from './components/ScreenshotReplyTab';
import { ManualReplyTab } from './components/ManualReplyTab';
import { PickupGeneratorTab } from './components/PickupGeneratorTab';
import { BioOptimizerTab } from './components/BioOptimizerTab';
import { HistoryTab } from './components/HistoryTab';
import { CodeExportModal } from './components/CodeExportModal';
import {
  CreditState,
  HOURLY_FREE_CREDITS,
  RESET_INTERVAL_MS,
  syncCreditState,
  consumeCredit,
  RizzScoreResult,
} from './utils/rules';
import { ThemeMode, getInitialTheme, applyTheme } from './utils/theme';
import {
  Camera,
  MessageSquare,
  Flame,
  Sparkles,
  History,
  Home,
  Settings,
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('landing');
  const [quizOpen, setQuizOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [codeExportOpen, setCodeExportOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<string | undefined>();
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const [dialect, setDialect] = useState<'PT-BR' | 'PT-PT'>('PT-BR');

  const [creditState, setCreditState] = useState<CreditState>(() => {
    try {
      const saved = localStorage.getItem('lovix_credit_state');
      if (saved) {
        return syncCreditState(JSON.parse(saved));
      }
    } catch {}
    return {
      credits: HOURLY_FREE_CREDITS,
      lastResetTime: Date.now(),
      isPro: false,
    };
  });

  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('lovix_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [timeUntilReset, setTimeUntilReset] = useState<string>('59m');
  const [toast, setToast] = useState<string | null>(null);

  // Initialize theme on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('tab') === 'screenshot') {
      setActiveView('screenshot');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updated = syncCreditState(creditState, now);
      if (updated.credits !== creditState.credits) {
        setCreditState(updated);
        localStorage.setItem('lovix_credit_state', JSON.stringify(updated));
      }

      if (!creditState.isPro) {
        const msLeft = Math.max(0, creditState.lastResetTime + RESET_INTERVAL_MS - now);
        const minsLeft = Math.ceil(msLeft / (60 * 1000));
        setTimeUntilReset(`${minsLeft}m`);
      } else {
        setTimeUntilReset('Ilimitado');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [creditState]);

  const updateCredits = (newState: CreditState) => {
    setCreditState(newState);
    localStorage.setItem('lovix_credit_state', JSON.stringify(newState));
  };

  const handleToggleTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    showToast(newTheme === 'dark' ? 'Tema escuro ativado' : 'Tema claro ativado');
  };

  const handleConsumeCredit = (): boolean => {
    const res = consumeCredit(creditState);
    if (!res.allowed) {
      setPaywallReason(res.reason || 'Seus 10 créditos gratuitos por hora acabaram!');
      setPaywallOpen(true);
      return false;
    }
    updateCredits(res.newState);
    return true;
  };

  const handleSaveToHistory = (item: any) => {
    const updated = [item, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem('lovix_history', JSON.stringify(updated));
  };

  const handleToggleFavorite = (index: number) => {
    const updated = [...history];
    updated[index].isFavorite = !updated[index].isFavorite;
    setHistory(updated);
    localStorage.setItem('lovix_history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('lovix_history');
    showToast('Histórico limpo com sucesso.');
  };

  const handleUpgradeSuccess = (planId: string) => {
    const proState: CreditState = {
      credits: 9999,
      lastResetTime: Date.now(),
      isPro: true,
    };
    updateCredits(proState);
    setPaywallOpen(false);
    showToast(`Parabéns! Lovix PRO (${planId.toUpperCase()}) ativado com sucesso!`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex justify-center selection:bg-[#ff2a6d] selection:text-white transition-colors duration-200 ${
        isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#030407] text-gray-100'
      }`}
    >
      {/* Mobile-Only Dedicated App Shell with Google Design Aesthetics */}
      <div className="mobile-shell safe-bottom flex flex-col w-full">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-[#16192b]/95 border border-[#ff2a6d]/60 text-white px-3.5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-slideDown">
            <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
            <span className="text-xs font-bold leading-tight">{toast}</span>
          </div>
        )}

        {/* Top Navbar */}
        <Navbar
          creditState={creditState}
          onNavigateHome={() => setActiveView('landing')}
          onOpenPaywall={() => {
            setPaywallReason(undefined);
            setPaywallOpen(true);
          }}
          onOpenExportModal={() => setCodeExportOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          theme={theme}
          onToggleThemeQuick={() => handleToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          dialect={dialect}
          onToggleDialect={() => setDialect((prev) => (prev === 'PT-BR' ? 'PT-PT' : 'PT-BR'))}
          timeUntilReset={timeUntilReset}
        />

        {/* Screen Content */}
        <main className="flex-1">
          {activeView === 'landing' && (
            <LandingHero
              onStartQuiz={() => setQuizOpen(true)}
              onGoToApp={(tab) => setActiveView(tab || 'screenshot')}
              onOpenPaywall={() => {
                setPaywallReason(undefined);
                setPaywallOpen(true);
              }}
            />
          )}

          {activeView === 'screenshot' && (
            <div className="p-3">
              <ScreenshotReplyTab
                onConsumeCredit={handleConsumeCredit}
                dialect={dialect}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>
          )}

          {activeView === 'manual' && (
            <div className="p-3">
              <ManualReplyTab
                onConsumeCredit={handleConsumeCredit}
                dialect={dialect}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>
          )}

          {activeView === 'pickup' && (
            <div className="p-3">
              <PickupGeneratorTab
                onConsumeCredit={handleConsumeCredit}
                dialect={dialect}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>
          )}

          {activeView === 'bio' && (
            <div className="p-3">
              <BioOptimizerTab
                onConsumeCredit={handleConsumeCredit}
                onSaveToHistory={handleSaveToHistory}
              />
            </div>
          )}

          {activeView === 'history' && (
            <div className="p-3">
              <HistoryTab
                history={history}
                onClearHistory={handleClearHistory}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          )}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (Always reachable by thumb) */}
        <nav
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-2xl transition-colors duration-200 ${
            isLight ? 'bg-white/95 border-t border-slate-200' : 'bg-[#090b14]/95 border-t border-[#1a1f33]'
          }`}
        >
          <button
            onClick={() => setActiveView('landing')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'landing'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Início</span>
          </button>

          <button
            onClick={() => setActiveView('screenshot')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'screenshot'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Print OCR</span>
          </button>

          <button
            onClick={() => setActiveView('manual')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'manual'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Manual</span>
          </button>

          <button
            onClick={() => setActiveView('pickup')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'pickup'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <Flame className="w-5 h-5" />
            <span>Cantadas</span>
          </button>

          <button
            onClick={() => setActiveView('bio')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'bio'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Bio AI</span>
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              activeView === 'history'
                ? isLight
                  ? 'text-[#e11d48]'
                  : 'text-[#ff2a6d]'
                : isLight
                ? 'text-slate-500'
                : 'text-gray-400'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Salvos</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-bold active:scale-95 transition-all cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-800' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Ajustes</span>
          </button>
        </nav>

        {/* Modals */}
        <QuizModal
          isOpen={quizOpen}
          onClose={() => setQuizOpen(false)}
          theme={theme}
          onCompleteToPaywall={(_answers, result: RizzScoreResult) => {
            setQuizOpen(false);
            setPaywallReason(
              `Seu Score no Lovix é ${result.score}/100. Desbloqueie o Pro para atingir ${result.potential}%.`
            );
            setPaywallOpen(true);
          }}
          onCompleteToApp={(_answers, result: RizzScoreResult) => {
            setQuizOpen(false);
            setActiveView('screenshot');
            showToast(`Bem-vindo ao Lovix! Score: ${result.score}/100. 10 créditos liberados.`);
          }}
        />

        <PaywallModal
          isOpen={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          onUpgradeSuccess={handleUpgradeSuccess}
          reason={paywallReason}
          theme={theme}
        />

        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          creditState={creditState}
          onSimulateHotmartWebhook={() => {
            handleUpgradeSuccess('anual');
          }}
        />

        <CodeExportModal
          isOpen={codeExportOpen}
          onClose={() => setCodeExportOpen(false)}
        />
      </div>
    </div>
  );
}
