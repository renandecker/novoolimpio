package br.com.sol7.olimpio.comercial.prospectoradar;

import jakarta.validation.constraints.NotBlank;

public record ProspectoRadarRequest(@NotBlank String nome,String dadosJson){}