package br.com.sol7.olimpio.estoque.solicitacaoestoque;

import br.com.sol7.olimpio.shared.enums.Motivo;
import java.math.BigDecimal;
import java.util.Date;

public record SolicitacaoEstoqueRequest(BigDecimal valor, int quantidade, Long vendaProdutoId, Long usuarioId, Long produtoId, Long unidadeId, Date dataSolicitacao, boolean ativo, Motivo motivo, Long idMotivo) {}
