package br.com.sol7.olimpio.basico.usuario.dto;

public record UsuarioRequest(String login,String senha,String foto,String fotoBase64,String hierarquia,int qtdeNotify,boolean ativo,boolean senhaProvisoria,Long pessoaId,Long funcionarioId,Long unidadeDefaultId){}
