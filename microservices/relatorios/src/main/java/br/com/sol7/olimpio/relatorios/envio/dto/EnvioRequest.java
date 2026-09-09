package br.com.sol7.olimpio.relatorios.envio.dto;

import jakarta.validation.constraints.NotBlank;

public record EnvioRequest(@NotBlank String nome,String dadosJson){}