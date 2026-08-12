import React from 'react';
import { ModuleTabs } from '../ModuleTabs';
import { UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH, COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH } from '../masterDetailSources';

export default function ViewTurmaListTurmaListScreen() {
  return (
    <ModuleTabs
      tabs={[
        { key: 'turma', label: 'Turma', path: '/api/educacao/turma' },
        { key: 'matriculas', label: 'Matrículas', path: '/api/educacao/matricula' },
        { key: 'notas', label: 'Notas', empty: 'Notas da turma.' },
        { key: 'presencas', label: 'Presenças', empty: 'Presenças da turma.' },
        { key: 'diaAula', label: 'Dias Aula', path: '/api/educacao/ocorrencia-componente-curricular' },
        { key: 'comparativoAula', label: 'Comparativo Aula', empty: 'Comparativo de aulas.' },
        { key: 'selecioneProfessor', label: 'Professor', path: '/api/professor/professor' },
        { key: 'selecionarAluno', label: 'Selecionando Aluno', empty: 'Seleção de aluno.' },
        { key: 'novaTurma', label: 'Selecionando nova Turma', empty: 'Seleção de nova turma.' },
        {
          key: 'unidade',
          label: 'Unidade',
          masterDetail: { label: 'Unidade', source: UNIDADE_SOURCE, valueKey: 'id', searchKeys: UNIDADE_SEARCH, columns: UNIDADE_COLUMNS },
        },
        {
          key: 'componente',
          label: 'Componente Curricular',
          masterDetail: { label: 'Componente Curricular', source: COMPONENTE_SOURCE, valueKey: 'id', searchKeys: COMPONENTE_SEARCH, columns: COMPONENTE_COLUMNS },
        },
      ]}
    />
  );
}

