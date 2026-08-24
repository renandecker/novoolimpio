package br.com.sol7.olimpio.educacao.requisitomatriz;

public record RequisitoMatrizResponse(
        Long id,
        Long matrizCurricularId,
        Long matrizCurricularRequisitoId,
        Long componenteCurricularId,
        Long requisitoComponenteCurricularId,
        String tipoRequisito) {
}
