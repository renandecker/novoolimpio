import type {ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '../../features/auth/auth';
import {api} from '../services/api';
import {PermissionProvider} from '../services/permissions';
import type {ModulePermissions} from '../types/index';

export default function PermissionBridge({children}: { children: ReactNode }) {
    const {session} = useAuth();
    const permissions = session?.permissions ?? ['READ'];
    const jwtModulePermissions = (session?.modulePermissions ?? {}) as ModulePermissions;
    const serverQuery = useQuery({
        queryKey: ['permissao-me', session?.username],
        queryFn: async () => (await api.get<ModulePermissions>('/api/permissao/me')).data,
        enabled: Boolean(session),
        retry: false,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    });
    const modulePermissions = serverQuery.data ?? jwtModulePermissions;
    return (
        <PermissionProvider permissions={permissions} modulePermissions={modulePermissions}>
            {children}
        </PermissionProvider>
    );
}
