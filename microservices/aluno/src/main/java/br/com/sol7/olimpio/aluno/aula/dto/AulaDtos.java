package br.com.sol7.olimpio.aluno.aula.dto;

import java.util.Date;

public final class AulaDtos {

    private AulaDtos() {
    }

    public record AulaResponse(Long id, String nome, String descricao, Long ocorrenciaComponenteCurricularId) {
    }

    public record AulaAnexoResponse(Long id, Long aulaId, String nome, String anexo, String tipo) {
    }

    public record ContratoAulaResponse(Long id, String curso) {
    }

    public record OferecimentoAulaResponse(Long id, String modulo) {
    }

    public record OcorrenciaAulaResponse(Long id, String data, boolean aulaCoringa, boolean aulaPresencial) {
    }

    public record TurmaAulaResponse(Long id, String curso, String componente, Integer turma, String unidade,
                                    String professor) {
    }

    public record AulaTurmaResponse(Long id, String nome, String descricao, String data, boolean assistida) {
    }

    public record AulaAssistidaRequest(Long pessoaId) {
    }

    public record AulaAssistidaResponse(Long aulaId, Long pessoaId, Date dataAssistida) {
    }
}