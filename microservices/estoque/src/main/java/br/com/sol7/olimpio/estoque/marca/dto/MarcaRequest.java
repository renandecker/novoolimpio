package br.com.sol7.olimpio.estoque.marca;

import jakarta.validation.constraints.NotBlank;

public record MarcaRequest(@NotBlank String descricao){}
