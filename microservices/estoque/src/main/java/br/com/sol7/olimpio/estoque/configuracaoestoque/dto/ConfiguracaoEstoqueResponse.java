package br.com.sol7.olimpio.estoque.configuracaoestoque;

public record ConfiguracaoEstoqueResponse(Long id,boolean central,int diasPrevisao,Long usuarioId,Long unidadeId,String email,String zoom,String area){}
