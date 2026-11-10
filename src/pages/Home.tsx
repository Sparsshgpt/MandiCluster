import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  BarChart3,
  Network,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Database,
  Wheat,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { MarketSummaryResponse, MetadataResponse } from '../types';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

const PIE_COLORS = ['#15803D', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC', '#A7F3D0', '#0D9488', '#059669'];

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [summary, setSummary] = useState<MarketSummaryResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [metaData, summaryData] = await Promise.all([
        api.getMetadata(),
        api.getMarketSummary({ commodity: 'Wheat' }),
      ]);
      setMeta(metaData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to MandiCluster analytics API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('mandicluster_data_updated', handleUpdate);
    return () => window.removeEventListener('mandicluster_data_updated', handleUpdate);
  }, []);

  if (loading) return <LoadingState message="Loading agricultural intelligence metrics..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!meta || !summary) return null;

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-forest text-xs font-semibold">
              <Wheat className="w-3.5 h-3.5" />
              <span>AI & ML Market Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Mandi<span className="text-forest">Cluster</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium text-forest-dark leading-snug">
              {t('tagline', 'Discover Markets. Understand Prices. Make Informed Decisions.')}
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {t(
                'hero_desc',
                'MandiCluster applies unsupervised machine learning to analyze agricultural market data, discover similar price patterns, identify unusual observations, and help farmers compare potential selling destinations.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/market-analysis"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-forest hover:bg-forest-hover shadow-sm hover:shadow transition-all"
              >
                <span>{t('explore_market', 'Explore Market Analysis')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/clustering"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-forest bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
              >
                <Network className="w-4 h-4" />
                <span>{t('explore_clustering', 'Explore Clustering')}</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-xs p-5 bg-gradient-to-br from-emerald-50/70 to-slate-50 rounded-2xl border border-emerald-100 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest">
                <Sprout className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">National Mandi Insights</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyzing AGMARKNET modal rates across key northern, central & southern agricultural trading centers.
              </p>
              <div className="pt-2 text-[11px] text-emerald-800 font-medium">
                Standardized in ₹ / Quintal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('summary_cards.markets_analyzed', 'Markets Analyzed')}
          value={meta.provenance.unique_markets}
          subtitle={`Across ${meta.states.length} Major States`}
          icon={MapPin}
          badge="Verified Mandis"
          badgeColor="green"
        />
        <StatCard
          title={t('summary_cards.crops_available', 'Crops Available')}
          value={meta.commodities.length}
          subtitle="Wheat, Paddy, Mustard, Cotton & more"
          icon={Layers}
          badge="Standard Commodities"
          badgeColor="blue"
        />
        <StatCard
          title={t('summary_cards.clusters_identified', 'Clusters Identified')}
          value="3 - 5"
          subtitle="K-Means & DBSCAN Segmentation"
          icon={Network}
          badge="ML Grouping"
          badgeColor="amber"
        />
        <StatCard
          title={t('summary_cards.latest_date', 'Latest Market Date')}
          value={meta.max_date}
          subtitle={`From ${meta.min_date}`}
          icon={Calendar}
          badge={meta.provenance.is_sample_data ? 'Verified Sample Data' : 'Live Dataset'}
          badgeColor="slate"
        />
      </section>

      {/* Main Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Price Trend */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('market_analysis.price_trend_title', 'Historical Modal Price Trend (₹ / Quintal)')}
              </h3>
              <p className="text-xs text-slate-500">Commodity: Wheat (12-Month Window)</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-forest">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.price_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${value}`, 'Avg Modal Price']}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_modal_price"
                  stroke="#15803D"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#15803D' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ranking by Market */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('market_analysis.ranking_title', 'Average Modal Price Ranking by Mandi')}
              </h3>
              <p className="text-xs text-slate-500">Top Trading Mandis for Wheat</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-forest">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.ranking_by_market.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="market" type="category" stroke="#94A3B8" fontSize={11} width={85} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Mean Modal Price']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="avg_modal_price" fill="#15803D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Commodity Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Commodity Observation Distribution
              </h3>
              <p className="text-xs text-slate-500">Relative coverage across commodities in dataset</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-forest">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.commodity_distribution}
                  dataKey="observations"
                  nameKey="commodity"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {summary.commodity_distribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [val, 'Observations']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Price Variability (CV %) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t('market_analysis.variability_title', 'Market Price Variability (CV %)')}
              </h3>
              <p className="text-xs text-slate-500">Coefficient of Variation across reporting mandis</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-forest">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.variability_by_market.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="market" stroke="#94A3B8" fontSize={11} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Coefficient of Variation']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="cv_percent" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Observations Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Mandi Observations</h3>
            <p className="text-xs text-slate-500">
              Latest actual reported records from {meta.provenance.source}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            <Database className="w-3.5 h-3.5 text-forest" />
            <span>Updated: {meta.max_date}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Crop</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4 text-right">Modal Price</th>
                <th className="py-3 px-4 text-right">Arrivals (T)</th>
                <th className="py-3 px-4">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.recent_observations.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">{row.Date}</td>
                  <td className="py-3 px-4 font-medium text-forest">{row.Commodity}</td>
                  <td className="py-3 px-4 text-slate-600">{row.State}</td>
                  <td className="py-3 px-4 text-slate-600">{row.District}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.Market}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{row.Modal_Price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {row.Arrivals_Tonnes || 0}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">{row.Unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
