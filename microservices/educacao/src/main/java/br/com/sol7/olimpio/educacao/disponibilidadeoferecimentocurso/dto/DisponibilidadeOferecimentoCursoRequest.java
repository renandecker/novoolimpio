package br.com.sol7.olimpio.educacao.disponibilidadeoferecimentocurso;

import jakarta.validation.constraints.NotBlank;

public record DisponibilidadeOferecimentoCursoRequest(@NotBlank String nome,String dadosJson){}