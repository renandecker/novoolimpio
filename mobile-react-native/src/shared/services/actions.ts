import {api} from './api';

export const executeAction = (resource: string, action: string, outcome: string, payload = '') =>
    api.post(`/api/basico/actions/${resource}/${action}`, {payload}, {
        headers: {'X-Screen-Outcome': outcome},
    });
