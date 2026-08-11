import { useMutation } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { executeAction, Action } from './actions';

export const useAction = (resource: string, action: Action) =>
  useMutation<AxiosResponse, unknown, string>({
    mutationFn: (payload) => executeAction(resource, action, payload),
  });
