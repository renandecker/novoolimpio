package br.com.sol7.olimpio.educacao.gerarcertificado;

import jakarta.validation.constraints.NotBlank;

public record GerarCertificadoRequest(@NotBlank String nome,String dadosJson){}