package br.com.sol7.olimpio.comercial.indicador;

import java.util.Date;

public record IndicadorRequest(String nome, Date data_criacao, String formato_indicador, boolean dia, boolean mes, boolean ano, boolean semana, boolean vinculadoVendedor) {}
