import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScatterChart as ScatterIcon,
  Layers,
  Settings2,
  HelpCircle,
  Play,
  Activity,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { MetadataResponse, DimReductionComparisonResponse, DimReductionRequest } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

const CLUSTER_COLORS = ['#15803D', '#2563EB', '#D97706', '#9333EA', '#DC2626', '#0891B2'];

export const PCAComparison: React.FC = () => {
  const { t } = useTranslation();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [nClusters, setNClusters] = useState<number>(3);
  const [perplexity, setPerplexity] = useState<number>(4.0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drData, setDrData] = useState<DimReductionComparisonResponse | null>(null);

  const executeDimReduction = async (crop: string, clusters: number, perp: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.compareDimReduction({
        commodity: crop,
        n_clusters: clusters,
        tsne_perplexity: perp,
        random_seed: 42,
      });
      setDrData(res);
    } catch (err: any) {
      setError(err.message || 'Dimensionality reduction failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const metadata = await api.getMetadata();
        setMeta(metadata);
        const defaultCrop = metadata.commodities[0] || 'Wheat';
        setCommodity(defaultCrop);
        await executeDimReduction(defaultCrop, 3, 4.0);
      } catch (err: any) {
        setError(err.message || 'Initialization failed.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleApply = () => {
    executeDimReduction(commodity, nClusters, perplexity);
  };

  if (initialLoading) return <LoadingState message="Computing PCA and t-SNE embeddings..." />;

  // Group PCA points by cluster_id
  const pcaByCluster: Record<number, any[]> = {};
  const tsneByCluster: Record<number, any[]> = {};

  if (drData) {
    drData.pca_points.forEach((pt) => {
      if (!pcaByCluster[pt.cluster_id]) pcaByCluster[pt.cluster_id] = [];
      pcaByCluster[pt.cluster_id].push({
        x: pt.pca_x,
        y: pt.pca_y,
        market: pt.market,
        district: pt.district,
        state: pt.state,
        mean_price: pt.mean_price,
        cluster_id: pt.cluster_id,
      });
    });

    drData.tsne_points.forEach((pt) => {
      if (!tsneByCluster[pt.cluster_id]) tsneByCluster[pt.cluster_id] = [];
      tsneByCluster[pt.cluster_id].push({
        x: pt.tsne_x,
        y: pt.tsne_y,
        market: pt.market,
        district: pt.district,
        state: pt.state,
        mean_price: pt.mean_price,
        cluster_id: pt.cluster_id,
      });
    });
  }

  const explainedTotal = drData
    ? (drData.pca_explained_variance_ratio.reduce((a, b) => a + b, 0) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('pca_tsne.title', 'Dimensionality Reduction: PCA vs. t-SNE')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            'pca_tsne.subtitle',
            'Comparing linear global-variance preservation against non-linear local-neighborhood manifold embedding on the exact same market observations.'
          )}
        </p>
      </div>

      {/* Control Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Commodity:</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {meta?.commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Clusters (K):</label>
            <select
              value={nClusters}
              onChange={(e) => setNClusters(parseInt(e.target.value, 10))}
              className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value={2}>2 Clusters</option>
              <option value={3}>3 Clusters</option>
              <option value={4}>4 Clusters</option>
              <option value={5}>5 Clusters</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">t-SNE Perplexity:</label>
            <input
              type="range"
              min={1.5}
              max={6.0}
              step={0.5}
              value={perplexity}
              onChange={(e) => setPerplexity(parseFloat(e.target.value))}
              className="w-24 accent-forest cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">{perplexity}</span>
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{loading ? 'Recomputing...' : 'Recompute Embeddings'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={handleApply} />}

      {drData && (
        <>
          {/* Side-by-Side Projection Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: PCA */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
                    <span>{t('pca_tsne.pca_panel_title', 'Principal Component Analysis (PCA)')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Linear projection • Explains {explainedTotal}% total feature variance
                  </p>
                </div>
                <div className="text-right text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  PC1: {(drData.pca_explained_variance_ratio[0] * 100).toFixed(1)}% | PC2:{' '}
                  {(drData.pca_explained_variance_ratio[1] * 100).toFixed(1)}%
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="PC1"
                      stroke="#94A3B8"
                      fontSize={11}
                      label={{ value: 'Principal Component 1 (Global Trend)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="PC2"
                      stroke="#94A3B8"
                      fontSize={11}
                      label={{ value: 'Principal Component 2 (Volatility)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                            <p className="font-bold text-slate-900">{pt.market}</p>
                            <p className="text-slate-500">{pt.district}, {pt.state}</p>
                            <p className="text-slate-700">Mean Price: <span className="font-semibold">₹{pt.mean_price}</span></p>
                            <p className="text-forest font-semibold">Cluster {pt.cluster_id}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    {Object.keys(pcaByCluster).map((cIdStr) => {
                      const cId = parseInt(cIdStr, 10);
                      return (
                        <Scatter
                          key={cId}
                          name={`Cluster ${cId}`}
                          data={pcaByCluster[cId]}
                          fill={CLUSTER_COLORS[cId % CLUSTER_COLORS.length]}
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Panel: t-SNE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>{t('pca_tsne.tsne_panel_title', 't-Distributed Stochastic Neighbor Embedding (t-SNE)')}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Non-linear manifold embedding • Perplexity: {drData.perplexity_used}
                  </p>
                </div>
                <div className="text-right text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Local Neighborhood Preserved
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="t-SNE Dimension 1"
                      stroke="#94A3B8"
                      fontSize={11}
                      label={{ value: 't-SNE Dimension 1 (Arbitrary Coordinate)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="t-SNE Dimension 2"
                      stroke="#94A3B8"
                      fontSize={11}
                      label={{ value: 't-SNE Dimension 2 (Arbitrary Coordinate)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                            <p className="font-bold text-slate-900">{pt.market}</p>
                            <p className="text-slate-500">{pt.district}, {pt.state}</p>
                            <p className="text-slate-700">Mean Price: <span className="font-semibold">₹{pt.mean_price}</span></p>
                            <p className="text-blue-700 font-semibold">Cluster {pt.cluster_id}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    {Object.keys(tsneByCluster).map((cIdStr) => {
                      const cId = parseInt(cIdStr, 10);
                      return (
                        <Scatter
                          key={cId}
                          name={`Cluster ${cId}`}
                          data={tsneByCluster[cId]}
                          fill={CLUSTER_COLORS[cId % CLUSTER_COLORS.length]}
                        />
                      );
                    })}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Feature Loadings Table (PCA Axes Interpretability) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {t('pca_tsne.feature_loadings_title', 'PCA Principal Component Feature Loadings')}
            </h3>
            <p className="text-xs text-slate-500">
              Shows how each original agricultural feature weights onto PC1 and PC2. Unlike t-SNE, PCA axes have direct mathematical interpretation.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Agricultural Feature</th>
                    <th className="py-2.5 px-3 text-right">PC1 Loading</th>
                    <th className="py-2.5 px-3 text-right">PC2 Loading</th>
                    <th className="py-2.5 px-3">Primary Alignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drData.pca_loadings.map((load) => (
                    <tr key={load.feature} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{load.feature.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">{load.pc1_loading}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-700">{load.pc2_loading}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {Math.abs(load.pc1_loading) > Math.abs(load.pc2_loading) ? 'Global Price Level' : 'Price Spread / Volatility'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Explanation Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-forest" />
              <span>{t('pca_tsne.comparison_title', 'Methodological Comparison: PCA vs. t-SNE')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Linear vs. Non-linear</p>
                <p className="leading-relaxed">
                  {t(
                    'pca_tsne.linear_vs_nonlinear',
                    'PCA is a linear orthogonal projection that maximizes total variance captured. t-SNE is a non-linear probabilistic technique tailored for preserving local pairwise affinities.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Global vs. Local Geometry</p>
                <p className="leading-relaxed">
                  {t(
                    'pca_tsne.global_vs_local',
                    'PCA preserves global Euclidean geometry, making distant points genuinely far apart in feature space. t-SNE focuses on local neighbors; inter-cluster visual distances should not be interpreted as metric distances.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">Axis Interpretability</p>
                <p className="leading-relaxed">
                  {t(
                    'pca_tsne.interpretability',
                    'PCA axes correspond directly to linear combinations of agricultural features (e.g., mean price, CV). t-SNE embedding axes possess no direct physical or economic interpretation.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
