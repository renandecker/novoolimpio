package br.com.sol7.olimpio.comercial.campanha;

import java.util.Date;

public record CampanhaResponse(Long id,String descricao,Integer meta,boolean ativo,Date dataInicial){}
