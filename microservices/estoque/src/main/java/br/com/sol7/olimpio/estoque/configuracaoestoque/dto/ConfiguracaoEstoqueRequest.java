package br.com.sol7.olimpio.estoque.configuracaoestoque;

public record ConfiguracaoEstoqueRequest(boolean central,int diasPrevisao,Long usuarioId,Long unidadeId,String email,String zoom,String area){}
