import React, { useState } from 'react';
import { MessageSquare, Sparkles, Copy, Check, Flame, RefreshCw, AlertCircle } from 'lucide-react';
import { RizzometerCard, RizzometerData } from './RizzometerCard';
import { copyToClipboardSafe } from '../utils/clipboard';

interface ReplySuggestion {
  text: string;
  style: string;
  reasoning: string;
}

interface ManualReplyTabProps {
  onConsumeCredit: () => boolean;
  dialect: 'PT-BR' | 'PT-PT';
  onSaveToHistory: (item: any) => void;
}

export const ManualReplyTab: React.FC<ManualReplyTabProps> = ({
  onConsumeCredit,
  dialect,
  onSaveToHistory,
}) => {
  const [conversationText, setConversationText] = useState('');
  const [partnerBio, setPartnerBio] = useState('');
  const [tone, setTone] = useState('Pegador');
  const [goal, setGoal] = useState('Flertar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rizzometer, setRizzometer] = useState<RizzometerData | null>(null);
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const tones = ['Pegador', 'Flirty', 'Engraçado', 'Inteligente', 'Fofo', 'Safado'];
  const goals = [
    'Flertar',
    'Marcar Encontro',
    'Ser Engraçado',
    'Continuar Papo',
    'Quebrar Gelo',
    'Pedir Desculpa',
    'Resposta Formal',
  ];

  const presets = [
    {
      label: 'Ela: "O que vc faz da vida?"',
      text: 'Match: E aí, o que você faz da vida de bom? Trabalha com o quê?',
    },
    {
      label: 'Ela: "Fala isso pra todas"',
      text: 'Match: Hahaha aposto que você tem essa mesma lábia com todas aqui.',
    },
    {
      label: 'Papo esfriando no "Tudo bem"',
      text: 'Você: Oi, tudo bem?\nMatch: Oi, tudo bem e vc?\nVocê: Tudo certo tb',
    },
  ];

  const handleGenerate = async () => {
    if (!conversationText.trim()) {
      setError('Cole a última mensagem ou trecho da conversa.');
      return;
    }

    const canProceed = onConsumeCredit();
    if (!canProceed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationText,
          partnerBio,
          goal,
          tone,
          dialect,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setRizzometer(data.rizzometer || {
        score: 72,
        level: 'alta',
        status: 'Interesse Neutro a Alto',
        signals: ['Abertura para resposta'],
        tactic: 'Provoque curiosidade com tom confiante.'
      });
      setSuggestions(data.suggestions || []);

      onSaveToHistory({
        type: 'manual_reply',
        title: `Papo: "${conversationText.substring(0, 24)}..."`,
        preview: conversationText,
        tone,
        goal,
        suggestions: data.suggestions || [],
        rizzometer: data.rizzometer,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar respostas.');
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
          <span className="text-[10px] font-black uppercase tracking-wider text-[#05d9e8] block mb-1">
            Modo 2 • Entrada Manual
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Cole o Papo do App</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Cole a última mensagem e receba 3 respostas afiadas do Lovix.
          </p>
        </div>

        {/* Quick Presets Carousel */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
            Exemplos Rápidos (Toque para colar):
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => setConversationText(p.text)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#141728] border border-slate-200 dark:border-[#212740] active:border-[#ff2a6d] text-slate-700 dark:text-gray-300 whitespace-nowrap active:scale-95 transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 block mb-1">
              Última Mensagem ou Conversa:
            </label>
            <textarea
              rows={3}
              value={conversationText}
              onChange={(e) => setConversationText(e.target.value)}
              placeholder='Ex: Ela: "hahaha que audácia! O que vc vai fazer no fim de semana?"'
              className="w-full bg-slate-50 dark:bg-[#131627] border border-slate-200 dark:border-[#212740] focus:border-[#ff2a6d] rounded-xl p-3 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 block mb-1">
              (Opcional) Bio do Match ou Interesses:
            </label>
            <input
              type="text"
              value={partnerBio}
              onChange={(e) => setPartnerBio(e.target.value)}
              placeholder="Ex: Ama café, praia, vinhos e tem um golden..."
              className="w-full bg-slate-50 dark:bg-[#131627] border border-slate-200 dark:border-[#212740] focus:border-[#05d9e8] rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 block mb-1.5">
            Tom Desejado:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
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

        {/* Goal Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 block mb-1.5">
            Objetivo:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
                  goal === g
                    ? 'bg-[#05d9e8] text-black shadow-md shadow-[#05d9e8]/30'
                    : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#ff2a6d] via-[#ff5e62] to-[#05d9e8] text-white font-black text-sm shadow-xl shadow-[#ff2a6d]/25 flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Gerando com Lovix...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Gerar 3 Respostas com IA (1 Crédito)</span>
            </>
          )}
        </button>

      </div>

      {/* RESULTS DISPLAY */}
      {suggestions.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {rizzometer && <RizzometerCard data={rizzometer} />}

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff2a6d]" />
                3 Respostas Geradas
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-gray-400">Toque para copiar</span>
            </div>

            <div className="space-y-2.5">
              {suggestions.map((item, index) => {
                const isCopied = copiedIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#111322] border border-slate-200 dark:border-[#1f253d] active:border-[#ff2a6d] rounded-2xl p-4 shadow-sm space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#ff2a6d]/15 text-[#ff2a6d] border border-[#ff2a6d]/30">
                        {item.style}
                      </span>

                      <button
                        onClick={() => handleCopy(item.text, index)}
                        className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-100 dark:bg-[#181d33] text-sky-600 dark:text-cyan-300 border border-slate-200 dark:border-[#272f4f]'
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

                    <div className="text-[11px] text-slate-500 dark:text-gray-400 pt-1.5 border-t border-slate-100 dark:border-[#1a1e30]">
                      <strong className="text-sky-600 dark:text-[#05d9e8] font-bold">Gatilho: </strong>
                      <span>{item.reasoning}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
