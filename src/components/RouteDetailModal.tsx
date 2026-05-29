import type { RouteData } from '../types';
import SpotCard from './SpotCard';
import { spotsData } from '../data/spots';

interface RouteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: RouteData | null;
}

export default function RouteDetailModal({ isOpen, onClose, route }: RouteDetailModalProps) {
  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-bounceIn">
        <div className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times" />
          </button>
          <h2 className="text-2xl font-extrabold mb-2">{route.title}</h2>
          <p className="text-sky-100">{route.description}</p>
          {route.drivingTime && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <i className="fas fa-car" />
              <span className="text-sky-100">{route.drivingTime}</span>
            </div>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {route.days.map((day) => (
            <div key={day.day} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-primary to-secondary text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-extrabold shadow-md">
                  <span className="text-xs leading-none">DAY</span>
                  <span className="text-xl leading-none">{day.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-text">{day.title}</h3>
                  <p className="text-sm text-textLight">{day.details}</p>
                </div>
              </div>

              {day.itinerary && day.itinerary.length > 0 && (
                <div className="mb-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-4">
                  <div className="text-sm font-semibold text-text mb-2">行程安排</div>
                  <div className="space-y-2">
                    {day.itinerary.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-textLight">
                        <i className={`fas ${step.icon} text-primary w-4`} />
                        <span>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {day.spots && day.spots.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-text mb-3">景点一览</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {day.spots.map((spotName) => {
                      if (!spotsData[spotName]) return null;
                      return <SpotCard key={spotName} spotName={spotName} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}