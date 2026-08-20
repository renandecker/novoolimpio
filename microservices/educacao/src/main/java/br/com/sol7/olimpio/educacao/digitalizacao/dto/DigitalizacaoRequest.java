package br.com.sol7.olimpio.educacao.digitalizacao;

import jakarta.validation.constraints.NotBlank;

public record DigitalizacaoRequest(@NotBlank String nome,String dadosJson){}