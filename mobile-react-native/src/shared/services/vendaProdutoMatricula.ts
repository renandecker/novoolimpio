import {api} from './api';

export interface MaterialVendaItem {
    quantidade?: number | null;
    valor?: number | null;
}

/**
 * Mobile: insere em fin_venda_produto os registros definidos no ValorProduto
 * (unidade + curso) após a finalização da matrícula.
 * Nunca lança erro para não bloquear a matrícula.
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
        const {data: valores} = await api.get<Array<{id: number}>>('/api/financeiro/valor-produto/por-unidade-curso', {
            params: {unidadeId, curriculoId},
        });
        const valorProduto = (valores ?? [])[0];
        if (!valorProduto) return 0;
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
            } catch {}
        }
        return criadas;
    } catch {
        return 0;
    }
}
