package br.com.sol7.olimpio.educacao.contrato;

import java.util.Date;
import java.math.BigDecimal;

public record ContratoRequest(Long curriculoId,Long unidadeId,Long unidadeResponsavelId,Long ultimoContratoId,Long contratoAnteriorId,Long compromissoId,Long valorCursoId,Long pessoaId,Long descontoCursoId,Long taxaCursoId,Long formaPagamentoId,BigDecimal valorDesconto,BigDecimal valorTaxa,Long responsavelId,Date dataConclusao,String local,Long usuarioId,Long testemunha1Id,Long testemunha2Id,Boolean ativo,Boolean inscricao,Boolean desistente,Long contratoDesistenteId,Boolean pdf,Date data,Date dataReparcelamento,Date dataCancelamento,Integer qtdeReparcelamento,Long cadernoComponenteCurricularId,Long ultimaParcelaId,Long cancelamentoId,Long proximaParcelaId,Long oferecimentoInicioId,Long oferecimentoFimId,Integer qtdParcelasAtrasadas,Integer qtdParcelasNaoPagas,BigDecimal valorParcelas,Boolean trocaTurma){}
