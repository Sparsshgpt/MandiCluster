import {
  MetadataResponse,
  ValidationReport,
  MarketSummaryRequest,
  MarketSummaryResponse,
  MarketCompareRequest,
  MarketCompareResponse,
  ClusteringRequest,
  ClusteringResponse,
  ClusterEvaluationRequest,
  ClusterEvaluationResponse,
  DimReductionRequest,
  DimReductionComparisonResponse,
  AnomalyDetectionRequest,
  AnomalyDetectionResponse,
  RecommendationRequest,
  RecommendationResponse,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errMessage = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; service: string }> {
    return fetchJson(`${API_BASE}/health`);
  },

  async getMetadata(): Promise<MetadataResponse> {
    return fetchJson(`${API_BASE}/metadata`);
  },

  async validateUpload(file: File): Promise<ValidationReport> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/data/validate`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Validation failed');
    }

    return res.json();
  },

  async getMarketSummary(req: MarketSummaryRequest): Promise<MarketSummaryResponse> {
    return fetchJson(`${API_BASE}/market/summary`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async compareMarkets(req: MarketCompareRequest): Promise<MarketCompareResponse> {
    return fetchJson(`${API_BASE}/market/compare`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async runClustering(req: ClusteringRequest): Promise<ClusteringResponse> {
    return fetchJson(`${API_BASE}/clustering/run`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async evaluateClusters(req: ClusterEvaluationRequest): Promise<ClusterEvaluationResponse> {
    return fetchJson(`${API_BASE}/clustering/evaluate`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async compareDimReduction(req: DimReductionRequest): Promise<DimReductionComparisonResponse> {
    return fetchJson(`${API_BASE}/dimensionality-reduction/pca`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async runAnomalyDetection(req: AnomalyDetectionRequest): Promise<AnomalyDetectionResponse> {
    return fetchJson(`${API_BASE}/anomaly-detection/run`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getRecommendations(req: RecommendationRequest): Promise<RecommendationResponse> {
    return fetchJson(`${API_BASE}/recommendations/compare`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
};
