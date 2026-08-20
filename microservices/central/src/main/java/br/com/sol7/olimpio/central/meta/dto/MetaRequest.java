package br.com.sol7.olimpio.central.meta;

import java.util.Date;

public record MetaRequest(Long operadorId,Integer meta,Date data,Date dataInicial,Date dataFinal,Long operacionalId,Long usuarioId){}
