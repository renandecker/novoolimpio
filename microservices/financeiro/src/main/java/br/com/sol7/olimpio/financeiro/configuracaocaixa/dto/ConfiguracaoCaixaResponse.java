package br.com.sol7.olimpio.financeiro.configuracaocaixa;
import java.math.BigDecimal;

public record ConfiguracaoCaixaResponse(Long id, Long unidadeId, BigDecimal fundoCaixa, int dias, String email, int impressao, Boolean pagPropriaUnid, Long usuarioId, Long responsavelId, String templateCaixa, int tipoModeloCaixa) {}
