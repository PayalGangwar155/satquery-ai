export interface SystemHealth {
  status: string;
  version: string;
  mode: string;
  llm_provider: string;
  offline_replay: boolean;
}

export interface Provenance {
  source_name: string;
  source_url: string;
  retrieved_at: string;
  request_params: Record<string, any>;
  scene_id?: string;
  acquisition_date?: string;
}

export interface ConfidenceComponents {
  cloud_score: number;
  resolution_score: number;
  temporal_score: number;
  coverage_score: number;
}

export interface ConfidenceBreakdown {
  overall_confidence: number;
  components: ConfidenceComponents;
  explanation: string;
}

export interface OperationResult {
  step_id: string;
  op: string;
  status: 'completed' | 'failed' | 'running';
  duration_ms: number;
  output: Record<string, any>;
  provenance?: Provenance;
  error_message?: string;
}

export interface QueryResponse {
  query_id: string;
  question: string;
  status: 'completed' | 'failed';
  total_duration_ms: number;
  step_results: OperationResult[];
  evidence: Record<string, any>;
  confidence: ConfidenceBreakdown;
  grounded_answer: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  location: string;
  index: string;
  timestamp: string;
  status: 'completed' | 'failed';
  confidencePct: number;
  response: QueryResponse;
}

export interface SavedArea {
  id: string;
  name: string;
  state: string;
  description: string;
  bbox: number[]; // [minLon, minLat, maxLon, maxLat]
  centroid: [number, number]; // [lon, lat]
  defaultIndex: 'NDVI' | 'NDWI' | 'NDBI';
  defaultQuery: string;
  badge: string;
  type: string;
}

export interface PresetQuery {
  id: string;
  label: string;
  index: 'NDVI' | 'NDWI' | 'NDBI' | 'CHANGE';
  query: string;
  badge: string;
  description: string;
}
