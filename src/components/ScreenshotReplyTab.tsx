import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Copy, Check, ShieldCheck, Flame, RefreshCw, AlertCircle } from 'lucide-react';
import { RizzometerCard, RizzometerData } from './RizzometerCard';
import { copyToClipboardSafe } from '../utils/clipboard';

interface ReplySuggestion {
  text: string;
  style: string;
  reasoning: string;
}

interface ScreenshotReplyTabProps {
  onConsumeCredit: () => boolean;
  dialect: 'PT-BR' | 'PT-PT';
  onSaveToHistory: (item: any) => void;
}

export const ScreenshotReplyTab: React.FC<ScreenshotReplyTabProps> = ({
  onConsumeCredit,
  dialect,
  onSaveToHistory,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chips
  const [tone, setTone] = useState('Flirty');
  const [goal, setGoal] = useState('Marcar Encontro');

  // Results
  const [transcript, setTranscript] = useState<string | null>(null);
  const [rizzometer, setRizzometer] = useState<RizzometerData | null>(null);
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tones = ['Pegador', 'Flirty', 'Engraçado', 'Inteligente', 'Fofo', 'Safado'];
  const goals = [
    'Marcar Encontro',
    'Flertar',
    'Ser Engraçado',
    'Continuar Papo',
    'Quebrar Gelo',
    'Pedir Desculpa',
    'Resposta Formal',
  ];

  const sampleScreenshots = [
    {
      id: 'tinder-vacuo',
      title: 'Tinder',
      subtitle: 'Resposta curta ("Hahaha sim")',
      createDataUri: () => createSampleChatDataUri(
        'Tinder: Larissa, 24',
        'Você: Vi que você curte vinhos e praia. Qual o melhor pico do litoral norte?',
        'Larissa: Hahaha sim, amo Ilhabela!'
      )
    },
    {
      id: 'insta-stories',
      title: 'Instagram',
      subtitle: 'Foto no restaurante',
      createDataUri: () => createSampleChatDataUri(
        'Instagram Direct: @beatriz.m',
        'Beatriz: Não aguentei e pedi a sobremesa inteira de novo 🙈',
        'Você: (Aguardando resposta com gancho)'
      )
    },
    {
      id: 'whatsapp-date',
      title: 'WhatsApp',
      subtitle: 'Papo esfriando',
      createDataUri: () => createSampleChatDataUri(
        'WhatsApp: Juliana',
        'Juliana: Nossa, essa semana foi muito corrida no trabalho...',
        'Você: (Hora de sugerir um drink)'
      )
    }
  ];

  function createSampleChatDataUri(header: string, msg1: string, msg2: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#0e101a';
    ctx.fillRect(0, 0, 600, 700);

    ctx.fillStyle = '#171a29';
    ctx.fillRect(0, 0, 600, 75);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(header, 30, 46);

    ctx.fillStyle = '#1e243b';
    roundRect(ctx, 40, 120, 520, 90, 16);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px system-ui, sans-serif';
    wrapText(ctx, msg1, 60, 155, 480, 24);

    ctx.fillStyle = '#ff2a6d';
    roundRect(ctx, 40, 240, 520, 90, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, sans-serif';
    wrapText(ctx, msg2, 60, 275, 480, 24);

    ctx.fillStyle = '#718096';
    ctx.font = 'italic 14px system-ui, sans-serif';
    ctx.fillText('Captura de conversa para análise do Lovix', 140, 640);

    return canvas.toDataURL('image/jpeg');
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof sampleScreenshots[0]) => {
    const uri = sample.createDataUri();
    setImagePreview(uri);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Carregue um print ou selecione um exemplo acima.');
      return;
    }

    const canProceed = onConsumeCredit();
    if (!canProceed) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          goal,
          tone,
          dialect,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTranscript(data.ocrTranscript || 'Conversa identificada');
      setRizzometer(data.rizzometer || {
        score: 75,
        level: 'alta',
        status: 'Luz Verde! Resposta receptiva',
        signals: ['Interação aberta'],
        tactic: 'Proponha um date presencial.'
      });
      setSuggestions(data.suggestions || []);

      onSaveToHistory({
        type: 'screenshot_reply',
        title: `Print: ${data.matchName || 'Match'}`,
        preview: data.lastMessage || 'Conversa analisada',
        tone,
        goal,
        suggestions: data.suggestions || [],
        rizzometer: data.rizzometer,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar imagem.');
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
      
      {/* Privacy guarantee bar */}
      <div className="bg-slate-50 dark:bg-[#101322] border border-slate-200 dark:border-[#1e2338] px-3 py-2 rounded-xl flex items-center gap-2 text-[11px] text-slate-700 dark:text-gray-300 shadow-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span className="leading-tight">
          <strong className="text-slate-900 dark:text-white">100% Privado (LGPD):</strong> Seus prints são processados em memória encriptada e nunca salvos.
        </span>
      </div>

      {/* Main Analysis Card */}
      <div className="bg-white dark:bg-[#0f111c] border border-slate-200 dark:border-[#1c2136] rounded-2xl p-4 shadow-md space-y-4 transition-colors">
        
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#ff2a6d] block mb-1">
            Modo 1 • Resposta por Print OCR
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Carregue o Print da Conversa</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Tire um print no Tinder, Bumble ou Whats e o Lovix gera 3 respostas perfeitas.
          </p>
        </div>

        {/* Upload Dropzone */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] active:scale-98 ${
            imagePreview
              ? 'border-[#00f5a0] bg-[#00f5a0]/5'
              : 'border-[#ff2a6d]/50 active:border-[#ff2a6d] bg-[#ff2a6d]/5'
          }`}
        >
          {imagePreview ? (
            <div className="space-y-2">
              <img
                src={imagePreview}
                alt="Print Selecionado"
                className="max-h-36 rounded-lg mx-auto shadow-md object-contain border border-[#232945]"
              />
              <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> Print pronto! Toque para trocar
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#ff2a6d]/15 text-[#ff2a6d] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xs text-slate-800 dark:text-white block">
                Toque para Selecionar Print da Galeria
              </span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 block">
                Tinder, Bumble, Insta Stories ou WhatsApp
              </span>
            </div>
          )}
        </div>

        {/* Quick Sample Selector - Horizontal Swipeable Pills */}
        <div>
          <span className="text-[10px] font-black uppercase text-amber-500 dark:text-amber-400 tracking-wider block mb-1.5">
            💡 Ou Teste com Exemplos Rápidos:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {sampleScreenshots.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className="p-2 px-3 rounded-xl bg-slate-50 dark:bg-[#141728] border border-slate-200 dark:border-[#212740] active:border-[#ff2a6d] text-left flex-shrink-0 active:scale-95 transition-all text-xs"
              >
                <div className="font-bold text-slate-800 dark:text-white text-[11px]">{sample.title}</div>
                <div className="text-[9px] text-slate-500 dark:text-gray-400">{sample.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* TONE SELECTION CHIPS (Horizontal Swipeable) */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 block mb-1.5">
            1. Tom Desejado:
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

        {/* GOAL SELECTION CHIPS (Horizontal Swipeable) */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300 block mb-1.5">
            2. Objetivo da Resposta:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {goals.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
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

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main CTA */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#ff2a6d] via-[#ff5e62] to-[#05d9e8] text-white font-black text-sm shadow-xl shadow-[#ff2a6d]/25 flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Lendo Print com IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Gerar 3 Respostas com Lovix (1 Crédito)</span>
            </>
          )}
        </button>

      </div>

      {/* RESULTS DISPLAY */}
      {suggestions.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Rizzometer Card */}
          {rizzometer && <RizzometerCard data={rizzometer} />}

          {/* OCR Transcript */}
          {transcript && (
            <div className="bg-slate-50 dark:bg-[#111322] border border-slate-200 dark:border-[#1e2338] rounded-2xl p-3.5 text-xs text-slate-700 dark:text-gray-300 shadow-xs">
              <span className="font-bold text-slate-500 dark:text-gray-400 uppercase text-[9px] tracking-wider block mb-1">
                💬 Conversa Lida pelo OCR:
              </span>
              <p className="italic text-slate-800 dark:text-gray-200 font-mono whitespace-pre-line bg-white dark:bg-[#090b14] p-2.5 rounded-lg border border-slate-200 dark:border-[#1a1e30] text-[11px]">
                {transcript}
              </p>
            </div>
          )}

          {/* 3 Suggestions */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#ff2a6d]" />
                3 Respostas ({tone} • {goal})
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
                      <strong className="text-sky-600 dark:text-[#05d9e8] font-bold">Por que funciona: </strong>
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
