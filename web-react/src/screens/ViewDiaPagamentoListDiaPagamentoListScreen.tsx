import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'dia', label: 'Dia' },
];

export default function ViewDiaPagamentoListDiaPagamentoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Dia Pagamento</h1>
        <DataTable
          path="/api/view/diaPagamento/listDiaPagamento"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
        />
      </main>
    </PermissionGate>
  );
}
