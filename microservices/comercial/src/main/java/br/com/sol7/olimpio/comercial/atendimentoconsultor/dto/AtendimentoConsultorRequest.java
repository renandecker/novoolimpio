package br.com.sol7.olimpio.comercial.atendimentoconsultor;
import jakarta.validation.constraints.NotBlank;
public record AtendimentoConsultorRequest(@NotBlank String nome, String dadosJson) {}