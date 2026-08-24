package br.com.sol7.olimpio.educacao.matrizcurricular;

public record MatrizCurricularRequest(
        Long curriculoId,
        Long componenteCurricularId,
        Long grupoComponenteCurricularId,
        Long tipoMatrizCurricularId,
        Long modalidadeId,
        Integer ordem) {
}
