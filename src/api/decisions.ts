import { apiGet, apiPost, apiDelete } from '../utils/api';

export interface DecisionOption {
  id: number;
  text: string;
  votes: number;
}

export interface Decision {
  id: number;
  title: string;
  description: string;
  created_at: string;
  expires_at: string | null;
  option_count: number;
  total_votes: number;
  duration?: string;
}

export const decisionApi = {
  /** 获取所有决策列表 */
  getList: () =>
    apiGet<Decision[]>('/api/decisions'),

  /** 创建决策投票 */
  create: (data: {
    title: string;
    description: string;
    options: string[];
    userId: number;
    duration: string;
  }) => apiPost<{ success: boolean; decisionId: number }>('/api/decisions', data),

  /** 获取单个决策详情 */
  getDetail: (id: number) =>
    apiGet<{ decision: Decision; options: DecisionOption[] }>(`/api/decisions/${id}`),

  /** 检查用户是否已投票 */
  getUserVote: (decisionId: number, userId: number) =>
    apiGet<{ hasVoted: boolean; votedOptionId: number | null }>(
      `/api/decisions/${decisionId}/user-vote?userId=${userId}`,
    ),

  /** 为决策投票 */
  vote: (decisionId: number, optionId: number, userId: number) =>
    apiPost<{ success: boolean; options: DecisionOption[] }>(
      `/api/decisions/${decisionId}/vote`,
      { optionId, userId },
    ),

  /** 重新开启已结束的投票 */
  reopen: (decisionId: number, userId: number) =>
    apiPost<{ success: boolean; decisionId: number }>(
      `/api/decisions/${decisionId}/reopen`,
      { userId },
    ),

  /** 基于平票创建新投票 */
  recreateFromTie: (decisionId: number, userId: number, optionTexts: string[]) =>
    apiPost<{ success: boolean; decisionId: number }>(
      `/api/decisions/${decisionId}/recreate-from-tie`,
      { userId, optionTexts },
    ),

  /** 删除决策 */
  remove: (id: number) =>
    apiDelete<{ success: boolean }>(`/api/decisions/${id}`),

  /** 通过 AI 根据用户描述创建投票 */
  aiCreate: (data: {
    userInput: string;
    userId: number;
    duration?: string;
  }) =>
    apiPost<{
      success: boolean;
      decisionId: number;
      generated: { title: string; description: string; options: string[] };
    }>('/api/decisions/ai-create', data),
};
