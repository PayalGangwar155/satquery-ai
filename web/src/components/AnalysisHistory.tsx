import { useState } from 'react';
import {
  History,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { HistoryItem } from '../types';

interface AnalysisHistoryProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function AnalysisHistory({
  history,
  onSelectHistory,
  onClearHistory
}: AnalysisHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.index.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Analysis Query History</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans pt-0.5">
            Locally preserved analytical executions with grounded evidence.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter / Search bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by query, location, or index..."
            className="w-full bg-[#070b14] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      )}

      {/* History Items List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filteredHistory.length === 0 ? (
          <div className="p-12 border border-[#1e293b] rounded-xl bg-[#070b14]/50 text-center space-y-3 text-slate-500">
            <History className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-xs text-slate-300 font-sans">No analysis history recorded yet.</p>
            <p className="text-[11px] text-slate-500">
              Executed queries will automatically save here for one-click restoration.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isNDVI = item.index === 'NDVI';
            const isNDWI = item.index === 'NDWI';

            return (
              <div
                key={item.id}
                className="p-4 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/50 rounded-xl space-y-3 transition-colors shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-100 font-sans truncate">
                      "{item.query}"
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {item.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectHistory(item)}
                    className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      isNDVI
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                        : isNDWI
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/80'
                        : 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                    }`}>
                      {item.index}
                    </span>

                    <span className="flex items-center gap-1 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Confidence: <strong className="text-slate-200">{item.confidencePct}%</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
