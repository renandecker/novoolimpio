import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { PermissionGate } from '../permissions';

interface UnidadeRow {
  id: number;
  nome_fantasia?: string;
  razao_social?: string;
  fl_ativo?: boolean;
}

interface ControleEstoqueRow {
  id: number;
  valor?: number | null;
  quantidade: number;
  qtdeSolicitado: number;
  qtdeDefeito: number;
  qtdeFalta: number;
  qtdeNaoEncontrado: number;
  qtdeReservado: number;
  qtdeAprovadoNaoEntregue: number;
  produtoId?: number | null;
  unidadeId?: number | null;
}

export default function ViewEstoqueEstoqueprodutoListScreen() {
  const [unidadeId, setUnidadeId] = useState('');

  const unidadesQuery = useQuery({
    queryKey: ['estoque-estoqueproduto-unidades'],
    queryFn: async () => (await api.get<UnidadeRow[]>('/api/view/unidade/listUnidade')).data,
  });

  const controleQuery = useQuery({
    queryKey: ['estoque-estoqueproduto-controle', unidadeId],
    queryFn: async () =>
      (await api.get<ControleEstoqueRow[]>('/api/estoque/estoque-produto/controle', { params: { unidadeId } })).data,
    enabled: !!unidadeId,
  });

  const unidades = (unidadesQuery.data ?? []).filter((u) => u.fl_ativo !== false);
  const itens = controleQuery.data ?? [];

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Estoque Produto</h1>
        <div className="disp-filtros">
          <div className="disp-filtro">
            <label htmlFor="estoque-unidade">Unidade</label>
            <select
              id="estoque-unidade"
              className="disp-select"
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
            >
              <option value="">Selecione a unidade</option>
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome_fantasia || u.razao_social || `Unidade ${u.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!unidadeId ? (
          <p className="disp-aviso">Selecione uma unidade para visualizar o estoque.</p>
        ) : controleQuery.isLoading ? (
          <p>Carregando...</p>
        ) : itens.length === 0 ? (
          <p>Nenhum item de controle de estoque encontrado.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Valor</th>
                <th>Quantidade</th>
                <th>Solicitado</th>
                <th>Defeito</th>
                <th>Falta</th>
                <th>Não Encontrado</th>
                <th>Reservado</th>
                <th>Aprovado N. Entregue</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.produtoId ?? ''}</td>
                  <td>{item.valor ?? ''}</td>
                  <td>{item.quantidade}</td>
                  <td>{item.qtdeSolicitado}</td>
                  <td>{item.qtdeDefeito}</td>
                  <td>{item.qtdeFalta}</td>
                  <td>{item.qtdeNaoEncontrado}</td>
                  <td>{item.qtdeReservado}</td>
                  <td>{item.qtdeAprovadoNaoEntregue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </PermissionGate>
  );
}
