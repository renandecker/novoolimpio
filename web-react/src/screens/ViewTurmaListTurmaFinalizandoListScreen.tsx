import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';
import { COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH, TURMA_SOURCE, TURMA_COLUMNS, TURMA_SEARCH } from '../masterDetailSources';

export default function ViewTurmaListTurmaFinalizandoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Turma Finalizando</h1>
        <ModuleTabs
          tabs={[
            { key: 'matriculas', label: 'Matrículas', path: '/api/view/turma/listTurmaFinalizando' },
            { key: 'notas', label: 'Notas', empty: 'Conteúdo de Notas.' },
            { key: 'presencas', label: 'Presenças', empty: 'Conteúdo de Presenças.' },
            { key: 'diasAula', label: 'Dias Aula', empty: 'Conteúdo de Dias Aula.' },
            { key: 'comparativoAula', label: 'Comparativo Aula', empty: 'Conteúdo de Comparativo Aula.' },
            { key: 'professor', label: 'Professor', empty: 'Conteúdo de Professor.' },
            { key: 'selecionandoAluno', label: 'Selecionando Aluno', empty: 'Conteúdo de Selecionando Aluno.' },
            { key: 'selecionandoNovaTurma', label: 'Selecionando nova Turma', masterDetail: { label: 'Selecionando nova Turma', source: TURMA_SOURCE, valueKey: 'id', searchKeys: TURMA_SEARCH, columns: TURMA_COLUMNS } },
            { key: 'informacoes', label: 'Informações', empty: 'Conteúdo de Informações.' },
            { key: 'disponibilidade', label: 'Disponibilidade', empty: 'Conteúdo de Disponibilidade.' },
            { key: 'componenteCurricular', label: 'Componente Curricular', masterDetail: { label: 'Componente Curricular', source: COMPONENTE_SOURCE, valueKey: 'id', searchKeys: COMPONENTE_SEARCH, columns: COMPONENTE_COLUMNS } },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
