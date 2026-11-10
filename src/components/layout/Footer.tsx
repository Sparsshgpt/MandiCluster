import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Database, GitBranch, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">MandiCluster</span>
            </div>
            <p className="text-slate-500 leading-relaxed max-w-md text-xs sm:text-sm">
              Agricultural market segmentation and price-pattern intelligence platform. Applying unsupervised machine learning to uncover price behaviors, evaluate mandi clusters, identify outliers, and support farmer decision making.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
              <Database className="w-3.5 h-3.5 text-forest" />
              <span>Data source: AGMARKNET / Open Government Data (OGD) Platform India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Platform Modules</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link to="/market-analysis" className="hover:text-forest transition-colors">
                  {t('nav.market_analysis', 'Market Analysis')}
                </Link>
              </li>
              <li>
                <Link to="/clustering" className="hover:text-forest transition-colors">
                  {t('nav.clustering', 'Clustering Pipeline')}
                </Link>
              </li>
              <li>
                <Link to="/insights/cluster-evaluation" className="hover:text-forest transition-colors">
                  {t('nav.cluster_evaluation', 'Cluster Evaluation (Elbow & Silhouette)')}
                </Link>
              </li>
              <li>
                <Link to="/insights/pca-vs-tsne" className="hover:text-forest transition-colors">
                  {t('nav.pca_vs_tsne', 'PCA vs. t-SNE Projections')}
                </Link>
              </li>
              <li>
                <Link to="/insights/anomaly-detection" className="hover:text-forest transition-colors">
                  {t('nav.anomaly_detection', 'Anomaly Detection (Isolation Forest)')}
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-forest transition-colors">
                  {t('nav.recommendations', 'Logistics Net Calculator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Methodology & Ethics</p>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>
                <Link to="/about" className="hover:text-forest transition-colors">
                  Analytical Methodology
                </Link>
              </li>
              <li>
                <Link to="/about#provenance" className="hover:text-forest transition-colors">
                  Data Provenance & Cleaning
                </Link>
              </li>
              <li>
                <Link to="/about#limitations" className="hover:text-forest transition-colors">
                  Known Limitations
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                Supports all 22 scheduled Indian languages with native scripts & RTL support.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 MandiCluster. Open Agricultural Intelligence for Smallholder Farmers.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              Verified Decision Support
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
