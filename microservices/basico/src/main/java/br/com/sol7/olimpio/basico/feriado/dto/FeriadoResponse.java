package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.Date;

public record FeriadoResponse(Long id,String nome,String descricao,String tipoFeriao,Date dataFeriado,Date dataCriacao,Boolean nacional,Boolean todosCursos,Boolean feriadoFixo){}
