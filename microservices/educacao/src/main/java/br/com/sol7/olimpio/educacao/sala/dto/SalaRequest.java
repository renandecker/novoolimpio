package br.com.sol7.olimpio.educacao.sala;

public record SalaRequest(String descricao, String sucinto, Long unidadeId, Long tipoSalaId, Integer quantidadeAlunos, Integer predio, Integer andar, Integer numero, Boolean arCondicionado, Boolean ensalamentoAutomatico) {}
