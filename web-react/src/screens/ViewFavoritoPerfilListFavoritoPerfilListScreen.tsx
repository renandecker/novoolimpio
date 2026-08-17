import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'modulo_descricao', label: 'Rótulo' },
  { key: 'perfil_descricao', label: 'Perfil' },
];

export default function ViewFavoritoPerfilListFavoritoPerfilListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Favorito Perfil</h1>
        <DataTable path="/api/view/favoritoPerfil/listFavoritoPerfil" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
