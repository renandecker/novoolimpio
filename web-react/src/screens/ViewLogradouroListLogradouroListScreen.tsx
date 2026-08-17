import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Nome' },
  { key: 'cep', label: 'CEP' },
  { key: 'bairro_descricao', label: 'Bairro' },
  { key: 'tipo_logradouro', label: 'Tipo' },
  { key: 'complemento', label: 'Complemento' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
];

export default function ViewLogradouroListLogradouroListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Logradouro</h1>
        <DataTable path="/api/view/logradouro/listLogradouro" columns={COLUMNS} maxMainColumns={COLUMNS.length} />
      </main>
    </PermissionGate>
  );
}
