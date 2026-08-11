import { useState } from 'react';
import { api } from '../api';
import { PermissionGate } from '../permissions';
import { DataTable, PAGE_SIZES } from '../DataTable';
import { useModulePaged } from '../useModulePaged';
import { AutoComplete, type AutoCompleteOption } from '../AutoComplete';
import { Wizard } from '../Wizard';
import type { ApiItem } from '../types';

const CONTRACT_COLUMNS = [
  { key: 'id', label: 'Contrato' },
  { key: 'id_pessoa', label: 'Aluno' },
  { key: 'id_curso', label: 'Curso' },
  { key: 'id_unidade', label: 'Unidade' },
  { key: 'id_unidade_resposavel', label: 'Unidade Responsável' },
  { key: 'data', label: 'Data' },
  { key: 'ativo', label: 'Status' },
  { key: 'qtde_parcelas_atrasadas', label: 'Pendente' },
  { key: 'valor_parcelas', label: 'Valor' },
];

const ACTION_STEPS = [
  { key: 'situacao', label: 'Situação Financeira', empty: 'Situação financeira do aluno.' },
  { key: 'pessoais', label: 'Dados Pessoais', empty: 'Dados pessoais do aluno.' },
  { key: 'historicoNap', label: 'Histórico NAP', empty: 'Histórico de atendimentos no NAP.' },
  { key: 'historicoCobranca', label: 'Histórico Cobrança', empty: 'Histórico de cobranças do aluno.' },
  { key: 'notas', label: 'Notas', empty: 'Notas do aluno.' },
  { key: 'presencas', label: 'Presenças', empty: 'Presenças do aluno.' },
  { key: 'historicoAluno', label: 'Histórico aluno', empty: 'Histórico completo do aluno.' },
];

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const renderValue = (item: ApiItem, key: string) => {
  const value = asRecord(item)[key];
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

function ContractsTable({ searchedIds }: { searchedIds: number[] | null }) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZES[0]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const q = useModulePaged('/api/view/contrato/colunasContrato', page, size);
  const all = q.data?.content ?? [];
  const totalElements = q.data?.totalElements ?? 0;
  const totalPages = Math.max(1, q.data?.totalPages ?? 0);

  const items = searchedIds
    ? all.filter((item) => searchedIds.includes(Number(item.id)))
    : all;
  const colSpan = 2 + CONTRACT_COLUMNS.length;

  return (
    <div className="data-table">
      {q.isError ? (
        <p>Erro ao carregar os contratos.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="col-toggle"></th>
              <th className="col-id">Id</th>
              {CONTRACT_COLUMNS.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.isLoading && items.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>Carregando...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  {searchedIds ? 'Nenhum aluno encontrado.' : 'Nenhum registro encontrado.'}
                </td>
              </tr>
            ) : (
              items.flatMap((item) => {
                const rowKey = String(item.id);
                const isOpen = Boolean(expanded[rowKey]);
                const row = (
                  <tr key={`${rowKey}-row`}>
                    <td className="col-toggle">
                      <button
                        type="button"
                        className="btn-row-toggle"
                        title={isOpen ? 'Recolher' : 'Expandir'}
                        onClick={() => setExpanded((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                      >
                        {isOpen ? '▾' : '▸'}
                      </button>
                    </td>
                    <td className="col-id">{item.id}</td>
                    {CONTRACT_COLUMNS.map((column) => (
                      <td key={column.key}>{renderValue(item, column.key)}</td>
                    ))}
                  </tr>
                );
                if (!isOpen) return [row];
                return [
                  row,
                  <tr key={`${rowKey}-detail`} className="row-detail">
                    <td colSpan={colSpan}>
                      <DataTable path="/api/view/matricula/colunasMatricula" />
                    </td>
                  </tr>,
                ];
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={colSpan} className="data-table-paginator">
                <button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0 || q.isFetching}>
                  Anterior
                </button>
                <span>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                  disabled={page >= totalPages - 1 || q.isFetching}
                >
                  Próxima
                </button>
                <label>
                  Registros por página
                  <select
                    value={size}
                    onChange={(event) => {
                      setSize(Number(event.target.value));
                      setPage(0);
                    }}
                  >
                    {PAGE_SIZES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <span>Total: {totalElements}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

export default function ViewGestaoAlunoGestaoAlunoListScreen() {
  const [aluno, setAluno] = useState<AutoCompleteOption | null>(null);
  const [searchedIds, setSearchedIds] = useState<number[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [erro, setErro] = useState('');

  const fetchAlunos = async (query: string): Promise<AutoCompleteOption[]> => {
    const { data } = await api.get<{ id: number; nome: string }[]>(
      '/api/educacao/contrato/auto-complete-aluno',
      { params: { query } },
    );
    return (data ?? []).map((item) => ({ id: item.id, label: item.nome || `#${item.id}` }));
  };

  const selecionarAluno = (option: AutoCompleteOption | null) => {
    setAluno(option);
    setErro('');
    if (!option) {
      setSearchedIds(null);
      return;
    }
    setSearching(true);
    api
      .get<number[]>('/api/educacao/contrato/buscar-contratos-pessoa', { params: { pessoaId: option.id } })
      .then((response) => setSearchedIds(response.data ?? []))
      .catch(() => {
        setSearchedIds([]);
        setErro('Erro ao buscar os contratos do aluno.');
      })
      .finally(() => setSearching(false));
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Gestão de Aluno</h1>
        <section className="div_form">
          <div className="form-title">Gestão do Aluno</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'busca',
                  label: 'Buscar Aluno',
                  content: (
                    <>
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="form-label">Aluno</span>
                          <AutoComplete
                            placeholder="Digite ao menos 3 caracteres..."
                            value={aluno}
                            onChange={selecionarAluno}
                            fetchOptions={fetchAlunos}
                          />
                        </label>
                      </div>
                      {erro && <p className="form-erro">{erro}</p>}
                      <div className="modal-actions">
                        <button
                          type="button"
                          className="btn-form-save"
                          onClick={() => aluno && selecionarAluno(aluno)}
                          disabled={searching || !aluno}
                        >
                          {searching ? 'Buscando...' : 'Buscar/Atualizar'}
                        </button>
                        <button type="button" className="btn-form-back" onClick={() => selecionarAluno(null)}>
                          Limpar campo
                        </button>
                      </div>
                    </>
                  ),
                },
                ...ACTION_STEPS.map((step, index) => ({
                  key: step.key,
                  label: step.label,
                  nextLabel: index === ACTION_STEPS.length - 1 ? 'Finalizar' : undefined,
                  content: <p className="master-detail-empty">{step.empty}</p>,
                })),
              ]}
            />
          </div>
        </section>
        <ContractsTable searchedIds={searchedIds} />
      </main>
    </PermissionGate>
  );
}
