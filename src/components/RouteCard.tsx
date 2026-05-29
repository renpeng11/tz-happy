import { useState, useEffect } from 'react';
import { useVote } from '../context/VoteContext';
import type { RouteData } from '../types';

interface RouteCardProps {
  route: RouteData;
}

export default function RouteCard({ route }: RouteCardProps) {
  const { voteData, currentUser, castVote } = useVote();
  const [hasVoted, setHasVoted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setHasVoted(currentUser.hasVoted);
    }
  }, [currentUser]);

  const handleVote = async () => {
    setIsAnimating(true);
    const success = await castVote(route.id);
    if (success) {
      setHasVoted(true);
    }
    setIsAnimating(false);
  };

  const getVoteButtonStyle = () => {
    if (hasVoted) {
      if (currentUser?.votedRoute === route.id) {
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      }
      return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
    return 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:-translate-y-0.5';
  };

  const getVoteButtonIcon = () => {
    if (hasVoted) {
      if (currentUser?.votedRoute === route.id) {
        return <i className="fas fa-check text-sm" />;
      }
      return <i className="fas fa-check-double text-sm" />;
    }
    return <i className="fas fa-heart text-sm" />;
  };

  const getVoteButtonText = () => {
    if (hasVoted) {
      if (currentUser?.votedRoute === route.id) {
        return '已投票';
      }
      return '已投票';
    }
    return '投它一票';
  };

  return (
    <div className="route-card bg-white rounded-[20px] mb-5 shadow-[0_4px_20px_rgba(6,182,212,0.08)] overflow-hidden animate-fadeIn" id={`route${route.id}`}>
      <div className="route-header bg-gradient-to-br from-[#e0f2fe] to-[#f3e8ff] p-[16px_14px] border-b border-[#c4b5fd] flex flex-col gap-[12px]">
        <div className="route-title font-bold text-base md:text-lg text-sky-800">
          {route.title}
        </div>
        <button
          onClick={handleVote}
          disabled={isAnimating}
          className={`vote-btn text-white font-bold text-[0.95rem] px-5 py-3 rounded-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all duration-200 min-h-[44px] w-full ${getVoteButtonStyle()} ${isAnimating ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
        >
          {getVoteButtonIcon()}
          {getVoteButtonText()} ({voteData[route.id]})
        </button>
      </div>
      <div className="route-body p-4">
        {route.description && (
          <div className="meta-info bg-[#f0fdfa] p-3 rounded-sm mb-3 text-[0.85rem]">
            <div className="flex items-start gap-2">
              <i className="fas fa-user-group w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-textLight">
                <strong className="text-text">适配人群：</strong>
                {route.description}
              </span>
            </div>
            {route.drivingTime && (
              <div className="flex items-start gap-2 mt-2">
                <i className="fas fa-car w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-textLight">
                  <strong className="text-text">车程参考：</strong>
                  {route.drivingTime}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="timeline space-y-4">
          {route.days.map((day) => (
            <div key={day.day} className="timeline-item relative mb-[18px] bg-white rounded-[12px] p-[16px_14px] border border-[#e0f2fe] shadow-[0_2px_10px_rgba(6,182,212,0.06)]">
              <div className="day-header flex items-start gap-3">
                <div className="day-number-badge bg-gradient-to-r from-primary to-secondary text-white w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-lg shadow-md flex-shrink-0">
                  {day.day}
                </div>
                <div className="day-info flex-1 min-w-0">
                  <div className="day-title flex flex-wrap gap-2 mb-3">
                    <span className="day-route-tag bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <i className="fas fa-route text-xs" />
                      {day.title.split('宿')[0].trim().replace(/\s*→\s*$/, '')}
                    </span>
                    {day.title.includes('宿') && (
                      <span className="day-accommodation-tag bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <i className="fas fa-bed text-xs" />
                        宿{day.title.split('宿')[1]?.trim()}
                      </span>
                    )}
                  </div>
                  {day.itinerary && day.itinerary.length > 0 && (
                    <div className="day-itinerary flex flex-col gap-2 mb-3">
                      {day.itinerary.map((step, index) => (
                        <div key={index} className="itinerary-step bg-gradient-to-r from-white to-sky-50 border-[1.5px] border-sky-200 px-[12px] py-[10px] rounded-sm text-[0.85rem] text-text flex items-center gap-2">
                          <i className={`fas ${step.icon} text-primary`} />
                          {step.text}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="day-details bg-[#fefefe] p-[12px] rounded-sm border-l-[3px] border-l-amber-500 text-[0.85rem] leading-[1.6] text-[#475569]">
                    {day.details}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
