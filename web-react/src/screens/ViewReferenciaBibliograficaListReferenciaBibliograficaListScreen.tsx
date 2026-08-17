import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'autor', label: 'Autor' },
  { key: 'titulo', label: 'Título' },
  { key: 'volume', label: 'Volume' },
];

export default function ViewReferenciaBibliograficaListReferenciaBibliograficaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Referencia Bibliografica</h1>
        <DataTable path="/api/view/referenciaBibliografica/listReferenciaBibliografica" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
