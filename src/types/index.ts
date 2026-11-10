export interface DataProvenance {
  source: string;
  retrieval_date: string;
  date_range_start: string;
  date_range_end: string;
  total_records: number;
  unique_markets: number;
  unique_commodities: number;
  cleaning_steps: string[];
  is_sample_data: boolean;
}

export interface MetadataResponse {
  commodities: string[];
  states: string[];
  districts_by_state: Record<string, string[]>;
  markets_by_district: Record<string, string[]>;
  min_date: string;
  max_date: string;
  total_records: number;
  provenance: DataProvenance;
}

export interface ValidationReport {
  total_rows: number;
  valid_rows: number;
  rejected_rows: number;
  duplicate_rows: number;
  missing_value_counts: Record<string, number>;
  column_mapping: Record<string, string>;
  applied_transformations: string[];
  sample_records: any[];
  is_valid: boolean;
  error_message?: string;
}

export interface MarketSummaryRequest {
  commodity?: string;
  state?: string;
  district?: string;
  market?: string;
  start_date?: string;
  end_date?: string;
}

export interface MarketSummaryResponse {
  total_observations: number;
  avg_modal_price: number;
  min_observed_price: number;
  max_observed_price: number;
  overall_std_dev: number;
  overall_cv: number;
  price_trend: Array<{
    date: string;
    avg_modal_price: number;
    min_price: number;
    max_price: number;
    total_arrivals: number;
  }>;
  ranking_by_market: Array<{
    market: string;
    state: string;
    avg_modal_price: number;
    observation_count: number;
  }>;
  commodity_distribution: Array<{
    commodity: string;
    observations: number;
    markets_trading: number;
  }>;
  variability_by_market: Array<{
    market: string;
    mean_price: number;
    std_dev: number;
    cv_percent: number;
    min_price: number;
    max_price: number;
  }>;
  recent_observations: Array<{
    Date: string;
    State: string;
    District: string;
    Market: string;
    Commodity: string;
    Variety: string;
    Min_Price: number;
    Max_Price: number;
    Modal_Price: number;
    Arrivals_Tonnes: number;
    Unit: string;
    Data_Source: string;
  }>;
}

export interface MarketCompareRequest {
  commodity: string;
  markets: string[];
  start_date?: string;
  end_date?: string;
}

export interface MarketMetricItem {
  market: string;
  state: string;
  district: string;
  avg_modal_price: number;
  min_price: number;
  max_price: number;
  std_dev: number;
  coefficient_of_variation: number;
  latest_date: string;
  latest_modal_price: number;
  avg_arrivals: number;
  observation_count: number;
}

export interface MarketCompareResponse {
  commodity: string;
  markets: MarketMetricItem[];
  time_series: Array<Record<string, any>>;
}

export interface ClusteringRequest {
  commodity: string;
  state?: string;
  algorithm: string;
  n_clusters: number;
  eps?: number;
  min_samples?: number;
  features?: string[];
  random_seed?: number;
  scaler?: string;
}

export interface ClusterSummaryItem {
  cluster_id: number;
  cluster_label: string;
  market_count: number;
  mean_price: number;
  median_price: number;
  avg_std_dev: number;
  avg_cv: number;
  avg_arrivals: number;
  representative_markets: string[];
  characterization: string;
}

export interface MarketClusterPoint {
  market: string;
  district: string;
  state: string;
  cluster_id: number;
  is_noise: boolean;
  pca_x: number;
  pca_y: number;
  mean_price: number;
  median_price: number;
  std_price: number;
  cv_price: number;
  avg_arrivals: number;
}

export interface ClusteringResponse {
  commodity: string;
  algorithm: string;
  n_clusters_found: number;
  total_markets: number;
  noise_points_count: number;
  silhouette_score?: number | null;
  davies_bouldin_index?: number | null;
  inertia?: number | null;
  pca_explained_variance: number[];
  cluster_summaries: ClusterSummaryItem[];
  market_points: MarketClusterPoint[];
  feature_importance: Record<string, number>;
}

export interface ClusterEvaluationRequest {
  commodity: string;
  state?: string;
  k_min: number;
  k_max: number;
  features?: string[];
  random_seed?: number;
}

export interface EvaluationKPoint {
  k: number;
  inertia: number;
  silhouette_score: number;
  davies_bouldin_index: number;
}

export interface ClusterEvaluationResponse {
  commodity: string;
  k_points: EvaluationKPoint[];
  cluster_sizes_by_k: Record<number, number[]>;
  cluster_stability_score: number;
  suggested_k_elbow: number;
  suggested_k_silhouette: number;
}

export interface DimReductionRequest {
  commodity: string;
  state?: string;
  n_clusters: number;
  features?: string[];
  tsne_perplexity: number;
  random_seed?: number;
}

export interface PCAPoint {
  market: string;
  state: string;
  district: string;
  cluster_id: number;
  pca_x: number;
  pca_y: number;
  mean_price: number;
}

export interface TSNEPoint {
  market: string;
  state: string;
  district: string;
  cluster_id: number;
  tsne_x: number;
  tsne_y: number;
  mean_price: number;
}

export interface FeatureLoading {
  feature: string;
  pc1_loading: number;
  pc2_loading: number;
}

export interface DimReductionComparisonResponse {
  commodity: string;
  total_observations: number;
  pca_points: PCAPoint[];
  tsne_points: TSNEPoint[];
  pca_explained_variance_ratio: number[];
  pca_loadings: FeatureLoading[];
  perplexity_used: number;
}

export interface AnomalyDetectionRequest {
  commodity: string;
  market: string;
  algorithm: string;
  contamination: number;
  start_date?: string;
  end_date?: string;
}

export interface AnomalyPoint {
  date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrivals: number;
  is_anomaly: boolean;
  anomaly_score: number;
  deviation_from_mean_percent: number;
  neutral_explanation: string;
}

export interface AnomalyDetectionResponse {
  commodity: string;
  market: string;
  algorithm: string;
  contamination_rate: number;
  total_observations: number;
  flagged_observations_count: number;
  historical_mean_price: number;
  historical_std_dev: number;
  time_series: AnomalyPoint[];
  interpretation_guidance: string;
}

export interface RecommendationRequest {
  commodity: string;
  state: string;
  origin_market: string;
  quantity_quintals: number;
  vehicle_type: string;
  custom_cost_per_km?: number;
  custom_loading_cost?: number;
  max_distance_km?: number;
}

export interface MarketRecommendationItem {
  rank: number;
  market: string;
  district: string;
  state: string;
  reported_modal_price: number;
  price_date: string;
  is_fresh_data: boolean;
  distance_km: number;
  estimated_transport_cost_total: number;
  estimated_transport_cost_per_quintal: number;
  estimated_net_price_per_quintal: number;
  estimated_total_proceeds: number;
  difference_vs_local_per_quintal: number;
  difference_vs_local_total: number;
  is_origin: boolean;
  freshness_note: string;
}

export interface RecommendationResponse {
  commodity: string;
  origin_market: string;
  quantity_quintals: number;
  vehicle_type: string;
  cost_per_km_assumed: number;
  base_handling_cost_assumed: number;
  recommendations: MarketRecommendationItem[];
  disclaimer: string;
}
