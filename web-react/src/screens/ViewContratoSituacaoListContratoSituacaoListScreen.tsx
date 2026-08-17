import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descricao' },
  { key: 'sucinto', label: 'Sucinto' },
];

export default function ViewContratoSituacaoListContratoSituacaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Contrato Situacao</h1>
        <DataTable
          path="/api/view/contratoSituacao/listContratoSituacao"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}
