import React from 'react';
import {
  Flame,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  Camera,
  MessageSquare,
} from 'lucide-react';

interface LandingHeroProps {
  onStartQuiz: () => void;
  onGoToApp: (tab?: string) => void;
  onOpenPaywall: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartQuiz,
  onGoToApp,
}) => {
  return (
    <div className="px-4 pt-4 pb-8 space-y-5">
      {/* Social Proof Pill (Google Material 3 Chip style) */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#121526] border border-slate-200 dark:border-[#212640] text-[11px] shadow-sm">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-800 dark:text-white ml-0.5">4.9/5</span>
          </div>
          <span className="text-slate-400 dark:text-gray-500">•</span>
          <span className="text-slate-600 dark:text-gray-300 font-semibold">+10M Conversas Salvas</span>
          <span className="text-slate-400 dark:text-gray-500">•</span>
          <span className="text-emerald-500 font-bold flex items-center gap-0.5">
            <ShieldCheck className="w-3.5 h-3.5" /> LGPD
          </span>
        </div>
      </div>

      {/* Main Punchy Mobile Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          Nunca Mais Fique no Vácuo.{' '}
          <span className="lovix-gradient-text block">
            Transforme Matches em Encontros.
          </span>
        </h1>
        <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
          Mande o print no <strong className="text-slate-900 dark:text-white">Tinder, Bumble ou WhatsApp</strong>. O <strong>Lovix</strong> analisa o interesse e gera 3 respostas magnéticas.
        </p>
      </div>

      {/* Action Buttons - Mobile Big Touch Targets */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={onStartQuiz}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#ff2a6d] via-[#ff5e62] to-[#ff2a6d] bg-[length:200%_auto] text-white font-black text-base shadow-xl shadow-[#ff2a6d]/25 flex items-center justify-center gap-2.5 active:scale-98 transition-transform cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>Fazer Teste de Carisma Grátis (2 min)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onGoToApp('screenshot')}
          className="w-full h-12 rounded-2xl bg-white dark:bg-[#121422] hover:bg-slate-50 dark:hover:bg-[#181c30] text-slate-800 dark:text-gray-200 font-bold text-xs border border-slate-200 dark:border-[#232942] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
        >
          <Camera className="w-4 h-4 text-[#05d9e8]" />
          <span>Testar com Print Agora (10 Créditos Grátis)</span>
        </button>
      </div>

      {/* Dating Apps Badges Scrollable */}
      <div className="pt-1">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-gray-400 font-black text-center mb-2">
          Compatível com todos os seus apps
        </p>
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-[#111424] border border-pink-200 dark:border-[#1f253d] text-[11px] font-bold text-pink-600 dark:text-pink-400 whitespace-nowrap">
            🔥 Tinder
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-[#111424] border border-amber-200 dark:border-[#1f253d] text-[11px] font-bold text-amber-700 dark:text-yellow-400 whitespace-nowrap">
            🐝 Bumble
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-[#111424] border border-purple-200 dark:border-[#1f253d] text-[11px] font-bold text-purple-700 dark:text-purple-400 whitespace-nowrap">
            💜 Hinge
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-[#111424] border border-emerald-200 dark:border-[#1f253d] text-[11px] font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
            💬 Whats
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-[#111424] border border-rose-200 dark:border-[#1f253d] text-[11px] font-bold text-rose-700 dark:text-rose-400 whitespace-nowrap">
            📸 Insta
          </span>
        </div>
      </div>

      {/* Mobile Comparison: Sem Lovix vs Com Lovix */}
      <div className="space-y-3 pt-2">
        {/* Without */}
        <div className="bg-red-50/50 dark:bg-[#10121d] rounded-2xl p-4 border border-red-200 dark:border-red-500/25 relative shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Sem o Lovix ❌
            </span>
            <span className="text-[9px] text-slate-500 dark:text-gray-500">Papo burocrático</span>
          </div>

          <div className="space-y-1.5 text-[11px] bg-white dark:bg-[#090b14] p-3 rounded-xl border border-red-100 dark:border-[#1a1e30]">
            <div className="bg-slate-100 dark:bg-[#1a1f33] text-slate-700 dark:text-gray-300 p-2 rounded-lg max-w-[85%] ml-auto">
              "Oi, tudo bem? Como foi seu dia?"
            </div>
            <div className="bg-slate-50 dark:bg-[#131624] text-slate-500 dark:text-gray-400 p-2 rounded-lg max-w-[85%]">
              "Oi, td bem e vc?"
            </div>
            <div className="text-center py-1 text-red-500 dark:text-red-400 text-[10px] font-semibold italic">
              ⏱️ Visualizado há 3 dias • Ficou no vácuo
            </div>
          </div>
        </div>

        {/* With Lovix */}
        <div className="bg-white dark:bg-[#111626] rounded-2xl p-4 border border-[#ff2a6d]/30 dark:border-[#ff2a6d]/40 relative shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-[#ff2a6d] tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05d9e8] animate-ping"></span>
              Com o Lovix PRO 🚀
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Termômetro 94%</span>
          </div>

          <div className="space-y-1.5 text-[11px] bg-slate-50 dark:bg-[#090b14] p-3 rounded-xl border border-slate-200 dark:border-[#212845]">
            <div className="bg-white dark:bg-[#131624] text-slate-700 dark:text-gray-300 p-2 rounded-lg max-w-[85%] border border-slate-200 dark:border-transparent">
              "hahaha vc não tem cara de quem sabe cozinhar nada além de miojo"
            </div>
            <div className="bg-gradient-to-r from-[#ff2a6d] to-[#ff5e62] text-white p-2 rounded-lg max-w-[88%] ml-auto font-medium shadow-sm">
              "Duvido sustentar isso depois de provar meu risoto sexta. Mas você leva o vinho."
            </div>
            <div className="bg-emerald-50 dark:bg-[#131624] text-emerald-700 dark:text-emerald-400 p-2 rounded-lg max-w-[85%] font-semibold border border-emerald-200 dark:border-transparent">
              "Fechado! Qual vinho vc prefere? Me passa seu Whats!"
            </div>
          </div>
        </div>
      </div>

      {/* 4 Quick Mobile Feature Pills */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onGoToApp('screenshot')}
          className="bg-white dark:bg-[#111320] border border-slate-200 dark:border-[#1f243b] active:border-[#ff2a6d] p-3.5 rounded-2xl text-left transition-all active:scale-95 shadow-sm"
        >
          <Camera className="w-5 h-5 text-[#ff2a6d] mb-1.5" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white">Print OCR</h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">Leitura de imagem e 3 respostas</p>
        </button>

        <button
          onClick={() => onGoToApp('pickup')}
          className="bg-white dark:bg-[#111320] border border-slate-200 dark:border-[#1f243b] active:border-amber-500 p-3.5 rounded-2xl text-left transition-all active:scale-95 shadow-sm"
        >
          <Flame className="w-5 h-5 text-amber-500 mb-1.5" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white">Cantadas</h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">6 tons: Pegador a Safado</p>
        </button>

        <button
          onClick={() => onGoToApp('manual')}
          className="bg-white dark:bg-[#111320] border border-slate-200 dark:border-[#1f243b] active:border-[#05d9e8] p-3.5 rounded-2xl text-left transition-all active:scale-95 shadow-sm"
        >
          <MessageSquare className="w-5 h-5 text-[#05d9e8] mb-1.5" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white">Chat Manual</h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">Cole trechos e destrave</p>
        </button>

        <button
          onClick={() => onGoToApp('bio')}
          className="bg-white dark:bg-[#111320] border border-slate-200 dark:border-[#1f243b] active:border-purple-500 p-3.5 rounded-2xl text-left transition-all active:scale-95 shadow-sm"
        >
          <Sparkles className="w-5 h-5 text-purple-500 mb-1.5" />
          <h2 className="text-xs font-black text-slate-900 dark:text-white">Bio AI</h2>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">+300% matches na bio</p>
        </button>
      </div>

      {/* Verified Mobile Testimonial Card */}
      <div className="bg-slate-50 dark:bg-[#0f111c] border border-slate-200 dark:border-[#1d2238] rounded-2xl p-4 text-xs shadow-sm">
        <div className="flex items-center gap-1 text-amber-500 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
          ))}
          <span className="text-[10px] text-slate-500 dark:text-gray-400 ml-1.5 font-medium">Lucas S., 26 anos • SP</span>
        </div>
        <p className="text-slate-700 dark:text-gray-300 italic text-[11px] leading-relaxed">
          "Eu sempre morria na terceira mensagem. Usei o modo Pegador do Lovix no Tinder e marquei um date no mesmo dia."
        </p>
      </div>
    </div>
  );
};
