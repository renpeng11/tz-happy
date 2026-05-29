import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import WeatherSection from './components/WeatherSection';
import SpotsOverview from './components/SpotsOverview';
import RoutesSection from './components/RoutesSection';
import VoteResults from './components/VoteResults';
import BackToTop from './components/BackToTop';
import AnchorNav from './components/AnchorNav';

function AppContent() {
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
