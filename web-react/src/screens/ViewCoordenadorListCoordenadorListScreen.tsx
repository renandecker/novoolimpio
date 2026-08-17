import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'coordenador_descricao', label: 'Coordenador' },
  { key: 'operador_descricao', label: 'Operador' },
  { key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data) },
  { key: 'meta', label: 'Meta' },
  { key: 'agendado', label: 'Agendado' },
  { key: 'ligacao', label: 'Ligação' },
  { key: 'pausa', label: 'Pausa' },
  { key: 'prioritario', label: 'Fila Prioritária' },
];

export default function ViewCoordenadorListCoordenadorListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Coordenador</h1>
        <DataTable path="/api/view/coordenador/listCoordenador" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
