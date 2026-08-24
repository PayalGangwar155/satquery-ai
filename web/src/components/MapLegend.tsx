import { Layers, Info } from 'lucide-react';

interface MapLegendProps {
  indexName?: string;
  meanValue?: number;
}

export default function MapLegend({ indexName = 'NDVI', meanValue }: MapLegendProps) {
  const normalizedIndex = indexName.toUpperCase();

  const getLegendData = () => {
    if (normalizedIndex === 'NDWI') {
      return {
        title: 'NDWI (Normalized Difference Water Index)',
        formula: '(Green - NIR) / (Green + NIR)',
        gradient: 'from-amber-700 via-sky-600 to-blue-500',
        categories: [
          { label: 'Dry / Non-water', range: '< -0.2', color: '#b45309' },
          { label: 'Low Moisture', range: '-0.2 - 0.0', color: '#0284c7' },
          { label: 'Moderate Water', range: '0.0 - 0.2', color: '#0ea5e9' },
          { label: 'High Open Water', range: '> 0.2', color: '#3b82f6' }
        ]
      };
    }

    if (normalizedIndex === 'NDBI') {
      return {
        title: 'NDBI (Normalized Difference Built-up Index)',
        formula: '(SWIR - NIR) / (SWIR + NIR)',
        gradient: 'from-emerald-700 via-amber-600 to-rose-600',
        categories: [
          { label: 'Low Built-up', range: '< 0.0', color: '#059669' },
          { label: 'Moderate Urban', range: '0.0 - 0.2', color: '#d97706' },
          { label: 'High Built-up', range: '0.2 - 0.5', color: '#dc2626' },
          { label: 'Dense Concrete', range: '> 0.5', color: '#991b1b' }
        ]
      };
    }

    // Default NDVI
    return {
      title: 'NDVI (Normalized Difference Vegetation Index)',
      formula: '(NIR - Red) / (NIR + Red)',
      gradient: 'from-amber-800 via-yellow-600 via-lime-600 to-emerald-500',
      categories: [
        { label: 'Very Low (Barren/Water)', range: '< 0.1', color: '#78350f' },
        { label: 'Low (Sparse Shrub)', range: '0.1 - 0.2', color: '#ca8a04' },
        { label: 'Moderate (Grassland)', range: '0.2 - 0.4', color: '#65a30d' },
        { label: 'High (Healthy Crops)', range: '0.4 - 0.6', color: '#16a34a' },
        { label: 'Very High (Dense Forest)', range: '> 0.6', color: '#15803d' }
      ]
    };
  };

  const legend = getLegendData();

  return (
    <div className="p-3 bg-[#0c1322]/95 border border-[#1e293b] rounded-xl shadow-2xl font-mono text-xs backdrop-blur-md space-y-2">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-1.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wider">{normalizedIndex} Spectral Scale</span>
        </div>
        {meanValue !== undefined && (
          <span className="text-[10px] text-slate-300 bg-[#070b14] px-2 py-0.5 rounded border border-[#1e293b]">
            Mean: <strong className="text-cyan-300">{meanValue}</strong>
          </span>
        )}
      </div>

      {/* Continuous Gradient Bar */}
      <div className="space-y-1">
        <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${legend.gradient} shadow-inner`} />
        <div className="flex justify-between text-[9px] text-slate-400 font-bold px-0.5">
          <span>-1.0</span>
          <span>0.0</span>
          <span>+1.0</span>
        </div>
      </div>

      {/* Discrete Categories */}
      <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
        {legend.categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-1.5 text-slate-300">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0 border border-slate-700/60"
              style={{ backgroundColor: cat.color }}
            />
            <span className="truncate text-slate-400">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-slate-400 pt-1 border-t border-[#1e293b] flex items-center gap-1">
        <Info className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="truncate">{legend.formula}</span>
      </div>
    </div>
  );
}
