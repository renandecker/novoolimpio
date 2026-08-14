import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export type Permission = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';
export type ModulePermissions = Record<string, string[]>;

type PermissionsValue = {
  permissions: string[];
  modulePermissions: ModulePermissions;
  can: (permission: Permission, outcome?: string) => boolean;
};

const PermissionsContext = createContext<PermissionsValue>({
  permissions: ['READ'],
  modulePermissions: {},
  can: () => false,
});

export const normalizeOutcome = (value: string) =>
  value.replace(/\.xhtml$/i, '').replace(/^\/+|\/+$/g, '');

export const useCurrentOutcome = () => {
  const { pathname } = useLocation();
  return normalizeOutcome(pathname);
};

export function PermissionProvider({
  permissions,
  modulePermissions,
  children,
}: {
  permissions: string[];
  modulePermissions: ModulePermissions;
  children: ReactNode;
}) {
  const value = useMemo<PermissionsValue>(() => {
    const global = new Set<string>(permissions);
    const hasModulePermissions = Object.keys(modulePermissions).length > 0;
    const can = (permission: Permission, outcome?: string) => {
      if (outcome !== undefined && outcome !== '') {
        const key = normalizeOutcome(outcome);
        if (Object.prototype.hasOwnProperty.call(modulePermissions, key)) {
          return modulePermissions[key].includes(permission);
        }
        if (hasModulePermissions) return global.has(permission);
      }
      return global.has(permission);
    };
    return { permissions, modulePermissions, can };
  }, [permissions, modulePermissions]);
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export const usePermissions = () => useContext(PermissionsContext);

export function PermissionGate({
  permission,
  children,
  module,
}: {
  permission: Permission;
  children: ReactNode;
  module?: string;
}) {
  const { can } = usePermissions();
  const current = useCurrentOutcome();
  return can(permission, module ?? current) ? <>{children}</> : null;
}
