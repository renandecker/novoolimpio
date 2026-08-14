package br.com.sol7.olimpio.asaas.pagamento_pix.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ParcelaPixResponse(
        Long id,
        String qrcode,
        String chave,
        String situacao,
        BigDecimal valor,
        BigDecimal valorPago,
        String providerChargeId,
        String endToEndId,
        LocalDate dataVencimento,
        LocalDateTime dataCriacao,
        LocalDateTime dataPagamento) {}
