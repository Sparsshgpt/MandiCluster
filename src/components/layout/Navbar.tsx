import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  BarChart3,
  Network,
  Cpu,
  Calculator,
  Info,
  ChevronDown,
  UploadCloud,
  Menu,
  X,
  ScatterChart,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import { UploadModal } from '../common/UploadModal';
import { ValidationReport } from '../../types';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isInsightsActive = location.pathname.startsWith('/insights');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-forest bg-emerald-50 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'text-forest bg-emerald-50 font-semibold'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  const handleUploadSuccess = (_report: ValidationReport) => {
    // Optionally trigger refresh across app
    window.dispatchEvent(new CustomEvent('mandicluster_data_updated'));
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group" onClick={closeMobile}>
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  Mandi<span className="text-forest">Cluster</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">Agri Market Intelligence</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <NavLink to="/" className={navLinkClass}>
                {t('nav.home', 'Home')}
              </NavLink>

              <NavLink to="/market-analysis" className={navLinkClass}>
                <BarChart3 className="w-4 h-4 text-slate-400" />
                {t('nav.market_analysis', 'Market Analysis')}
              </NavLink>

              <NavLink to="/clustering" className={navLinkClass}>
                <Network className="w-4 h-4 text-slate-400" />
                {t('nav.clustering', 'Clustering')}
              </NavLink>

              {/* ML Insights Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    isInsightsActive
                      ? 'text-forest bg-emerald-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-slate-400" />
                  <span>{t('nav.ml_insights', 'ML Insights')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 border border-slate-200 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    <NavLink
                      to="/insights/cluster-evaluation"
                      onClick={() => setDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-emerald-50 text-forest font-semibold' : 'text-slate-700'
                        }`
                      }
                    >
                      <LineChart className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">{t('nav.cluster_evaluation', 'Cluster Evaluation')}</p>
                        <p className="text-[11px] text-slate-500">Inertia, Silhouette, Davies-Bouldin</p>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/insights/pca-vs-tsne"
                      onClick={() => setDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-emerald-50 text-forest font-semibold' : 'text-slate-700'
                        }`
                      }
                    >
                      <ScatterChart className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">{t('nav.pca_vs_tsne', 'PCA vs. t-SNE')}</p>
                        <p className="text-[11px] text-slate-500">Linear vs Non-linear Embedding</p>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/insights/anomaly-detection"
                      onClick={() => setDropdownOpen(false)}
                      className={({ isActive }) =>
                        `flex items-start gap-2.5 px-3.5 py-2.5 text-xs sm:text-sm hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-emerald-50 text-forest font-semibold' : 'text-slate-700'
                        }`
                      }
                    >
                      <ShieldAlert className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">{t('nav.anomaly_detection', 'Anomaly Detection')}</p>
                        <p className="text-[11px] text-slate-500">Isolation Forest & LOF</p>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink to="/recommendations" className={navLinkClass}>
                <Calculator className="w-4 h-4 text-slate-400" />
                {t('nav.recommendations', 'Recommendations')}
              </NavLink>

              <NavLink to="/about" className={navLinkClass}>
                <Info className="w-4 h-4 text-slate-400" />
                {t('nav.about', 'About')}
              </NavLink>
            </nav>

            {/* Right Tools (Language + Upload + Mobile trigger) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-forest bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                title="Upload custom mandi CSV"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{t('nav.upload_csv', 'Upload CSV')}</span>
              </button>

              <LanguageSelector />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            <NavLink to="/" onClick={closeMobile} className={mobileNavLinkClass}>
              {t('nav.home', 'Home')}
            </NavLink>
            <NavLink to="/market-analysis" onClick={closeMobile} className={mobileNavLinkClass}>
              <BarChart3 className="w-4 h-4 text-slate-400" />
              {t('nav.market_analysis', 'Market Analysis')}
            </NavLink>
            <NavLink to="/clustering" onClick={closeMobile} className={mobileNavLinkClass}>
              <Network className="w-4 h-4 text-slate-400" />
              {t('nav.clustering', 'Clustering')}
            </NavLink>

            <div className="pt-1 pb-1">
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('nav.ml_insights', 'ML Insights')}
              </p>
              <div className="mt-1 space-y-0.5 pl-2">
                <NavLink to="/insights/cluster-evaluation" onClick={closeMobile} className={mobileNavLinkClass}>
                  <LineChart className="w-4 h-4 text-forest" />
                  {t('nav.cluster_evaluation', 'Cluster Evaluation')}
                </NavLink>
                <NavLink to="/insights/pca-vs-tsne" onClick={closeMobile} className={mobileNavLinkClass}>
                  <ScatterChart className="w-4 h-4 text-forest" />
                  {t('nav.pca_vs_tsne', 'PCA vs. t-SNE')}
                </NavLink>
                <NavLink to="/insights/anomaly-detection" onClick={closeMobile} className={mobileNavLinkClass}>
                  <ShieldAlert className="w-4 h-4 text-forest" />
                  {t('nav.anomaly_detection', 'Anomaly Detection')}
                </NavLink>
              </div>
            </div>

            <NavLink to="/recommendations" onClick={closeMobile} className={mobileNavLinkClass}>
              <Calculator className="w-4 h-4 text-slate-400" />
              {t('nav.recommendations', 'Recommendations')}
            </NavLink>

            <NavLink to="/about" onClick={closeMobile} className={mobileNavLinkClass}>
              <Info className="w-4 h-4 text-slate-400" />
              {t('nav.about', 'About')}
            </NavLink>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  setUploadModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-forest bg-emerald-50 border border-emerald-200 rounded-lg"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{t('nav.upload_csv', 'Upload Custom Dataset')}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
};
