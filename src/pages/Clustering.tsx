import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Network,
  Settings2,
  Play,
  Layers,
  MapPin,
  CheckCircle2,
  Info,
  ScatterChart as ScatterIcon,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { MetadataResponse, ClusteringResponse, ClusteringRequest } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

const CLUSTER_COLORS = ['#15803D', '#2563EB', '#D97706', '#9333EA', '#DC2626', '#0891B2', '#4F46E5'];

export const Clustering: React.FC = () => {
  const { t } = useTranslation();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [state, setState] = useState<string>('All');
  const [algorithm, setAlgorithm] = useState<string>('kmeans');
  const [nClusters, setNClusters] = useState<number>(3);
  const [eps, setEps] = useState<number>(1.2);
  const [minSamples, setMinSamples] = useState<number>(2);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [scaler, setScaler] = useState<string>('standard');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'mean_price',
    'median_price',
    'std_price',
    'cv_price',
    'price_range',
    'price_trend_slope',
    'avg_arrivals',
  ]);

  const [result, setResult] = useState<ClusteringResponse | null>(null);

  useEffect(() => {
    const fetchMetaAndRun = async () => {
      try {
        const metadata = await api.getMetadata();
        setMeta(metadata);
        if (metadata.commodities.length > 0) {
          setCommodity(metadata.commodities[0]);
        }
        // Run initial clustering
        const initialRes = await api.runClustering({
          commodity: metadata.commodities[0] || 'Wheat',
          algorithm: 'kmeans',
          n_clusters: 3,
          features: selectedFeatures,
          random_seed: 42,
          scaler: 'standard',
        });
        setResult(initialRes);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize clustering.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchMetaAndRun();
  }, []);

  const handleRunClustering = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: ClusteringRequest = {
        commodity,
        state: state === 'All' ? undefined : state,
        algorithm,
        n_clusters: nClusters,
        eps,
        min_samples: minSamples,
        features: selectedFeatures,
        random_seed: randomSeed,
        scaler,
      };
      const res = await api.runClustering(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Clustering execution failed. Please verify configuration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      if (selectedFeatures.length > 2) {
        setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
      }
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  if (initialLoading) return <LoadingState message="Initializing clustering algorithms..." />;

  // Prepare grouped data for Recharts scatter plot by cluster_id
  const scatterDataByCluster: Record<number, any[]> = {};
  if (result) {
    result.market_points.forEach((pt) => {
      if (!scatterDataByCluster[pt.cluster_id]) {
        scatterDataByCluster[pt.cluster_id] = [];
      }
      scatterDataByCluster[pt.cluster_id].push({
        x: pt.pca_x,
        y: pt.pca_y,
        market: pt.market,
        district: pt.district,
        state: pt.state,
        mean_price: pt.mean_price,
        cv_price: pt.cv_price,
        cluster_id: pt.cluster_id,
        is_noise: pt.is_noise,
      });
    });
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('clustering.title', 'Mandi Cluster Analysis')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            'clustering.subtitle',
            'Unsupervised segmentation grouping agricultural markets with similar price-level and volatility dynamics.'
          )}
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Settings2 className="w-4 h-4 text-forest" />
          <span>{t('clustering.config_panel', 'Clustering Configuration')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Crop */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest" />
              <span>{t('clustering.select_crop', 'Commodity / Crop')}</span>
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {meta?.commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>{t('clustering.select_state', 'State')}</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="All">All States</option>
              {meta?.states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Algorithm */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-forest" />
              <span>{t('clustering.algorithm', 'Clustering Algorithm')}</span>
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="kmeans">K-Means (Standard)</option>
              <option value="minibatch">MiniBatch K-Means</option>
              <option value="hierarchical">Hierarchical (Agglomerative)</option>
              <option value="dbscan">DBSCAN (Density-Based)</option>
            </select>
          </div>

          {/* K or DBSCAN Params */}
          {algorithm !== 'dbscan' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('clustering.k_clusters', 'Number of Clusters (K)')}: {nClusters}
              </label>
              <input
                type="range"
                min={2}
                max={6}
                value={nClusters}
                onChange={(e) => setNClusters(parseInt(e.target.value, 10))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>K=2</span>
                <span>K=4</span>
                <span>K=6</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                DBSCAN Epsilon (ε): {eps}
              </label>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.1}
                value={eps}
                onChange={(e) => setEps(parseFloat(e.target.value))}
                className="w-full accent-forest cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Dense (0.4)</span>
                <span>Moderate (1.2)</span>
                <span>Sparse (2.5)</span>
              </div>
            </div>
          )}
        </div>

        {/* Feature Selection Checkboxes */}
        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 mb-2 block">
            Market-Level Statistical Features for Distance Metric:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { id: 'mean_price', label: 'Mean Modal Price' },
              { id: 'median_price', label: 'Median Modal Price' },
              { id: 'std_price', label: 'Price Standard Dev' },
              { id: 'cv_price', label: 'Coeff. of Variation' },
              { id: 'price_range', label: 'Relative Price Range' },
              { id: 'price_trend_slope', label: '30-Day Trend Slope' },
              { id: 'avg_arrivals', label: 'Average Arrivals' },
            ].map((f) => {
              const active = selectedFeatures.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFeature(f.id)}
                  className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="block">{f.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Observation unit: 1 Market aggregate. Market IDs and geographical names are never used as numerical distance features.
          </p>
        </div>

        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={handleRunClustering}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-forest hover:bg-forest-hover shadow-sm transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{loading ? t('clustering.running', 'Computing clusters...') : t('clustering.run_analysis', 'Execute Clustering')}</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={handleRunClustering} />}

      {/* Results Output */}
      {result && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.clusters_found', 'Clusters Found')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{result.n_clusters_found}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.markets_assigned', 'Mandis Assigned')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{result.total_markets}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.noise_points', 'Noise Points')}</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-0.5">{result.noise_points_count}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.silhouette', 'Silhouette Score')}</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">
                {result.silhouette_score !== null ? result.silhouette_score : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.davies_bouldin', 'Davies–Bouldin')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                {result.davies_bouldin_index !== null ? result.davies_bouldin_index : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">{t('clustering.inertia', 'Inertia (WCSS)')}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                {result.inertia !== null ? result.inertia : 'N/A'}
              </p>
            </div>
          </div>

          {/* 2D PCA Cluster Map */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ScatterIcon className="w-5 h-5 text-forest" />
                  <span>{t('clustering.pca_projection_title', '2D PCA Projection of Mandi Clusters')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dimensionality reduced to 2 Principal Components (Explaining {(result.pca_explained_variance.reduce((a, b) => a + b, 0) * 100).toFixed(1)}% of feature variance)
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Principal Component 1"
                    stroke="#94A3B8"
                    fontSize={11}
                    label={{ value: 'Principal Component 1 (Global Price & Volume Axis)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Principal Component 2"
                    stroke="#94A3B8"
                    fontSize={11}
                    label={{ value: 'Principal Component 2 (Volatility & Range Axis)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-900">{pt.market}</p>
                          <p className="text-slate-500">{pt.district}, {pt.state}</p>
                          <div className="border-t border-slate-100 pt-1 text-slate-700">
                            <p>Mean Price: <span className="font-semibold">₹{pt.mean_price}</span></p>
                            <p>Volatility (CV): <span className="font-semibold">{pt.cv_price}%</span></p>
                            <p>Cluster: <span className="font-semibold">{pt.is_noise ? 'Noise Point' : `Cluster ${pt.cluster_id}`}</span></p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {Object.keys(scatterDataByCluster).map((cIdStr) => {
                    const cId = parseInt(cIdStr, 10);
                    const isNoise = cId === -1;
                    const color = isNoise ? '#64748B' : CLUSTER_COLORS[cId % CLUSTER_COLORS.length];
                    const label = isNoise ? 'Noise / Outlier Points' : `Cluster ${cId}`;
                    return (
                      <Scatter
                        key={cId}
                        name={label}
                        data={scatterDataByCluster[cId]}
                        fill={color}
                      />
                    );
                  })}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('clustering.summary_table_title', 'Cluster Characteristics & Representative Mandis')}
                </h3>
                <p className="text-xs text-slate-500">
                  Quantitative feature medoids and profile interpretation
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('clustering.cluster_id', 'Cluster ID')}</th>
                    <th className="py-3 px-4 text-right">{t('clustering.market_count', 'Mandis')}</th>
                    <th className="py-3 px-4 text-right">{t('clustering.mean_price', 'Mean Price')}</th>
                    <th className="py-3 px-4 text-right">{t('clustering.median_price', 'Median Price')}</th>
                    <th className="py-3 px-4 text-right">{t('clustering.avg_variability', 'Volatility (CV %)')}</th>
                    <th className="py-3 px-4 text-right">Avg Arrivals</th>
                    <th className="py-3 px-4">{t('clustering.representative_mandis', 'Representative Mandis')}</th>
                    <th className="py-3 px-4">{t('clustering.characterization', 'Quantitative Profile')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.cluster_summaries.map((c) => {
                    const isNoise = c.cluster_id === -1;
                    const badgeBg = isNoise ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-forest font-semibold';
                    return (
                      <tr key={c.cluster_id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${badgeBg}`}>
                            {c.cluster_label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{c.market_count}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">₹{c.mean_price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-slate-600">₹{c.median_price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{c.avg_cv}%</td>
                        <td className="py-3 px-4 text-right text-slate-600">{c.avg_arrivals} T</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {c.representative_markets.map((m) => (
                              <span key={m} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs max-w-xs">{c.characterization}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Transparent Guidance Alert */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
              <span>
                {t(
                  'clustering.disclaimer_note',
                  'Note: Cluster IDs are arbitrary categorical identifiers generated by unsupervised algorithms and do NOT represent qualitative rankings, market superiority, or trading endorsements.'
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
