import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'ordem', label: 'Ordem' },
  { key: 'componente_curricular_descricao', label: 'Componente Curricular' },
];

export default function ViewCronogramaComponenteCurricularListCronogramaComponenteCurricularListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Cronograma Componente Curricular</h1>
        <DataTable path="/api/view/cronogramaComponenteCurricular/listCronogramaComponenteCurricular" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
