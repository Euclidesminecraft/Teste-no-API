import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Compass } from 'lucide-react';

export interface RizzometerData {
  score: number;
  level: 'alta' | 'media' | 'baixa';
  status: string;
  signals?: string[];
  tactic?: string;
}

interface RizzometerCardProps {
  data: RizzometerData;
}

export const RizzometerCard: React.FC<RizzometerCardProps> = ({ data }) => {
  const isGreen = data.level === 'alta' || data.score >= 70;
  const isYellow = (data.level === 'media' || (data.score >= 45 && data.score < 70)) && !isGreen;

  const colorConfig = isGreen
    ? {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20',
        barColor: 'from-emerald-400 to-teal-300',
        icon: CheckCircle,
      }
    : isYellow
    ? {
        border: 'border-amber-500/40',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/20',
        barColor: 'from-amber-400 to-orange-400',
        icon: AlertTriangle,
      }
    : {
        border: 'border-rose-500/40',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        badgeBg: 'bg-rose-500/20',
        barColor: 'from-rose-500 to-red-600',
        icon: ShieldAlert,
      };

  const Icon = colorConfig.icon;

  return (
    <div className={`p-3.5 rounded-2xl border ${colorConfig.border} ${colorConfig.bg} shadow-md space-y-2.5 transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorConfig.badgeBg} ${colorConfig.text}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-300">
              Termômetro de Interesse
            </h4>
            <span className={`text-xs font-black ${colorConfig.text} block leading-tight`}>
              {data.status}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-black ${colorConfig.text}`}>
            {data.score}%
          </div>
          <span className="text-[9px] text-slate-500 dark:text-gray-400 font-medium">Interesse</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-[#0a0c14] rounded-full overflow-hidden border border-slate-300 dark:border-[#1e2338]">
        <div
          className={`h-full bg-gradient-to-r ${colorConfig.barColor} rounded-full transition-all duration-700`}
          style={{ width: `${Math.min(100, Math.max(5, data.score))}%` }}
        ></div>
      </div>

      {/* Sinais */}
      {data.signals && data.signals.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.signals.map((sig, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#0a0b12] border border-slate-200 dark:border-[#20253d] text-slate-700 dark:text-gray-300 shadow-xs"
            >
              {sig}
            </span>
          ))}
        </div>
      )}

      {/* Tactic */}
      {data.tactic && (
        <div className="text-[11px] bg-white/90 dark:bg-[#090b14]/80 p-2.5 rounded-xl border border-slate-200 dark:border-[#1c2136] flex items-start gap-1.5 shadow-xs">
          <Compass className="w-3.5 h-3.5 text-[#05d9e8] flex-shrink-0 mt-0.5" />
          <div className="leading-tight">
            <strong className="text-sky-600 dark:text-[#05d9e8] font-bold">Dica Tática: </strong>
            <span className="text-slate-700 dark:text-gray-300">{data.tactic}</span>
          </div>
        </div>
      )}
    </div>
  );
};
