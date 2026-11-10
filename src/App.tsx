import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { Home } from './pages/Home';
import { MarketAnalysis } from './pages/MarketAnalysis';
import { Clustering } from './pages/Clustering';
import { ClusterEvaluation } from './pages/ClusterEvaluation';
import { PCAComparison } from './pages/PCAComparison';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { Recommendations } from './pages/Recommendations';
import { About } from './pages/About';

export const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market-analysis" element={<MarketAnalysis />} />
          <Route path="/clustering" element={<Clustering />} />
          <Route path="/insights/cluster-evaluation" element={<ClusterEvaluation />} />
          <Route path="/insights/pca-vs-tsne" element={<PCAComparison />} />
          <Route path="/insights/anomaly-detection" element={<AnomalyDetection />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
