package br.com.sol7.olimpio.financeiro.sangria.dto;

import java.math.BigDecimal;
import java.util.Date;

import br.com.sol7.olimpio.financeiro.sangria.entity.Sangria;

public record SangriaRequest(Long caixaId,Date data,BigDecimal valor){}
