import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'titulo', label: 'Título' },
  { key: 'tema', label: 'Tema' },
  { key: 'fl_default', label: 'Tema Padrão', render: (item) => (asRecord(item).fl_default ? 'Sim' : 'Não') },
];

const LAYOUT_COMBOS = { tema: { path: '/api/login/temas', valueKey: 'tema', labelKey: 'titulo' } };

export default function ViewConfiguracaoListLayoutListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Layout do Sistema</h1>
        <DataTable path="/api/view/configuracao/listLayout" combos={LAYOUT_COMBOS} columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
