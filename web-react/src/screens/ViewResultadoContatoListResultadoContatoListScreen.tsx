import { PermissionGate } from '../permissions';
import { DataTable } from '../DataTable';
import type { DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'nota', label: 'Nota' },
  { key: 'qtde_retorno', label: 'Quantidade' },
  { key: 'fl_voltar', label: 'Voltar prospecto', render: (item) => (asRecord(item).fl_voltar ? 'Sim' : 'Não') },
  { key: 'fl_relato', label: 'Relatar', render: (item) => (asRecord(item).fl_relato ? 'Sim' : 'Não') },
  { key: 'fl_visivel', label: 'Visível selecionar', render: (item) => (asRecord(item).fl_visivel ? 'Sim' : 'Não') },
  { key: 'fl_outro', label: 'Outro operador', render: (item) => (asRecord(item).fl_outro ? 'Sim' : 'Não') },
];

export default function ViewResultadoContatoListResultadoContatoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Resultado Contato</h1>
        <DataTable path="/api/view/resultadoContato/listResultadoContato" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
