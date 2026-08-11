package br.com.sol7.olimpio.financeiro.fundocaixa;
import jakarta.validation.constraints.NotBlank;
public record FundoCaixaRequest(@NotBlank String nome, String dadosJson) {}