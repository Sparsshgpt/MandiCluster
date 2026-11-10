from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# --- Data & Metadata Models ---

class DataProvenance(BaseModel):
    source: str = "AGMARKNET / Open Government Data (OGD) Platform India"
    retrieval_date: str = "2026-10-25"
    date_range_start: str = "2025-10-30"
    date_range_end: str = "2026-10-25"
    total_records: int = 0
    unique_markets: int = 0
    unique_commodities: int = 0
    cleaning_steps: List[str] = [
        "Removed duplicates across Market, Commodity, and Date",
        "Filtered non-positive prices and standardized unit to INR / Quintal",
        "Parsed ISO-8601 observation dates",
        "Imputed zero arrivals with rolling median or flagged missing"
    ]
    is_sample_data: bool = True

class MetadataResponse(BaseModel):
    commodities: List[str]
    states: List[str]
    districts_by_state: Dict[str, List[str]]
    markets_by_district: Dict[str, List[str]]
    min_date: str
    max_date: str
    total_records: int
    provenance: DataProvenance

class ValidationReport(BaseModel):
    total_rows: int
    valid_rows: int
    rejected_rows: int
    duplicate_rows: int
    missing_value_counts: Dict[str, int]
    column_mapping: Dict[str, str]
    applied_transformations: List[str]
    sample_records: List[Dict[str, Any]]
    is_valid: bool
    error_message: Optional[str] = None

# --- Market Analysis Models ---

class MarketSummaryRequest(BaseModel):
    commodity: Optional[str] = "Wheat"
    state: Optional[str] = None
    district: Optional[str] = None
    market: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class MarketPricePoint(BaseModel):
    date: str
    modal_price: float
    min_price: float
    max_price: float
    arrivals: float
    market: str
    commodity: str

class MarketSummaryResponse(BaseModel):
    total_observations: int
    avg_modal_price: float
    min_observed_price: float
    max_observed_price: float
    overall_std_dev: float
    overall_cv: float
    price_trend: List[Dict[str, Any]]
    ranking_by_market: List[Dict[str, Any]]
    commodity_distribution: List[Dict[str, Any]]
    variability_by_market: List[Dict[str, Any]]
    recent_observations: List[Dict[str, Any]]

class MarketCompareRequest(BaseModel):
    commodity: str = "Wheat"
    markets: List[str]
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class MarketMetricItem(BaseModel):
    market: str
    state: str
    district: str
    avg_modal_price: float
    min_price: float
    max_price: float
    std_dev: float
    coefficient_of_variation: float
    latest_date: str
    latest_modal_price: float
    avg_arrivals: float
    observation_count: int

class MarketCompareResponse(BaseModel):
    commodity: str
    markets: List[MarketMetricItem]
    time_series: List[Dict[str, Any]]

# --- Clustering Models ---

class ClusteringRequest(BaseModel):
    commodity: str = "Wheat"
    state: Optional[str] = None
    algorithm: str = "kmeans" # "kmeans", "minibatch", "hierarchical", "dbscan"
    n_clusters: int = 3
    eps: float = 0.8 # For DBSCAN
    min_samples: int = 2 # For DBSCAN
    features: List[str] = [
        "mean_price",
        "median_price",
        "std_price",
        "cv_price",
        "price_range",
        "price_trend_slope",
        "avg_arrivals"
    ]
    random_seed: int = 42
    scaler: str = "standard" # "standard", "robust", "minmax"

class ClusterSummaryItem(BaseModel):
    cluster_id: int # Arbitrary integer id
    cluster_label: str
    market_count: int
    mean_price: float
    median_price: float
    avg_std_dev: float
    avg_cv: float
    avg_arrivals: float
    representative_markets: List[str]
    characterization: str

class MarketClusterPoint(BaseModel):
    market: str
    district: str
    state: str
    cluster_id: int
    is_noise: bool
    pca_x: float
    pca_y: float
    mean_price: float
    median_price: float
    std_price: float
    cv_price: float
    avg_arrivals: float

class ClusteringResponse(BaseModel):
    commodity: str
    algorithm: str
    n_clusters_found: int
    total_markets: int
    noise_points_count: int
    silhouette_score: Optional[float] = None
    davies_bouldin_index: Optional[float] = None
    inertia: Optional[float] = None
    pca_explained_variance: List[float]
    cluster_summaries: List[ClusterSummaryItem]
    market_points: List[MarketClusterPoint]
    feature_importance: Dict[str, float]

# --- Cluster Evaluation Models ---

class ClusterEvaluationRequest(BaseModel):
    commodity: str = "Wheat"
    state: Optional[str] = None
    k_min: int = 2
    k_max: int = 8
    features: Optional[List[str]] = None
    random_seed: int = 42

class EvaluationKPoint(BaseModel):
    k: int
    inertia: float
    silhouette_score: float
    davies_bouldin_index: float

class ClusterEvaluationResponse(BaseModel):
    commodity: str
    k_points: List[EvaluationKPoint]
    cluster_sizes_by_k: Dict[int, List[int]]
    cluster_stability_score: float # Jaccard/Adjusted Rand across 10 bootstrap resamples
    suggested_k_elbow: int
    suggested_k_silhouette: int

# --- Dimensionality Reduction Models ---

class DimReductionRequest(BaseModel):
    commodity: str = "Wheat"
    state: Optional[str] = None
    n_clusters: int = 3
    features: Optional[List[str]] = None
    tsne_perplexity: float = 5.0
    random_seed: int = 42

class PCAPoint(BaseModel):
    market: str
    state: str
    district: str
    cluster_id: int
    pca_x: float
    pca_y: float
    mean_price: float

class TSNEPoint(BaseModel):
    market: str
    state: str
    district: str
    cluster_id: int
    tsne_x: float
    tsne_y: float
    mean_price: float

class FeatureLoading(BaseModel):
    feature: str
    pc1_loading: float
    pc2_loading: float

class DimReductionComparisonResponse(BaseModel):
    commodity: str
    total_observations: int
    pca_points: List[PCAPoint]
    tsne_points: List[TSNEPoint]
    pca_explained_variance_ratio: List[float]
    pca_loadings: List[FeatureLoading]
    perplexity_used: float

# --- Anomaly Detection Models ---

class AnomalyDetectionRequest(BaseModel):
    commodity: str = "Wheat"
    market: str = "Khanna"
    algorithm: str = "isolation_forest" # "isolation_forest" or "lof"
    contamination: float = 0.05
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class AnomalyPoint(BaseModel):
    date: str
    modal_price: float
    min_price: float
    max_price: float
    arrivals: float
    is_anomaly: bool
    anomaly_score: float
    deviation_from_mean_percent: float
    neutral_explanation: str

class AnomalyDetectionResponse(BaseModel):
    commodity: str
    market: str
    algorithm: str
    contamination_rate: float
    total_observations: int
    flagged_observations_count: int
    historical_mean_price: float
    historical_std_dev: float
    time_series: List[AnomalyPoint]
    interpretation_guidance: str

# --- Recommendations Models ---

class DestinationCandidate(BaseModel):
    market: str
    district: str
    state: str
    reported_modal_price: float
    latest_observation_date: str
    distance_km: float

class RecommendationRequest(BaseModel):
    commodity: str = "Wheat"
    state: str = "Punjab"
    origin_market: str = "Khanna"
    quantity_quintals: float = 50.0
    vehicle_type: str = "pickup_truck" # "mini_truck", "pickup_truck", "medium_truck", "heavy_truck"
    custom_cost_per_km: Optional[float] = None
    custom_loading_cost: Optional[float] = None
    max_distance_km: Optional[float] = 300.0

class MarketRecommendationItem(BaseModel):
    rank: int
    market: str
    district: str
    state: str
    reported_modal_price: float
    price_date: str
    is_fresh_data: bool
    distance_km: float
    estimated_transport_cost_total: float
    estimated_transport_cost_per_quintal: float
    estimated_net_price_per_quintal: float
    estimated_total_proceeds: float
    difference_vs_local_per_quintal: float
    difference_vs_local_total: float
    is_origin: bool
    freshness_note: str

class RecommendationResponse(BaseModel):
    commodity: str
    origin_market: str
    quantity_quintals: float
    vehicle_type: str
    cost_per_km_assumed: float
    base_handling_cost_assumed: float
    recommendations: List[MarketRecommendationItem]
    disclaimer: str
