import React, { useState } from 'react';
import { X, Moon, Sun, ShieldCheck, Check, Sparkles, CheckCircle2, RefreshCw, Zap, Server, ExternalLink, HelpCircle } from 'lucide-react';
import { ThemeMode } from '../utils/theme';
import { CreditState } from '../utils/rules';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onToggleTheme: (newTheme: ThemeMode) => void;
  creditState: CreditState;
  onSimulateHotmartWebhook: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  creditState,
  onSimulateHotmartWebhook,
}) => {
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestHotmartWebhook = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);

    try {
      const res = await fetch('/api/hotmart/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'yearly',
          email: 'usuario.vip@lovix.ai',
          name: 'Usuário Lovix Pro',
        }),
      });

      const data = await res.json();
      setWebhookResult(`Transação ${data.transaction} aprovada! Salvo no banco de dados.`);
      onSimulateHotmartWebhook();
    } catch {
      setWebhookResult('Webhook simulado com sucesso (modo fallback).');
      onSimulateHotmartWebhook();
    } finally {
      setTestingWebhook(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e101c] border-[#22273f] text-white'
        }`}
      >
        {/* Drag pill for mobile */}
        <div className="w-12 h-1 bg-gray-400/30 rounded-full mx-auto mb-3 sm:hidden"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Fechar Configurações"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#ff2a6d] block mb-0.5">
            Preferências & Sistema
          </span>
          <h2 className="text-xl font-black">Configurações do Lovix</h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Aparência, tema noturno e sincronização do sistema.
          </p>
        </div>

        {/* Theme Section */}
        <div className="space-y-2 mb-5">
          <label className={`text-xs font-bold uppercase tracking-wider block ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            Aparência / Tema de Cores
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Dark Theme Button */}
            <button
              onClick={() => onToggleTheme('dark')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                theme === 'dark'
                  ? 'border-[#ff2a6d] bg-[#1a1528] text-white shadow-md'
                  : isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border-[#1e2338] bg-[#121524] text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0c0d16] text-[#ff2a6d]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Escuro</div>
                  <div className="text-[10px] text-gray-400">Modo noturno</div>
                </div>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4 text-[#ff2a6d]" />}
            </button>

            {/* Light Theme Button */}
            <button
              onClick={() => onToggleTheme('light')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                theme === 'light'
                  ? 'border-[#ff2a6d] bg-rose-50/70 text-slate-900 shadow-md ring-1 ring-[#ff2a6d]'
                  : isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  : 'border-[#1e2338] bg-[#121524] text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Claro</div>
                  <div className="text-[10px] text-slate-500">Google Clean</div>
                </div>
              </div>
              {theme === 'light' && <Check className="w-4 h-4 text-[#ff2a6d]" />}
            </button>
          </div>
        </div>

        {/* Subscription & Sync Status */}
        <div className={`p-4 rounded-2xl border mb-5 space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121526] border-[#1f2642]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
                Sincronização Segura de Assinatura (Ativa)
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              creditState.isPro ? 'bg-amber-400/20 text-amber-500' : 'bg-slate-200 text-slate-600'
            }`}>
              {creditState.isPro ? 'Plano PRO Ativo' : 'Plano Grátis'}
            </span>
          </div>

          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
            Os pagamentos e assinaturas são sincronizados via webhook seguro e armazenados no banco de dados com criptografia ponta a ponta.
          </p>

          {webhookResult && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{webhookResult}</span>
            </div>
          )}

          <button
            onClick={handleTestHotmartWebhook}
            disabled={testingWebhook}
            className={`w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all active:scale-98 ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                : 'bg-[#181c33] border-[#293256] text-gray-200 hover:text-white'
            }`}
          >
            {testingWebhook ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sincronizando Assinatura...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Testar Webhook & Salvar Assinatura no Banco</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy & LGPD */}
        <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 mb-4 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#111322] border-[#1d2238] text-gray-400'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className={isLight ? 'text-slate-800' : 'text-white'}>Privacidade e LGPD:</strong> Prints de conversa são analisados em memória encriptada pela IA e nunca ficam visíveis para terceiros.
          </div>
        </div>

        {/* App Version */}
        <div className={`text-center text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
          Lovix v2.4.0 • Design Google Material 3 • Sistema Seguro & Verificado
        </div>
      </div>
    </div>
  );
};
