import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable'; 
import type { ApiItem } from '../types';

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'cargaHoraria', label: 'Carga Horária' },
  { key: 'tipoAtividade', label: 'Tipo Atividade' },
];

export default function ViewAtividadeComplementarListAtividadeComplementarListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Atividade Complementar</h1>
        <DataTable path="/api/educacao/atividade-complementar" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}