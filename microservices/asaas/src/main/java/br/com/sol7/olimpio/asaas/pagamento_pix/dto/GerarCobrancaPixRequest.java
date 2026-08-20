package br.com.sol7.olimpio.asaas.pagamento_pix.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GerarCobrancaPixRequest(
@NotNull Long idParcela,
@NotNull Long idPessoa,
@NotNull BigDecimal valor,
@NotNull LocalDate dataVencimento){}
