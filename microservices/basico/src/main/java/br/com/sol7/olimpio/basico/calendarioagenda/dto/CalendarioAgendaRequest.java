package br.com.sol7.olimpio.basico.calendarioagenda.dto;
import jakarta.validation.constraints.NotBlank;
public record CalendarioAgendaRequest(@NotBlank String nome, String dadosJson) {}