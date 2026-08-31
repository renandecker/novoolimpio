package br.com.sol7.olimpio.financeiro.campanhanegociacao;

import java.util.Date;
import java.math.BigDecimal;

public record CampanhaNegociacaoRequest(String descricao,Integer diaPagamentoAntecipado,Integer diasParaVencer,Integer dia,Integer mes,Integer parcela,Integer ano,BigDecimal valor,BigDecimal percentual,boolean ativo,Date dataFim,String tipoCampanha,String objetivo,String condicaoEspecial,Boolean beneficioProximoMes,String tipoOferta){}
