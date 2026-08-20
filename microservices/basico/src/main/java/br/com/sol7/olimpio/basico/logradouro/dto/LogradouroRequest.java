package br.com.sol7.olimpio.basico.logradouro.dto;

public record LogradouroRequest(String descricao,String cep,String tipo,String complemento,String local,String longitude,String latitude,Long bairroId){}
