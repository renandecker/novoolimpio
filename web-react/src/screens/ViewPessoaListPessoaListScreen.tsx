import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'telefone', label: 'Telefone' },
  { key: 'celular', label: 'Celular' },
  { key: 'email', label: 'E-mail' },
];

export default function ViewPessoaListPessoaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Pessoa</h1>
        <DataTable path="/api/view/pessoa/listPessoa" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
