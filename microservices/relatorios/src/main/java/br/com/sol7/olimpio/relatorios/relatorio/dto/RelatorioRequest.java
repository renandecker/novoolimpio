package br.com.sol7.olimpio.relatorios.relatorio;
import jakarta.validation.constraints.NotBlank;
public record RelatorioRequest(@NotBlank String nome, String dadosJson) {}