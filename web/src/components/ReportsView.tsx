import {
  FileText,
  Download,
  FileDown,
  Layers,
  Database,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { QueryResponse, HistoryItem } from '../types';

interface ReportsViewProps {
  currentResponse: QueryResponse | null;
  history: HistoryItem[];
  onExportGeoJson: () => void;
  onExportReport: () => void;
}

export default function ReportsView({
  currentResponse,
  history,
  onExportGeoJson,
  onExportReport
}: ReportsViewProps) {
  const downloadCsvSummary = () => {
    if (history.length === 0) return;
    const header = ['Query ID', 'Question', 'Location', 'Index', 'Confidence (%)', 'Timestamp', 'Status'];
    const rows = history.map((item) => [
      item.id,
      `"${item.query.replace(/"/g, '""')}"`,
      `"${item.location}"`,
      item.index,
      item.confidencePct,
      item.timestamp,
      item.status
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satquery_audit_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Analytical Products, Audit Ledgers & Reports</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            Export deterministic satellite observation products in standard GIS and audit ledger formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Traceable Products
          </span>
        </div>
      </div>

      {/* Active Session Export Card */}
      <div className="p-5 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Current Active Query Analytical Artifacts
          </span>
          <span className="text-xs font-mono text-cyan-300">
            {currentResponse ? `Query ID: ${currentResponse.query_id}` : 'No Active Query Run'}
          </span>
        </div>

        {currentResponse ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#070b14] border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="text-slate-300 font-semibold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentResponse.evidence?.step_1?.resolved_name || 'Specified AOI'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed font-sans">
                {currentResponse.grounded_answer}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExportGeoJson}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-xs font-bold font-sans transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <FileDown className="w-4 h-4 text-cyan-400" />
                <span>Export GeoJSON Polygon</span>
              </button>

              <button
                onClick={onExportReport}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold font-sans transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <Download className="w-4 h-4" />
                <span>Download Full JSON Audit Report</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">
            Run an analysis from Mission Control to generate downloadable GeoJSON and JSON evidence artifacts.
          </p>
        )}
      </div>

      {/* Historical Audit Ledger Table */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Historical Observation Ledger
            </span>
            <p className="text-[11px] text-slate-400 pt-0.5 font-sans">
              Recorded queries with deterministic confidence and timestamp audit.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={downloadCsvSummary}
              className="px-3 py-1.5 bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs rounded-lg font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-sans">
            No historical reports recorded yet. Run satellite queries to populate the ledger.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 overflow-x-auto">
            {history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200">{item.query}</div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.timestamp.substring(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    {item.index}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {item.confidencePct}% Conf
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
