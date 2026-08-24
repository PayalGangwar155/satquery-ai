import { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertCircle,
  Compass,
  Layers,
  FileDown,
  Download
} from 'lucide-react';
import Header from './components/Header';
import Sidebar, { ActiveTab } from './components/Sidebar';
import QueryBar from './components/QueryBar';
import PipelineTracker from './components/PipelineTracker';
import MapView from './components/MapView';
import MetricCards from './components/MetricCards';
import AnswerCard from './components/AnswerCard';
import DataProvenance from './components/DataProvenance';
import PlanTape from './components/PlanTape';
import AnalysisHistory from './components/AnalysisHistory';
import SavedAreas, { DEFAULT_SAVED_AREAS } from './components/SavedAreas';
import DataSourcesModal from './components/DataSourcesModal';
import HelpModal from './components/HelpModal';
import SettingsModal from './components/SettingsModal';
import {
  SystemHealth,
  QueryResponse,
  HistoryItem,
  SavedArea
} from './types';

export default function App() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [query, setQuery] = useState('Analyze NDVI vegetation in Delhi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<'idle' | 'loading' | 'completed' | 'failed'>('idle');

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // LocalStorage-backed History & Saved Areas
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('satquery_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedAreas, setSavedAreas] = useState<SavedArea[]>(() => {
    try {
      const saved = localStorage.getItem('satquery_saved_areas');
      return saved ? JSON.parse(saved) : DEFAULT_SAVED_AREAS;
    } catch {
      return DEFAULT_SAVED_AREAS;
    }
  });

  // Fetch system health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: SystemHealth) => setHealth(data))
      .catch((err) => console.error('Failed to fetch health status', err));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('satquery_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Could not save history to localStorage', e);
    }
  }, [history]);

  // Execute Satellite Query
  const handleExecute = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q || loading) return;

    setLoading(true);
    setPipelineStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        let errDetail = `Satellite query failed with HTTP status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.detail) errDetail = errJson.detail;
        } catch {}
        throw new Error(errDetail);
      }

      const data: QueryResponse = await res.json();
      setResponse(data);
      setPipelineStatus('completed');

      // Add to history
      const location = data.evidence?.step_1?.resolved_name || 'Specified AOI';
      const indexName = data.evidence?.step_5?.index_name || 'NDVI';
      const conf = data.confidence?.overall_confidence ? Math.round(data.confidence.overall_confidence * 100) : 97;

      const newHistoryItem: HistoryItem = {
        id: data.query_id || String(Date.now()),
        query: q,
        location,
        index: indexName,
        timestamp: new Date().toISOString(),
        status: 'completed',
        confidencePct: conf,
        response: data
      };

      setHistory((prev) => [newHistoryItem, ...prev.filter((h) => h.query !== q).slice(0, 19)]);
    } catch (err: any) {
      console.error('Execution error:', err);
      setError(err.message || 'Unable to retrieve satellite analysis. Check upstream connectivity.');
      setPipelineStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  // Restore previous analysis from history
  const handleSelectHistory = (item: HistoryItem) => {
    setQuery(item.query);
    setResponse(item.response);
    setPipelineStatus('completed');
    setError(null);
    setActiveTab('analysis');
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('satquery_history');
    } catch {}
  };

  // Select Saved Area
  const handleSelectSavedArea = (area: SavedArea) => {
    setQuery(area.defaultQuery);
    setActiveTab('analysis');
    handleExecute(area.defaultQuery);
  };

  // Save current active AOI
  const handleSaveCurrentAoi = () => {
    if (!response?.evidence?.step_1) return;
    const aoi = response.evidence.step_1;
    const indexName = response.evidence?.step_5?.index_name || 'NDVI';
    const newArea: SavedArea = {
      id: `custom-${Date.now()}`,
      name: aoi.resolved_name,
      state: 'Custom Saved AOI',
      description: `User-saved region for ${indexName} observation`,
      bbox: aoi.bbox,
      centroid: aoi.centroid,
      defaultIndex: indexName as any,
      defaultQuery: query,
      badge: 'User Saved',
      type: 'Custom AOI'
    };

    setSavedAreas((prev) => [newArea, ...prev]);
    try {
      localStorage.setItem('satquery_saved_areas', JSON.stringify([newArea, ...savedAreas]));
    } catch {}
  };

  // Export GeoJSON
  const handleExportGeoJson = () => {
    if (!response?.evidence?.step_1?.geojson) return;
    const geojsonStr = JSON.stringify(response.evidence.step_1.geojson, null, 2);
    const blob = new Blob([geojsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satquery_aoi_${response.query_id || 'export'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Full JSON Report
  const handleExportReport = () => {
    if (!response) return;
    const reportStr = JSON.stringify(response, null, 2);
    const blob = new Blob([reportStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satquery_report_${response.query_id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derived metadata from active response
  const activeBbox = response?.evidence?.step_1?.bbox;
  const activeGeojson = response?.evidence?.step_1?.geojson;
  const activeAoiName = response?.evidence?.step_1?.resolved_name;
  const activeIndexName = response?.evidence?.step_5?.index_name || 'NDVI';
  const activeMeanVal = response?.evidence?.step_5?.statistics?.mean;
  const selectedScene = response?.evidence?.step_3?.selected_scene;

  const satelliteMeta = {
    collection: selectedScene?.collection || 'SENTINEL-2 L2A',
    resolution: '10m',
    sceneId: selectedScene?.scene_id,
    acqDate: selectedScene?.acquisition_date
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-900 selection:text-cyan-100 overflow-hidden">
      {/* Top Header */}
      <Header
        health={health}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          historyCount={history.length}
          savedCount={savedAreas.length}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] flex flex-col">
          {/* VIEW ROUTER */}
          {activeTab === 'history' ? (
            <div className="p-6 max-w-5xl mx-auto w-full">
              <AnalysisHistory
                history={history}
                onSelectHistory={handleSelectHistory}
                onClearHistory={handleClearHistory}
              />
            </div>
          ) : activeTab === 'saved' ? (
            <div className="p-6 max-w-5xl mx-auto w-full">
              <SavedAreas
                savedAreas={savedAreas}
                onSelectArea={handleSelectSavedArea}
                activeAoiName={activeAoiName}
                onSaveCurrentAoi={handleSaveCurrentAoi}
              />
            </div>
          ) : activeTab === 'datasources' ? (
            <div className="p-6 max-w-5xl mx-auto w-full">
              <DataSourcesModal isOpen={true} onClose={() => setActiveTab('analysis')} />
            </div>
          ) : activeTab === 'settings' ? (
            <div className="p-6 max-w-4xl mx-auto w-full">
              <SettingsModal isOpen={true} onClose={() => setActiveTab('analysis')} health={health} />
            </div>
          ) : (
            /* MAIN ANALYSIS / EXPLORE WORKSPACE (Default) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 min-h-0">
              {/* Center/Left Main Panel (Cols 1-8 on desktop) */}
              <div className="lg:col-span-8 border-r border-[#1e293b] flex flex-col p-5 gap-5 overflow-y-auto bg-[#070b14]">
                {/* Hero Command Query Bar */}
                <QueryBar
                  query={query}
                  setQuery={setQuery}
                  onExecute={handleExecute}
                  loading={loading}
                />

                {/* Visual Pipeline Tracker */}
                <PipelineTracker
                  status={pipelineStatus}
                  totalDurationMs={response?.total_duration_ms}
                />

                {/* MapLibre GL Cartographic Map View */}
                <MapView
                  bbox={activeBbox}
                  geojson={activeGeojson}
                  aoiName={activeAoiName}
                  indexName={activeIndexName}
                  meanValue={activeMeanVal}
                  satelliteMetadata={satelliteMeta}
                />

                {/* Error State Card */}
                {error && (
                  <div className="p-6 bg-red-950/40 border border-red-800/80 rounded-2xl space-y-3 font-mono shadow-2xl">
                    <div className="flex items-center justify-between text-red-400 font-bold text-xs uppercase">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> ANALYSIS COULD NOT BE COMPLETED
                      </span>
                      <span className="bg-red-900/60 px-2 py-0.5 rounded text-red-300">HTTP 500 / TIMEOUT</span>
                    </div>
                    <p className="text-sm text-slate-200 font-sans leading-relaxed">
                      {error}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleExecute()}
                        className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>RETRY ANALYSIS</span>
                      </button>
                      <button
                        onClick={() => {
                          setQuery('Analyze NDVI vegetation in Delhi');
                          handleExecute('Analyze NDVI vegetation in Delhi');
                        }}
                        className="px-4 py-2 bg-[#070b14] hover:bg-[#131b2e] border border-[#1e293b] text-slate-300 font-bold text-xs uppercase rounded-xl transition-colors font-mono"
                      >
                        Try Preset (Delhi NDVI)
                      </button>
                    </div>
                  </div>
                )}

                {/* Empty State Banner before first analysis */}
                {!response && !loading && !error && (
                  <div className="p-8 border border-[#1e293b] rounded-2xl bg-[#0f172a] text-center space-y-4 shadow-xl">
                    <div className="p-3 bg-[#0e2a38] text-cyan-400 border border-cyan-500/40 rounded-2xl w-fit mx-auto shadow-lg shadow-cyan-950/50">
                      <Compass className="w-8 h-8 animate-pulse text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide">
                        Explore Earth with Natural Language
                      </h3>
                      <p className="text-xs text-slate-400 font-sans pt-1 max-w-lg mx-auto">
                        Ask SatQuery about vegetation health, flood extent, urban development, or crop vigor across Indian and global geographic regions.
                      </p>
                    </div>
                  </div>
                )}

                {/* Deterministic Metric Cards */}
                {response && (
                  <MetricCards
                    evidence={response.evidence}
                    confidence={response.confidence}
                  />
                )}

                {/* Grounded Natural Language Narrative & Confidence Gauge */}
                {response && (
                  <AnswerCard
                    answer={response.grounded_answer}
                    confidence={response.confidence}
                    evidence={response.evidence}
                  />
                )}

                {/* Dedicated Data Provenance & Upstream Audit Section */}
                {response && (
                  <DataProvenance evidence={response.evidence} />
                )}

                {/* Export Actions Bar */}
                {response && (
                  <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-2xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Export Deterministic Analytical Products:</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={handleExportGeoJson}
                        className="px-3 py-1.5 bg-[#070b14] hover:bg-[#131b2e] border border-[#1e293b] hover:border-cyan-500/50 rounded-xl text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Export GeoJSON</span>
                      </button>

                      <button
                        onClick={handleExportReport}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download JSON Report</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Signature Plan Tape Log (Cols 9-12 on desktop) */}
              <div className="lg:col-span-4 bg-[#0c1322] flex flex-col border-l border-[#1e293b] h-full overflow-hidden">
                <PlanTape
                  stepResults={response?.step_results || []}
                  totalDurationMs={response?.total_duration_ms}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <DataSourcesModal isOpen={isDataSourcesOpen} onClose={() => setIsDataSourcesOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} health={health} />
    </div>
  );
}
