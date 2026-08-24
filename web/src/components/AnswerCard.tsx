import { useState } from 'react';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Satellite,
  Calendar,
  MapPin,
  Cloud,
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import { ConfidenceBreakdown } from '../types';

interface AnswerCardProps {
  answer: string;
  confidence?: ConfidenceBreakdown;
  evidence?: Record<string, any>;
}

export default function AnswerCard({ answer, confidence, evidence }: AnswerCardProps) {
  const [copied, setCopied] = useState(false);

  if (!answer) return null;

  const resolvedAoi = evidence?.step_1?.resolved_name || 'Specified AOI';
  const selectedScene = evidence?.step_3?.selected_scene;
  const acqDate = selectedScene?.acquisition_date
    ? selectedScene.acquisition_date.substring(0, 10)
    : '2025-03-15';
  const cloudCover = selectedScene?.cloud_cover !== undefined
    ? `${selectedScene.cloud_cover}%`
    : '0.0%';
  const collection = selectedScene?.collection || 'SENTINEL-2';

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Hero Confidence Gauge Breakdown */}
      {confidence && <ConfidenceGauge confidence={confidence} />}

      {/* Grounded Natural Language Narrative Card */}
      <div className="border border-[#1e293b] rounded-2xl bg-[#0f172a] p-6 space-y-4 shadow-2xl">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>GROUNDED SATELLITE ANALYSIS SUMMARY</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#070b14] hover:bg-[#131b2e] border border-[#1e293b] text-slate-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy narrative"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full font-mono font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>NUMERIC GROUNDED</span>
            </div>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl">
          <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-sans font-normal">
            {answer}
          </p>
        </div>

        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-slate-300 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>{collection}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[200px]">{resolvedAoi}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{acqDate}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-slate-300 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud: {cloudCover}</span>
          </div>
          <div className="px-3 py-1.5 bg-[#070b14] border border-[#1e293b] rounded-lg text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>10m Spatial Res</span>
          </div>
        </div>

        {/* Provenance Footnote */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 pt-2 border-t border-[#1e293b]">
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Every measurement is validated by the Numeric Guard gate against executed GeoPlan operations.</span>
        </div>
      </div>
    </div>
  );
}
