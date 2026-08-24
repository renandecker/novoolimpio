package br.com.sol7.olimpio.educacao.requisitomatriz;

public record RequisitoMatrizRequest(
        Long curriculoId,
        Long matrizCurricularId,
        Long matrizCurricularRequisitoId,
        Long componenteCurricularId,
        Long requisitoComponenteCurricularId,
        String tipoRequisito) {
}
