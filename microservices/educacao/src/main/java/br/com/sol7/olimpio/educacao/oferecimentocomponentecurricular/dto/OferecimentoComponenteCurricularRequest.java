package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;

import java.util.Date;

public record OferecimentoComponenteCurricularRequest(Long unidadeId,Long periodoId,Long grupoId,Long salaId,Date dataInicio,Date dataFim,Date dataAlteracao,int tipoReplicacao,String tipoPlanejamento,int diasReplicar,int qtdeSequencia,int qtdeEspacoCaderno,Long curriculoId,Long professorId,Long componenteCurricularId,Long componenteCurricularReplicarId,Integer vagas,Integer inscritos,Date dataCancelamento,Boolean registraFrequencia,Boolean possuiAvaliacao,boolean replicar,Boolean replicado,boolean detalharReplicacao,String salas,String status,int sequencia){}
