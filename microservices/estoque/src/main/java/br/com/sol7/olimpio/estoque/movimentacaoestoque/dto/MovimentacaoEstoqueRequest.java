package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import br.com.sol7.olimpio.shared.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.util.Date;

public record MovimentacaoEstoqueRequest(BigDecimal valor,int quantidade,TipoMovimentacao tipoMovimentacao,Date dataMovimento,Long usuarioId,Long produtoId,Long unidadeId,Long vendaProdutoId,Long unidadeCentralId,Long fornecedorId,boolean central){}
