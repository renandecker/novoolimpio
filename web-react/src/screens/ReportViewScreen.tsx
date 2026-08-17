import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { abrirRelatorio, type RelatorioDisponivel } from '../relatorios';
import { usePermissions } from '../permissions';

const reportTypes = ['TABELA', 'GRAFICO', 'MAPA'] as const;
type ReportType = (typeof reportTypes)[number];

const routeFor: Record<ReportType, string> = {
  TABELA: 'listTabela',
  GRAFICO: 'listGrafico',
  MAPA: 'listMapa',
};

const resourceFor: Record<ReportType, string> = {
  TABELA: 'tabela',
  GRAFICO: 'grafico',
  MAPA: 'mapa',
};

const labelFor = (key: string) => key
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/^./, (letter) => letter.toUpperCase());

const valueFor = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  return String(value);
};

function isReportType(value: string | undefined): value is ReportType {
  return reportTypes.includes(value?.toUpperCase() as ReportType);
}

export default function ReportViewScreen() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [editing, setEditing] = useState(() => searchParams.get('edit') === '1');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const reportType = isReportType(tipo) ? tipo.toUpperCase() as ReportType : undefined;
  const reportId = Number(id);
  const managementOutcome = reportType ? `view/relatorios/${routeFor[reportType]}` : '';

  const report = useQuery({
    queryKey: ['relatorio-aberto', reportType, reportId],
    queryFn: () => abrirRelatorio(reportType!, reportId),
    enabled: Boolean(reportType && Number.isInteger(reportId) && reportId > 0),
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/api/relatorios/${resourceFor[reportType!]}/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios', 'disponiveis'] });
      navigate('/');
    },
  });

  if (!reportType || !Number.isInteger(reportId) || reportId <= 0) {
    return <main><h1>Relatório inválido</h1></main>;
  }
  if (report.isLoading) return <main><p>Carregando relatório...</p></main>;
  if (report.isError || !report.data) return <main><h1>Relatório indisponível</h1><p>Você não possui acesso a este relatório ou ele não existe.</p></main>;

  const canEdit = can('UPDATE', managementOutcome);
  const canDelete = can('DELETE', managementOutcome);
  const data = report.data;

  return (
    <main className="report-view">
      <div className="report-view-header">
        <div>
          <span className="report-view-type">{data.tipo}</span>
          <h1>{data.nome}</h1>
        </div>
        <div className="report-view-actions">
          {canEdit && <button className="btngreen" onClick={() => setEditing(true)}>Editar</button>}
          {canDelete && <button className="btn-danger" onClick={() => setConfirmingDelete(true)}>Excluir</button>}
        </div>
      </div>

      {editing ? (
        <ReportEditor
          type={reportType}
          id={reportId}
          initial={data.configuracao}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            queryClient.invalidateQueries({ queryKey: ['relatorio-aberto', reportType, reportId] });
            queryClient.invalidateQueries({ queryKey: ['relatorios', 'disponiveis'] });
          }}
        />
      ) : (
        <section className="report-view-content">
          <h2>Relatório</h2>
          {data.tipo === 'TABELA' && data.dados && (
            <div className="report-result">
              {data.dados.colunas.length === 0 ? <p>Este relatório ainda não possui colunas configuradas.</p> : (
                <table>
                  <thead><tr>{data.dados.colunas.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                  <tbody>{data.dados.linhas.length === 0 ? <tr><td colSpan={data.dados.colunas.length}>Nenhum registro encontrado.</td></tr> : data.dados.linhas.map((row, index) => <tr key={index}>{data.dados!.colunas.map((column) => <td key={column}>{valueFor(row[column])}</td>)}</tr>)}</tbody>
                </table>
              )}
            </div>
          )}
          <dl className="report-details">
            {Object.entries(data.configuracao)
              .filter(([key]) => key !== 'id' && !key.startsWith('todos'))
              .map(([key, value]) => <div key={key}><dt>{labelFor(key)}</dt><dd>{valueFor(value)}</dd></div>)}
          </dl>
        </section>
      )}

      {confirmingDelete && (
        <div className="modal-overlay" onClick={() => setConfirmingDelete(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Excluir relatório</h3>
            <p>Deseja excluir “{data.nome}”?</p>
            {remove.isError && <p>Não foi possível excluir o relatório.</p>}
            <div className="modal-actions">
              <button className="btnblue" onClick={() => setConfirmingDelete(false)}>Cancelar</button>
              <button className="btn-danger" disabled={remove.isPending} onClick={() => remove.mutate()}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ReportEditor({ type, id, initial, onClose, onSaved }: { type: ReportType; id: number; initial: Record<string, unknown>; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState(initial);
  const save = useMutation({
    mutationFn: () => api.put(`/api/relatorios/${resourceFor[type]}/${id}`, values),
    onSuccess: onSaved,
  });

  return (
    <section className="report-view-content">
      <h2>Editar relatório</h2>
      <form className="report-edit-form" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
        {Object.entries(values).filter(([key]) => key !== 'id').map(([key, value]) => (
          <label key={key} className="form-field">
            <span className="form-label">{labelFor(key)}</span>
            {typeof value === 'boolean' ? (
              <input type="checkbox" checked={value} onChange={(event) => setValues((previous) => ({ ...previous, [key]: event.target.checked }))} />
            ) : (
              <input
                className="form-input"
                type={typeof value === 'number' ? 'number' : 'text'}
                value={value == null ? '' : String(value)}
                onChange={(event) => setValues((previous) => ({
                  ...previous,
                  [key]: typeof value === 'number' ? Number(event.target.value) : event.target.value,
                }))}
              />
            )}
          </label>
        ))}
        {save.isError && <p>Não foi possível salvar as alterações.</p>}
        <div className="modal-actions">
          <button type="button" className="btnblue" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btngreen" disabled={save.isPending}>Salvar</button>
        </div>
      </form>
    </section>
  );
}
