import { useState, useEffect } from 'react';
import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import WeatherSection from './components/WeatherSection';
import SpotsOverview from './components/SpotsOverview';
import RoutesSection from './components/RoutesSection';
import VoteResults from './components/VoteResults';
import BackToTop from './components/BackToTop';
import AnchorNav from './components/AnchorNav';
import RouteDetailModal from './components/RouteDetailModal';
import type { RouteData } from './types';

function AppContent() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  useEffect(() => {
    const handleViewDetail = (event: Event) => {
      const customEvent = event as CustomEvent<RouteData | null>;
      if (customEvent.detail) {
        setSelectedRoute(customEvent.detail);
        setShowDetailModal(true);
      }
    };

    window.addEventListener('viewRouteDetail', handleViewDetail);
    return () => window.removeEventListener('viewRouteDetail', handleViewDetail);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-amber-50">
      <Header />
      <main className="container mx-auto px-3 md:px-5 max-w-7xl">
        <WeatherSection />
        <SpotsOverview />
        <RoutesSection />
        <VoteResults />
      </main>
      <BackToTop />
      <AnchorNav />
      
      <RouteDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        route={selectedRoute}
      />
    </div>
  );
}

export default function App() {
  return (
    <VoteProvider>
      <AppContent />
    </VoteProvider>
  );
}
