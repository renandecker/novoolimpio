import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './auth';
import { api } from './api';
import { PermissionProvider } from './permissions';
import type { ModulePermissions } from './types';

export default function PermissionBridge({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const permissions = session?.permissions ?? ['READ'];
  const jwtModulePermissions = (session?.modulePermissions ?? {}) as ModulePermissions;
  const serverQuery = useQuery({
    queryKey: ['permissao-me', session?.username],
    queryFn: async () => (await api.get<ModulePermissions>('/api/permissao/me')).data,
    enabled: Boolean(session),
    retry: false,
  });
  const modulePermissions = serverQuery.data ?? jwtModulePermissions;
  return (
    <PermissionProvider permissions={permissions} modulePermissions={modulePermissions}>
      {children}
    </PermissionProvider>
  );
}
