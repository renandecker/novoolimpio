import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {useState, useCallback} from 'react';
import {api} from '../../shared/services/api';
import {useQuery} from '@tanstack/react-query';
import type {ApiItem} from '../../shared/types/types';

interface Unidade {
  id: number;
  sucinto: string;
}

interface GerirNapItem extends ApiItem {
  data: string;
  qtdCartas: number;
  qtdEmails: number;
  qtdLigacoes: number;
  qtdSemRegistro: number;
  qtdPresente: number;
  qtdMeiaPresenca: number;
  qtdAusente: number;
  qtdAtestado: number;
  qtdCancelado: number;
  qtdTrocaTurma: number;
  qtdProrrogado: number;
  qtdDesistente: number;
  qtdAtrasado: number;
  gerirNapsPessoas: GerirNapPessoa[];
}

interface GerirNapPessoa extends ApiItem {
  pessoa: {
    pessoaFisica: {
      nome: string;
    };
  };
  qtdCartas: number;
  qtdEmails: number;
  qtdLigacoes: number;
  qtdSemRegistro: number;
  qtdPresente: number;
  qtdMeiaPresenca: number;
  qtdAusente: number;
  qtdAtestado: number;
  qtdCancelado: number;
  qtdTrocaTurma: number;
  qtdProrrogado: number;
  qtdDesistente: number;
  qtdAtrasado: number;
}

const MESES = [
  {value: '01', label: 'Janeiro'},
  {value: '02', label: 'Fevereiro'},
  {value: '03', label: 'Março'},
  {value: '04', label: 'Abril'},
  {value: '05', label: 'Maio'},
  {value: '06', label: 'Junho'},
  {value: '07', label: 'Julho'},
  {value: '08', label: 'Agosto'},
  {value: '09', label: 'Setembro'},
  {value: '10', label: 'Outubro'},
  {value: '11', label: 'Novembro'},
  {value: '12', label: 'Dezembro'},
];

const COLUMNS: DataTableColumn[] = [
  {key: 'data', label: 'Data', render: (item) => {
    const date = new Date((item as unknown as GerirNapItem).data);
    return date.toLocaleDateString('pt-BR');
  }},
  {key: 'qtdCartas', label: 'Cartas Enviadas'},
  {key: 'qtdEmails', label: 'Emails Enviados'},
  {key: 'qtdLigacoes', label: 'Ligações Realizadas'},
  {key: 'qtdSemRegistro', label: 'Sem Registro'},
  {key: 'qtdPresente', label: 'Presente'},
  {key: 'qtdMeiaPresenca', label: 'Meia Presença'},
  {key: 'qtdAusente', label: 'Ausente'},
  {key: 'qtdAtestado', label: 'Atestado'},
  {key: 'qtdCancelado', label: 'Cancelado'},
  {key: 'qtdTrocaTurma', label: 'Troca de Turma'},
  {key: 'qtdProrrogado', label: 'Prorrogado'},
  {key: 'qtdDesistente', label: 'Desistente'},
  {key: 'qtdAtrasado', label: 'Atrasado'},
];

export default function ViewNapListGerirNapListScreen() {
  const [unidadeId, setUnidadeId] = useState<number | ''>('');
  const [mes, setMes] = useState<string>('');
  const [ano, setAno] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [notice, setNotice] = useState<string>('');

  const {data: unidades = []} = useQuery<Unidade[]>({
    queryKey: ['unidades'],
    queryFn: async (): Promise<Unidade[]> => {
      const response = await api.get<{content: Unidade[]} | Unidade[]>('/api/basico/unidade', {params: {size: 1000}});
      const data = response.data;
      return 'content' in data ? data.content : data;
    },
  });

  const carregarNap = useCallback(async () => {
    if (!unidadeId || !mes || !ano) return;
    setNotice('Carregando...');
    try {
      const response = await api.get<{content: GerirNapItem[]}>('/api/view/nap/listGerirNap', {
        params: {unidadeId, mes, ano, size: 1000},
      });
      setNotice('');
      return response.data.content ?? [];
    } catch (error) {
      setNotice(`Erro ao carregar: ${error}`);
      return [];
    }
  }, [unidadeId, mes, ano]);

  const handleFilterChange = useCallback(() => {
    carregarNap();
  }, [carregarNap]);

  return (
    <PermissionGate permission="READ">
      <main>
        <div className="div_form">
          <div className="form-title">Gerir NAP</div>
          <div className="table_form">
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px'}}>
              <div className="form-field">
                <label className="form-label" htmlFor="unidade">Unidade</label>
                <select
                  id="unidade"
                  className="form-input form-select"
                  value={unidadeId}
                  onChange={(e) => setUnidadeId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">-- Selecione --</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>{u.sucinto}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="mes">Mês</label>
                <select
                  id="mes"
                  className="form-input form-select"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                >
                  <option value="">-- Selecione --</option>
                  {MESES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  className="form-input"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="AAAA"
                  min={2000}
                  max={2100}
                  style={{width: '100px'}}
                />
              </div>
            </div>

            {(unidadeId && mes && ano) && (
              <DataTable
                path="/api/view/nap/listGerirNap"
                columns={COLUMNS}
                params={{unidadeId, mes, ano}}
                module="educacao"
                outcome="gerirNap"
                maxMainColumns={COLUMNS.length}
                extraRowActions={[
                  {
                    key: 'expandir',
                    title: 'Expandir/Recolher',
                    icon: '▾',
                    className: 'btn-action btnyellow',
                    onClick: async (item: ApiItem) => {
                      setExpandedRows(prev => ({...prev, [item.id]: !prev[item.id]}));
                    },
                  },
                ]}
              />
            )}

            {notice && <p className="data-table-notice">{notice}</p>}
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}