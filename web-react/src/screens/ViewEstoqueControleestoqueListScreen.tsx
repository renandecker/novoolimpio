import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const CONTROLE_ESTOQUE_COLUMNS: DataTableColumn[] = [
  { key: 'valor', label: 'Valor' },
  { key: 'quantidade', label: 'Quantidade' },
  { key: 'qtdeSolicitado', label: 'Solicitado' },
  { key: 'qtdeDefeito', label: 'Defeito' },
  { key: 'qtdeFalta', label: 'Falta' },
  { key: 'qtdeNaoEncontrado', label: 'Não Encontrado' },
  { key: 'qtdeReservado', label: 'Reservado' },
  { key: 'qtdeAprovadoNaoEntregue', label: 'Aprovado N. Entregue' },
  { key: 'produtoId', label: 'Produto' },
  { key: 'unidadeId', label: 'Unidade' },
];

export default function ViewEstoqueControleestoqueListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Controle Estoque</h1>
        <DataTable path="/api/estoque/controle-estoque" columns={CONTROLE_ESTOQUE_COLUMNS} />
      </main>
    </PermissionGate>
  );
}
