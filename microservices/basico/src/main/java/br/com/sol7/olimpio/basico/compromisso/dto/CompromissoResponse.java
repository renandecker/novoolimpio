package br.com.sol7.olimpio.basico.compromisso.dto;

import java.util.Date;

public record CompromissoResponse(Long id,String descricao,Date data,Long horarioId,Long tipoCompromissoId,Long agendaId,Long pessoaId,Date dataChegada,Date dataAlteracao,Date dataInicio,Date dataConclusao,String observacao,boolean ativo,Long usuarioId,Long statusCompromissoId,Long prospectoId,Long atendenteId,Long usuarioFinalizouId){}
