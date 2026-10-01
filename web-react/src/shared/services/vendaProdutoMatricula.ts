import {api} from './api';

interface ValorProdutoRow {
    id: number;
}

export interface MaterialVendaItem {
    quantidade?: number | null;
    valor?: number | null;
}

/**
 * Insere os registros definidos em fin_venda_produto após a finalização da matrícula.
 *
 * Regra: busca o ValorProduto configurado para (unidade + curso) em
 * GET /api/financeiro/valor-produto/por-unidade-curso e, havendo configuração,
 * cria um registro em fin_venda_produto (POST /api/estoque/venda-produto) para
 * cada material, com id_forma_pagamento = valorProduto.id.
 *
 * Retorna a quantidade de vendas criadas. Nunca lança erro (falha silenciosa com warn)
 * para não bloquear a finalização da matrícula.
 */
export async function criarVendasProdutoDaMatricula(args: {
    unidadeId?: number | null;
    curriculoId?: number | null;
    pessoaId?: number | null;
    materiais: MaterialVendaItem[];
}): Promise<number> {
    const {unidadeId, curriculoId, pessoaId, materiais} = args;
    const itens = (materiais ?? []).filter((m) => (m.quantidade ?? 0) > 0);
    if (itens.length === 0) return 0;
    if (!unidadeId || !curriculoId || !pessoaId) return 0;
    try {
        const {data: valores} = await api.get<ValorProdutoRow[]>('/api/financeiro/valor-produto/por-unidade-curso', {
            params: {unidadeId, curriculoId},
        });
        const valorProduto = (valores ?? [])[0];
        if (!valorProduto) {
            console.warn('[venda-produto] nenhum ValorProduto definido para unidade/curso', {unidadeId, curriculoId});
            return 0;
        }
        let criadas = 0;
        for (const item of itens) {
            try {
                await api.post('/api/estoque/venda-produto', {
                    dataCompra: new Date().toISOString(),
                    unidadeId,
                    usuarioId: null,
                    pessoaId,
                    tipoFormaPagamento: null,
                    valor: item.valor ?? null,
                    formaPagamentoId: valorProduto.id,
                    quantidade: item.quantidade ?? 1,
                });
                criadas += 1;
            } catch (e) {
                console.warn('[venda-produto] falha ao criar venda do material', e);
            }
        }
        return criadas;
    } catch (e) {
        console.warn('[venda-produto] falha ao buscar ValorProduto da unidade/curso', e);
        return 0;
    }
}
