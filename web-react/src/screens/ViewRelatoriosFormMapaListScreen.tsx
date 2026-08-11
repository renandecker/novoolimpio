import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Tabs } from '../Tabs';

const DEFINICAO_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'estruturaId', label: 'Estrutura' },
  { key: 'medidaId', label: 'Medida' },
  { key: 'dimensaoId', label: 'Dimensão' },
  { key: 'utilizando', label: 'Utilizando' },
  { key: 'dataAlteracao', label: 'Data Alteração' },
];

const FILTROS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
];

export default function ViewRelatoriosFormMapaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Mapa</h1>
        <Tabs
          tabs={[
            {
              key: 'definicao',
              label: 'Definição',
              content: <DataTable path="/api/relatorios/mapa" columns={DEFINICAO_COLUMNS} />,
            },
            { key: 'permissao', label: 'Permissão', content: <p className="master-detail-empty">Usuários, unidades e perfis com acesso ao mapa.</p> },
            { key: 'regras', label: 'Regras', content: <p className="master-detail-empty">Regras de marcação do mapa.</p> },
            {
              key: 'filtros',
              label: 'Filtros',
              content: <DataTable path="/api/relatorios/filtros" columns={FILTROS_COLUMNS} />,
            },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
