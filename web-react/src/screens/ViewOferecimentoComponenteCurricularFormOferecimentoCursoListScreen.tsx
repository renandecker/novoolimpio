import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard } from '../Wizard';

const CURSO_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Grupo' },
  { key: 'curriculo_descricao', label: 'Curso' },
];

const DIAS_AULA_COLUMNS: DataTableColumn[] = [
  { key: 'oferecimentoComponenteCurricular_descricao', label: 'Disciplina' },
  { key: 'data', label: 'Data' },
  { key: 'sala_descricao', label: 'Sala' },
  { key: 'diaAula_descricao', label: 'Dia Aula' },
  { key: 'aulaCoringa', label: 'Aula Coringa' },
  { key: 'aulaPresencial', label: 'Presencial' },
];

const PROFESSOR_COLUMNS: DataTableColumn[] = [
  { key: 'pessoaId', label: 'Pessoa' },
  { key: 'ativo', label: 'Ativo' },
  { key: 'dataInicio', label: 'Início' },
  { key: 'dataFim', label: 'Fim' },
];

export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Oferecimento Curso</h1>
        <div className="div_form">
          <div className="form-title">Oferecimento Curso</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'oferecimento',
                  label: 'Curso',
                  content: <DataTable path="/api/educacao/oferecimento-curso" columns={CURSO_COLUMNS} />,
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
