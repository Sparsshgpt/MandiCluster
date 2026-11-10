import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Truck,
  CheckSquare,
  Square,
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
import { MetadataResponse, MarketCompareResponse } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';

const LINE_COLORS = ['#15803D', '#2563EB', '#D97706', '#7C3AED', '#DC2626', '#0D9488'];

export const MarketAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<MetadataResponse | null>(null);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [datePreset, setDatePreset] = useState<string>('12m'); // '6m', '12m', 'all'
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<MarketCompareResponse | null>(null);

  // Load Metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const metadata = await api.getMetadata();
        setMeta(metadata);
        if (metadata.commodities.length > 0) {
          setSelectedCrop(metadata.commodities[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load agricultural metadata.');
      }
    };
    fetchMeta();
  }, []);

  // Compute date range from preset
  const getDateRange = () => {
    if (!meta) return { start: undefined, end: undefined };
    const maxDt = new Date(meta.max_date);
    if (datePreset === '6m') {
      const minDt = new Date(maxDt);
      minDt.setMonth(minDt.getMonth() - 6);
      return { start: minDt.toISOString().slice(0, 10), end: meta.max_date };
    }
    if (datePreset === '12m') {
      const minDt = new Date(maxDt);
      minDt.setMonth(minDt.getMonth() - 12);
      return { start: minDt.toISOString().slice(0, 10), end: meta.max_date };
    }
    return { start: meta.min_date, end: meta.max_date };
  };

  // Run market compare query
  const runComparison = async () => {
    if (!meta) return;
    setLoading(true);
    setError(null);
    try {
      const { start, end } = getDateRange();
      const res = await api.compareMarkets({
        commodity: selectedCrop,
        markets: selectedMarkets,
        start_date: start,
        end_date: end,
      });
      setCompareData(res);
      // Auto-select first 3 markets if none selected
      if (selectedMarkets.length === 0 && res.markets.length > 0) {
        setSelectedMarkets(res.markets.slice(0, 3).map((m) => m.market));
      }
    } catch (err: any) {
      setError(err.message || 'Market comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meta) {
      runComparison();
    }
  }, [meta, selectedCrop, selectedState, datePreset]);

  // Handle market toggle
  const toggleMarket = (marketName: string) => {
    if (selectedMarkets.includes(marketName)) {
      if (selectedMarkets.length > 1) {
        setSelectedMarkets(selectedMarkets.filter((m) => m !== marketName));
      }
    } else {
      if (selectedMarkets.length < 5) {
        setSelectedMarkets([...selectedMarkets, marketName]);
      }
    }
  };

  // Export filtered data as CSV
  const exportCsv = () => {
    if (!compareData || compareData.markets.length === 0) return;
    const headers = [
      'Market',
      'State',
      'District',
      'Average Modal Price (INR/Qtl)',
      'Min Price',
      'Max Price',
      'Std Deviation',
      'Coefficient of Variation (%)',
      'Average Arrivals (Tonnes)',
      'Latest Observation Date',
      'Latest Modal Price',
    ];
    const rows = compareData.markets.map((m) => [
      `"${m.market}"`,
      `"${m.state}"`,
      `"${m.district}"`,
      m.avg_modal_price,
      m.min_price,
      m.max_price,
      m.std_dev,
      m.coefficient_of_variation,
      m.avg_arrivals,
      `"${m.latest_date}"`,
      m.latest_modal_price,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mandicluster_${selectedCrop.toLowerCase()}_comparison.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !meta) return <LoadingState message="Loading market comparison filters..." />;
  if (error && !compareData) return <ErrorMessage message={error} onRetry={runComparison} />;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('market_analysis.title', 'Agricultural Market Price Analysis')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t(
              'market_analysis.subtitle',
              'Analyze historical price trajectories, compare mandi variations, and inspect seasonal arrivals across major agricultural centers.'
            )}
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!compareData || compareData.markets.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-forest" />
          <span>{t('market_analysis.export_csv', 'Export Filtered CSV')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-forest" />
          <span>Market Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Crop Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest" />
              <span>{t('market_analysis.crop', 'Commodity / Crop')}</span>
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setSelectedMarkets([]);
              }}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {meta?.commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* State Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>{t('market_analysis.state', 'State')}</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
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

          {/* Date Window Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest" />
              <span>{t('market_analysis.date_presets', 'Date Window')}</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setDatePreset('6m')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  datePreset === '6m' ? 'bg-white text-forest font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6M
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('12m')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  datePreset === '12m' ? 'bg-white text-forest font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12M
              </button>
              <button
                type="button"
                onClick={() => setDatePreset('all')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  datePreset === 'all' ? 'bg-white text-forest font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Multi-mandi Selection Chips */}
        {compareData && compareData.markets.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              {t('market_analysis.compare_markets', 'Select Mandis to Compare on Charts')} (Max 5):
            </p>
            <div className="flex flex-wrap gap-2">
              {compareData.markets.map((m) => {
                const isSelected = selectedMarkets.includes(m.market);
                return (
                  <button
                    key={m.market}
                    type="button"
                    onClick={() => toggleMarket(m.market)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-forest" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{m.market}</span>
                    <span className="text-[10px] text-slate-400">({m.state})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {(!compareData || compareData.markets.length === 0) && (
        <EmptyState
          title="No Market Records Found"
          description={t(
            'market_analysis.empty_state',
            'No market observations match your selected filters. Please adjust the crop or date range.'
          )}
        />
      )}

      {/* Main Charts */}
      {compareData && compareData.markets.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Historical Modal Price Trend Comparison */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('market_analysis.price_trend_title', 'Historical Modal Price Trend (₹ / Quintal)')}
                  </h3>
                  <p className="text-xs text-slate-500">Mandi comparison for {selectedCrop}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-forest" />
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={compareData.time_series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => val.slice(5)} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${val}`, name.replace('_price', '')]}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    {selectedMarkets.map((m, idx) => (
                      <Line
                        key={m}
                        type="monotone"
                        dataKey={`${m}_price`}
                        name={m}
                        stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Average Price Ranking */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('market_analysis.ranking_title', 'Average Modal Price Ranking')}
                  </h3>
                  <p className="text-xs text-slate-500">Mean modal rate comparison</p>
                </div>
                <BarChart3 className="w-4 h-4 text-forest" />
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.markets} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={['dataMin - 150', 'dataMax + 100']} tickFormatter={(v) => `₹${v}`} />
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

            {/* Chart 3: Price Variability (CV %) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('market_analysis.variability_title', 'Price Variability (Coefficient of Variation %)')}
                  </h3>
                  <p className="text-xs text-slate-500">Volatility index across mandis</p>
                </div>
                <TrendingUp className="w-4 h-4 text-forest" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.markets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="market" stroke="#94A3B8" fontSize={11} interval={0} angle={-20} textAnchor="end" height={45} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Coeff of Variation']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="coefficient_of_variation" fill="#D97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Arrivals Comparison */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {t('market_analysis.arrivals_title', 'Market Arrivals (Average Tonnes)')}
                  </h3>
                  <p className="text-xs text-slate-500">Trading volume comparison</p>
                </div>
                <Truck className="w-4 h-4 text-forest" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compareData.markets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="market" stroke="#94A3B8" fontSize={11} interval={0} angle={-20} textAnchor="end" height={45} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v}T`} />
                    <Tooltip
                      formatter={(val: any) => [`${val} Tonnes`, 'Average Daily Arrivals']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="avg_arrivals" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Market Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {t('market_analysis.table_title', 'Market Metrics Summary Table')}
              </h3>
              <p className="text-xs text-slate-500">
                Summary statistics in INR / Quintal for {selectedCrop}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4">State</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.avg_modal_price', 'Avg Modal Price')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.min_price', 'Min Price')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.max_price', 'Max Price')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.std_dev', 'Std Dev')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.cv', 'CV %')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.avg_arrivals', 'Avg Arrivals')}</th>
                    <th className="py-3 px-4 text-right">{t('market_analysis.latest_obs', 'Latest Date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compareData.markets.map((row) => (
                    <tr key={row.market} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.market}</td>
                      <td className="py-3 px-4 text-slate-600">{row.state}</td>
                      <td className="py-3 px-4 text-slate-600">{row.district}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{row.avg_modal_price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{row.min_price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{row.max_price.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-slate-600">₹{row.std_dev}</td>
                      <td className="py-3 px-4 text-right font-medium text-amber-700">{row.coefficient_of_variation}%</td>
                      <td className="py-3 px-4 text-right text-slate-600">{row.avg_arrivals} T</td>
                      <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">{row.latest_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
