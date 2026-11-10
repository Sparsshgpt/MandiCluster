import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from api.schemas.models import DimReductionComparisonResponse, PCAPoint, TSNEPoint, FeatureLoading

def run_dim_reduction_comparison(
    features_df: pd.DataFrame,
    metadata_df: pd.DataFrame,
    commodity: str,
    n_clusters: int = 3,
    perplexity: float = 5.0,
    random_seed: int = 42
) -> DimReductionComparisonResponse:
    """
    Executes both PCA (linear, global variance maximizing) and t-SNE (non-linear, local neighborhood preserving)
    on the exact same dataset, market observations, and cluster labels.
    """
    n_samples, n_features = features_df.shape
    if n_samples < 3:
        raise ValueError(f"At least 3 markets required for dimensionality reduction. Found {n_samples}.")

    # Drop zero variance features
    variances = features_df.var()
    non_constant = variances[variances > 1e-8].index.tolist()
    if not non_constant:
        raise ValueError("Selected features have zero variance.")

    X_raw = features_df[non_constant].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)

    # Consistent clustering for color-coding in both projections
    actual_k = max(2, min(n_clusters, n_samples - 1))
    km = KMeans(n_clusters=actual_k, random_state=random_seed, n_init=10)
    cluster_labels = km.fit_predict(X_scaled)

    # 1. PCA (2 Components)
    pca = PCA(n_components=min(2, X_scaled.shape[1]), random_state=random_seed)
    X_pca = pca.fit_transform(X_scaled)
    if X_pca.shape[1] == 1:
        X_pca = np.column_stack([X_pca, np.zeros(n_samples)])
    
    explained_var = [float(v) for v in pca.explained_variance_ratio_]

    # Feature loadings for PC1 and PC2
    loadings: List[FeatureLoading] = []
    if pca.components_.shape[0] >= 1:
        pc1 = pca.components_[0]
        pc2 = pca.components_[1] if pca.components_.shape[0] > 1 else np.zeros(len(pc1))
        for i, feat in enumerate(non_constant):
            loadings.append(FeatureLoading(
                feature=feat,
                pc1_loading=round(float(pc1[i]), 3),
                pc2_loading=round(float(pc2[i]), 3)
            ))

    # 2. t-SNE (2 Components)
    # Validate perplexity: must be strictly less than n_samples (typically <= (n_samples - 1) / 3)
    max_valid_perp = max(1.0, float(n_samples - 1) / 2.5)
    effective_perp = min(float(perplexity), max_valid_perp)
    if effective_perp < 1.0:
        effective_perp = 1.0

    tsne_kwargs = {
        "n_components": 2,
        "perplexity": effective_perp,
        "random_state": random_seed,
        "learning_rate": "auto",
        "init": "random"
    }
    # Compatible across scikit-learn versions (n_iter in <=1.4, max_iter in >=1.5)
    try:
        tsne = TSNE(**tsne_kwargs, n_iter=1000)
    except TypeError:
        tsne = TSNE(**tsne_kwargs, max_iter=1000)
    X_tsne = tsne.fit_transform(X_scaled)

    # Build response points
    market_names = list(features_df.index)
    pca_points: List[PCAPoint] = []
    tsne_points: List[TSNEPoint] = []

    for i, m_name in enumerate(market_names):
        meta = metadata_df.loc[m_name]
        c_id = int(cluster_labels[i])
        mean_p = float(meta["mean_price"])
        st = str(meta["state"])
        dist = str(meta["district"])

        pca_points.append(PCAPoint(
            market=m_name,
            state=st,
            district=dist,
            cluster_id=c_id,
            pca_x=round(float(X_pca[i, 0]), 3),
            pca_y=round(float(X_pca[i, 1]), 3),
            mean_price=mean_p
        ))

        tsne_points.append(TSNEPoint(
            market=m_name,
            state=st,
            district=dist,
            cluster_id=c_id,
            tsne_x=round(float(X_tsne[i, 0]), 3),
            tsne_y=round(float(X_tsne[i, 1]), 3),
            mean_price=mean_p
        ))

    return DimReductionComparisonResponse(
        commodity=commodity,
        total_observations=n_samples,
        pca_points=pca_points,
        tsne_points=tsne_points,
        pca_explained_variance_ratio=[round(v, 4) for v in explained_var],
        pca_loadings=loadings,
        perplexity_used=round(effective_perp, 1)
    )
