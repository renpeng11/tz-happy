import { useState, useEffect } from 'react';
import { routesData } from '../data/spots';
import { useVote } from '../context/VoteContext';

interface ItineraryHeaderProps {
  onNavigate?: () => void;
  onOpenPoem?: () => void;
  onOpenDecision?: () => void;
}

export default function ItineraryHeader({ onNavigate, onOpenPoem, onOpenDecision }: ItineraryHeaderProps) {
  const { voteData, currentUser } = useVote();
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const winnerRoute = () => {
    let maxVotes = 0;
    let winnerRouteId = 1;

    Object.entries(voteData).forEach(([routeId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerRouteId = parseInt(routeId);
      }
    });

    return routesData.find(r => r.id === winnerRouteId) || null;
  };

  const route = winnerRoute();

  useEffect(() => {
    const targetDate = new Date('2026-06-17T08:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white py-5 shadow-lg mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <i className="fas fa-route text-xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold mb-1">
                🎒 行程详情
              </h1>
              <div className="text-sky-100 text-sm">
                <div className="font-semibold">{route?.title || '获胜路线'}</div>
                <div className="text-xs opacity-80 mt-0.5">{route?.description || '精心规划的旅程'}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[320px]">
              <div className="text-center mb-3">
                <span className="text-sm opacity-90">🐉 距离端午节出发还有</span>
              </div>
              <div className="flex justify-center gap-2">
                <div className="text-center">
                  <div className="bg-white/30 rounded-lg px-3 py-2 min-w-[56px]">
                    <div className="text-xl md:text-2xl font-extrabold">{countdown.days}</div>
                    <div className="text-xs opacity-80">天</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/30 rounded-lg px-3 py-2 min-w-[56px]">
                    <div className="text-xl md:text-2xl font-extrabold">{countdown.hours}</div>
                    <div className="text-xs opacity-80">时</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/30 rounded-lg px-3 py-2 min-w-[56px]">
                    <div className="text-xl md:text-2xl font-extrabold">{countdown.minutes}</div>
                    <div className="text-xs opacity-80">分</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white/30 rounded-lg px-3 py-2 min-w-[56px]">
                    <div className="text-xl md:text-2xl font-extrabold">{countdown.seconds}</div>
                    <div className="text-xs opacity-80">秒</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-1.5 text-xs">
                  <i className="fas fa-clock text-sky-200" />
                  <span className="opacity-80">集合</span>
                  <span className="font-bold">8:00</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <i className="fas fa-map-marker-alt text-sky-200" />
                  <span className="opacity-80">地点</span>
                  <span className="font-bold">红柿苑</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <i className="fas fa-car text-sky-200" />
                  <span className="opacity-80">出发</span>
                  <span className="font-bold">8:30</span>
                </div>
                {onOpenPoem && (
                  <button
                    onClick={onOpenPoem}
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <i className="fas fa-book-open" />
                    背诗免门票
                  </button>
                )}
                {onOpenDecision && (
                  <button
                    onClick={onOpenDecision}
                    className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <i className="fas fa-question-circle" />
                    遇事不决
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center w-full justify-between">
            {onNavigate && (
              <button
                onClick={onNavigate}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
              >
                <i className="fas fa-vote-yea text-xs" />
                路线投票
              </button>
            )}
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full p-1">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.nickname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="text-right">
                  <div className="font-semibold text-xs">{currentUser.nickname}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}