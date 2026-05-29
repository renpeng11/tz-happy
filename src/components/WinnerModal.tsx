import type { RouteData } from '../types';
import { routeLabels } from '../data/spots';

interface WinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onViewDetail: () => void;
    winnerRoute: RouteData | null;
    votes: number;
}

export default function WinnerModal({ isOpen, onClose, onViewDetail, winnerRoute, votes }: WinnerModalProps) {
    if (!isOpen || !winnerRoute) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-bounceIn">
                <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 p-6 text-center text-white">
                    <div className="text-6xl mb-3">🎉</div>
                    <h2 className="text-2xl font-extrabold mb-2">投票结果出炉！</h2>
                    <p className="text-emerald-100">本次端午出行路线已确定</p>
                </div>

                <div className="p-6">
                    <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-5 mb-6">
                        <div className="text-center">
                            <div className="text-sm text-textLight mb-2">获胜路线</div>
                            <h3 className="text-xl font-bold text-text mb-3">{winnerRoute.title}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold">
                                    <i className="fas fa-trophy mr-1" />
                                    {votes} 票
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 text-center text-textLight text-sm">
                        {winnerRoute.description}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 text-text font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            关闭
                        </button>
                        <button
                            onClick={onViewDetail}
                            className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                        >
                            <i className="fas fa-eye mr-1" />
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}