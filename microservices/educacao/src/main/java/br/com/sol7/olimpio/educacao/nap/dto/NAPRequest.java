package br.com.sol7.olimpio.educacao.nap;
import jakarta.validation.constraints.NotBlank;
public record NAPRequest(@NotBlank String nome, String dadosJson) {}