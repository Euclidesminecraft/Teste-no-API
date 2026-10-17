import React, { useState } from 'react';
import { Flame, Sparkles, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { copyToClipboardSafe } from '../utils/clipboard';

interface PickupLine {
  text: string;
  tone: string;
  context: string;
  whyItWorks: string;
}

interface PickupGeneratorTabProps {
  onConsumeCredit: () => boolean;
  dialect: 'PT-BR' | 'PT-PT';
  onSaveToHistory: (item: any) => void;
}

export const PickupGeneratorTab: React.FC<PickupGeneratorTabProps> = ({
  onConsumeCredit,
  dialect,
  onSaveToHistory,
}) => {
  const [tone, setTone] = useState('Pegador');
  const [context, setContext] = useState('Instagram Stories');
  const [partnerInterests, setPartnerInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<PickupLine[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const tones = ['Pegador', 'Flirty', 'Engraçado', 'Inteligente', 'Fofo', 'Safado'];
  const contexts = [
    'Instagram Stories',
    'Tinder Geral',
    'Academia / Fitness',
    'Praia / Verão',
    'Café / Livraria',
    'Pet / Cachorro',
    'Signos / Astrologia',
    'Viagens / Turismo',
  ];

  const handleGenerate = async () => {
    const canProceed = onConsumeCredit();
    if (!canProceed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          context,
          partnerInterests,
          dialect,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLines(data.lines || []);

      onSaveToHistory({
        type: 'pickup_line',
        title: `Cantadas (${tone} • ${context})`,
        preview: data.lines?.[0]?.text || 'Cantadas geradas',
        tone,
        goal: 'Abridor de Conversa',
        suggestions: (data.lines || []).map((l: any) => ({
          text: l.text,
          style: l.tone,
          reasoning: l.whyItWorks,
        })),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar cantadas.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await copyToClipboardSafe(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#0f111c] border border-slate-200 dark:border-[#1c2136] rounded-2xl p-4 shadow-md space-y-4 transition-colors">
        
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
            Modo 3 • Gerador de Cantadas
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Cantadas Magnéticas</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Abridores irresistíveis calibrados para o perfil dela e o contexto.
          </p>
        </div>

        {/* 6 Tones Horizontal Swipe */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1.5">
            1. Tom / Energia:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                  tone === t
                    ? 'bg-[#ff2a6d] text-white shadow-md shadow-[#ff2a6d]/30'
                    : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Context Horizontal Swipe */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1.5">
            2. Onde Você Vai Abordar?
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {contexts.map((c) => (
              <button
                key={c}
                onClick={() => setContext(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                  context === c
                    ? 'bg-[#05d9e8] text-black shadow-md shadow-[#05d9e8]/30'
                    : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Detail Input */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1">
            3. (Opcional) Detalhe da Foto ou Bio do Match:
          </label>
          <input
            type="text"
            value={partnerInterests}
            onChange={(e) => setPartnerInterests(e.target.value)}
            placeholder="Ex: Foto com prancha de surf, fone de ouvido, pet..."
            className="w-full bg-slate-50 dark:bg-[#131627] border border-slate-200 dark:border-[#212740] focus:border-[#ff2a6d] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#ff2a6d] via-[#ff5e62] to-[#ffd700] text-white font-black text-sm shadow-xl shadow-[#ff2a6d]/25 flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Criando Cantadas com Lovix...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Gerar 3 Cantadas ({tone})</span>
            </>
          )}
        </button>

      </div>

      {/* RESULTS DISPLAY */}
      {lines.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              3 Cantadas Geradas ({tone})
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-gray-400">Toque para copiar</span>
          </div>

          <div className="space-y-2.5">
            {lines.map((item, index) => {
              const isCopied = copiedIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#111322] border border-slate-200 dark:border-[#1f253d] active:border-amber-500/50 rounded-2xl p-4 shadow-sm dark:shadow-md space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      Cantada #{index + 1} • {item.tone}
                    </span>

                    <button
                      onClick={() => handleCopy(item.text, index)}
                      className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-slate-100 dark:bg-[#181d33] text-slate-800 dark:text-cyan-300 border border-slate-200 dark:border-[#272f4f]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                    "{item.text}"
                  </p>

                  <div className="text-[11px] text-slate-600 dark:text-gray-400 pt-1.5 border-t border-slate-100 dark:border-[#1a1e30]">
                    <strong className="text-[#0284c7] dark:text-[#05d9e8] font-bold">Por que funciona: </strong>
                    <span>{item.whyItWorks}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
