package br.com.sol7.olimpio.financeiro.gerarcarne;

import jakarta.validation.constraints.NotBlank;

public record GerarCarneRequest(@NotBlank String nome,String dadosJson){}