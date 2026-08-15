package br.com.sol7.olimpio.professor.aula.dto;

public final class AulaDtos {

    private AulaDtos() {}

    public record AulaResponse(Long id, String nome, String descricao, Long ocorrenciaComponenteCurricularId) {}

    public record AulaRequest(String nome, String descricao, Long ocorrenciaComponenteCurricularId) {}

    public record AulaAnexoResponse(Long id, Long aulaId, String nome, String anexo, String tipo) {}

    public record AulaAnexoRequest(Long aulaId, String nome, String anexo, String tipo) {}

    public record AvaliacaoPerguntaAnexoResponse(Long id, Long avaliacaoPerguntaId, String nome, String anexo) {}

    public record AvaliacaoPerguntaAnexoRequest(Long avaliacaoPerguntaId, String nome, String anexo) {}

    public record OcorrenciaAulaResponse(Long id, String data, boolean aulaCoringa, boolean aulaPresencial) {}
}
