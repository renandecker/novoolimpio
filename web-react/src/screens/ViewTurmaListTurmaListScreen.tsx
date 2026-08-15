import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import { Tabs } from '../Tabs';
import { Wizard } from '../Wizard';
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

/** <p:dialog id="dialogo" header="Finalizando Turma"><p:tabView> — plain tabs, not a wizard. */
function FinalizarTurmaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
        <h2>Finalizando Turma</h2>
        <Tabs
          tabs={[
            {
              key: 'matriculas',
              label: 'Matrículas',
              content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} />,
            },
            { key: 'notas', label: 'Notas', content: <p className="master-detail-empty">Notas da turma.</p> },
            { key: 'presencas', label: 'Presenças', content: <p className="master-detail-empty">Presenças da turma.</p> },
          ]}
        />
        <div className="modal-actions form-footer">
          <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

/** <p:dialog id="dialogProrrogando" widgetVar="prorrogando"><p:wizard> — Dias Aula / Comparativo Aula / Professor. */
function ProrrogarTurmaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
        <h2>Prorrogando Turma</h2>
        <Wizard
          completeLabel="Concluir"
          onComplete={onClose}
          steps={[
            {
              key: 'diaAula',
              label: 'Dias Aula',
              content: <DataTable path="/api/educacao/ocorrencia-componente-curricular" columns={DIAS_AULA_COLUMNS} />,
            },
            {
              key: 'comparativoAula',
              label: 'Comparativo Aula',
              content: <p className="master-detail-empty">Comparativo de aulas.</p>,
            },
            {
              key: 'selecioneProfessor',
              label: 'Professor',
              nextLabel: 'Salvar',
              content: <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

/** <p:dialog header="Trocar aluno da turma"><p:wizard id="wizardtroca" showNavBar="false"> — Selecionando Aluno / Nova Turma. */
function TrocarTurmaModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
        <h2>Trocar aluno da turma</h2>
        <Wizard
          completeLabel="Concluir"
          onComplete={onClose}
          steps={[
            { key: 'selecionarAluno', label: 'Selecionando Aluno', content: <p className="master-detail-empty">Seleção de aluno.</p> },
            { key: 'novaTurma', label: 'Selecionando nova Turma', nextLabel: 'Finalizar', content: <p className="master-detail-empty">Seleção de nova turma.</p> },
          ]}
        />
      </div>
    </div>
  );
}

export default function ViewTurmaListTurmaListScreen() {
  const [unidades, setUnidades] = useState<ApiItem[]>([]);
  const [componentes, setComponentes] = useState<ApiItem[]>([]);
  const [finalizarAberto, setFinalizarAberto] = useState(false);
  const [prorrogarAberto, setProrrogarAberto] = useState(false);
  const [trocarAberto, setTrocarAberto] = useState(false);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Turma</h1>

        <div className="div_form">
          <div className="form-title">Filtros</div>
          <div className="table_form">
            <MasterDetail
              label="Unidade"
              source={UNIDADE_SOURCE}
              valueKey="id"
              searchKeys={UNIDADE_SEARCH}
              columns={UNIDADE_COLUMNS}
              items={unidades}
              onChange={setUnidades}
            />
            <MasterDetail
              label="Componente Curricular"
              source={COMPONENTE_SOURCE}
              valueKey="id"
              searchKeys={COMPONENTE_SEARCH}
              columns={COMPONENTE_COLUMNS}
              items={componentes}
              onChange={setComponentes}
            />
          </div>
        </div>

        {/* Cada botão abaixo corresponde a um <p:menuitem>/<p:dialog> independente em
            listTurma.xhtml — não são etapas de um único wizard de página. */}
        <div className="modal-actions" style={{ margin: '0.5rem 0' }}>
          <button type="button" className="btnblack" onClick={() => setFinalizarAberto(true)}>
            Finalizar Turma
          </button>
          <button type="button" className="btnyellow" onClick={() => setProrrogarAberto(true)}>
            Cancelar ou Prorrogar
          </button>
          <button type="button" className="btnsky" onClick={() => setTrocarAberto(true)}>
            Trocar Turma
          </button>
        </div>

        <DataTable path="/api/educacao/turma" columns={TURMA_COLUMNS} />

        {finalizarAberto && <FinalizarTurmaModal onClose={() => setFinalizarAberto(false)} />}
        {prorrogarAberto && <ProrrogarTurmaModal onClose={() => setProrrogarAberto(false)} />}
        {trocarAberto && <TrocarTurmaModal onClose={() => setTrocarAberto(false)} />}
      </main>
    </PermissionGate>
  );
}
