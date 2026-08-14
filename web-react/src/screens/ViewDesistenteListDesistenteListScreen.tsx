import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { CancelamentoModal } from '../CancelamentoModal';

const DESISTENTE_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'contratoId', label: 'Contrato' },
  { key: 'motivoId', label: 'Motivo' },
  { key: 'pessoaFuncionarioId', label: 'Funcionário' },
  { key: 'dataCriacao', label: 'Data Criação' },
  { key: 'ativo', label: 'Ativo' },
];

// listDesistente.xhtml (olimpio.zip) shows a plain list of alunos desistentes; the row actions
// "Reativar", "Reparcelamento" and "Cancelamento de Contrato" each open their own modal — the
// "Cancelamento" wizard is not a page-level tab.
export default function ViewDesistenteListDesistenteListScreen() {
  const [cancelamentoAberto, setCancelamentoAberto] = useState(false);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>List Desistente</h1>
        <div className="div_form">
          <div className="form-title">Desistente</div>
          <div className="modal-actions" style={{ marginBottom: '0.5rem' }}>
            <button type="button" className="btn-danger" onClick={() => setCancelamentoAberto(true)}>
              Cancelamento de Contrato
            </button>
          </div>
          <DataTable path="/api/educacao/desistente" columns={DESISTENTE_COLUMNS} />
        </div>
        {cancelamentoAberto && <CancelamentoModal onClose={() => setCancelamentoAberto(false)} />}
      </main>
    </PermissionGate>
  );
}
