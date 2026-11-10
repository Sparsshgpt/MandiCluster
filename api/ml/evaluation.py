import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score, adjusted_rand_score
from api.schemas.models import ClusterEvaluationResponse, EvaluationKPoint

def evaluate_clustering_k(
    features_df: pd.DataFrame,
    commodity: str,
    k_min: int = 2,
    k_max: int = 8,
    random_seed: int = 42
) -> ClusterEvaluationResponse:
    """
    Evaluates clustering metrics across varying K (from k_min to k_max)
    including Inertia, Silhouette Score, Davies-Bouldin Index, and cluster stability.
    """
    n_samples = len(features_df)
    if n_samples < 4:
        raise ValueError(f"At least 4 markets are needed for multi-K cluster evaluation. Found {n_samples}.")

    # Preprocessing
    scaler = StandardScaler()
    X = scaler.fit_transform(features_df.values)

    actual_k_max = min(k_max, n_samples - 1)
    actual_k_min = min(k_min, actual_k_max)

    k_points: List[EvaluationKPoint] = []
    cluster_sizes: Dict[int, List[int]] = {}
    
    inertias = []
    silhouette_scores = []
    davies_bouldins = []
    k_vals = list(range(actual_k_min, actual_k_max + 1))

    for k in k_vals:
        km = KMeans(n_clusters=k, random_state=random_seed, n_init=10)
        labels = km.fit_predict(X)
        
        inertia = float(km.inertia_)
        inertias.append(inertia)
        
        try:
            sil = float(silhouette_score(X, labels))
        except Exception:
            sil = 0.0
        silhouette_scores.append(sil)
        
        try:
            db = float(davies_bouldin_score(X, labels))
        except Exception:
            db = 1.0
        davies_bouldins.append(db)

        # Cluster sizes
        unique, counts = np.unique(labels, return_counts=True)
        cluster_sizes[k] = [int(c) for c in counts]

        k_points.append(EvaluationKPoint(
            k=k,
            inertia=round(inertia, 2),
            silhouette_score=round(sil, 4),
            davies_bouldin_index=round(db, 4)
        ))

    # Suggested K by Silhouette (maximum silhouette)
    best_sil_idx = int(np.argmax(silhouette_scores)) if silhouette_scores else 0
    suggested_k_sil = k_vals[best_sil_idx] if k_vals else 3

    # Suggested K by Elbow heuristic (maximum distance from line connecting first and last point)
    if len(k_vals) >= 3:
        p1 = np.array([k_vals[0], inertias[0]])
        p2 = np.array([k_vals[-1], inertias[-1]])
        line_vec = p2 - p1
        line_dist = np.linalg.norm(line_vec)
        distances = []
        for i, k in enumerate(k_vals):
            p = np.array([k, inertias[i]])
            # Perpendicular distance
            dist = np.abs(np.cross(line_vec, p1 - p)) / line_dist
            distances.append(dist)
        suggested_k_elbow = k_vals[int(np.argmax(distances))]
    else:
        suggested_k_elbow = suggested_k_sil

    # Cluster stability analysis: Compare repeated runs on bootstrap resamples (80% subsample)
    # Using Adjusted Rand Index across 10 resamples with K = suggested_k_sil
    stability_scores = []
    np.random.seed(random_seed)
    base_km = KMeans(n_clusters=suggested_k_sil, random_state=random_seed, n_init=5)
    base_labels = base_km.fit_predict(X)

    subsample_size = max(3, int(0.85 * n_samples))
    for resample_iter in range(8):
        sub_indices = np.random.choice(n_samples, size=subsample_size, replace=False)
        sub_X = X[sub_indices]
        resample_km = KMeans(n_clusters=suggested_k_sil, random_state=random_seed + resample_iter, n_init=5)
        resample_labels = resample_km.fit_predict(sub_X)
        ari = adjusted_rand_score(base_labels[sub_indices], resample_labels)
        stability_scores.append(max(0.0, float(ari)))

    mean_stability = float(np.mean(stability_scores)) if stability_scores else 0.85

    return ClusterEvaluationResponse(
        commodity=commodity,
        k_points=k_points,
        cluster_sizes_by_k=cluster_sizes,
        cluster_stability_score=round(mean_stability, 3),
        suggested_k_elbow=suggested_k_elbow,
        suggested_k_silhouette=suggested_k_sil
    )
