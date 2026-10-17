import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Flame, Crown } from 'lucide-react';
import { calculateRizzScore, QuizAnswers, RizzScoreResult } from '../utils/rules';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteToPaywall: (answers: QuizAnswers, result: RizzScoreResult) => void;
  onCompleteToApp: (answers: QuizAnswers, result: RizzScoreResult) => void;
  theme?: 'dark' | 'light';
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onCompleteToPaywall,
  onCompleteToApp,
  theme = 'dark',
}) => {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    goal: 'Marcar encontros rápidos',
    gender: 'Homem buscando mulher',
    age: '22-25',
    struggle: 'Manter a conversa interessante sem esfriar',
    app: 'Tinder',
    confidence: 6,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisPhase, setAnalysisPhase] = useState('Analisando perfil comportamental...');
  const [result, setResult] = useState<RizzScoreResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const questions = [
    {
      id: 1,
      title: 'Qual é o seu principal objetivo agora?',
      subtitle: 'Isso calibra o estilo das respostas.',
      options: [
        { label: 'Marcar encontros rápidos para o fim de semana', icon: '⚡' },
        { label: 'Encontrar um namoro sério e de qualidade', icon: '💍' },
        { label: 'Melhorar minha lábia e nunca ficar sem assunto', icon: '🎯' },
        { label: 'Parar de tomar vácuo e ser ignorado', icon: '🚫' },
        { label: 'Ter confiança para abordar no Insta ou Whats', icon: '📱' },
      ],
      field: 'goal' as keyof QuizAnswers,
    },
    {
      id: 2,
      title: 'Qual é o seu gênero e interesse?',
      subtitle: 'Para adaptar o tom e os gatilhos culturais.',
      options: [
        { label: 'Homem buscando mulher', icon: '👨👩' },
        { label: 'Mulher buscando homem', icon: '👩👨' },
        { label: 'Homem buscando homem', icon: '👨👨' },
        { label: 'Mulher buscando mulher', icon: '👩👩' },
        { label: 'Outro / Sem preferência restrita', icon: '✨' },
      ],
      field: 'gender' as keyof QuizAnswers,
    },
    {
      id: 3,
      title: 'Qual é a sua faixa etária?',
      subtitle: 'O vocabulário muda com a idade.',
      options: [
        { label: '18 - 21 anos (Geração Z / Universitário)', icon: '🎓' },
        { label: '22 - 25 anos (Vida profissional começando)', icon: '🚀' },
        { label: '26 - 30 anos (Independência & Carreira)', icon: '💼' },
        { label: '31 - 40 anos (Maturidade & Objetividade)', icon: '🍸' },
        { label: '40+ anos (Experiência & Elegância)', icon: '🌟' },
      ],
      field: 'age' as keyof QuizAnswers,
    },
    {
      id: 4,
      title: 'Qual a sua MAIOR dificuldade ao conversar?',
      subtitle: 'O Lovix vai atuar exatamente no seu gargalo.',
      options: [
        { label: 'Manter a conversa interessante sem esfriar', icon: '❄️' },
        { label: 'Não saber o que falar na PRIMEIRA mensagem', icon: '😶' },
        { label: 'Saber se ela/ele está realmente afim de mim', icon: '🔍' },
        { label: 'Levar do app para o Whats ou marcar o date', icon: '📅' },
        { label: 'Tomar vácuo no meio de um papo bom', icon: '👻' },
      ],
      field: 'struggle' as keyof QuizAnswers,
    },
    {
      id: 5,
      title: 'Qual app você mais usa no momento?',
      subtitle: 'Adaptamos para a dinâmica de cada rede.',
      options: [
        { label: 'Tinder', icon: '🔥' },
        { label: 'Instagram Direct', icon: '📸' },
        { label: 'WhatsApp', icon: '💬' },
        { label: 'Bumble', icon: '🐝' },
        { label: 'Hinge / Inner Circle', icon: '💜' },
      ],
      field: 'app' as keyof QuizAnswers,
    },
  ];

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      setAnalysisProgress(20);
      setAnalysisPhase('Mapeando padrões comportamentais...');

      setTimeout(() => {
        setAnalysisProgress(55);
        setAnalysisPhase('Cruzando com o banco de dados do Lovix...');
      }, 700);

      setTimeout(() => {
        setAnalysisProgress(85);
        setAnalysisPhase('Calculando seu Score de Carisma final...');
      }, 1400);

      setTimeout(() => {
        const computed = calculateRizzScore(answers);
        setResult(computed);
        setIsAnalyzing(false);
        setStep(7);
      }, 2100);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        className={`relative w-full max-w-md border-t sm:border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0e101c] border-[#232942] text-white'
        }`}
      >
        {/* Mobile Drag Pill / Top handle */}
        <div className="w-12 h-1 bg-gray-400/40 rounded-full mx-auto mb-3 sm:hidden"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors active:scale-95 ${
            isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Fechar Quiz"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar (during questions) */}
        {step <= 6 && (
          <div className="mb-5 pr-8">
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-bold">
              <span className="text-[#ff2a6d]">Pergunta {step} de 6</span>
              <span>{Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#1b1f33] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Analyzing Spinner Screen */}
        {isAnalyzing && (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="relative w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#1b1f33]"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#ff2a6d] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-8 h-8 text-[#ff2a6d] animate-pulse" />
              </div>
            </div>

            <h3 className="text-lg font-black mb-1.5 text-white">Analisando Perfil no Lovix...</h3>
            <p className="text-xs text-gray-400 mb-5">{analysisPhase}</p>

            <div className="w-full max-w-xs h-2 bg-[#1b1f33] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff2a6d] via-[#05d9e8] to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-gray-500 mt-2">{analysisProgress}%</span>
          </div>
        )}

        {/* Step 1 to 5: Touch-friendly Multiple Choice */}
        {!isAnalyzing && step <= 5 && (
          <div>
            {(() => {
              const currentQ = questions[step - 1];
              return (
                <div>
                  <h2 className="text-lg font-black mb-1 text-white pr-6">{currentQ.title}</h2>
                  <p className="text-xs text-gray-400 mb-4">{currentQ.subtitle}</p>

                  <div className="space-y-2 mb-6">
                    {currentQ.options.map((opt, idx) => {
                      const isSelected = answers[currentQ.field] === opt.label;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setAnswers({ ...answers, [currentQ.field]: opt.label });
                          }}
                          className={`w-full min-h-[50px] p-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between border transition-all active:scale-98 cursor-pointer ${
                            isSelected
                              ? 'bg-[#ff2a6d]/15 border-[#ff2a6d] text-white shadow-md shadow-[#ff2a6d]/20'
                              : 'bg-[#131627] border-[#1e2338] text-gray-300 active:bg-[#181c2e]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base flex-shrink-0">{opt.icon}</span>
                            <span className="leading-tight">{opt.label}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#ff2a6d] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Mobile Nav buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1b1f33]">
              <button
                onClick={handlePrev}
                disabled={step === 1}
                className={`text-xs font-bold text-gray-400 hover:text-white px-3 py-2 flex items-center gap-1 ${
                  step === 1 ? 'opacity-0 pointer-events-none' : ''
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                onClick={handleNext}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#ff2a6d] to-[#ff5e62] text-white font-black text-xs shadow-lg shadow-[#ff2a6d]/30 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Confidence Slider */}
        {!isAnalyzing && step === 6 && (
          <div>
            <h2 className="text-lg font-black mb-1 text-white">
              De 1 a 10, qual sua confiança no flerte?
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              1 = Trava totalmente | 10 = Domínio absoluto
            </p>

            <div className="bg-[#131627] border border-[#21273f] rounded-2xl p-5 mb-6 text-center">
              <div className="text-4xl font-black text-[#ff2a6d] mb-1">
                {answers.confidence}
                <span className="text-xl text-gray-500 font-semibold">/10</span>
              </div>
              <p className="text-xs text-gray-300 font-medium mb-5">
                {answers.confidence <= 4
                  ? '⚠️ Hesitação frequente e medo de incomodar'
                  : answers.confidence <= 7
                  ? '⚡ Consegue conversar, mas falta o gancho para o date'
                  : '🔥 Alta confiança, pronto para refinar as melhores chances'}
              </p>

              <input
                type="range"
                min="1"
                max="10"
                value={answers.confidence}
                onChange={(e) => setAnswers({ ...answers, confidence: parseInt(e.target.value) })}
                className="w-full accent-[#ff2a6d] h-3 bg-[#1e2338] rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2">
                <span>1 (Tímido)</span>
                <span>5 (Médio)</span>
                <span>10 (Mestre)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1b1f33]">
              <button
                onClick={handlePrev}
                className="text-xs font-bold text-gray-400 hover:text-white px-3 py-2 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                onClick={handleNext}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#ff2a6d] to-[#05d9e8] text-white font-black text-xs shadow-lg shadow-[#ff2a6d]/30 flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Ver Meu Score</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 7: Diagnostic Results Mobile View */}
        {!isAnalyzing && step === 7 && result && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ff2a6d]/15 text-[#ff2a6d] border border-[#ff2a6d]/30">
                Diagnóstico Lovix
              </span>
              <h2 className="text-xl font-black text-white mt-1.5">Score de Carisma: {result.score}/100</h2>
              <p className="text-xs text-gray-400">Arquétipo: <strong className="text-[#05d9e8]">{result.archetype}</strong></p>
            </div>

            {/* Score Visual */}
            <div className="grid grid-cols-2 gap-2 bg-[#121524] p-3 rounded-2xl border border-[#20253d]">
              <div className="text-center border-r border-[#1e2338] pr-1">
                <span className="text-[10px] text-gray-400 font-medium">Nível Atual</span>
                <div className="text-2xl font-black text-amber-400">{result.score}%</div>
              </div>
              <div className="text-center pl-1">
                <span className="text-[10px] text-[#00f5a0] font-semibold flex items-center justify-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Potencial
                </span>
                <div className="text-2xl font-black text-[#00f5a0]">{result.potential}%</div>
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-[#121524] border border-red-500/20 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-red-400 flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3 h-3" />
                Onde você trava no flerte:
              </div>
              <ul className="space-y-1 text-gray-300 list-disc list-inside text-[11px]">
                {result.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onCompleteToPaywall(answers, result)}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-[#ff2a6d] via-[#ff5e62] to-[#ffd700] text-white font-black text-xs shadow-lg shadow-[#ff2a6d]/30 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>Desbloquear Potencial de {result.potential}%</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onCompleteToApp(answers, result)}
                className="w-full h-11 rounded-xl bg-transparent text-gray-400 font-bold text-xs border border-[#21273f] active:bg-white/5"
              >
                Começar no Modo Grátis (10 créditos/h)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
