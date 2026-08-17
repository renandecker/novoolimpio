package br.com.sol7.olimpio.pagamento.parcelacartao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ParcelaCartaoResponse(
        Long id,
        Long idParcela,
        Long idCartaoPessoa,
        String tipoPagamento,
        int qtdParcelas,
        BigDecimal valor,
        String status,
        String ipgTransactionId,
        String orderId,
        String codigoAutorizacao,
        String mensagemRetorno,
        LocalDateTime dataTransacao) {}
