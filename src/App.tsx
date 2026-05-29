import { useState, useEffect } from 'react';
import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import ItineraryHeader from './components/ItineraryHeader';
import WeatherSection from './components/WeatherSection';
import SpotsOverview from './components/SpotsOverview';
import RoutesSection from './components/RoutesSection';
import VoteResults from './components/VoteResults';
import BackToTop from './components/BackToTop';
import AnchorNav from './components/AnchorNav';
import RouteDetailModal from './components/RouteDetailModal';
import ItineraryDetail from './components/ItineraryDetail';
import type { RouteData } from './types';

function AppContent() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [currentPage, setCurrentPage] = useState<'vote' | 'itinerary'>(() => {
    const now = new Date();
    const cutoffDate = new Date('2026-05-30T00:00:00');
    return now >= cutoffDate ? 'itinerary' : 'vote';
  });

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
      {currentPage === 'vote' ? (
        <Header onNavigate={() => {
          sessionStorage.setItem('navigatedFromVote', 'true');
          setCurrentPage('itinerary');
        }} />
      ) : (
        <ItineraryHeader onNavigate={() => setCurrentPage('vote')} />
      )}
      <main className="container mx-auto px-3 md:px-5 max-w-7xl">
        {currentPage === 'vote' ? (
          <>
            <WeatherSection />
            <SpotsOverview />
            <RoutesSection />
            <VoteResults />
          </>
        ) : (
          <ItineraryDetail />
        )}
      </main>
      <BackToTop isHidden={showDetailModal} />
      <AnchorNav isHidden={showDetailModal || currentPage === 'itinerary'} />

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
