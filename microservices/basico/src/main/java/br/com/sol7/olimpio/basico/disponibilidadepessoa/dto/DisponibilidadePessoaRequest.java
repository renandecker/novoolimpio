package br.com.sol7.olimpio.basico.disponibilidadepessoa.dto;
import jakarta.validation.constraints.NotBlank;
public record DisponibilidadePessoaRequest(@NotBlank String nome, String dadosJson) {}