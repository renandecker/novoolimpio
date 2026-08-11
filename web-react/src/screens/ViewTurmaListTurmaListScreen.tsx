import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Tabs } from '../Tabs';
import {
  UNIDADE_SOURCE,
  UNIDADE_COLUMNS,
  UNIDADE_SEARCH,
  COMPONENTE_SOURCE,
  COMPONENTE_COLUMNS,
  COMPONENTE_SEARCH,
} from '../masterDetailSources';
import type { ApiItem } from '../types';

const TURMA_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
];

const MATRICULA_COLUMNS: DataTableColumn[] = [
  { key: 'contratoId', label: 'Contrato' },
  { key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento' },
  { key: 'formaPagamentoId', label: 'Forma de Pagamento' },
  { key: 'status', label: 'Status' },
  { key: 'data', label: 'Data' },
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

export default function ViewTurmaListTurmaListScreen() {
  const [unidades, setUnidades] = useState<ApiItem[]>([]);
  const [componentes, setComponentes] = useState<ApiItem[]>([]);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Turma</h1>
        <Tabs
          tabs={[
            {
              key: 'turma',
              label: 'Turma',
              content: <DataTable path="/api/educacao/turma" columns={TURMA_COLUMNS} />,
            },
            {
              key: 'matriculas',
              label: 'Matrículas',
              content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} />,
            },
            { key: 'notas', label: 'Notas', content: <p className="master-detail-empty">Notas da turma.</p> },
            { key: 'presencas', label: 'Presenças', content: <p className="master-detail-empty">Presenças da turma.</p> },
            {
              key: 'diaAula',
              label: 'Dias Aula',
              content: <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={DIAS_AULA_COLUMNS} />,
            },
            { key: 'comparativoAula', label: 'Comparativo Aula', content: <p className="master-detail-empty">Comparativo de aulas.</p> },
            {
              key: 'selecioneProfessor',
              label: 'Professor',
              content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS} />,
            },
            { key: 'selecionarAluno', label: 'Selecionando Aluno', content: <p className="master-detail-empty">Seleção de aluno.</p> },
            { key: 'novaTurma', label: 'Selecionando nova Turma', content: <p className="master-detail-empty">Seleção de nova turma.</p> },
            {
              key: 'unidade',
              label: 'Unidade',
              content: (
                <MasterDetail
                  label="Unidade"
                  source={UNIDADE_SOURCE}
                  valueKey="id"
                  searchKeys={UNIDADE_SEARCH}
                  columns={UNIDADE_COLUMNS}
                  items={unidades}
                  onChange={setUnidades}
                />
              ),
            },
            {
              key: 'componente',
              label: 'Componente Curricular',
              content: (
                <MasterDetail
                  label="Componente Curricular"
                  source={COMPONENTE_SOURCE}
                  valueKey="id"
                  searchKeys={COMPONENTE_SEARCH}
                  columns={COMPONENTE_COLUMNS}
                  items={componentes}
                  onChange={setComponentes}
                />
              ),
            },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
