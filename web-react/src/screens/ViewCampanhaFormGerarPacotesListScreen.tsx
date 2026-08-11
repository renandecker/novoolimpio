import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard } from '../Wizard';

const INFORMACOES_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'meta', label: 'Meta' },
  { key: 'ativo', label: 'Ativo' },
  { key: 'dataInicial', label: 'Data Inicial' },
];

const ACAO_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipoAcaoId', label: 'Tipo Ação' },
  { key: 'meta', label: 'Meta' },
  { key: 'custo', label: 'Custo' },
  { key: 'dataInicial', label: 'Data Inicial' },
  { key: 'dataFinal', label: 'Data Final' },
];

const CAMPOS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'rotulo', label: 'Rótulo' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'tamanho', label: 'Tamanho' },
  { key: 'categoriaId', label: 'Categoria' },
];

export default function ViewCampanhaFormGerarPacotesListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Gerar Pacotes</h1>
        <div className="div_form">
          <div className="form-title">Gerar Pacotes</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'informacoes',
                  label: 'Informações',
                  content: <DataTable path="/api/comercial/campanha" columns={INFORMACOES_COLUMNS} />,
                },
                { key: 'filtros', label: 'Filtros', content: <p className="master-detail-empty">Filtros gerais de geração de pacotes.</p> },
                {
                  key: 'facao',
                  label: 'Ação',
                  content: <DataTable path="/api/comercial/acao" columns={ACAO_COLUMNS} />,
                },
                { key: 'fprospecto', label: 'Prospecto', content: <p className="master-detail-empty">Filtros de prospecto.</p> },
                {
                  key: 'campos',
                  label: 'Campos',
                  content: <DataTable path="/api/comercial/campo" columns={CAMPOS_COLUMNS} />,
                },
                { key: 'fligacao', label: 'Ligação', content: <p className="master-detail-empty">Filtros de ligação.</p> },
                { key: 'facademico', label: 'Acadêmico', content: <p className="master-detail-empty">Filtros acadêmicos.</p> },
                {
                  key: 'operacional',
                  label: 'Operacional',
                  nextLabel: 'Gerar',
                  content: <p className="master-detail-empty">Usuários e pacotes operacionais.</p>,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
