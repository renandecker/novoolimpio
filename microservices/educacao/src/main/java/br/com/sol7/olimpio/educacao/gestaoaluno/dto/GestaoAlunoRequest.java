package br.com.sol7.olimpio.educacao.gestaoaluno;

import jakarta.validation.constraints.NotBlank;

public record GestaoAlunoRequest(@NotBlank String nome,String dadosJson){}