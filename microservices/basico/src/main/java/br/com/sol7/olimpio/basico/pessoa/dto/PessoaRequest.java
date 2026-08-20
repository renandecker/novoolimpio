package br.com.sol7.olimpio.basico.pessoa.dto;

import java.util.Date;

public record PessoaRequest(String numero,String complemento,String email,String telefone,String celular,String foto,String observacao,boolean comunicado,Long logradouroId,Date dataCadastro,Date dataAlteracao,Long pessoaFisicaId,Long pessoaJuridicaId,Long professorId){}
