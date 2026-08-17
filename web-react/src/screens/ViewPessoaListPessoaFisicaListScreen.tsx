import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'rg', label: 'RG' },
];

export default function ViewPessoaListPessoaFisicaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Pessoa Fisica</h1>
        <DataTable path="/api/view/pessoa/listPessoaFisica" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
