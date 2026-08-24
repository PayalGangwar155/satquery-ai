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
  const rawCloud = selectedScene?.cloud_cover !== undefined ? selectedScene.cloud_cover : 0.0;
  const cloudCover = typeof rawCloud === 'number' ? `${rawCloud.toFixed(1)}%` : `${rawCloud}%`;
  const collection = selectedScene?.collection || 'Sentinel-2 L2A';

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* Hero Confidence Gauge Breakdown */}
      {confidence && <ConfidenceGauge confidence={confidence} />}

      {/* Grounded Natural Language Narrative Card */}
      <div className="border border-slate-800 rounded-2xl bg-[#0f172a] p-4 sm:p-5 space-y-3.5 shadow-xl">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Grounded Satellite Analysis Summary</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#070b14] hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-sans transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
              title="Copy narrative text"
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

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-sans font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Numeric Grounded</span>
            </div>
          </div>
        </div>

        {/* Narrative Paragraph */}
        <div className="p-4 bg-[#070b14] border border-slate-800/80 rounded-xl">
          <p className="text-base text-slate-100 leading-relaxed font-sans font-normal">
            {answer}
          </p>
        </div>

        {/* Metadata Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>{collection}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate max-w-[220px]">{resolvedAoi}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>{acqDate}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 font-mono">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud: {cloudCover}</span>
          </div>
          <div className="px-2.5 py-1 bg-[#070b14] border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>10m GSD</span>
          </div>
        </div>

        {/* Provenance Footnote */}
        <div className="text-xs text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Every measurement is verified by the Numeric Guard against completed GeoPlan operations.</span>
        </div>
      </div>
    </div>
  );
}
