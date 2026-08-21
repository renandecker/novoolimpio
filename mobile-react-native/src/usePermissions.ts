import {useAuth} from './auth';
import {can, type Permission} from './permissions';

export function usePermissions() {
    const {session} = useAuth();

    return {
        can: (permission: Permission, outcome?: string) => can(session, permission, outcome),
        canCreate: (outcome?: string) => can(session, 'CREATE', outcome),
        canUpdate: (outcome?: string) => can(session, 'UPDATE', outcome),
        canDelete: (outcome?: string) => can(session, 'DELETE', outcome),
        canExecute: (outcome?: string) => can(session, 'EXECUTE', outcome),
        canRead: (outcome?: string) => can(session, 'READ', outcome),
        hasModulePermissions: () => Object.keys(session?.modulePermissions ?? {}).length > 0,
        modulePermissions: session?.modulePermissions ?? {},
        globalPermissions: session?.permissions ?? ['READ'],
    };
}

export function useModulePermissions(outcome: string) {
    const {canCreate, canUpdate, canDelete, canExecute, canRead} = usePermissions();
    return {
        canCreate: canCreate(outcome),
        canUpdate: canUpdate(outcome),
        canDelete: canDelete(outcome),
        canExecute: canExecute(outcome),
        canRead: canRead(outcome),
    };
}