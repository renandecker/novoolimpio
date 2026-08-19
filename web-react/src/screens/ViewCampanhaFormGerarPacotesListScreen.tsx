import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard, useWizardData } from '../Wizard';
import { useApi } from '../api';

const ACAO_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'tipoAcaoId', label: 'Tipo Ação' },
  { key: 'responsavelId', label: 'Responsável' },
];

const PROSPECTO_FILTER_COLUMNS: DataTableColumn[] = [
  { key: 'campoId', label: 'Campo' },
  { key: 'operacao', label: 'Operação' },
  { key: 'valor', label: 'Valor' },
];

const LIGACAO_FILTER_COLUMNS: DataTableColumn[] = [
  { key: 'tipoFiltro', label: 'Filtro' },
  { key: 'resultadoContatoId', label: 'Resultado' },
  { key: 'operacao', label: 'Operação' },
  { key: 'valor', label: 'Valor' },
  { key: 'valor2', label: 'Valor 2' },
];

const ACADEMICO_FILTER_COLUMNS: DataTableColumn[] = [
  { key: 'tipoFiltro', label: 'Filtro' },
  { key: 'curriculoId', label: 'Curso' },
  { key: 'componenteCurricularId', label: 'Componente' },
  { key: 'status', label: 'Status' },
];

interface GerarPacoteData {
  entity: {
    id?: number;
    acaoDeCampanhaId?: number;
    unidadeId?: number;
    numeroProspectos?: number;
  };
  acoes: any[];
  filtrosProspecto: any[];
  filtrosLigacao: any[];
  filtrosAcademico: any[];
  prospectos: any[];
}

export default function ViewCampanhaFormGerarPacotesListScreen() {
  const { data, updateFields } = useWizardData<GerarPacoteData>({
    entity: {},
    acoes: [],
    filtrosProspecto: [],
    filtrosLigacao: [],
    filtrosAcademico: [],
    prospectos: [],
  });

  const { post: savePacote } = useApi('/api/comercial/pacote');

  const validateStep1 = async (currentData: GerarPacoteData) => {
    if (!currentData.entity.acaoDeCampanhaId) return 'Selecione a ação de campanha';
    if (!currentData.entity.unidadeId) return 'Selecione a unidade';
    if (!currentData.entity.numeroProspectos || currentData.entity.numeroProspectos <= 0) {
      return 'Informe a quantidade de prospectos (maior que zero)';
    }
    return true;
  };

  const validateStep2 = async (currentData: GerarPacoteData) => {
    // At least one filter type should be configured
    const hasFilters = currentData.filtrosProspecto.length > 0 ||
                       currentData.filtrosLigacao.length > 0 ||
                       currentData.filtrosAcademico.length > 0;
    if (!hasFilters) return 'Configure pelo menos um filtro';
    return true;
  };

  const onEnterStep3 = async (currentData: GerarPacoteData) => {
    // Load prospectos based on filters
    // This would be done via API call in real implementation
  };

  const validateStep3 = async (currentData: GerarPacoteData) => {
    if (!currentData.prospectos || currentData.prospectos.length === 0) {
      return 'Nenhum prospecto encontrado com os filtros definidos';
    }
    return true;
  };

  const handleComplete = async (formData: GerarPacoteData) => {
    try {
      await savePacote({
        ...formData.entity,
        acoes: formData.acoes,
        filtros: {
          prospecto: formData.filtrosProspecto,
          ligacao: formData.filtrosLigacao,
          academico: formData.filtrosAcademico,
        },
        prospectos: formData.prospectos,
      });
      alert('Pacote gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar pacote:', error);
      alert('Erro ao gerar pacote');
    }
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Gerar Pacotes</h1>
        <div className="div_form">
          <div className="form-title">Gerar Pacote de Campanha</div>
          <div className="table_form">
            <Wizard
              initialData={data}
              onDataChange={updateFields}
              steps={[
                {
                  key: 'informacoes',
                  label: 'Informações',
                  content: (
                    <div>
                      <DataTable path="/api/comercial/acao-campanha" columns={ACAO_COLUMNS} />
                    </div>
                  ),
                  validate: validateStep1,
                },
                {
                  key: 'filtros',
                  label: 'Filtros',
                  content: (
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <h3>Filtros de Prospecto</h3>
                        <DataTable path="/api/comercial/filtro-prospecto" columns={PROSPECTO_FILTER_COLUMNS} />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <h3>Filtros de Ligação</h3>
                        <DataTable path="/api/comercial/filtro-ligacao" columns={LIGACAO_FILTER_COLUMNS} />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <h3>Filtros Acadêmicos</h3>
                        <DataTable path="/api/comercial/filtro-academico" columns={ACADEMICO_FILTER_COLUMNS} />
                      </div>
                    </div>
                  ),
                  validate: validateStep2,
                  onEnter: onEnterStep3,
                },
                {
                  key: 'operacional',
                  label: 'Operacional',
                  nextLabel: 'Gerar',
                  content: (
                    <div>
                      <DataTable path="/api/comercial/prospecto" columns={[
                        { key: 'id', label: 'ID' },
                        { key: 'pessoaId', label: 'Pessoa' },
                        { key: 'nota', label: 'Nota' },
                        { key: 'dataCadastro', label: 'Data Cadastro' },
                        { key: 'acaoId', label: 'Ação' },
                      ]} />
                    </div>
                  ),
                  validate: validateStep3,
                },
              ]}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}