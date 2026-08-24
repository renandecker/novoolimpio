package br.com.sol7.olimpio.basico.pessoa.dto;

import java.time.LocalDate;

public record PessoaResponse(Long id,String numero,String complemento,String email,String telefone,String celular,String foto,String observacao,boolean comunicado,Long logradouroId,LocalDate dataCadastro,LocalDate dataAlteracao){}
