package br.com.sol7.olimpio.central.coordenador;
import jakarta.validation.constraints.NotBlank;
public record CoordenadorRequest(@NotBlank String nome, String dadosJson) {}