package br.com.sol7.olimpio.basico.alterarsenha.dto;
import jakarta.validation.constraints.NotBlank;
public record AlterarSenhaRequest(@NotBlank String nome, String dadosJson) {}