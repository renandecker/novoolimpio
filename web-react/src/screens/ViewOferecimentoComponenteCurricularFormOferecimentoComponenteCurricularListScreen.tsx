import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard } from '../Wizard';

const TIPO_PLANEJAMENTO_OPTIONS = [
  { value: 'DISPONIBILIDADE_AULA', label: 'Disponibilidade aula' },
  { value: 'DISPONIBILIDADE_SEQUENTE', label: 'Disponibilidade sequente' },
  { value: 'DISPONIBILIDADE_LIVRE', label: 'Disponibilidade livre' },
];

const OFERECIMENTO_COLUMNS: DataTableColumn[] = [
  { key: 'unidadeId', label: 'Unidade' },
  { key: 'grupoId', label: 'Grupo' },
  { key: 'salaId', label: 'Sala' },
  { key: 'curriculoId', label: 'Curso' },
  { key: 'componenteCurricularId', label: 'Componente Curricular' },
  { key: 'professorId', label: 'Professor' },
  { key: 'vagas', label: 'Vagas' },
  { key: 'inscritos', label: 'Inscritos' },
  { key: 'status', label: 'Status' },
  { key: 'tipoPlanejamento', label: 'Tipo Planejamento', options: TIPO_PLANEJAMENTO_OPTIONS },
  { key: 'dataInicio', label: 'Início' },
  { key: 'dataFim', label: 'Fim' },
];

const DIAS_AULA_COLUMNS: DataTableColumn[] = [
  { key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento' },
  { key: 'data', label: 'Data' },
  { key: 'professorId', label: 'Professor' },
  { key: 'salaId', label: 'Sala' },
  { key: 'aulaCoringa', label: 'Aula Coringa' },
  { key: 'aulaPresencial', label: 'Presencial' },
  { key: 'ativo', label: 'Ativo' },
];

const PROFESSOR_COLUMNS: DataTableColumn[] = [
  { key: 'pessoaId', label: 'Pessoa' },
  { key: 'ativo', label: 'Ativo' },
  { key: 'dataInicio', label: 'Início' },
  { key: 'dataFim', label: 'Fim' },
];

export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Oferecimento Componente Curricular</h1>
        <div className="div_form">
          <div className="form-title">Oferecimento Componente Curricular</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'oferecimento',
                  label: 'Componente Curricular',
                  content: <DataTable path="/api/educacao/oferecimento-componente-curricular" columns={OFERECIMENTO_COLUMNS} />,
                },
                {
                  key: 'tabDiaAula',
                  label: 'Dias Aula',
                  content: <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={DIAS_AULA_COLUMNS} />,
                },
                {
                  key: 'tabProfessor',
                  label: 'Professor',
                  nextLabel: 'Salvar',
                  content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS} />,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
