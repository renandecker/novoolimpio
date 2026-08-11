package br.com.sol7.olimpio.financeiro.ligacaocobranca;

import java.math.BigDecimal;
import java.util.Date;

public record LigacaoCobrancaResponse(Long id, Long usuarioId, Long contratoId, Date dataInicial, Date dataFinal, Long resultadoCobrancaId, String telefone, String observacao, Long compromissoId, boolean ativo, Long etapasCobrancaId, Integer qtdeParcela, BigDecimal valor) {}
