import { useState } from 'react';
import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import type { ApiItem } from '../types';
import { CancelamentoModal } from '../CancelamentoModal';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!match) return String(value);
  return `${match[3]}/${match[2]}/${match[1]}`;
};

const DESISTENTE_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'data_criacao', label: 'Data Desistente', render: (item) => formatDate(asRecord(item).data_criacao) },
  { key: 'id_contrato', label: 'Contrato' },
  { key: 'pessoa_aluno_descricao', label: 'Nome Aluno' },
  { key: 'pessoa_notificou_descricao', label: 'Nome Funcionário' },
  { key: 'motivo_descricao', label: 'Motivo' },
];

export default function ViewDesistenteListDesistenteListScreen() {
  const [cancelamentoAberto, setCancelamentoAberto] = useState(false);

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Desistente</h1>
        <div className="div_form">
          <div className="form-title">Desistente</div>
          <div className="modal-actions" style={{ marginBottom: '0.5rem' }}>
            <button type="button" className="btn-danger" onClick={() => setCancelamentoAberto(true)}>
              Cancelamento de Contrato
            </button>
          </div>
          <DataTable path="/api/view/desistente/listDesistente" columns={DESISTENTE_COLUMNS} />
        </div>
        {cancelamentoAberto && <CancelamentoModal onClose={() => setCancelamentoAberto(false)} />}
      </main>
    </PermissionGate>
  );
}
