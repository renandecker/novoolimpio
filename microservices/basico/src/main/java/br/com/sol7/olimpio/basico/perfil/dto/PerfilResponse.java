package br.com.sol7.olimpio.basico.perfil.dto;

public record PerfilResponse(Long id,String descricao,Boolean exibirFavorito,Boolean ajustarFavoritos,Boolean exibirFoto,Boolean exibirSenha,Boolean exibirMenu,Boolean comunicar,Long moduloId,String hierarquia){}
