package br.com.sol7.olimpio.educacao.turma;
import jakarta.validation.constraints.NotBlank;
public record TurmaRequest(@NotBlank String nome, String dadosJson) {}