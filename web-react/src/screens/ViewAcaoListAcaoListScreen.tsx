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
  { key: 'tipo_acao_descricao', label: 'Tipo da Ação' },
  { key: 'responsavel_descricao', label: 'Contratante' },
  { key: 'data_inicial', label: 'Início', render: (item) => formatDate(asRecord(item).data_inicial) },
  { key: 'data_final', label: 'Fim', render: (item) => formatDate(asRecord(item).data_final) },
  { key: 'data_final_captacao', label: 'Fim da Captação', render: (item) => formatDate(asRecord(item).data_final_captacao) },
  { key: 'data_coleta', label: 'Coleta', render: (item) => formatDate(asRecord(item).data_coleta) },
];

export default function ViewAcaoListAcaoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Acao</h1>
        <DataTable path="/api/view/acao/listAcao" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
