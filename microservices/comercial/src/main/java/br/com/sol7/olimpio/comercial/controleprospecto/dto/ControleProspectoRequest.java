package br.com.sol7.olimpio.comercial.controleprospecto;
import jakarta.validation.constraints.NotBlank;
public record ControleProspectoRequest(@NotBlank String nome, String dadosJson) {}