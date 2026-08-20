package br.com.sol7.olimpio.educacao.recriarcalendarioacademico;

import jakarta.validation.constraints.NotBlank;

public record RecriarCalendarioAcademicoRequest(@NotBlank String nome,String dadosJson){}