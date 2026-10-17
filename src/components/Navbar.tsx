import React from 'react';
import { Flame, Sparkles, Crown, Smartphone, Globe, Settings, Moon, Sun } from 'lucide-react';
import { CreditState } from '../utils/rules';
import { ThemeMode } from '../utils/theme';

interface NavbarProps {
  creditState: CreditState;
  onNavigateHome: () => void;
  onOpenPaywall: () => void;
  onOpenExportModal: () => void;
  onOpenSettings: () => void;
  theme: ThemeMode;
  onToggleThemeQuick: () => void;
  dialect: 'PT-BR' | 'PT-PT';
  onToggleDialect: () => void;
  timeUntilReset: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  creditState,
  onNavigateHome,
  onOpenPaywall,
  onOpenExportModal,
  onOpenSettings,
  theme,
  onToggleThemeQuick,
  dialect,
  onToggleDialect,
  timeUntilReset,
}) => {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 px-3.5 py-2.5 border-b backdrop-blur-md transition-colors ${
      isLight ? 'bg-white/95 border-slate-200' : 'bg-[#090a12]/95 border-[#1b1f33]'
    }`}>
      <div className="flex items-center justify-between">
        
        {/* Brand Logo - Lovix */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
          aria-label="Lovix Início"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff2a6d] via-[#ff5e62] to-[#05d9e8] p-0.5 flex items-center justify-center shadow-md shadow-[#ff2a6d]/20">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0d0e17]'}`}>
              <Flame className="w-4.5 h-4.5 text-[#ff2a6d] fill-[#ff2a6d]" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <span className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Lovix
              </span>
              <span className="text-[9px] font-extrabold px-1 rounded bg-[#ff2a6d] text-white">
                AI
              </span>
            </div>
            <p className={`text-[9px] font-medium leading-none ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Carisma & Flerte #1
            </p>
          </div>
        </button>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1.5">
          {/* Quick Theme Toggle Icon Button */}
          <button
            onClick={onToggleThemeQuick}
            title={`Alternar para tema ${isLight ? 'escuro' : 'claro'}`}
            className={`p-1.5 rounded-lg border transition-all active:scale-95 ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#131627] border-[#20253d] text-amber-300'
            }`}
            aria-label="Alternar Tema"
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          {/* Dialect Switcher */}
          <button
            onClick={onToggleDialect}
            title="Alterar dialeto"
            className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-1.5 rounded-lg active:scale-95 transition-all ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#131627] border-[#20253d] text-gray-300'
            }`}
          >
            <Globe className="w-3 h-3 text-[#05d9e8]" />
            <span>{dialect}</span>
          </button>

          {/* Credits Counter Pill */}
          {creditState.isPro ? (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 text-amber-500 text-[11px] font-black shadow-sm active:scale-95"
            >
              <Crown className="w-3 h-3 text-amber-500" />
              <span>PRO</span>
            </button>
          ) : (
            <button
              onClick={onOpenPaywall}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] active:scale-95 transition-all ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#131627] border-[#232840] text-gray-200'
              }`}
              title={`Créditos resetam em ${timeUntilReset}`}
            >
              <Sparkles className="w-3 h-3 text-[#ff2a6d]" />
              <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {creditState.credits}/10
              </span>
            </button>
          )}

          {/* Settings Menu Icon */}
          <button
            onClick={onOpenSettings}
            title="Configurações e Tema"
            className={`p-1.5 rounded-lg border active:scale-95 transition-all ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#131627] border-[#20253d] text-gray-300'
            }`}
            aria-label="Abrir Configurações"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Upgrade Button */}
          {!creditState.isPro && (
            <button
              onClick={onOpenPaywall}
              className="bg-gradient-to-r from-[#ff2a6d] to-[#ff5e62] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shadow-md shadow-[#ff2a6d]/25 active:scale-95 transition-transform"
            >
              Lovix PRO
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
