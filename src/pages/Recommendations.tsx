import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  Truck,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  Scale,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { MetadataResponse, RecommendationResponse, RecommendationRequest } from '../types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const Recommendations: React.FC = () => {
  const { t } = useTranslation();
  const [meta, setMeta] = useState<MetadataResponse | null>(null);
  const [commodity, setCommodity] = useState<string>('Wheat');
  const [state, setState] = useState<string>('Punjab');
  const [originMarket, setOriginMarket] = useState<string>('Khanna');
  const [quantity, setQuantity] = useState<number>(50);
  const [vehicleType, setVehicleType] = useState<string>('pickup_truck');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recData, setRecData] = useState<RecommendationResponse | null>(null);

  const calculateRecommendations = async (c: string, st: string, origin: string, q: number, v: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRecommendations({
        commodity: c,
        state: st,
        origin_market: origin,
        quantity_quintals: q,
        vehicle_type: v,
      });
      setRecData(res);
    } catch (err: any) {
      setError(err.message || 'Recommendation calculation failed.');
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
        await calculateRecommendations(defaultCrop, 'Punjab', 'Khanna', 50, 'pickup_truck');
      } catch (err: any) {
        setError(err.message || 'Initialization failed.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculateRecommendations(commodity, state, originMarket, quantity, vehicleType);
  };

  if (initialLoading) return <LoadingState message="Initializing agricultural logistics calculator..." />;

  // Get top advantage destination (if not origin)
  const topAlternative = recData?.recommendations.find((r) => !r.is_origin && r.difference_vs_local_total > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('recommendations.title', 'Market Comparison & Logistics Net Calculator')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t(
            'recommendations.subtitle',
            'Empowering farmers to compare potential destination mandis by calculating net proceeds after actual road transport costs.'
          )}
        </p>
      </div>

      {/* Calculator Input Form */}
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Calculator className="w-4 h-4 text-forest" />
          <span>{t('recommendations.form_title', 'Produce & Logistics Parameters')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Commodity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-forest" />
              <span>{t('recommendations.crop', 'Commodity / Crop')}</span>
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

          {/* Origin State */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>Origin State</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              {meta?.states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Origin Mandi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest" />
              <span>{t('recommendations.origin_market', 'Origin / Local Mandi')}</span>
            </label>
            <input
              type="text"
              value={originMarket}
              onChange={(e) => setOriginMarket(e.target.value)}
              placeholder="e.g. Khanna, Karnal"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Selling Quantity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-forest" />
              <span>{t('recommendations.quantity', 'Quantity (Quintals)')}</span>
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            />
          </div>

          {/* Vehicle Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-forest" />
              <span>{t('recommendations.vehicle_type', 'Transport Vehicle')}</span>
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="mini_truck">Mini Truck (1.5T / 15 Qtl)</option>
              <option value="pickup_truck">Pickup Truck (2.5T / 25 Qtl)</option>
              <option value="medium_truck">Medium Commercial (7T / 70 Qtl)</option>
              <option value="heavy_truck">Heavy Truck (16T / 160 Qtl)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Formula: Estimated Net Price = Modal Price - Transport Cost / Quintal
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-forest hover:bg-forest-hover shadow-sm transition-colors disabled:opacity-50"
          >
            <Calculator className="w-4 h-4" />
            <span>{loading ? 'Calculating Logistics...' : t('recommendations.calculate_button', 'Compute Destination Net Proceeds')}</span>
          </button>
        </div>
      </form>

      {error && <ErrorMessage message={error} onRetry={() => calculateRecommendations(commodity, state, originMarket, quantity, vehicleType)} />}

      {recData && (
        <div className="space-y-6">
          {/* Top Recommendation Highlight Card */}
          {topAlternative ? (
            <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 p-6 rounded-2xl border border-emerald-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Optimal Destination Found</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Transporting to {topAlternative.market} ({topAlternative.district}, {topAlternative.state}) yields +₹{topAlternative.difference_vs_local_total.toLocaleString('en-IN')} net gain
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  After accounting for ~₹{topAlternative.estimated_transport_cost_total.toLocaleString('en-IN')} total round-trip transport over {topAlternative.distance_km} km, selling {quantity} quintals at {topAlternative.market} generates higher net returns compared to selling locally at {originMarket}.
                </p>
              </div>

              <div className="text-left md:text-right bg-white p-4 rounded-xl border border-emerald-100 shadow-xs flex-shrink-0">
                <p className="text-xs text-slate-500 font-medium">Estimated Net Proceeds</p>
                <p className="text-2xl font-extrabold text-forest">₹{topAlternative.estimated_total_proceeds.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-semibold text-emerald-700">₹{topAlternative.estimated_net_price_per_quintal} / Quintal Net</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">Local Market is Cost-Optimal</p>
              <p>
                Selling locally at {originMarket} generates the highest net proceeds once transport costs to neighboring mandis are deducted.
              </p>
            </div>
          )}

          {/* Results Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('recommendations.results_title', 'Destination Mandi Comparison Ranking')}
                </h3>
                <p className="text-xs text-slate-500">
                  Ranked by Estimated Total Net Proceeds for {quantity} Quintals of {commodity}
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Vehicle: {recData.vehicle_type} (~₹{recData.cost_per_km_assumed}/km)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('recommendations.rank', 'Rank')}</th>
                    <th className="py-3 px-4">{t('recommendations.market', 'Mandi')}</th>
                    <th className="py-3 px-4">{t('recommendations.district_state', 'District / State')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.reported_price', 'Reported Price')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.distance', 'Distance')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.transport_cost_qtl', 'Freight / Qtl')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.net_price_qtl', 'Net Price / Qtl')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.total_net_proceeds', 'Total Net Proceeds')}</th>
                    <th className="py-3 px-4 text-right">{t('recommendations.diff_vs_local', 'Advantage vs Local')}</th>
                    <th className="py-3 px-4">{t('recommendations.freshness', 'Freshness')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recData.recommendations.map((item) => {
                    const isPositive = item.difference_vs_local_total > 0;
                    return (
                      <tr
                        key={item.market}
                        className={`transition-colors ${
                          item.is_origin ? 'bg-slate-50/80 font-medium' : isPositive ? 'hover:bg-emerald-50/40' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            item.rank === 1 ? 'bg-forest text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{item.market}</span>
                            {item.is_origin && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-bold uppercase">
                                {t('recommendations.origin_badge', 'Local')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.district}, {item.state}</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800">₹{item.reported_modal_price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{item.distance_km} km</td>
                        <td className="py-3 px-4 text-right text-slate-600">₹{item.estimated_transport_cost_per_quintal}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₹{item.estimated_net_price_per_quintal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-forest">
                          ₹{item.estimated_total_proceeds.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-bold">
                          {item.is_origin ? (
                            <span className="text-slate-400">Baseline</span>
                          ) : isPositive ? (
                            <span className="text-emerald-700">+₹{item.difference_vs_local_total.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-red-600">-₹{Math.abs(item.difference_vs_local_total).toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded ${
                            item.is_fresh_data ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {item.freshness_note}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Decision Support Disclaimer Notice */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{t('recommendations.disclaimer_title', 'Decision Support Notice')}</span>
              </p>
              <p className="leading-relaxed">
                {t(
                  'recommendations.disclaimer_text',
                  'This calculator provides decision-support estimates using published AGMARKNET prices and road transport approximations. It does not provide guaranteed financial quotes or guaranteed purchasing commitments. Prices fluctuate daily at mandi auctions.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
