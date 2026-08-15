package br.com.sol7.olimpio.aluno.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class AlunoDtos {

    public record AlunoPerfilResponse(
            String username, String nome, String nomeSocial, String cpf, String rg,
            LocalDate dataNascimento, String email, String telefone, String celular, String foto) {}

    public record MatriculaResponse(
            Long id, String curso, String componente, String unidade, Integer turma, String periodo, Integer ano,
            String status, LocalDate data, BigDecimal mediaFinal, BigDecimal percentualPresenca,
            Integer qtdeAula, Integer qtdeAulaFeita, Integer qtdeAulaPresente, Integer qtdeAulaMeiaPresente,
            Integer qtdeFalta, Integer qtdeAulaAtrasado, String professor) {}

    public record AvaliacaoResponse(Integer ordem, BigDecimal nota, String conceito) {}

    public record GrauNotaResponse(
            Long id, Long idGrauNota, String nome, Integer numeroNota, BigDecimal peso, BigDecimal nota,
            List<AvaliacaoResponse> avaliacoes) {}

    public record GrauResponse(
            Long id, String descricao, BigDecimal notaMaxima, BigDecimal mediaSemExame, BigDecimal mediaFinal,
            BigDecimal frequenciaMinima, List<GrauNotaResponse> notas) {}

    public record BoletimResponse(
            MatriculaResponse matricula, List<GrauResponse> graus, BigDecimal media, String status,
            BigDecimal frequenciaPerc) {}

    public record OcorrenciaPresencaResponse(LocalDate data, String presenca, String presencaDescricao, String componente) {}

    public record FrequenciaResponse(
            MatriculaResponse matricula, List<OcorrenciaPresencaResponse> ocorrencias, Integer aulasRealizadas,
            Integer presentes, Integer meias, Integer ausentes, Integer atestados, Integer atrasos,
            Integer semMarcacao, Integer canceladas, Integer prorrogadas, BigDecimal frequenciaPerc,
            BigDecimal ausenciaPerc) {}

    public record BoletimResumoResponse(
            MatriculaResponse matricula, BigDecimal media, String status, BigDecimal frequenciaPerc) {}

    public record DashboardResponse(List<MatriculaResponse> matriculas, List<BoletimResumoResponse> boletins) {}

    public record ResumoFinanceiroResponse(
            String situacao, Integer diasAtraso, Integer qtdParcelasAtrasadas,
            Integer qtdParcelasRestantes, BigDecimal valorPendente) {}

    public record ParcelaResponse(
            Long id, Long contratoId, Integer parcela, Integer parcelaSequencia,
            BigDecimal multa, BigDecimal juros, BigDecimal desconto,
            LocalDate dataVencimento, LocalDate dataPagamento, LocalDate dataCancelamento,
            BigDecimal valor, BigDecimal valorPago, String tipoPagamento,
            Boolean reparcela, Boolean cancelamento, Boolean original,
            boolean vendaProduto, boolean multaLivro,
            String descricao, String descricaoCor, String situacao, String situacaoCor) {}

    public record ContratoFinanceiroResponse(
            Long id, String curso, String unidade, String unidadeResponsavel, String status,
            Integer qtdeReparcelamento, Integer proximaParcelaSequencia, LocalDate proximaParcelaData,
            BigDecimal proximaParcelaValor, Integer ultimaParcelaSequencia, LocalDate ultimaParcelaData,
            BigDecimal ultimaParcelaValor) {}

    public record FinanceiroResponse(
            ResumoFinanceiroResponse resumo,
            List<ContratoFinanceiroResponse> contratos,
            List<ParcelaResponse> parcelasMes,
            List<ParcelaResponse> parcelasMatricula,
            List<ParcelaResponse> parcelasProdutos,
            List<ParcelaResponse> parcelasCanceladas) {}

    public record PessoaDadosResponse(
            Long id, String nome, String cpf, String rg, LocalDate dataNascimento,
            String email, String telefone, String celular) {}

    public record LigacaoNapResponse(
            Long id, LocalDateTime dataInicial, String telefone, String observacao,
            String resultado, LocalDate retornoAula) {}

    public record EmailNapResponse(
            Long id, LocalDateTime data, String email, String assunto, String mensagem) {}

    public record HistoricoNapResponse(
            List<LigacaoNapResponse> ligacoes, List<EmailNapResponse> emails) {}

    public record LigacaoCobrancaResponse(
            Long id, LocalDateTime dataInicial, String telefone, String observacao,
            String resultado, Integer qtdeParcela, BigDecimal valor) {}

    public record EmailCobrancaResponse(
            Long id, LocalDateTime data, String email, String assunto, String mensagem,
            Integer qtdeParcela, BigDecimal valor) {}

    public record HistoricoCobrancaResponse(
            List<LigacaoCobrancaResponse> ligacoes, List<EmailCobrancaResponse> emails) {}

    public record HistoricoAlunoResponse(
            Long id, LocalDateTime dataRegistro, String descricao, Long usuarioId, String usuarioNome) {}
}
