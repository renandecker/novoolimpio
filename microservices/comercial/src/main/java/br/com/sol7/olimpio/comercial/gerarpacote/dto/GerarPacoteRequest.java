package br.com.sol7.olimpio.comercial.gerarpacote;

import jakarta.validation.constraints.NotBlank;

public record GerarPacoteRequest(@NotBlank String nome,String dadosJson){}