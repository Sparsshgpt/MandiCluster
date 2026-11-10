import pandas as pd
import numpy as np
from typing import List, Tuple, Optional

def compute_price_trend_slope(series: pd.Series) -> float:
    """Computes simple linear regression slope (normalized per 30-day period) over sequential observations."""
    n = len(series)
    if n < 2:
        return 0.0
    x = np.arange(n)
    y = series.values
    # Avoid zero division
    x_var = np.var(x)
    if x_var == 0:
        return 0.0
    cov = np.cov(x, y)[0, 1]
    slope = cov / x_var
    # Scale slope relative to mean to yield a percentage change rate per step
    mean_val = np.mean(y)
    if mean_val != 0:
        return float((slope / mean_val) * 10.0) # approx 10 observation trend %
    return float(slope)

def extract_market_features(
    df: pd.DataFrame,
    commodity: str,
    state: Optional[str] = None,
    features_to_include: Optional[List[str]] = None,
    min_observations: int = 5
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Aggregates historical time-series observations into one statistical feature vector per market
    for a single selected commodity (to prevent price scale cross-contamination).

    Observation Unit: 1 Market (e.g. Khanna, Karnal, Lasalgaon) for the specified Commodity.
    Returns:
      - features_df: DataFrame with numerical feature matrix indexed by Market
      - metadata_df: DataFrame with State, District, Market identifiers and raw statistics
    """
    sub_df = df[df["Commodity"].str.lower() == commodity.lower()].copy()
    if state and state != "All":
        sub_df = sub_df[sub_df["State"].str.lower() == state.lower()]

    if len(sub_df) == 0:
        return pd.DataFrame(), pd.DataFrame()

    # Sort chronologically for trend analysis
    sub_df = sub_df.sort_values(by=["Market", "Date"])

    all_features = [
        "mean_price",
        "median_price",
        "std_price",
        "cv_price",
        "price_range",
        "price_trend_slope",
        "avg_arrivals"
    ]
    selected_features = features_to_include if features_to_include else all_features

    market_rows = []
    meta_rows = []

    for market, group in sub_df.groupby("Market"):
        if len(group) < min_observations:
            continue

        prices = group["Modal_Price"].dropna()
        arrivals = group["Arrivals_Tonnes"].dropna() if "Arrivals_Tonnes" in group else pd.Series([0.0])

        if len(prices) == 0:
            continue

        mean_p = float(prices.mean())
        median_p = float(prices.median())
        std_p = float(prices.std(ddof=1)) if len(prices) > 1 else 0.0
        cv_p = float(std_p / mean_p) if mean_p > 0 else 0.0
        
        # Relative price range: (Max - Min) / Mean
        p_min = float(prices.min())
        p_max = float(prices.max())
        price_range = float((p_max - p_min) / mean_p) if mean_p > 0 else 0.0
        
        # Linear slope
        trend_slope = compute_price_trend_slope(prices)
        
        # Arrivals
        avg_arr = float(arrivals.mean()) if len(arrivals) > 0 else 0.0

        st = group["State"].iloc[0]
        dist = group["District"].iloc[0]

        feat_dict = {
            "mean_price": mean_p,
            "median_price": median_p,
            "std_price": std_p,
            "cv_price": cv_p,
            "price_range": price_range,
            "price_trend_slope": trend_slope,
            "avg_arrivals": avg_arr
        }

        # Keep only requested features in numerical matrix
        filtered_feat = {k: feat_dict[k] for k in selected_features if k in feat_dict}
        market_rows.append(pd.Series(filtered_feat, name=market))

        meta_rows.append({
            "market": market,
            "state": st,
            "district": dist,
            "mean_price": round(mean_p, 2),
            "median_price": round(median_p, 2),
            "std_price": round(std_p, 2),
            "cv_price": round(cv_p * 100, 2), # In percent
            "avg_arrivals": round(avg_arr, 1),
            "observation_count": len(group)
        })

    if not market_rows:
        return pd.DataFrame(), pd.DataFrame()

    features_df = pd.DataFrame(market_rows)
    # Fill any NA features with column median
    features_df = features_df.fillna(features_df.median())

    metadata_df = pd.DataFrame(meta_rows).set_index("market")

    return features_df, metadata_df
