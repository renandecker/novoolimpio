package br.com.sol7.olimpio.asaas.parcela;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FinAsaasParcelaRequest(
        String billingType,
        LocalDateTime dataCriacao,
        LocalDate paymentDate,
        Double value,
        String installment,
        String asaasId,
        String status,
        String url,
        String urlPagamento,
        String description,
        Integer installmentNumber,
        Double discount,
        Double fine,
        Double interest,
        String discountType,
        String fineType,
        String interestType,
        String qrCodeImage,
        String keyPix,
        Boolean flAtivo,
        String payload) {}
