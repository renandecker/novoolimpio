package br.com.sol7.olimpio.educacao.rematricula;
import jakarta.validation.constraints.NotBlank;
public record RematriculaRequest(@NotBlank String nome, String dadosJson) {}