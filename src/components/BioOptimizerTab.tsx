import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, AlertCircle, Camera, CheckCircle2 } from 'lucide-react';
import { copyToClipboardSafe } from '../utils/clipboard';

interface OptimizedBio {
  style: string;
  bio: string;
  hook: string;
}

interface BioOptimizerTabProps {
  onConsumeCredit: () => boolean;
  onSaveToHistory: (item: any) => void;
}

export const BioOptimizerTab: React.FC<BioOptimizerTabProps> = ({
  onConsumeCredit,
  onSaveToHistory,
}) => {
  const [appName, setAppName] = useState('Tinder');
  const [currentBio, setCurrentBio] = useState('');
  const [highlights, setHighlights] = useState('');
  const [vibe, setVibe] = useState('Equilibrado (Charme & Descontração)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [optimizedBios, setOptimizedBios] = useState<OptimizedBio[]>([]);
  const [photoTips, setPhotoTips] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const apps = ['Tinder', 'Bumble', 'Hinge', 'Insta Bio'];
  const vibes = [
    'Equilibrado',
    'Misterioso',
    'Engraçado',
    'Direto',
  ];

  const presets = [
    {
      label: 'Bio básica / clichê',
      bio: 'Gosto de sair com amigos, beber cerveja e Netflix. 1.83m. Se não curtir pagode nem me chama.',
      highlights: 'Gosto de cozinhar, corro aos domingos e toco violão.',
    },
    {
      label: 'Perfil sem bio / em branco',
      bio: 'Novo por aqui haha',
      highlights: 'Arquiteto, adoro restaurantes novos e sou pai de pet.',
    },
  ];

  const handleOptimize = async () => {
    const canProceed = onConsumeCredit();
    if (!canProceed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentBio,
          appName,
          vibe,
          highlights,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOptimizedBios(data.optimizedBios || []);
      setPhotoTips(data.photoTips || []);

      onSaveToHistory({
        type: 'bio_optimization',
        title: `Bio Otimizada para ${appName}`,
        preview: data.optimizedBios?.[0]?.bio || 'Bio otimizada',
        tone: vibe,
        goal: 'Multiplicar Matches',
        suggestions: (data.optimizedBios || []).map((b: any) => ({
          text: b.bio,
          style: b.style,
          reasoning: b.hook,
        })),
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao otimizar bio.');
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
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
            Feature Exclusiva Lovix
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Bio Optimizer 300%</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Transforme uma bio sem graça em um ímã de likes e matches.
          </p>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
            Exemplos Rápidos:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentBio(p.bio);
                  setHighlights(p.highlights);
                }}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141728] border border-slate-200 dark:border-[#212740] active:border-purple-500 text-slate-700 dark:text-gray-300 whitespace-nowrap active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* App selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1.5">
            Para Qual Aplicativo?
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {apps.map((a) => (
              <button
                key={a}
                onClick={() => setAppName(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all ${
                  appName === a
                    ? 'bg-[#ff2a6d] text-white shadow-md shadow-[#ff2a6d]/30'
                    : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1">
              Bio Atual:
            </label>
            <textarea
              rows={2}
              value={currentBio}
              onChange={(e) => setCurrentBio(e.target.value)}
              placeholder="Cole sua bio atual aqui..."
              className="w-full bg-slate-50 dark:bg-[#131627] border border-slate-200 dark:border-[#212740] focus:border-purple-500 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1">
              Profissão, Hobbies ou Curiosidades:
            </label>
            <input
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Ex: Engenheiro, café especial, pagode, corrida..."
              className="w-full bg-slate-50 dark:bg-[#131627] border border-slate-200 dark:border-[#212740] focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Vibe Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 block mb-1.5">
            Estilo de Bio:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {vibes.map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all active:scale-95 ${
                  vibe === v
                    ? 'bg-purple-600 dark:bg-purple-500/25 border-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-[#141728] border-slate-200 dark:border-[#20253d] text-slate-600 dark:text-gray-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-purple-500 via-[#ff2a6d] to-[#05d9e8] text-white font-black text-sm shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Otimizando Perfil no Lovix...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Otimizar Bio com IA (1 Crédito)</span>
            </>
          )}
        </button>

      </div>

      {/* RESULTS DISPLAY */}
      {optimizedBios.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                3 Bios Otimizadas para {appName}
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-gray-400">Toque para copiar</span>
            </div>

            <div className="space-y-2.5">
              {optimizedBios.map((item, index) => {
                const isCopied = copiedIndex === index;
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#111322] border border-slate-200 dark:border-[#1f253d] active:border-purple-500/50 rounded-2xl p-4 shadow-sm dark:shadow-md space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        {item.style}
                      </span>

                      <button
                        onClick={() => handleCopy(item.bio, index)}
                        className={`h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-100 dark:bg-[#181d33] text-slate-800 dark:text-purple-200 border border-slate-200 dark:border-[#272f4f]'
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

                    <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-[#090b14] p-3 rounded-xl border border-slate-100 dark:border-[#1a1e30]">
                      {item.bio}
                    </p>

                    <div className="text-[11px] text-slate-600 dark:text-gray-400">
                      <strong className="text-[#0284c7] dark:text-[#05d9e8] font-bold">Por que funciona: </strong>
                      <span>{item.hook}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo Tips Mobile Card */}
          {photoTips.length > 0 && (
            <div className="bg-white dark:bg-[#111322] border border-slate-200 dark:border-[#1f253d] rounded-2xl p-4 space-y-2 shadow-sm dark:shadow-md transition-colors">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-[#00f5a0]" />
                Regras de Ouro para Suas Fotos:
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-gray-300">
                {photoTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
