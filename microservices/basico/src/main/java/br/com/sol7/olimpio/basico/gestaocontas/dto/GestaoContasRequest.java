package br.com.sol7.olimpio.basico.gestaocontas.dto;

import jakarta.validation.constraints.NotBlank;

public record GestaoContasRequest(@NotBlank String nome,String dadosJson){}