import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard } from '../Wizard';

const SQL_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'tabela', label: 'Tabela' },
  { key: 'condicao', label: 'Condição' },
  { key: 'nomeBanco', label: 'Banco' },
  { key: 'coordenada', label: 'Coordenada' },
  { key: 'zoom', label: 'Zoom' },
];

export default function ViewEstruturaFormEstruturaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Estrutura</h1>
        <div className="div_form">
          <div className="form-title">Estrutura de Relatório</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'sql',
                  label: 'SQL',
                  content: <DataTable path="/api/relatorios/estrutura" columns={SQL_COLUMNS} />,
                },
                {
                  key: 'campos',
                  label: 'Campos',
                  nextLabel: 'Salvar',
                  content: <p className="master-detail-empty">Dimensões, tempo, medidas e georeferência da estrutura.</p>,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
