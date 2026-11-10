import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.cluster import KMeans, MiniBatchKMeans, AgglomerativeClustering, DBSCAN
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, davies_bouldin_score
from api.schemas.models import ClusteringResponse, ClusterSummaryItem, MarketClusterPoint

def get_scaler(scaler_type: str):
    if scaler_type == "robust":
        return RobustScaler()
    elif scaler_type == "minmax":
        return MinMaxScaler()
    return StandardScaler()

def run_clustering_pipeline(
    features_df: pd.DataFrame,
    metadata_df: pd.DataFrame,
    commodity: str,
    algorithm: str = "kmeans",
    n_clusters: int = 3,
    eps: float = 0.8,
    min_samples: int = 2,
    random_seed: int = 42,
    scaler_type: str = "standard"
) -> ClusteringResponse:
    """
    Executes unsupervised machine learning clustering on market feature vectors.
    """
    n_samples, n_features = features_df.shape
    if n_samples < 3:
        raise ValueError(f"At least 3 markets are required for clustering analysis. Found only {n_samples}.")

    # Drop constant features (zero variance)
    variances = features_df.var()
    non_constant = variances[variances > 1e-8].index.tolist()
    if not non_constant:
        raise ValueError("All selected features have near-zero variance. Cannot perform clustering.")
    X_raw = features_df[non_constant].values

    # Preprocessing: Scale features
    scaler = get_scaler(scaler_type)
    X_scaled = scaler.fit_transform(X_raw)

    # Dimensionality Reduction for 2D visualization
    pca = PCA(n_components=min(2, X_scaled.shape[1]), random_state=random_seed)
    X_pca = pca.fit_transform(X_scaled)
    if X_pca.shape[1] == 1:
        X_pca = np.column_stack([X_pca, np.zeros(n_samples)])
    
    explained_var = [float(v) for v in pca.explained_variance_ratio_]

    # Algorithm execution
    algo_clean = algorithm.lower().replace("-", "").replace("_", "")
    cluster_labels = np.zeros(n_samples, dtype=int)
    inertia_val: Optional[float] = None
    noise_count = 0

    # Ensure n_clusters does not exceed n_samples
    actual_k = max(2, min(n_clusters, n_samples - 1))

    if "minibatch" in algo_clean:
        model = MiniBatchKMeans(n_clusters=actual_k, random_state=random_seed, batch_size=32, n_init="auto")
        cluster_labels = model.fit_predict(X_scaled)
        inertia_val = float(model.inertia_)
    elif "hierarchical" in algo_clean or "agglomerative" in algo_clean:
        model = AgglomerativeClustering(n_clusters=actual_k, linkage="ward")
        cluster_labels = model.fit_predict(X_scaled)
    elif "dbscan" in algo_clean:
        model = DBSCAN(eps=eps, min_samples=min_samples)
        cluster_labels = model.fit_predict(X_scaled)
        noise_count = int(np.sum(cluster_labels == -1))
    else: # Default KMeans
        model = KMeans(n_clusters=actual_k, random_state=random_seed, n_init=10)
        cluster_labels = model.fit_predict(X_scaled)
        inertia_val = float(model.inertia_)

    # Validation of metrics
    unique_labels = sorted(list(set(cluster_labels)))
    non_noise_labels = [lbl for lbl in unique_labels if lbl != -1]
    n_clusters_found = len(non_noise_labels)

    sil_score: Optional[float] = None
    db_index: Optional[float] = None

    if n_clusters_found >= 2:
        # Calculate silhouette only on non-noise points if DBSCAN
        if -1 in unique_labels:
            mask = cluster_labels != -1
            if np.sum(mask) >= n_clusters_found + 1 and len(set(cluster_labels[mask])) >= 2:
                try:
                    sil_score = float(silhouette_score(X_scaled[mask], cluster_labels[mask]))
                    db_index = float(davies_bouldin_score(X_scaled[mask], cluster_labels[mask]))
                except Exception:
                    pass
        else:
            try:
                sil_score = float(silhouette_score(X_scaled, cluster_labels))
                db_index = float(davies_bouldin_score(X_scaled, cluster_labels))
            except Exception:
                pass

    # Build market points
    market_names = list(features_df.index)
    market_points: List[MarketClusterPoint] = []
    
    for i, m_name in enumerate(market_names):
        meta = metadata_df.loc[m_name]
        c_id = int(cluster_labels[i])
        market_points.append(MarketClusterPoint(
            market=m_name,
            district=str(meta["district"]),
            state=str(meta["state"]),
            cluster_id=c_id,
            is_noise=(c_id == -1),
            pca_x=round(float(X_pca[i, 0]), 3),
            pca_y=round(float(X_pca[i, 1]), 3),
            mean_price=float(meta["mean_price"]),
            median_price=float(meta["median_price"]),
            std_price=float(meta["std_price"]),
            cv_price=float(meta["cv_price"]),
            avg_arrivals=float(meta["avg_arrivals"])
        ))

    # Build Cluster Summary Table (with transparent, non-judgmental interpretations)
    cluster_summaries: List[ClusterSummaryItem] = []
    overall_mean_price = metadata_df["mean_price"].mean()

    for c_id in unique_labels:
        idx_mask = (cluster_labels == c_id)
        c_count = int(np.sum(idx_mask))
        c_markets = [market_names[i] for i in range(n_samples) if idx_mask[i]]
        
        c_meta = metadata_df.loc[c_markets]
        c_mean_price = float(c_meta["mean_price"].mean())
        c_median_price = float(c_meta["median_price"].mean())
        c_avg_std = float(c_meta["std_price"].mean())
        c_avg_cv = float(c_meta["cv_price"].mean())
        c_avg_arr = float(c_meta["avg_arrivals"].mean())

        # Select up to 3 representative markets (closest to centroid in scaled space)
        if c_id == -1:
            rep_markets = c_markets[:3]
            c_label = "Noise Points (Unclustered)"
            characterization = "Observations with unique or atypical price/arrival profiles that did not meet dense neighborhood criteria."
        else:
            c_label = f"Cluster {c_id}"
            c_pts = X_scaled[idx_mask]
            centroid = np.mean(c_pts, axis=0)
            dists = np.linalg.norm(c_pts - centroid, axis=1)
            sorted_indices = np.argsort(dists)
            rep_markets = [c_markets[idx] for idx in sorted_indices[:3]]

            # Plain language characterization based on quantitative attributes
            price_desc = "Premium Price" if c_mean_price > overall_mean_price * 1.05 else ("Economical Price" if c_mean_price < overall_mean_price * 0.95 else "Average Price")
            vol_desc = "High Volatility" if c_avg_cv > 8.0 else ("Moderate Volatility" if c_avg_cv > 4.0 else "Stable Price")
            characterization = f"Characterized by {price_desc.lower()} regimes and {vol_desc.lower()} behavior."

        cluster_summaries.append(ClusterSummaryItem(
            cluster_id=c_id,
            cluster_label=c_label,
            market_count=c_count,
            mean_price=round(c_mean_price, 2),
            median_price=round(c_median_price, 2),
            avg_std_dev=round(c_avg_std, 2),
            avg_cv=round(c_avg_cv, 2),
            avg_arrivals=round(c_avg_arr, 1),
            representative_markets=rep_markets,
            characterization=characterization
        ))

    # Feature importance approximated via PCA Component 1 loadings magnitude
    feature_imp = {}
    if len(non_constant) > 0 and pca.components_.shape[0] > 0:
        pc1_loadings = np.abs(pca.components_[0])
        total_load = np.sum(pc1_loadings)
        if total_load > 0:
            for feat_name, load in zip(non_constant, pc1_loadings):
                feature_imp[feat_name] = round(float(load / total_load), 4)

    return ClusteringResponse(
        commodity=commodity,
        algorithm=algorithm,
        n_clusters_found=n_clusters_found,
        total_markets=n_samples,
        noise_points_count=noise_count,
        silhouette_score=round(sil_score, 4) if sil_score is not None else None,
        davies_bouldin_index=round(db_index, 4) if db_index is not None else None,
        inertia=round(inertia_val, 2) if inertia_val is not None else None,
        pca_explained_variance=[round(v, 4) for v in explained_var],
        cluster_summaries=cluster_summaries,
        market_points=market_points,
        feature_importance=feature_imp
    )
