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
        queryKey: ['verificar-acesso-todas', session?.username],
        queryFn: async () => (await api.get<ModulePermissions>('/api/basico/verificar-acesso/todas')).data,
        enabled: Boolean(session),
        retry: false,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    });
    // Um mapa vazio nao substitui o claim do JWT: sem isso uma falha de consulta
    // apagaria as permissoes por tela que vieram no token e a interface cairia
    // para somente as permissoes globais.
    const modulePermissions = Object.keys(serverQuery.data ?? {}).length > 0
        ? (serverQuery.data as ModulePermissions)
        : jwtModulePermissions;
    return (
        <PermissionProvider permissions={permissions} modulePermissions={modulePermissions}>
            {children}
        </PermissionProvider>
    );
}
