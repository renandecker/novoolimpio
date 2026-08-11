package br.com.sol7.olimpio.financeiro.mensagemcobranca;

public record MensagemCobrancaRequest(String descricao, String assunto, String mensagem, Boolean flagEmail) {}
