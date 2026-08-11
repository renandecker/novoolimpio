package br.com.sol7.olimpio.comercial.gerenciarpacote;
import jakarta.validation.constraints.NotBlank;
public record GerenciarPacoteRequest(@NotBlank String nome, String dadosJson) {}