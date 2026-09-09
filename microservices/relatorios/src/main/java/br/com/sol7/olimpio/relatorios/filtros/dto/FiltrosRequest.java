package br.com.sol7.olimpio.relatorios.filtros.dto;

import jakarta.validation.constraints.NotBlank;

public record FiltrosRequest(@NotBlank String nome,String dadosJson){}