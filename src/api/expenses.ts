import { apiGet, apiPost, apiDelete } from '../utils/api';

export interface ExpenseRow {
  id: number;
  route_id: number;
  day: number;
  name: string;
  amount: number;
  category: string;
  time: string;
  user_id: number | null;
  user_name: string | null;
  user_avatar: string | null;
}

export const expenseApi = {
  /** 获取花销列表 */
  getList: (routeId: number) =>
    apiGet<ExpenseRow[]>(`/api/expenses?routeId=${routeId}`),

  /** 添加花销 */
  add: (data: {
    routeId: number;
    day: number;
    name: string;
    amount: number;
    category: string;
    time: string;
    userId?: number | string;
    userName?: string;
    userAvatar?: string;
  }) => apiPost<{ success: boolean; id: number }>('/api/expenses', data),

  /** 删除单条花销 */
  remove: (id: number | string) =>
    apiDelete<{ success: boolean }>(`/api/expenses/${id}`),

  /** 清空指定路线的所有花销 */
  clearAll: (routeId: number) =>
    apiDelete<{ success: boolean }>(`/api/expenses/all?routeId=${routeId}`),
};
