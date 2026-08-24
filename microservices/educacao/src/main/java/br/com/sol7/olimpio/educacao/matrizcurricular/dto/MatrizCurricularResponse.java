package br.com.sol7.olimpio.educacao.matrizcurricular;

public record MatrizCurricularResponse(
        Long id,
        Long curriculoId,
        Long componenteCurricularId,
        String componenteDescricao,
        String componenteSucinto,
        Long grupoComponenteCurricularId,
        Long tipoMatrizCurricularId,
        Long modalidadeId,
        Integer ordem) {
}
