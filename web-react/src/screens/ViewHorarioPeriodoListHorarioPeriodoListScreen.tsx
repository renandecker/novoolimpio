import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'dt_inicio', label: 'Data Início', render: (item) => formatDate(asRecord(item).dt_inicio) },
  { key: 'hora_inicio', label: 'Hora Início' },
  { key: 'dt_fim', label: 'Data Fim', render: (item) => formatDate(asRecord(item).dt_fim) },
  { key: 'hora_fim', label: 'Hora Fim' },
  { key: 'periodo_descricao', label: 'Período' },
  { key: 'turno_descricao', label: 'Turno' },
];

export default function ViewHorarioPeriodoListHorarioPeriodoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Horario Periodo</h1>
        <DataTable path="/api/view/horarioPeriodo/listHorarioPeriodo" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
