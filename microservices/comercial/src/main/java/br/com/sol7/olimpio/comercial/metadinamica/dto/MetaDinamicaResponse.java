package br.com.sol7.olimpio.comercial.metadinamica;

import java.math.BigDecimal;
import java.util.Date;

public record MetaDinamicaResponse(Long id, Integer mes, Integer ano, BigDecimal percSegunda, BigDecimal percTerca, BigDecimal percQuarta, BigDecimal percQuinta, BigDecimal percSexta, BigDecimal percSabado, BigDecimal percDomingo, Long indicadorId, Long unidadeId, Date dataAtualizacao) {}
