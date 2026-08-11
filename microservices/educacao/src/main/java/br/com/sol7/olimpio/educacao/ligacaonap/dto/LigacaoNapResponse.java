package br.com.sol7.olimpio.educacao.ligacaonap;

import java.math.BigDecimal;
import java.util.Date;

public record LigacaoNapResponse(Long id, Long usuarioId, Date dataInicial, Date dataFinal, Long resultadoLigacaoNapId, String telefone, String observacao, Long compromissoId, Long etapasNapId, Date retornoAula, boolean ativo, Integer qtdeAulaFeita, Integer qtdeAulaPresente, Integer qtdeAulaMeiaPresente, Integer qtdeFalta, BigDecimal mediaNota, BigDecimal notaTotal, BigDecimal notaExecutadas, BigDecimal notaObtida, Integer qtdeAula, Long contratoId, Long cadernoRetornoId, Integer qtdeAulaAtrasado) {}
