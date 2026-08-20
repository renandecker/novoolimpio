import {api} from './api';

export type Action = string;

export const executeAction = (resource: string, action: Action, payload = '', module = 'basico', outcome?: string) =>
    api.post(`/api/${module}/actions/${resource}/${action}`, {payload}, {
        headers: outcome ? {'X-Screen-Outcome': outcome} : undefined,
    });
