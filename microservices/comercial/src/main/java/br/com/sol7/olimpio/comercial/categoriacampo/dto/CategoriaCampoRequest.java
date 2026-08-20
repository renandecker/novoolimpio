package br.com.sol7.olimpio.comercial.categoriacampo;

import jakarta.validation.constraints.NotBlank;

public record CategoriaCampoRequest(@NotBlank String nome,String dadosJson){}