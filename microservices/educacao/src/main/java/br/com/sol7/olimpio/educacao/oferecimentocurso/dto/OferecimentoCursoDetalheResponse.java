package br.com.sol7.olimpio.educacao.oferecimentocurso;

import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularResponse;

import java.util.List;

// Grupo + as turmas (OferecimentoComponenteCurricular) - equivalente a listaOferecimentoCurso do legado.
public record OferecimentoCursoDetalheResponse(OferecimentoCursoResponse curso,
        List<OferecimentoComponenteCurricularResponse> oferecimentos){}
