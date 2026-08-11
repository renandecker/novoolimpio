package br.com.sol7.olimpio.educacao.disponibilidadesala;
import jakarta.validation.constraints.NotBlank;
public record DisponibilidadeSalaRequest(@NotBlank String nome, String dadosJson) {}