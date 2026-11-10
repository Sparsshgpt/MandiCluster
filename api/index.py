import os
import sys
import io
import pandas as pd
import numpy as np

# Ensure root directory and API directory are in sys.path for local and serverless execution
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
API_DIR = os.path.abspath(os.path.dirname(__file__))
if API_DIR not in sys.path:
    sys.path.insert(0, API_DIR)

from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from api.schemas.models import (
    MetadataResponse, DataProvenance, ValidationReport,
    MarketSummaryRequest, MarketSummaryResponse,
    MarketCompareRequest, MarketCompareResponse, MarketMetricItem,
    ClusteringRequest, ClusteringResponse,
    ClusterEvaluationRequest, ClusterEvaluationResponse,
    DimReductionRequest, DimReductionComparisonResponse,
    AnomalyDetectionRequest, AnomalyDetectionResponse,
    RecommendationRequest, RecommendationResponse
)
from api.data.ingestion import get_default_dataset, validate_and_clean_data
from api.ml.features import extract_market_features
from api.ml.clustering import run_clustering_pipeline
from api.ml.evaluation import evaluate_clustering_k
from api.ml.dim_reduction import run_dim_reduction_comparison
from api.ml.anomaly import detect_price_anomalies
from api.ml.recommendation import compute_market_recommendations

app = FastAPI(
    title="MandiCluster API",
    description="Agricultural Market Segmentation & Price-Pattern Intelligence Platform API",
    version="1.0.0"
)

# Enable CORS for local development and Vercel preview environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()

# Shared in-memory dataset cache (with fallback to default file)
_ACTIVE_DATASET: Optional[pd.DataFrame] = None
_CUSTOM_PROVENANCE: Optional[DataProvenance] = None

def get_current_df() -> pd.DataFrame:
    global _ACTIVE_DATASET
    if _ACTIVE_DATASET is not None and len(_ACTIVE_DATASET) > 0:
        return _ACTIVE_DATASET
    _ACTIVE_DATASET = get_default_dataset()
    return _ACTIVE_DATASET

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MandiCluster API",
        "version": "1.0.0",
        "runtime": "Python / FastAPI Serverless"
    }

@router.get("/metadata", response_model=MetadataResponse)
def get_metadata():
    df = get_current_df()
    
    commodities = sorted(df["Commodity"].dropna().unique().tolist())
    states = sorted(df["State"].dropna().unique().tolist())

    districts_by_state = {}
    for st, group in df.groupby("State"):
        districts_by_state[st] = sorted(group["District"].dropna().unique().tolist())

    markets_by_district = {}
    for dist, group in df.groupby("District"):
        markets_by_district[dist] = sorted(group["Market"].dropna().unique().tolist())

    min_date = str(df["Date"].min())
    max_date = str(df["Date"].max())

    prov = _CUSTOM_PROVENANCE or DataProvenance(
        total_records=len(df),
        unique_markets=df["Market"].nunique(),
        unique_commodities=df["Commodity"].nunique(),
        date_range_start=min_date,
        date_range_end=max_date,
        is_sample_data=(_CUSTOM_PROVENANCE is None)
    )

    return MetadataResponse(
        commodities=commodities,
        states=states,
        districts_by_state=districts_by_state,
        markets_by_district=markets_by_district,
        min_date=min_date,
        max_date=max_date,
        total_records=len(df),
        provenance=prov
    )

@router.post("/data/validate", response_model=ValidationReport)
async def validate_data_upload(file: UploadFile = File(...)):
    """Validates an uploaded CSV file, checks columns, cleans data, and loads it as active dataset."""
    global _ACTIVE_DATASET, _CUSTOM_PROVENANCE
    try:
        content = await file.read()
        csv_text = content.decode("utf-8", errors="replace")
        cleaned_df, report = validate_and_clean_data(file_content=csv_text)

        if report.is_valid and len(cleaned_df) > 0:
            _ACTIVE_DATASET = cleaned_df
            _CUSTOM_PROVENANCE = DataProvenance(
                source=f"User Upload ({file.filename})",
                retrieval_date=str(pd.Timestamp.now().strftime("%Y-%m-%d")),
                date_range_start=str(cleaned_df["Date"].min()),
                date_range_end=str(cleaned_df["Date"].max()),
                total_records=len(cleaned_df),
                unique_markets=cleaned_df["Market"].nunique(),
                unique_commodities=cleaned_df["Commodity"].nunique(),
                cleaning_steps=report.applied_transformations,
                is_sample_data=False
            )

        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Upload processing failed: {str(e)}")

@router.post("/market/summary", response_model=MarketSummaryResponse)
def get_market_summary(req: MarketSummaryRequest):
    df = get_current_df()

    if req.commodity:
        df = df[df["Commodity"].str.lower() == req.commodity.lower()]
    if req.state and req.state != "All":
        df = df[df["State"].str.lower() == req.state.lower()]
    if req.district and req.district != "All":
        df = df[df["District"].str.lower() == req.district.lower()]
    if req.market and req.market != "All":
        df = df[df["Market"].str.lower() == req.market.lower()]
    if req.start_date:
        df = df[df["Date"] >= req.start_date]
    if req.end_date:
        df = df[df["Date"] <= req.end_date]

    if len(df) == 0:
        return MarketSummaryResponse(
            total_observations=0,
            avg_modal_price=0.0,
            min_observed_price=0.0,
            max_observed_price=0.0,
            overall_std_dev=0.0,
            overall_cv=0.0,
            price_trend=[],
            ranking_by_market=[],
            commodity_distribution=[],
            variability_by_market=[],
            recent_observations=[]
        )

    prices = df["Modal_Price"].dropna()
    avg_price = float(prices.mean())
    min_p = float(prices.min())
    max_p = float(prices.max())
    std_p = float(prices.std()) if len(prices) > 1 else 0.0
    cv_p = round((std_p / avg_price) * 100, 2) if avg_price > 0 else 0.0

    # 1. Price trend: aggregated average modal price by date
    trend_data = []
    for dt, grp in df.groupby("Date"):
        trend_data.append({
            "date": str(dt),
            "avg_modal_price": round(float(grp["Modal_Price"].mean()), 2),
            "min_price": round(float(grp["Min_Price"].min()), 2),
            "max_price": round(float(grp["Max_Price"].max()), 2),
            "total_arrivals": round(float(grp["Arrivals_Tonnes"].sum()), 1)
        })
    trend_data.sort(key=lambda x: x["date"])

    # 2. Ranking by market
    ranking_data = []
    for m, grp in df.groupby("Market"):
        m_prices = grp["Modal_Price"]
        ranking_data.append({
            "market": m,
            "state": grp["State"].iloc[0],
            "avg_modal_price": round(float(m_prices.mean()), 2),
            "observation_count": len(grp)
        })
    ranking_data.sort(key=lambda x: x["avg_modal_price"], reverse=True)

    # 3. Commodity distribution
    full_df = get_current_df()
    comm_dist = []
    for c, grp in full_df.groupby("Commodity"):
        comm_dist.append({
            "commodity": c,
            "observations": len(grp),
            "markets_trading": grp["Market"].nunique()
        })
    comm_dist.sort(key=lambda x: x["observations"], reverse=True)

    # 4. Variability by market (top 15)
    variability_data = []
    for m, grp in df.groupby("Market"):
        p = grp["Modal_Price"]
        if len(p) > 1:
            m_mean = float(p.mean())
            m_std = float(p.std())
            m_cv = round((m_std / m_mean) * 100, 2) if m_mean > 0 else 0.0
            variability_data.append({
                "market": m,
                "mean_price": round(m_mean, 2),
                "std_dev": round(m_std, 2),
                "cv_percent": m_cv,
                "min_price": round(float(p.min()), 2),
                "max_price": round(float(p.max()), 2)
            })
    variability_data.sort(key=lambda x: x["cv_percent"], reverse=True)

    # 5. Recent observations
    recent = df.sort_values(by="Date", ascending=False).head(15).to_dict(orient="records")

    return MarketSummaryResponse(
        total_observations=len(df),
        avg_modal_price=round(avg_price, 2),
        min_observed_price=round(min_p, 2),
        max_observed_price=round(max_p, 2),
        overall_std_dev=round(std_p, 2),
        overall_cv=cv_p,
        price_trend=trend_data,
        ranking_by_market=ranking_data[:15],
        commodity_distribution=comm_dist,
        variability_by_market=variability_data[:15],
        recent_observations=recent
    )

@router.post("/market/compare", response_model=MarketCompareResponse)
def compare_markets(req: MarketCompareRequest):
    df = get_current_df()
    sub_df = df[df["Commodity"].str.lower() == req.commodity.lower()].copy()

    if req.markets:
        sub_df = sub_df[sub_df["Market"].isin(req.markets)]
    if req.start_date:
        sub_df = sub_df[sub_df["Date"] >= req.start_date]
    if req.end_date:
        sub_df = sub_df[sub_df["Date"] <= req.end_date]

    if len(sub_df) == 0:
        return MarketCompareResponse(commodity=req.commodity, markets=[], time_series=[])

    market_metrics: List[MarketMetricItem] = []
    for m, grp in sub_df.groupby("Market"):
        prices = grp["Modal_Price"]
        mean_p = float(prices.mean())
        std_p = float(prices.std()) if len(prices) > 1 else 0.0
        cv_p = round((std_p / mean_p) * 100, 2) if mean_p > 0 else 0.0
        latest_row = grp.sort_values(by="Date", ascending=False).iloc[0]

        market_metrics.append(MarketMetricItem(
            market=m,
            state=str(grp["State"].iloc[0]),
            district=str(grp["District"].iloc[0]),
            avg_modal_price=round(mean_p, 2),
            min_price=round(float(prices.min()), 2),
            max_price=round(float(prices.max()), 2),
            std_dev=round(std_p, 2),
            coefficient_of_variation=cv_p,
            latest_date=str(latest_row["Date"]),
            latest_modal_price=round(float(latest_row["Modal_Price"]), 2),
            avg_arrivals=round(float(grp["Arrivals_Tonnes"].mean()), 1),
            observation_count=len(grp)
        ))

    # Time series pivoting: Date, Market1_Price, Market2_Price...
    ts_dict = {}
    for _, row in sub_df.iterrows():
        dt = row["Date"]
        mkt = row["Market"]
        if dt not in ts_dict:
            ts_dict[dt] = {"date": dt}
        ts_dict[dt][f"{mkt}_price"] = float(row["Modal_Price"])
        ts_dict[dt][f"{mkt}_arrivals"] = float(row["Arrivals_Tonnes"])

    ts_list = sorted(list(ts_dict.values()), key=lambda x: x["date"])

    return MarketCompareResponse(
        commodity=req.commodity,
        markets=market_metrics,
        time_series=ts_list
    )

@router.post("/clustering/run", response_model=ClusteringResponse)
def run_clustering(req: ClusteringRequest):
    df = get_current_df()
    features_df, metadata_df = extract_market_features(
        df=df,
        commodity=req.commodity,
        state=req.state,
        features_to_include=req.features
    )

    if len(features_df) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient market observations for commodity '{req.commodity}' to perform clustering. Minimum 3 distinct markets required."
        )

    try:
        response = run_clustering_pipeline(
            features_df=features_df,
            metadata_df=metadata_df,
            commodity=req.commodity,
            algorithm=req.algorithm,
            n_clusters=req.n_clusters,
            eps=req.eps,
            min_samples=req.min_samples,
            random_seed=req.random_seed,
            scaler_type=req.scaler
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/clustering/evaluate", response_model=ClusterEvaluationResponse)
def evaluate_clusters(req: ClusterEvaluationRequest):
    df = get_current_df()
    features_df, _ = extract_market_features(
        df=df,
        commodity=req.commodity,
        state=req.state,
        features_to_include=req.features
    )

    if len(features_df) < 4:
        raise HTTPException(
            status_code=400,
            detail=f"At least 4 markets required for cluster evaluation. Found {len(features_df)} for '{req.commodity}'."
        )

    try:
        return evaluate_clustering_k(
            features_df=features_df,
            commodity=req.commodity,
            k_min=req.k_min,
            k_max=req.k_max,
            random_seed=req.random_seed
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/dimensionality-reduction/pca", response_model=DimReductionComparisonResponse)
@router.post("/dimensionality-reduction/tsne", response_model=DimReductionComparisonResponse)
def compare_dimensionality_reduction(req: DimReductionRequest):
    df = get_current_df()
    features_df, metadata_df = extract_market_features(
        df=df,
        commodity=req.commodity,
        state=req.state,
        features_to_include=req.features
    )

    if len(features_df) < 3:
        raise HTTPException(
            status_code=400,
            detail=f"At least 3 markets required for dimensionality reduction. Found {len(features_df)}."
        )

    try:
        return run_dim_reduction_comparison(
            features_df=features_df,
            metadata_df=metadata_df,
            commodity=req.commodity,
            n_clusters=req.n_clusters,
            perplexity=req.tsne_perplexity,
            random_seed=req.random_seed
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/anomaly-detection/run", response_model=AnomalyDetectionResponse)
def run_anomaly_detection(req: AnomalyDetectionRequest):
    df = get_current_df()
    try:
        return detect_price_anomalies(
            df=df,
            commodity=req.commodity,
            market=req.market,
            algorithm=req.algorithm,
            contamination=req.contamination,
            start_date=req.start_date,
            end_date=req.end_date
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recommendations/compare", response_model=RecommendationResponse)
def get_recommendations(req: RecommendationRequest):
    df = get_current_df()
    try:
        return compute_market_recommendations(
            df=df,
            commodity=req.commodity,
            origin_market=req.origin_market,
            quantity_quintals=req.quantity_quintals,
            vehicle_type=req.vehicle_type,
            custom_cost_per_km=req.custom_cost_per_km,
            custom_loading_cost=req.custom_loading_cost,
            max_distance_km=req.max_distance_km
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Dual route registration:
# 1. Standard API prefix /api/... (e.g. /api/health, /api/clustering/run)
app.include_router(router, prefix="/api")
# 2. Root fallback (handles cases where serverless rewrites strip the /api prefix)
app.include_router(router)
