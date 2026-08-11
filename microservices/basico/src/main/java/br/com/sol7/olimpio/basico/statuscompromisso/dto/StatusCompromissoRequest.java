package br.com.sol7.olimpio.basico.statuscompromisso.dto;

public record StatusCompromissoRequest(String descricao, String cor, boolean ativo, boolean alguem, boolean trocaautomatomatica, int dias, Long perfilId, String descricaoPessoa, Integer qtdeUsuario, Long proxStatusCompromissoId, Long statusCompromissoTrocaAutoId) {}
