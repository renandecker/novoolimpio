package br.com.sol7.olimpio.financeiro.custoservico;

import java.util.Date;
import java.math.BigDecimal;

public record CustoServicoResponse(Long id,BigDecimal valorEmail,BigDecimal valorSms,BigDecimal valorLigacao,BigDecimal valorCarta,Date dataAlteracao,int tipoSms,int tipoLigacao,int tipoCarta,int tipoEmail){}
