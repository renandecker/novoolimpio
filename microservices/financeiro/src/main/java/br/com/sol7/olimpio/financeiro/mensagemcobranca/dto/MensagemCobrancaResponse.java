package br.com.sol7.olimpio.financeiro.mensagemcobranca;

public record MensagemCobrancaResponse(Long id, String descricao, String assunto, String mensagem, Boolean flagEmail) {}
