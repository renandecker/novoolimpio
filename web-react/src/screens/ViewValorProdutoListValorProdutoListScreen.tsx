import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'vezes', label: 'Vezes' },
  { key: 'desconto', label: 'Desconto' },
  { key: 'juros', label: 'Juros' },
  { key: 'multa', label: 'Multa' },
  { key: 'dias_spc', label: 'Dias Atraso' },
  { key: 'dias_tolerancia_multa', label: 'Dia Tolerância' },
];

export default function ViewValorProdutoListValorProdutoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Valor Produto</h1>
        <DataTable path="/api/view/valorProduto/listValorProduto" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
