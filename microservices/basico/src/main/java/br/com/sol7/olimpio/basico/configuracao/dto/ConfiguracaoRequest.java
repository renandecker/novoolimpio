package br.com.sol7.olimpio.basico.configuracao.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfiguracaoRequest(@NotBlank String nome,String dadosJson){}