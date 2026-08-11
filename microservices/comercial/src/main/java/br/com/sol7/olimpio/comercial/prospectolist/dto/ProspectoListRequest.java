package br.com.sol7.olimpio.comercial.prospectolist;
import jakarta.validation.constraints.NotBlank;
public record ProspectoListRequest(@NotBlank String nome, String dadosJson) {}