import { apiPost } from '../utils/api';
import type { User } from '../types';

export const authApi = {
  /** 指纹登录 */
  login: (fingerprint: string) =>
    apiPost<{ success: boolean; user: User }>('/api/auth/login', { fingerprint }),
};
