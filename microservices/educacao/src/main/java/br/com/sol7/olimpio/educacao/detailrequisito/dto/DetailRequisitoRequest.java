package br.com.sol7.olimpio.educacao.detailrequisito;
import jakarta.validation.constraints.NotBlank;
public record DetailRequisitoRequest(@NotBlank String nome, String dadosJson) {}