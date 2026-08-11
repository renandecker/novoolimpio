package br.com.sol7.olimpio.financeiro.lote.dto;

import java.util.List;

public final class LoteCobrancaResponse {

    private LoteCobrancaResponse() {
    }

    public record ModeloEmail(Long id, String descricao, String assunto, String mensagem) {}

    public record Aluno(Long contratoId, String aluno, String contratante, String email) {}

    public record Resumo(Integer processados, Integer semEmail, String assunto) {}

    public record ResultadoLigacao(Integer processados) {}

    public record ResumoAlunos(List<Aluno> alunos, Integer total) {}
}
