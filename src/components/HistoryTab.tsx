import React, { useState } from 'react';
import { History, Copy, Check, Star, Trash2, Camera, MessageSquare, Flame, Sparkles, Filter } from 'lucide-react';
import { copyToClipboardSafe } from '../utils/clipboard';

interface HistoryItem {
  id?: string;
  type: 'screenshot_reply' | 'manual_reply' | 'pickup_line' | 'bio_optimization';
  title: string;
  preview: string;
  tone: string;
  goal?: string;
  suggestions: { text: string; style: string; reasoning?: string }[];
  rizzometer?: any;
  timestamp: string;
  isFavorite?: boolean;
}

interface HistoryTabProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onToggleFavorite: (index: number) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  onClearHistory,
  onToggleFavorite,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return item.isFavorite;
    return item.type === filter;
  });

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboardSafe(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'screenshot_reply':
        return <Camera className="w-3.5 h-3.5 text-[#ff2a6d]" />;
      case 'manual_reply':
        return <MessageSquare className="w-3.5 h-3.5 text-[#05d9e8]" />;
      case 'pickup_line':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'bio_optimization':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <History className="w-3.5 h-3.5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#0f111c] border border-slate-200 dark:border-[#1c2136] rounded-2xl p-4 shadow-md space-y-3 transition-colors">
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0284c7] dark:text-[#05d9e8] block mb-0.5">
              Histórico Lovix
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Conversas Salvas</h2>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-red-500 dark:text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          )}
        </div>

        {/* Filter Pills Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap active:scale-95 ${
              filter === 'all'
                ? 'bg-[#ff2a6d] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
            }`}
          >
            Todos ({history.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 ${
              filter === 'favorites'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
            }`}
          >
            <Star className="w-3 h-3 fill-current" /> Favoritos
          </button>
          <button
            onClick={() => setFilter('screenshot_reply')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap active:scale-95 ${
              filter === 'screenshot_reply'
                ? 'bg-[#ff2a6d] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
            }`}
          >
            Prints
          </button>
          <button
            onClick={() => setFilter('pickup_line')}
            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap active:scale-95 ${
              filter === 'pickup_line'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'bg-slate-100 dark:bg-[#141728] text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-[#20253d]'
            }`}
          >
            Cantadas
          </button>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-[#20253d] rounded-2xl">
            <History className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-gray-300">Nenhum registro ainda</h3>
            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
              Gere respostas com prints ou cantadas para salvar aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#121524] border border-slate-200 dark:border-[#1f253d] rounded-2xl p-3.5 space-y-2 shadow-xs dark:shadow-md transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0e101c]">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <span className="text-[9px] text-slate-500 dark:text-gray-400">
                        {item.timestamp} • {item.tone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.rizzometer && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-[10px]">
                        {item.rizzometer.score}%
                      </span>
                    )}
                    <button
                      onClick={() => onToggleFavorite(index)}
                      className="p-1 text-slate-400 dark:text-gray-400 active:text-amber-500"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite ? 'fill-amber-400 text-amber-500 dark:text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-[#1a1e30]">
                  {item.suggestions.map((sugg, sIdx) => {
                    const uniqueKey = `${index}-${sIdx}`;
                    const isCopied = copiedKey === uniqueKey;
                    return (
                      <div
                        key={sIdx}
                        className="bg-slate-50 dark:bg-[#090b14] p-2.5 rounded-xl border border-slate-200 dark:border-[#181c2e] flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex-1 pr-1">
                          <span className="text-[9px] font-bold text-[#ff2a6d] uppercase block">
                            {sugg.style}
                          </span>
                          <p className="text-slate-800 dark:text-gray-200 font-medium text-[11px]">"{sugg.text}"</p>
                        </div>
                        <button
                          onClick={() => handleCopy(sugg.text, uniqueKey)}
                          className={`h-7 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-[#151829] text-slate-700 dark:text-gray-300'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
