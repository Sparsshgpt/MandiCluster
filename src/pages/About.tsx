import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  BrainCircuit,
  Network,
  Activity,
  Layers,
  ShieldCheck,
  Cpu,
  BarChart2,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-10 pb-16 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-forest text-xs font-semibold">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>College ML Project Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('about.title', 'About MandiCluster')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(
            'about.subtitle',
            'An Unsupervised Machine Learning Platform for Agricultural Market Intelligence, Price Pattern Clustering, Outlier Detection, and Farmer Decision Support.'
          )}
        </p>
      </div>

      {/* Core Objectives */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-forest" />
          <span>{t('about.problem_title', 'Problem Statement & Project Objectives')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-900">The Smallholder Dilemma</h3>
            <p>
              Smallholder farmers in India often sell their harvest at immediate local mandis without knowing whether nearby markets are offering significantly higher rates. Mandi prices vary due to local demand, arrivals, and regional supply shocks.
            </p>
          </div>
          <div className="space-y-2 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
            <h3 className="font-bold text-slate-900">Unsupervised Learning Solution</h3>
            <p>
              Without requiring labeled training data, MandiCluster groups agricultural markets having similar price levels and volatility patterns, detects historical price anomalies, and computes net proceeds after freight costs.
            </p>
          </div>
        </div>
      </section>

      {/* Unsupervised Algorithms Viva Guide */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-forest" />
            <span>Unsupervised Machine Learning Algorithms Implemented</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key theoretical and practical points suitable for project evaluation and viva defense.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* K-Means */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">1. K-Means Clustering</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-forest text-[11px] font-semibold">Partitioning</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Iteratively partitions market feature vectors into K distinct clusters by minimizing the Within-Cluster Sum of Squares (Inertia/WCSS). Centroids represent the average price and volatility profile of that cluster.
            </p>
          </div>

          {/* MiniBatch K-Means */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">2. MiniBatch K-Means</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-forest text-[11px] font-semibold">Scalable</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A computationally efficient variant of K-Means that updates centroids using small random batches of observations, dramatically reducing convergence time for large historical market datasets.
            </p>
          </div>

          {/* Hierarchical Agglomerative */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">3. Agglomerative Clustering</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">Hierarchical</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bottom-up hierarchical clustering using Ward's minimum variance linkage. Pairs of markets with the closest distance profiles are sequentially merged into a cohesive tree hierarchy.
            </p>
          </div>

          {/* DBSCAN */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">4. DBSCAN</span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-semibold">Density-Based</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Density-Based Spatial Clustering of Applications with Noise. Groups markets situated in dense feature neighborhoods and flags atypical, isolated markets as noise points (-1) without forcing them into a cluster.
            </p>
          </div>

          {/* PCA */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">5. Principal Component Analysis (PCA)</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold">Linear Dim Reduction</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes orthogonal eigenvectors maximizing total variance of market feature vectors. Enables 2D visualization while retaining global distance geometry and offering interpretable feature loadings.
            </p>
          </div>

          {/* t-SNE */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">6. t-SNE</span>
              <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[11px] font-semibold">Non-Linear Manifold</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Converts pairwise Euclidean distances into Gaussian probabilities and minimizes the Kullback-Leibler divergence. Emphasizes local neighborhood structures over global distance metrics.
            </p>
          </div>

          {/* Isolation Forest */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">7. Isolation Forest</span>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-semibold">Anomaly Detection</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Isolates price anomalies by randomly partitioning features in tree structures. Unusual observations require significantly fewer tree splits to isolate, yielding higher anomaly scores.
            </p>
          </div>

          {/* Local Outlier Factor */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">8. Local Outlier Factor (LOF)</span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[11px] font-semibold">Density Outlier</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates the local reachability density of each market price point relative to its k-nearest neighbors. Points with substantially lower density than their surroundings are flagged as anomalies.
            </p>
          </div>
        </div>
      </section>

      {/* Cluster Evaluation Metrics */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-forest" />
          <span>Clustering Validation Metrics</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900">Inertia (WCSS) & Elbow</span>
            <p className="leading-relaxed">
              Measures compactness within clusters. The elbow point marks the value of K where marginal reduction in sum of squared errors plateaus.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900">Silhouette Coefficient</span>
            <p className="leading-relaxed">
              Evaluates cohesion vs. separation from -1 to +1. High positive scores show markets fit their assigned cluster far better than the nearest neighbor cluster.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <span className="font-bold text-slate-900">Davies–Bouldin Index</span>
            <p className="leading-relaxed">
              Measures similarity between each cluster and its most similar one. Lower values indicate better separation and tighter internal clustering.
            </p>
          </div>
        </div>
      </section>

      {/* Technology Stack & Summary */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs sm:text-sm text-slate-600">
        <h2 className="text-lg font-bold text-slate-900">Project Technology Architecture</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-medium text-slate-800">
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> Python 3.11
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> FastAPI
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> Scikit-learn
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> Pandas & NumPy
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> React 18 & Vite
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> TypeScript
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> Tailwind CSS
          </li>
          <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-forest" /> Recharts
          </li>
        </ul>
      </section>
    </div>
  );
};
