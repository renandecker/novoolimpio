package br.com.sol7.olimpio.educacao.desistente;

import java.util.Date;

public record DesistenteResponse(Long id,String descricao,Date dataCriacao,Long pessoaAlunoId,Long pessoaFuncionarioId,Long contratoId,Long motivoId,boolean ativo){}
