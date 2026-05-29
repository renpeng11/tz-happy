import SpotCard from './SpotCard';
import { spotsData } from '../data/spots';

export default function SpotsOverview() {
  const spotNames = Object.keys(spotsData);

  return (
    <div className="spots-overview mb-7">
      <div className="route-section-title text-lg font-extrabold text-sky-800 mb-4 flex items-center gap-2 pb-2 border-b-2 border-sky-100">
        <i className="fas fa-map-marker-alt text-primary" />
        景点概览
      </div>
      <div className="spots-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {spotNames.map((spotName) => (
          <SpotCard key={spotName} spotName={spotName} />
        ))}
      </div>
    </div>
  );
}
