import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from api.index import (
    health_check, get_metadata, get_market_summary,
    compare_markets, run_clustering, evaluate_clusters,
    compare_dimensionality_reduction, run_anomaly_detection,
    get_recommendations
)
from api.schemas.models import (
    MarketSummaryRequest, MarketCompareRequest,
    ClusteringRequest, ClusterEvaluationRequest,
    DimReductionRequest, AnomalyDetectionRequest,
    RecommendationRequest
)

def test_all_endpoints():
    print("Testing MandiCluster Endpoints...")
    
    # 1. Health
    h = health_check()
    assert h["status"] == "healthy"
    print("1. Health Check: PASSED")

    # 2. Metadata
    meta = get_metadata()
    assert len(meta.commodities) >= 5
    assert meta.total_records > 1000
    print(f"2. Metadata: PASSED ({len(meta.commodities)} crops, {meta.total_records} observations)")

    # 3. Market Summary
    summary = get_market_summary(MarketSummaryRequest(commodity="Wheat"))
    assert summary.total_observations > 0
    assert summary.avg_modal_price > 0
    print(f"3. Market Summary: PASSED (Avg Price: ₹{summary.avg_modal_price})")

    # 4. Market Compare
    cmp_res = compare_markets(MarketCompareRequest(commodity="Wheat", markets=["Khanna", "Karnal", "Kota"]))
    assert len(cmp_res.markets) >= 2
    print(f"4. Market Compare: PASSED ({len(cmp_res.markets)} markets compared)")

    # 5. Clustering (KMeans)
    clus_res = run_clustering(ClusteringRequest(commodity="Wheat", algorithm="kmeans", n_clusters=3))
    assert clus_res.n_clusters_found >= 2
    assert clus_res.silhouette_score is not None
    print(f"5. Clustering: PASSED ({clus_res.n_clusters_found} clusters, silhouette={clus_res.silhouette_score})")

    # 6. Cluster Evaluation
    eval_res = evaluate_clusters(ClusterEvaluationRequest(commodity="Wheat", k_min=2, k_max=5))
    assert len(eval_res.k_points) == 4
    print(f"6. Cluster Evaluation: PASSED (suggested k: elbow={eval_res.suggested_k_elbow}, sil={eval_res.suggested_k_silhouette})")

    # 7. PCA vs t-SNE
    dr_res = compare_dimensionality_reduction(DimReductionRequest(commodity="Wheat", n_clusters=3, tsne_perplexity=3.0))
    assert len(dr_res.pca_points) == len(dr_res.tsne_points)
    print(f"7. PCA vs t-SNE: PASSED ({len(dr_res.pca_points)} observations aligned)")

    # 8. Anomaly Detection
    anom_res = run_anomaly_detection(AnomalyDetectionRequest(commodity="Wheat", market="Khanna", algorithm="isolation_forest"))
    assert anom_res.total_observations > 10
    print(f"8. Anomaly Detection: PASSED ({anom_res.flagged_observations_count} flagged / {anom_res.total_observations} total)")

    # 9. Recommendations
    rec_res = get_recommendations(RecommendationRequest(commodity="Wheat", origin_market="Khanna", quantity_quintals=50.0))
    assert len(rec_res.recommendations) >= 3
    print(f"9. Recommendations: PASSED (Top Destination: {rec_res.recommendations[0].market}, proceeds: ₹{rec_res.recommendations[0].estimated_total_proceeds})")

    print("\nSUCCESS: All 9 Backend & Machine Learning Endpoints Passed with 100% integrity!")

if __name__ == "__main__":
    test_all_endpoints()
