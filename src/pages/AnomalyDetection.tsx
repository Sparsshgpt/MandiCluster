import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  TrendingUp,
  Info,
  Calendar,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { MetadataResponse, AnomalyDetectionResponse, AnomalyDetectionRequest } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const AnomalyDetection: React.FC = () => {
  const { t } = useTranslation();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [market, setMarket] = useState<string>('Khanna');
  const [algorithm, setAlgorithm] = useState<string>('isolation_forest');
  const [contamination, setContamination] = useState<number>(0.05);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyDetectionResponse | null>(null);

  const availableMarketsForCrop = meta
    ? meta.states.flatMap((st) =>
        meta.districts_by_state[st]?.flatMap((dist) => meta.markets_by_district[dist] || []) || []
      )
    : [];

  const runDetection = async (c: string, m: string, algo: string, cont: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runAnomalyDetection({
        commodity: c,
        market: m,
        algorithm: algo,
        contamination: cont,
      });
      setAnomalyData(res);
    } catch (err: any) {
      setError(err.message || 'Anomaly detection failed.');
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
        await runDetection(defaultCrop, 'Khanna', 'isolation_forest', 0.05);
      } catch (err: any) {
        setError(err.message || 'Initialization failed.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleRun = () => {
    runDetection(commodity, market, algorithm, contamination);
  };

  if (initialLoading) return <LoadingState message="Initializing anomaly detection models..." />;

  // Chart data formatting: add anomaly_dot only for flagged points
  const chartData = anomalyData
    ? anomalyData.time_series.map((pt) => ({
        date: pt.date,
        modal_price: pt.modal_price,
        anomaly_price: pt.is_anomaly ? pt.modal_price : null,
        deviation: pt.deviation_from_mean_percent,
        score: pt.anomaly_score,
        is_anomaly: pt.is_anomaly,
      }))
    : [];

  const flaggedList = anomalyData ? anomalyData.time_series.filter((pt) => pt.is_anomaly) : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('anomaly.title', 'Statistical Anomaly & Outlier Detection')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            'anomaly.subtitle',
            'Identify atypical market observations in historical price trajectories using unsupervised anomaly algorithms.'
          )}
        </p>
      </div>

      {/* Configuration Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest" />
              <span>Commodity / Crop:</span>
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>{t('anomaly.mandi_selector', 'Select Mandi')}:</span>
            </label>
            <input
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="e.g. Khanna, Lasalgaon, Agra..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-forest" />
              <span>{t('anomaly.algorithm', 'Anomaly Detection Model')}:</span>
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="isolation_forest">Isolation Forest (Tree-Based)</option>
              <option value="lof">Local Outlier Factor (Density-Based)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Contamination: {(contamination * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min={0.02}
              max={0.15}
              step={0.01}
              value={contamination}
              onChange={(e) => setContamination(parseFloat(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Conservative (2%)</span>
              <span>Default (5%)</span>
              <span>Sensitive (15%)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={handleRun}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-forest hover:bg-forest-hover rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Analyzing Observations...' : 'Run Anomaly Detection'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={handleRun} />}

      {anomalyData && (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Total Observations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{anomalyData.total_observations}</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <p className="text-[11px] text-amber-800 uppercase font-semibold">Flagged Observations</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{anomalyData.flagged_observations_count}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Historical Mean</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{anomalyData.historical_mean_price.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <p className="text-[11px] text-slate-500 uppercase font-semibold">Historical Std Dev</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{anomalyData.historical_std_dev}</p>
            </div>
          </div>

          {/* Time Series Chart with Highlighted Anomalies */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {t('anomaly.chart_title', 'Historical Modal Price with Flagged Observations')}
                </h3>
                <p className="text-xs text-slate-500">
                  {anomalyData.market} ({anomalyData.commodity}) • Green line shows modal price, amber dots highlight flagged observations
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                Model: {anomalyData.algorithm}
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                  <YAxis stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1">
                          <p className="font-bold text-slate-900">Date: {pt.date}</p>
                          <p className="text-slate-700">Modal Price: <span className="font-semibold">₹{pt.modal_price}</span></p>
                          {pt.is_anomaly && (
                            <div className="mt-1 pt-1 border-t border-slate-100 text-amber-700 font-medium">
                              <p>⚠️ Flagged Observation</p>
                              <p>Deviation: {pt.deviation}%</p>
                              <p>Outlier Score: {pt.score}</p>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="modal_price"
                    name="Reported Modal Price"
                    stroke="#15803D"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Scatter
                    dataKey="anomaly_price"
                    name="Flagged Observation (Outlier)"
                    fill="#D97706"
                    shape="circle"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Neutral Educational Notice */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-950">Important Analytical Notice</p>
              <p className="leading-relaxed text-amber-900/90">
                {t(
                  'anomaly.neutral_notice',
                  'A flagged observation is a statistical deviation from the model baseline. It is not evidence of fraud, incorrect data, or manipulation. Common causes include unseasonal rains, harvest arrival spikes, transport disruptions, or local festival demand surges.'
                )}
              </p>
            </div>
          </div>

          {/* Flagged Observations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t('anomaly.table_title', 'Flagged Observations Detail')}
              </h3>
              <p className="text-xs text-slate-500">
                Detailed contextual review of flagged time-series points
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('anomaly.date', 'Date')}</th>
                    <th className="py-3 px-4 text-right">{t('anomaly.modal_price', 'Observed Price')}</th>
                    <th className="py-3 px-4 text-right">Historical Mean</th>
                    <th className="py-3 px-4 text-right">{t('anomaly.deviation', 'Deviation')}</th>
                    <th className="py-3 px-4 text-right">Outlier Score</th>
                    <th className="py-3 px-4">{t('anomaly.explanation', 'Contextual Assessment')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flaggedList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No observations flagged at {contamination * 100}% sensitivity.
                      </td>
                    </tr>
                  ) : (
                    flaggedList.map((pt, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">{pt.date}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{pt.modal_price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500">
                          ₹{anomalyData.historical_mean_price.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700">
                          {pt.deviation_from_mean_percent > 0 ? `+${pt.deviation_from_mean_percent}%` : `${pt.deviation_from_mean_percent}%`}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono text-xs">
                          {pt.anomaly_score}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs max-w-sm">
                          {pt.neutral_explanation}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
