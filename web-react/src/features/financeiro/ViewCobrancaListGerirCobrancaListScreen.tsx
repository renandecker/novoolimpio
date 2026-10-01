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

interface GerirCobrancaItem extends ApiItem {
  data: string;
  qtdCartas: number;
  qtdEmails: number;
  qtdLigacoes: number;
  valorTotal: number;
  gerirCobrancaPessoas: GerirCobrancaPessoa[];
}

interface GerirCobrancaPessoa extends ApiItem {
  pessoa: {
    pessoaFisica: {
      nome: string;
    };
  };
  qtdCartas: number;
  qtdEmails: number;
  qtdLigacoes: number;
  valorTotal: number;
}

interface Totals {
  totalCartas: number;
  totalEmails: number;
  totalLigacoes: number;
  valorTotal: number;
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
    const date = new Date((item as unknown as GerirCobrancaItem).data);
    return date.toLocaleDateString('pt-BR');
  }},
  {key: 'qtdCartas', label: 'Cartas Enviadas'},
  {key: 'qtdEmails', label: 'Emails Enviados'},
  {key: 'qtdLigacoes', label: 'Ligações Realizadas'},
  {key: 'valorTotal', label: 'Valor', render: (item) => {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format((item as unknown as GerirCobrancaItem).valorTotal);
  }},
];

const PESSOA_COLUMNS: DataTableColumn[] = [
  {key: 'pessoa.pessoaFisica.nome', label: 'Pessoa'},
  {key: 'qtdCartas', label: 'Cartas Enviadas'},
  {key: 'qtdEmails', label: 'Emails Enviados'},
  {key: 'qtdLigacoes', label: 'Ligações Realizadas'},
  {key: 'valorTotal', label: 'Valor', render: (item) => {
    return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format((item as unknown as GerirCobrancaPessoa).valorTotal);
  }},
];

export default function ViewCobrancaListGerirCobrancaListScreen() {
  const [unidadeId, setUnidadeId] = useState<number | ''>('');
  const [mes, setMes] = useState<string>('');
  const [ano, setAno] = useState<string>('');
  const [notice, setNotice] = useState<string>('');

  const {data: unidades = []} = useQuery<Unidade[]>({
    queryKey: ['unidades'],
    queryFn: async (): Promise<Unidade[]> => {
      const response = await api.get<{content: Unidade[]} | Unidade[]>('/api/basico/unidade', {params: {size: 1000}});
      const data = response.data;
      return 'content' in data ? data.content : data;
    },
  });

  const {data: cobrancas = []} = useQuery<GerirCobrancaItem[]>({
    queryKey: ['gerirCobrancas', unidadeId, mes, ano],
    queryFn: async (): Promise<GerirCobrancaItem[]> => {
      const params: Record<string, string | number> = {size: 1000};
      if (unidadeId) params.unidadeId = unidadeId;
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      const response = await api.get<{content: GerirCobrancaItem[]}>('/api/view/cobranca/listGerirCobranca', {params});
      return response.data.content ?? [];
    },
    enabled: !!(unidadeId || mes || ano),
  });

  const totals = cobrancas.reduce((acc, item) => ({
    totalCartas: acc.totalCartas + (item.qtdCartas || 0),
    totalEmails: acc.totalEmails + (item.qtdEmails || 0),
    totalLigacoes: acc.totalLigacoes + (item.qtdLigacoes || 0),
    valorTotal: acc.valorTotal + (item.valorTotal || 0),
  }), {totalCartas: 0, totalEmails: 0, totalLigacoes: 0, valorTotal: 0} as Totals);

  const handleExport = useCallback(async (tipo: 'xlsx' | 'pdf' | 'csv' | 'xml', pageOnly: boolean) => {
    if (!unidadeId || !mes || !ano) return;
    setNotice(`Exportando ${tipo.toUpperCase()}...`);
    try {
      const response = await api.get('/api/relatorios/relatorio/disponiveis', {
        params: {
          tipoRelatorio: 'TABELA',
          unidadeId,
          mes,
          ano,
          pageOnly,
          formato: tipo,
        },
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GerirCobranca_${tipo}_${pageOnly ? 'pagina' : 'todas'}.${tipo}`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice(`Exportação ${tipo.toUpperCase()} concluída!`);
    } catch (error) {
      setNotice(`Erro ao exportar ${tipo.toUpperCase()}: ${error}`);
    }
  }, [unidadeId, mes, ano]);

  return (
    <PermissionGate permission="READ">
      <main>
        <div className="div_form">
          <div className="table_form">
            <div style={{display: 'grid', gridTemplateColumns: 'minmax(120px,160px) 1fr minmax(120px,160px) 1fr', gap: '16px', marginBottom: '16px'}}>
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
                />
              </div>
            </div>

            <DataTable
              path="/api/view/cobranca/listGerirCobranca"
              columns={COLUMNS}
              params={{unidadeId: unidadeId || undefined, mes: mes || undefined, ano: ano || undefined}}
              module="financeiro"
              outcome="gerirCobranca"
              maxMainColumns={COLUMNS.length}
            />

            <div style={{marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px'}}>
              <strong>Totais:</strong>
              <div style={{display: 'flex', gap: '24px', marginTop: '8px', flexWrap: 'wrap'}}>
                <span>Cartas Enviadas: <strong>{totals.totalCartas}</strong></span>
                <span>Emails Enviados: <strong>{totals.totalEmails}</strong></span>
                <span>Ligações Realizadas: <strong>{totals.totalLigacoes}</strong></span>
                <span>Valor Total: <strong>{new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(totals.valorTotal)}</strong></span>
              </div>
            </div>

            {notice && <p className="data-table-notice">{notice}</p>}
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}