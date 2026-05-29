import { useVote } from '../context/VoteContext';

interface HeaderProps {
  onNavigate?: () => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const { currentUser, resetVote } = useVote();

  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white text-center shadow-lg mb-4 rounded-b-[18px]">
      <div className="px-4 md:px-6">
        <h1 className="text-lg md:text-xl lg:text-[1.65rem] font-extrabold pt-6 md:pt-7.5 pb-1.5 md:pb-1.5 leading-[1.3]">
          台州 3天2晚 自驾游优选路线指南
        </h1>
        <p className="text-white/95 text-xs md:text-sm pb-4 md:pb-6 flex items-center justify-center gap-2">
          <i className="fas fa-calendar-days" />
          2026端午假期专属规划 · 智能选线与社区投票系统
        </p>
        {currentUser && (
          <div className="user-info flex items-center justify-center gap-[10px] pt-3 pb-4 md:pt-6 md:pb-6 border-t border-white/20">
            <img
              src={currentUser.avatar}
              alt={currentUser.nickname}
              className="user-avatar w-9 h-9 rounded-full border-2 border-white/60 object-cover"
            />
            <span className="user-nickname text-sm font-semibold cursor-pointer">{currentUser.nickname}</span>
            {currentUser.hasVoted && (
              <span className="user-badge flex items-center gap-1 bg-white/15 px-[10px] py-1 rounded-full text-xs text-emerald-300 font-semibold">
                <i className="fas fa-check-circle" />
                已投票
              </span>
            )}
            {currentUser.hasVoted && (
              <button
                onClick={resetVote}
                className="reset-vote-btn flex items-center gap-1 bg-red-500/20 border border-red-400/50 text-red-200 px-[10px] py-1.5 rounded-full text-xs font-semibold hover:bg-red-500/30 transition-all"
              >
                <i className="fas fa-rotate-right" />
                重置
              </button>
            )}
            {onNavigate && (
              <button
                onClick={onNavigate}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-[10px] py-1.5 rounded-full text-xs font-semibold transition-all"
              >
                <i className="fas fa-route" />
                行程详情
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
