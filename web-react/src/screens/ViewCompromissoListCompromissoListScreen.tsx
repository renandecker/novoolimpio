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
  { key: 'id', label: 'Id' },
  { key: 'usuario_descricao', label: 'Usuário Agendou' },
  { key: 'atendente_descricao', label: 'Consultor' },
  { key: 'usuario_finalizou_descricao', label: 'Finalizou' },
  { key: 'descricao', label: 'Visitante' },
  { key: 'agenda_descricao', label: 'Agenda' },
  { key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data) },
  { key: 'status_compromisso_descricao', label: 'Status' },
];

export default function ViewCompromissoListCompromissoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Compromisso</h1>
        <DataTable path="/api/view/compromisso/listCompromisso" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
