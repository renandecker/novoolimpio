package br.com.sol7.olimpio.professor.cadernochamada.dto;
import jakarta.validation.constraints.NotBlank;
public record CadernoChamadaRequest(@NotBlank String nome, String dadosJson) {}
