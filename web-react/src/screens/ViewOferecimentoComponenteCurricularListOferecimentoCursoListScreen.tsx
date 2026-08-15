import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Grupo' },
  { key: 'unidade_descricao', label: 'Unidade' },
  { key: 'curriculo_descricao', label: 'Curso' },
];

export default function ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Oferecimento Curso</h1>
        <DataTable path="/api/educacao/oferecimento-curso" columns={COLUMNS} />
      </main>
    </PermissionGate>
  );
}
