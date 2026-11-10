import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart as LineChartIcon,
  HelpCircle,
  TrendingDown,
  Sparkles,
  BarChart2,
  ShieldCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { MetadataResponse, ClusterEvaluationResponse } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const ClusterEvaluation: React.FC = () => {
  const { t } = useTranslation();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evalData, setEvalData] = useState<ClusterEvaluationResponse | null>(null);

  const fetchEval = async (cropName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.evaluateClusters({
        commodity: cropName,
        k_min: 2,
        k_max: 6,
      });
      setEvalData(res);
    } catch (err: any) {
      setError(err.message || 'Cluster evaluation computation failed.');
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
        await fetchEval(defaultCrop);
      } catch (err: any) {
        setError(err.message || 'Initialization failed.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCrop = e.target.value;
    setCommodity(newCrop);
    fetchEval(newCrop);
  };

  if (initialLoading) return <LoadingState message="Computing multi-K evaluation metrics..." />;

  // Prepare cluster size distribution data for the suggested K
  const clusterSizeData = evalData
    ? evalData.cluster_sizes_by_k[evalData.suggested_k_elbow]?.map((count, idx) => ({
        cluster: `Cluster ${idx}`,
        markets: count,
      })) || []
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Crop Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('evaluation.title', 'Cluster Evaluation Dashboard')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'evaluation.subtitle',
              'Quantitative validation of clustering quality, separation, compactness, and stability across parameter choices.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Commodity:</label>
          <select
            value={commodity}
            onChange={handleCropChange}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
          >
            {meta?.commodities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchEval(commodity)} />}

      {evalData && (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Elbow Heuristic Suggested K</span>
                <Sparkles className="w-4 h-4 text-forest" />
              </div>
              <p className="text-3xl font-bold text-slate-900">K = {evalData.suggested_k_elbow}</p>
              <p className="text-xs text-slate-500">Point of diminishing variance returns on WCSS</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Silhouette Optimal K</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-800">K = {evalData.suggested_k_silhouette}</p>
              <p className="text-xs text-slate-500">Highest pairwise separation coefficient</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                <span>Bootstrap Stability Score</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {(evalData.cluster_stability_score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">Adjusted Rand Index across 85% subsamples</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Elbow Curve (Inertia) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('evaluation.inertia_title', 'Elbow Curve: Inertia vs. Number of Clusters (K)')}
                </h3>
                <p className="text-xs text-slate-500">Within-Cluster Sum of Squares (Lower is tighter)</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evalData.k_points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="k" stroke="#94A3B8" fontSize={11} label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v.toFixed(0)}`} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Inertia (WCSS)']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inertia"
                      stroke="#15803D"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#15803D' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Silhouette Coefficient vs K */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('evaluation.silhouette_title', 'Silhouette Coefficient vs. K')}
                </h3>
                <p className="text-xs text-slate-500">Scores closer to +1 signify superior boundary separation</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evalData.k_points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="k" stroke="#94A3B8" fontSize={11} label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[-0.2, 1]} tickFormatter={(v) => v.toFixed(2)} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Silhouette Coefficient']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="silhouette_score"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2563EB' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Davies-Bouldin Index vs K */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('evaluation.db_title', 'Davies–Bouldin Index vs. K')}
                </h3>
                <p className="text-xs text-slate-500">Lower scores indicate tighter and better-separated clusters</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evalData.k_points}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="k" stroke="#94A3B8" fontSize={11} label={{ value: 'Number of Clusters (K)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => v.toFixed(2)} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Davies–Bouldin Index']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="davies_bouldin_index"
                      stroke="#D97706"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#D97706' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Cluster Size Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('evaluation.size_dist_title', 'Cluster Size Balance')} (at K = {evalData.suggested_k_elbow})
                </h3>
                <p className="text-xs text-slate-500">Number of mandis assigned to each cluster</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clusterSizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="cluster" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [val, 'Mandis']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="markets" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Plain-Language Explanations Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <HelpCircle className="w-5 h-5 text-forest" />
              <h3 className="text-base font-bold text-slate-900">
                {t('evaluation.plain_explanation_title', 'Understanding the Metrics')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Silhouette Score
                </p>
                <p className="leading-relaxed">
                  {t(
                    'evaluation.silhouette_desc',
                    'Silhouette Score measures how closely each market aligns with its own cluster versus neighboring clusters (-1 to +1). Values closer to +1 represent superior separation.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Davies–Bouldin Index
                </p>
                <p className="leading-relaxed">
                  {t(
                    'evaluation.db_desc',
                    'Davies–Bouldin Index evaluates the ratio of within-cluster scatter to between-cluster separation. Lower scores indicate tighter, better-separated clusters.'
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-forest"></span>
                  Elbow Method Heuristic
                </p>
                <p className="leading-relaxed">
                  {t(
                    'evaluation.elbow_desc',
                    "Inertia (Within-Cluster Sum of Squares) naturally decreases as K increases. The 'elbow point' marks where adding another cluster yields diminishing returns in variance reduction."
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Cluster Stability Analysis
                </p>
                <p className="leading-relaxed">
                  {t(
                    'evaluation.stability_desc',
                    'Cluster Stability evaluates whether cluster assignments remain consistent when subsampling 85% of markets over repeated bootstrap iterations.'
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
