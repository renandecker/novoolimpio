package br.com.sol7.olimpio.relatorios.filtros.dto;

import java.util.Date;

public record FiltrosResponse(
    Long id,
    String nome,
    String informacao,
    String valorFixo,
    String operacao,
    Date dataInicio,
    Date dataFim,
    String periodoDinamico,
    Boolean flFixo,
    Boolean flExibir,
    Boolean flTodosGrafico,
    Boolean flTodosTabela,
    Boolean flTodosMapa,
    Boolean flTodosOrganograma,
    Boolean flRede,
    Boolean flHierarquia,
    String hierarquia,
    Long idEstrutura,
    Long idDimensao,
    String tipoFiltro,
    String dadosJson
) {}