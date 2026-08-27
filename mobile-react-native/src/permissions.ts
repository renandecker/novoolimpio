import type {Session} from './auth';
import type {ModulePermissions} from './types';

export type Permission = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';

export const isAdmin = (session: Session | null): boolean => {
    return session?.hierarquia === 'ADMIN';
};

export const normalizeOutcome = (value: string) =>
    value.replace(/\.xhtml$/i, '').replace(/^\/+|\/+$/g, '');

export const can = (
    session: Session | null,
    permission: Permission,
    outcome?: string,
): boolean => {
    const permissions = session?.permissions ?? ['READ'];
    const modulePermissions: ModulePermissions = session?.modulePermissions ?? {};
    const global = new Set<string>(permissions);
    const hasModulePermissions = Object.keys(modulePermissions).length > 0;
    if (outcome !== undefined && outcome !== '') {
        const key = normalizeOutcome(outcome);
        if (Object.prototype.hasOwnProperty.call(modulePermissions, key)) {
            return modulePermissions[key].includes(permission);
        }
        if (hasModulePermissions) return permission === 'READ';
    }
    return global.has(permission);
};
