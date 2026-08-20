package br.com.sol7.olimpio.educacao.gerarchamadaassinada;

import jakarta.validation.constraints.NotBlank;

public record GerarChamadaAssinadaRequest(@NotBlank String nome,String dadosJson){}