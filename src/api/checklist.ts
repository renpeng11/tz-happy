import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

export interface ChecklistItem {
  id: number;
  name: string;
  is_checked: number;
  created_at: string;
}

export const checklistApi = {
  /** 获取清单列表 */
  getList: (userId?: number) =>
    apiGet<ChecklistItem[]>(userId ? `/api/checklist?userId=${userId}` : '/api/checklist'),

  /** 添加清单项目 */
  add: (name: string) =>
    apiPost<{ success: boolean; id: number }>('/api/checklist', { name }),

  /** 切换清单项目的选中状态 */
  toggle: (id: number, userId: number) =>
    apiPut<{ success: boolean; is_checked: number }>(`/api/checklist/${id}/toggle`, { userId }),

  /** 删除清单项目 */
  remove: (id: number) =>
    apiDelete<{ success: boolean }>(`/api/checklist/${id}`),
};
