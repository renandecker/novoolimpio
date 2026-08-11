import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Tabs } from '../Tabs';

const REGRA_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'contratoId', label: 'Contrato' },
  { key: 'motivoId', label: 'Motivo' },
  { key: 'pessoaFuncionarioId', label: 'Funcionário' },
  { key: 'dataCriacao', label: 'Data Criação' },
  { key: 'ativo', label: 'Ativo' },
];

const CANCELAMENTO_COLUMNS: DataTableColumn[] = [
  { key: 'contratoId', label: 'Contrato' },
  { key: 'dataCancelamento', label: 'Data Cancelamento' },
  { key: 'motivoCancelamento', label: 'Motivo' },
  { key: 'status', label: 'Status' },
];

export default function ViewDesistenteListDesistenteListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Desistente</h1>
        <Tabs
          tabs={[
            {
              key: 'indivname',
              label: 'Regra',
              content: <DataTable path="/api/educacao/desistente" columns={REGRA_COLUMNS} />,
            },
            {
              key: 'cancelamento',
              label: 'Cancelamento',
              content: <DataTable path="/api/educacao/matricula" columns={CANCELAMENTO_COLUMNS} />,
            },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
