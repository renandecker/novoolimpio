package br.com.sol7.olimpio.basico.modulo.dto;

public record ModuloResponse(Long id, Long antecessorId, String rotulo, String descricao, String icone, String ajuda, String outcome, Integer ordem) {}
