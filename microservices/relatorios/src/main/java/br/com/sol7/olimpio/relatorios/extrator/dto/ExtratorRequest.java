package br.com.sol7.olimpio.relatorios.extrator.dto;

import java.util.Date;

public record ExtratorRequest(String log,String situacao,String tipo,String sql,Long usuarioId,Long tabelaId,Date dataInicio,Date dataFim){}
