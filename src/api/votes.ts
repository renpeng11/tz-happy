import { apiGet, apiPost } from '../utils/api';
import type { VoteData } from '../types';

export const voteApi = {
  /** 获取投票统计 */
  getVotes: () =>
    apiGet<VoteData>('/api/votes'),

  /** 提交投票 */
  castVote: (routeId: number, userId: number) =>
    apiPost<{ success: boolean; votes: VoteData }>('/api/votes', { routeId, userId }),

  /** 重置投票 */
  resetVote: (userId: number, routeId: number | null) =>
    apiPost<{ success: boolean; votes: VoteData }>('/api/votes/reset', { userId, routeId }),

  /** 清空所有投票 */
  clearAll: () =>
    apiPost<{ success: boolean; votes: VoteData }>('/api/votes/clear'),
};
