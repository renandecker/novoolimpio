package br.com.sol7.olimpio.financeiro.caixa;
import java.util.Date;
import java.math.BigDecimal;

public record CaixaRequest(Date data, Date dataFechamento, Long usuarioId, BigDecimal fundoCaixa, Long impressoraId, Long unidadeId, int idCaixaUnidade, String documento) {}
