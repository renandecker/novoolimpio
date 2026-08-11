package br.com.sol7.olimpio.comercial.campo;

public record CampoRequest(String nome, String rotulo, String maskara, String tipo, Integer tamanho, Long categoriaId, Boolean flagNome, Boolean flagTelefone, Boolean flagEmail, Boolean flagRedeSocial, Boolean flagEndereco, Boolean flagIdade, Boolean flagBanco, Boolean flagMaskara, Boolean flagDataNascimento, Boolean flagLogradouro, Boolean flagUpload) {}
