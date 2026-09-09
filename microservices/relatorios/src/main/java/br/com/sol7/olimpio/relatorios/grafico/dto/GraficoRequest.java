package br.com.sol7.olimpio.relatorios.grafico.dto;

import java.util.Date;

public record GraficoRequest(String nome,boolean todosUnidades,boolean todosPerfis,boolean todosUsuarios,String formatoData,Date dataAlteracao,String tipo,String ordemGrafico,boolean exibirPercentual,boolean exibirLegenda,int colunaLegenda,String limite,int coluna,int altura,int margem,int diametro,boolean exibirValor,boolean valorAcumulado,int tipoEixo,String posicao,Long estruturaId,Long dimensaoReferenciaId,Long dimensaoInformacaoId,Long medidaInformacaoId,Long dimensaoCombinadoId,Long medidaCombinadoId){}
