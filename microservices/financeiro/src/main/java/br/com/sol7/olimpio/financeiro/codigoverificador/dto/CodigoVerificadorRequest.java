package br.com.sol7.olimpio.financeiro.codigoverificador;

import jakarta.validation.constraints.NotBlank;

public record CodigoVerificadorRequest(@NotBlank String nome,String dadosJson){}