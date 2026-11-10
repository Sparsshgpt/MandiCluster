import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler
from api.schemas.models import AnomalyDetectionResponse, AnomalyPoint

def detect_price_anomalies(
    df: pd.DataFrame,
    commodity: str,
    market: str,
    algorithm: str = "isolation_forest",
    contamination: float = 0.05,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    random_seed: int = 42
) -> AnomalyDetectionResponse:
    """
    Detects unusual market price points in historical time series using Isolation Forest
    or Local Outlier Factor with strictly neutral, educational explanations.
    """
    sub_df = df[
        (df["Commodity"].str.lower() == commodity.lower()) &
        (df["Market"].str.lower() == market.lower())
    ].copy()

    if start_date:
        sub_df = sub_df[sub_df["Date"] >= start_date]
    if end_date:
        sub_df = sub_df[sub_df["Date"] <= end_date]

    sub_df = sub_df.sort_values(by="Date").reset_index(drop=True)
    n_obs = len(sub_df)

    if n_obs < 10:
        raise ValueError(f"At least 10 historical observations required for statistical anomaly detection. Found {n_obs} for {market} ({commodity}).")

    # Features for anomaly detection:
    # 1. Normalized Modal Price
    # 2. Daily Price Spread: (Max_Price - Min_Price) / Modal_Price
    # 3. Step-over-step rate of change: (Price_t - Price_{t-1}) / Price_{t-1}
    prices = sub_df["Modal_Price"].values
    min_prices = sub_df["Min_Price"].values if "Min_Price" in sub_df else prices * 0.95
    max_prices = sub_df["Max_Price"].values if "Max_Price" in sub_df else prices * 1.05
    arrivals = sub_df["Arrivals_Tonnes"].values if "Arrivals_Tonnes" in sub_df else np.zeros(n_obs)

    spread = (max_prices - min_prices) / np.maximum(prices, 1.0)
    
    pct_changes = np.zeros(n_obs)
    if n_obs > 1:
        pct_changes[1:] = (prices[1:] - prices[:-1]) / np.maximum(prices[:-1], 1.0)

    feature_matrix = np.column_stack([
        prices,
        spread,
        pct_changes,
        arrivals
    ])

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(feature_matrix)

    # Valid contamination bound
    safe_contamination = max(0.01, min(0.20, float(contamination)))

    algo_name = algorithm.lower().replace("-", "").replace("_", "")
    is_anomaly_mask = np.zeros(n_obs, dtype=bool)
    anomaly_scores = np.zeros(n_obs, dtype=float)

    if "lof" in algo_name or "localoutlier" in algo_name:
        n_neighbors = max(3, min(20, n_obs - 1))
        lof = LocalOutlierFactor(n_neighbors=n_neighbors, contamination=safe_contamination)
        preds = lof.fit_predict(X_scaled) # -1 for outlier, 1 for inlier
        is_anomaly_mask = (preds == -1)
        # Negative outlier factor: lower is more abnormal
        raw_scores = -lof.negative_outlier_factor_
        anomaly_scores = (raw_scores - np.min(raw_scores)) / (np.max(raw_scores) - np.min(raw_scores) + 1e-8)
        model_display_name = "Local Outlier Factor (LOF)"
    else:
        # Default Isolation Forest
        iso = IsolationForest(
            contamination=safe_contamination,
            random_state=random_seed,
            n_estimators=100
        )
        preds = iso.fit_predict(X_scaled) # -1 for outlier, 1 for inlier
        is_anomaly_mask = (preds == -1)
        # Decision function: lower score means more anomalous
        raw_scores = -iso.score_samples(X_scaled)
        anomaly_scores = (raw_scores - np.min(raw_scores)) / (np.max(raw_scores) - np.min(raw_scores) + 1e-8)
        model_display_name = "Isolation Forest"

    mean_hist_price = float(np.mean(prices))
    std_hist_price = float(np.std(prices))

    points: List[AnomalyPoint] = []
    for i in range(n_obs):
        dt = str(sub_df["Date"].iloc[i])
        p = float(prices[i])
        min_p = float(min_prices[i])
        max_p = float(max_prices[i])
        arr = float(arrivals[i])
        flagged = bool(is_anomaly_mask[i])
        score = float(anomaly_scores[i])

        deviation_pct = round(((p - mean_hist_price) / mean_hist_price) * 100, 1) if mean_hist_price > 0 else 0.0

        if flagged:
            if deviation_pct > 15:
                neutral_expl = f"Flagged observation: Price was {deviation_pct}% above the historical mean. Likely reflects sudden local supply tightness, weather disruptions, or high festive demand."
            elif deviation_pct < -15:
                neutral_expl = f"Flagged observation: Price was {abs(deviation_pct)}% below the historical mean. Typical during seasonal harvest peak gluts or temporary transit blockades."
            else:
                neutral_expl = f"Flagged observation: Atypical combination of intraday price spread and market arrivals relative to historical baseline."
        else:
            neutral_expl = "Normal observation within expected statistical variance."

        points.append(AnomalyPoint(
            date=dt,
            modal_price=round(p, 2),
            min_price=round(min_p, 2),
            max_price=round(max_p, 2),
            arrivals=round(arr, 1),
            is_anomaly=flagged,
            anomaly_score=round(score, 3),
            deviation_from_mean_percent=deviation_pct,
            neutral_explanation=neutral_expl
        ))

    flagged_count = int(np.sum(is_anomaly_mask))

    guidance = (
        "Anomalies indicate statistical deviations from baseline patterns and do not imply fraud, "
        "incorrect data, or manipulation. They frequently indicate seasonal transition periods, unseasonal weather events, "
        "abrupt changes in mandi arrival volumes, or occasional transcription differences."
    )

    return AnomalyDetectionResponse(
        commodity=commodity,
        market=market,
        algorithm=model_display_name,
        contamination_rate=safe_contamination,
        total_observations=n_obs,
        flagged_observations_count=flagged_count,
        historical_mean_price=round(mean_hist_price, 2),
        historical_std_dev=round(std_hist_price, 2),
        time_series=points,
        interpretation_guidance=guidance
    )
