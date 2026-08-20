package br.com.sol7.olimpio.estoque.entrega;

public record EntregaRequest(String descricao,String area,String zoom,double longitude,double latitude,Long pessoaId){}
