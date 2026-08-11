import { api } from './api';

export type ActionCatalog = Record<string, string[]>;

export const listActions = (module = 'basico') => api.get<ActionCatalog>(`/api/${module}/actions/catalog`);

export const executeAction = (resource: string, action: string, outcome: string, payload = '') =>
  api.post(`/api/basico/actions/${resource}/${action}`, { payload }, {
    headers: { 'X-Screen-Outcome': outcome },
  });
