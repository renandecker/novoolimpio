package br.com.sol7.olimpio.financeiro.gerircobranca;

import jakarta.validation.constraints.NotBlank;

public record GerirCobrancaRequest(@NotBlank String nome,String dadosJson){}