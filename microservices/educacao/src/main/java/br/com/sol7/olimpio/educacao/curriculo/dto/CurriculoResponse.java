package br.com.sol7.olimpio.educacao.curriculo;

import java.util.Date;

public record CurriculoResponse(Long id,Long cursoId,String descricao,Long tipoCursoId,String sucinto,String descricaoDiploma,String sigla,Integer cargaHoraria,int qtdeIniciando,int qtdeFinalizando,String numeroParecer,String licenca,String reconhecimento,int qtdMaximaAlunos,int tipoModeloContrato,int tipoModeloBoletim,int tipoModeloCertificado,int tipoModeloPromissoria,Long escolaridadeId,Integer idadeMinima,Integer idadeMaxima,Date dataCancelamento,String templateContrato,String templateCertificado,String templateBoletim,String templatePromissoria,Long grauId,Boolean possuiRematricula){}
