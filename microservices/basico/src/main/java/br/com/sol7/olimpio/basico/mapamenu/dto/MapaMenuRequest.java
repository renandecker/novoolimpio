package br.com.sol7.olimpio.basico.mapamenu.dto;

import jakarta.validation.constraints.NotBlank;

public record MapaMenuRequest(@NotBlank String nome,String dadosJson){}