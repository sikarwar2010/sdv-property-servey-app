import { api } from '@/src/services/api/client';
import type { SyncPullRequest, SyncPullResponse, SyncPushRequest, SyncPushResponse } from '@/src/types/api';

export const syncService = {
  push(body: SyncPushRequest): Promise<SyncPushResponse> {
    return api.post<SyncPushResponse, SyncPushRequest>('/sync/push', body);
  },

  pull(body: SyncPullRequest): Promise<SyncPullResponse> {
    return api.post<SyncPullResponse, SyncPullRequest>('/sync/pull', body);
  },
};
