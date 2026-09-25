package br.com.sol7.olimpio.aluno.service;

import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AlunoPerfilResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoAlunoItemResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoDetalheResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoOpcaoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoPerguntaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoRespostaRequest;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResumoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ChamadaAulaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ContratoFinanceiroResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.DashboardResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.EmailCobrancaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.EmailNapResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FinanceiroResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.FrequenciaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.GrauNotaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.GrauResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoAlunoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoCobrancaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.HistoricoNapResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.LigacaoCobrancaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.TrocaTurmaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.LigacaoNapResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.MatriculaContratoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.MatriculaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.OcorrenciaPresencaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ParcelaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.PessoaDadosResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ResumoFinanceiroResponse;
import br.com.sol7.olimpio.aluno.repository.AlunoRepository;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.math.BigDecimal.ONE;
import static java.math.BigDecimal.ZERO;

@ApplicationScoped
@WithTransaction
public class AlunoService {

    @Inject
    AlunoRepository repository;

    private static final Map<String, String> PRESENCA_DESCRICAO = Map.of(
            "p", "Presente", "m", "Meia presença", "a", "Ausente", "t", "Atestado",
            "c", "Cancelado", "v", "Troca de turma", "r", "Prorrogado",
            "n", "Sem marcação", "d", "Atrasado", "i", "Irregular");

    private record GrauData(Long id, String descricao, BigDecimal notaMaxima, BigDecimal mediaSemExame,
                            BigDecimal mediaFinal, BigDecimal frequenciaMinima, List<GrauNotaData> notas) {
    }

    private record GrauNotaData(Long id, Long idGrauNota, String nome, Integer numeroNota, BigDecimal peso,
                                BigDecimal nota, List<AvaliacaoResponse> avaliacoes) {
    }

    public Uni<AlunoPerfilResponse> perfil(String username) {
        return repository.perfilPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Perfil do aluno não encontrado"))
                .map(this::toPerfil);
    }

    public Uni<List<MatriculaResponse>> matriculas(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.matriculasPorPessoa(pessoaId)
                        .map(rows -> rows.stream().map(this::toMatricula).toList()));
    }

    public Uni<DashboardResponse> dashboard(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(this::dashboardDePessoa);
    }

    private Uni<DashboardResponse> dashboardDePessoa(Long pessoaId) {
        return repository.matriculasPorPessoa(pessoaId)
                .onItem().transformToUni(rows -> {
                    List<MatriculaResponse> matriculas = rows.stream().map(this::toMatricula).toList();
                    return sequencial(matriculas.stream().map(this::resumoDeMatricula).toList())
                            .map(resumos -> new DashboardResponse(matriculas, resumos));
                });
    }

    private Uni<BoletimResumoResponse> resumoDeMatricula(MatriculaResponse matricula) {
        return repository.notasGrauPorMatricula(matricula.id()).map(rows -> {
            List<GrauData> graus = toGraus(rows);
            return new BoletimResumoResponse(matricula, media(graus), status(matricula, graus), matricula.percentualPresenca());
        });
    }

    public Uni<BoletimResponse> boletim(String username, Long matriculaId) {
        return matriculaDe(username, matriculaId).onItem().transformToUni(this::boletimDeMatricula);
    }

    private Uni<BoletimResponse> boletimDeMatricula(MatriculaResponse matricula) {
        return repository.notasGrauPorMatricula(matricula.id())
                .onItem().transformToUni(rows -> {
                    List<GrauData> graus = toGraus(rows);
                    return repository.avaliacoesPorMatricula(matricula.id()).map(avaliacoes -> {
                        vincularAvaliacoes(graus, avaliacoes);
                        BigDecimal media = media(graus);
                        return new BoletimResponse(matricula, graus.stream().map(this::toGrau).toList(), media, status(matricula, graus), matricula.percentualPresenca());
                    });
                });
    }

    public Uni<List<BoletimResponse>> boletimCompleto(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(this::boletimCompletoPorPessoa);
    }

    public Uni<FrequenciaResponse> frequencia(String username, Long matriculaId) {
        return matriculaDe(username, matriculaId).onItem().transformToUni(this::frequenciaDeMatricula);
    }

    private Uni<FrequenciaResponse> frequenciaDeMatricula(MatriculaResponse matricula) {
        return repository.presencasPorMatricula(matricula.id()).map(rows -> {
            List<OcorrenciaPresencaResponse> ocorrencias = new ArrayList<>();
            int presentes = 0, meias = 0, ausentes = 0, atestados = 0, atrasos = 0, semMarcacao = 0, canceladas = 0, prorrogadas = 0;
            for (Tuple row : rows) {
                String presenca = TupleHelper.getString(row, "presenca").trim().toLowerCase();
                String descricao = PRESENCA_DESCRICAO.getOrDefault(presenca, presenca.isEmpty() ? "Sem marcação" : presenca);
                ocorrencias.add(new OcorrenciaPresencaResponse(TupleHelper.getLocalDate(row, "data"), presenca, descricao, TupleHelper.getString(row, "componente")));
                switch (presenca) {
                    case "p" ->presentes++;
                    case "m" ->meias++;
                    case "a" ->ausentes++;
                    case "t" ->atestados++;
                    case "d" ->atrasos++;
                    case "n" ->semMarcacao++;
                    case "c" ->canceladas++;
                    case "r" ->prorrogadas++;
                    default ->{
                    }
                }
            }
            BigDecimal perc = matricula.percentualPresenca();
            BigDecimal ausPerc = perc == null ? null : BigDecimal.valueOf(100).subtract(perc);
            return new FrequenciaResponse(matricula, ocorrencias, rows.size(), presentes, meias, ausentes, atestados,
                    atrasos, semMarcacao, canceladas, prorrogadas, perc, ausPerc);
        });
    }

    public Uni<FinanceiroResponse> financeiro(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(this::financeiroPorPessoa);
    }

    public Uni<FinanceiroResponse> financeiroPorPessoa(Long pessoaId) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());
        return Uni.combine().all().unis(
                repository.resumoFinanceiroPorPessoa(pessoaId),
                repository.contratosPorPessoa(pessoaId),
                repository.parcelasMesPorPessoa(pessoaId, inicioMes, fimMes, hoje),
                repository.parcelasMatriculaPorPessoa(pessoaId),
                repository.parcelasProdutosPorPessoa(pessoaId),
                repository.parcelasCanceladasPorPessoa(pessoaId))
                .asTuple().map(t -> new FinanceiroResponse(
                        toResumo(t.getItem1()),
                        ((List<?>) t.getItem2()).stream().map(row -> toContratoFinanceiro((Tuple) row)).toList(),
                        ((List<?>) t.getItem3()).stream().map(row -> toParcela((Tuple) row)).toList(),
                        ((List<?>) t.getItem4()).stream().map(row -> toParcela((Tuple) row)).toList(),
                        ((List<?>) t.getItem5()).stream().map(row -> toParcela((Tuple) row)).toList(),
                        ((List<?>) t.getItem6()).stream().map(row -> toParcela((Tuple) row)).toList()));
    }

    public Uni<PessoaDadosResponse> pessoaDados(Long pessoaId) {
        return repository.pessoaDadosPorPessoa(pessoaId)
                .onItem().ifNull().failWith(() -> new NotFoundException("Pessoa não encontrada"))
                .map(this::toPessoaDados);
    }

    public Uni<List<PessoaDadosResponse>> responsaveis(Long pessoaId) {
        return repository.responsaveisPorPessoa(pessoaId)
                .map(rows -> rows.stream().map(this::toPessoaDados).toList());
    }

    public Uni<HistoricoNapResponse> historicoNap(Long pessoaId) {
        return Uni.combine().all().unis(
                repository.historicoNapLigacaoPorPessoa(pessoaId),
                repository.historicoNapEmailPorPessoa(pessoaId))
                .asTuple().map(t -> new HistoricoNapResponse(
                        ((List<?>) t.getItem1()).stream().map(row -> toLigacaoNap((Tuple) row)).toList(),
                        ((List<?>) t.getItem2()).stream().map(row -> toEmailNap((Tuple) row)).toList()));
    }

    public Uni<HistoricoCobrancaResponse> historicoCobranca(Long pessoaId) {
        return Uni.combine().all().unis(
                repository.historicoCobrancaLigacaoPorPessoa(pessoaId),
                repository.historicoCobrancaEmailPorPessoa(pessoaId))
                .asTuple().map(t -> new HistoricoCobrancaResponse(
                        ((List<?>) t.getItem1()).stream().map(row -> toLigacaoCobranca((Tuple) row)).toList(),
                        ((List<?>) t.getItem2()).stream().map(row -> toEmailCobranca((Tuple) row)).toList()));
    }

    public Uni<List<HistoricoAlunoResponse>> historicoAluno(Long pessoaId) {
        return repository.historicoAlunoPorPessoa(pessoaId)
                .map(rows -> rows.stream().map(this::toHistoricoAluno).toList());
    }

    public Uni<List<TrocaTurmaResponse>> trocasTurmaPorPessoa(Long pessoaId) {
        return repository.trocasTurmaPorPessoa(pessoaId)
                .map(rows -> rows.stream().map(this::toTrocaTurma).toList());
    }

    // Espelha gestaoAlunoController.buscarMatriculas (rowExpansion "detalhesAluno" de
    // gestaoAluno.xhtml): matriculas do contrato com colunas descritivas.
    public Uni<List<MatriculaContratoResponse>> matriculasPorContrato(Long contratoId) {
        return repository.matriculasPorContrato(contratoId)
                .map(rows -> rows.stream().map(this::toMatriculaContrato).toList());
    }

    public Uni<List<BoletimResponse>> boletimCompletoPorPessoa(Long pessoaId) {
        return repository.matriculasPorPessoa(pessoaId)
                .onItem().transformToUni(rows -> {
                    List<MatriculaResponse> matriculas = rows.stream().map(this::toMatricula).toList();
                    return sequencial(matriculas.stream().map(this::boletimDeMatricula).toList());
                });
    }

    public Uni<List<FrequenciaResponse>> frequenciasPorPessoa(Long pessoaId) {
        return repository.matriculasPorPessoa(pessoaId)
                .onItem().transformToUni(rows -> {
                    List<MatriculaResponse> matriculas = rows.stream().map(this::toMatricula).toList();
                    return sequencial(matriculas.stream().map(this::frequenciaDeMatricula).toList());
                });
    }

    public Uni<List<ChamadaAulaResponse>> chamadas(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.chamadasPorPessoa(pessoaId)
                        .map(rows -> rows.stream().map(this::toChamadaAula).toList()));
    }

    public Uni<List<AvaliacaoAlunoItemResponse>> avaliacoes(String username) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.avaliacoesPorPessoa(pessoaId)
                        .map(rows -> rows.stream().map(this::toAvaliacaoItem).toList()));
    }

    public Uni<AvaliacaoDetalheResponse> avaliacaoDetalhe(String username, Long avaliacaoId) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.avaliacaoPertenceAoAluno(avaliacaoId, pessoaId)
                        .chain(pertence -> {
                            if (!pertence) return Uni.createFrom().failure(new NotFoundException("Avaliação não encontrada"));
                            return repository.avaliacaoPorId(avaliacaoId)
                                    .onItem().ifNull().failWith(() -> new NotFoundException("Avaliação não encontrada"))
                                    .chain(avaliacao -> repository.perguntasDaAvaliacao(avaliacaoId, pessoaId)
                                            .map(rows -> toAvaliacaoDetalhe(avaliacao, rows)));
                        }));
    }

    public Uni<Void> responder(String username, Long avaliacaoId, List<AvaliacaoRespostaRequest> respostas) {
        List<AvaliacaoRespostaRequest> lista = respostas == null ? List.of() : respostas;
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.avaliacaoPertenceAoAluno(avaliacaoId, pessoaId)
                        .chain(pertence -> {
                            if (!pertence) return Uni.createFrom().failure(new NotFoundException("Avaliação não encontrada"));
                            return repository.removerRespostas(avaliacaoId, pessoaId)
                                    .chain(() -> sequencial(lista.stream()
                                            .map(r -> repository.inserirResposta(pessoaId, avaliacaoId,
                                                    r.perguntaId(), r.respostaId(), r.respostaTexto()))
                                            .toList()))
                                    .replaceWithVoid();
                        }));
    }

    private ChamadaAulaResponse toChamadaAula(Tuple row) {
        LocalDateTime assistida = TupleHelper.getLocalDateTime(row, "data_assitida");
        return new ChamadaAulaResponse(TupleHelper.getLong(row, "id"), TupleHelper.getString(row, "nome"), TupleHelper.getString(row, "descricao"),
                TupleHelper.getString(row, "componente"), TupleHelper.getInteger(row, "turma"), TupleHelper.getLocalDate(row, "data_aula"), assistida);
    }

    private AvaliacaoAlunoItemResponse toAvaliacaoItem(Tuple row) {
        return new AvaliacaoAlunoItemResponse(TupleHelper.getLong(row, "id"), TupleHelper.getString(row, "nome"), TupleHelper.getString(row, "descricao"),
                TupleHelper.getString(row, "componente"), TupleHelper.getInteger(row, "turma"), TupleHelper.getLocalDate(row, "data_inicial"), TupleHelper.getLocalDate(row, "data_final"),
                TupleHelper.getBoolean(row, "ativa"), TupleHelper.getBoolean(row, "respondida"));
    }

    private AvaliacaoDetalheResponse toAvaliacaoDetalhe(Tuple avaliacao, List<Tuple> rows) {
        Map<Long, List<Tuple>> porPergunta = new LinkedHashMap<>();
        for (Tuple row : rows) {
            porPergunta.computeIfAbsent(TupleHelper.getLong(row, "pergunta_id"), id -> new ArrayList<>()).add(row);
        }
        List<AvaliacaoPerguntaResponse> perguntas = new ArrayList<>();
        for (Map.Entry<Long, List<Tuple>> entry : porPergunta.entrySet()) {
            Tuple primeira = entry.getValue().get(0);
            Long escolhida = TupleHelper.getLong(primeira, "escolhida_id");
            String texto = TupleHelper.getString(primeira, "resposta_aluno");
            List<AvaliacaoOpcaoResponse> opcoes = entry.getValue().stream()
                    .filter(r -> TupleHelper.getLong(r, "resposta_id") != null)
                    .map(r -> new AvaliacaoOpcaoResponse(TupleHelper.getLong(r, "resposta_id"), TupleHelper.getString(r, "resposta_opcao")))
                    .toList();
            perguntas.add(new AvaliacaoPerguntaResponse(entry.getKey(), TupleHelper.getString(primeira, "pergunta"),
                    TupleHelper.getString(primeira, "tipo"), opcoes, escolhida, texto));
        }
        return new AvaliacaoDetalheResponse(TupleHelper.getLong(avaliacao, "id"), TupleHelper.getString(avaliacao, "nome"),
                TupleHelper.getString(avaliacao, "descricao"), TupleHelper.getBoolean(avaliacao, "ativa"), perguntas);
    }

    private ResumoFinanceiroResponse toResumo(Tuple row) {
        if (row == null) return new ResumoFinanceiroResponse("Em dia", 0, 0, 0, BigDecimal.ZERO);
        Integer diasAtraso = TupleHelper.getInteger(row, "dias_atraso");
        Integer atrasadas = TupleHelper.getInteger(row, "qtd_atrasadas");
        Integer restantes = TupleHelper.getInteger(row, "qtd_restantes");
        BigDecimal pendente = TupleHelper.getBigDecimal(row, "valor_pendente") == null ? BigDecimal.ZERO : TupleHelper.getBigDecimal(row, "valor_pendente");
        String situacao = diasAtraso != null && diasAtraso > 0 ? "Atraso" : "Em dia";
        return new ResumoFinanceiroResponse(situacao, diasAtraso, atrasadas, restantes, pendente);
    }

    private ContratoFinanceiroResponse toContratoFinanceiro(Tuple r) {
        LocalDate dataCancelamento = TupleHelper.getLocalDate(r, "data_cancelamento");
        String status;
        if (dataCancelamento != null && !TupleHelper.getBoolean(r, "desistente")) {
            status = "Cancelado " + dataCancelamento;
        } else if (dataCancelamento == null && !TupleHelper.getBoolean(r, "inscricao")) {
            status = "Ativo sem inscrição";
        } else if (dataCancelamento != null && TupleHelper.getBoolean(r, "desistente")) {
            status = "Desistente " + dataCancelamento;
        } else {
            status = "Ativo";
        }
        return new ContratoFinanceiroResponse(
                TupleHelper.getLong(r, "id"), TupleHelper.getString(r, "curso"), TupleHelper.getString(r, "unidade"), TupleHelper.getString(r, "unidade_responsavel"), status,
                TupleHelper.getInteger(r, "qtde_reparcelamento"), TupleHelper.getInteger(r, "prox_parcela_seq"), TupleHelper.getLocalDate(r, "prox_parcela_data"), TupleHelper.getBigDecimal(r, "prox_parcela_valor"),
                TupleHelper.getInteger(r, "ult_parcela_seq"), TupleHelper.getLocalDate(r, "ult_parcela_data"), TupleHelper.getBigDecimal(r, "ult_parcela_valor"));
    }

    private ParcelaResponse toParcela(Tuple r) {
        boolean vendaProduto = TupleHelper.getBoolean(r, "venda_produto");
        boolean multaLivro = TupleHelper.getBoolean(r, "multa_livro");
        boolean reparcela = TupleHelper.getBoolean(r, "fl_reparcela");
        boolean cancelamento = TupleHelper.getBoolean(r, "fl_cancelamento");
        boolean original = TupleHelper.getBoolean(r, "fl_original");
        Integer parcela = TupleHelper.getInteger(r, "parcela");
        String descricao;
        String descricaoCor;
        if (!vendaProduto && !multaLivro && (parcela == null || parcela == 0)) {
            descricao = "Taxa Inscrição";
            descricaoCor = "#faa523";
        } else if (!vendaProduto && !multaLivro && cancelamento) {
            descricao = "Matrícula Cancelamento";
            descricaoCor = "#808080";
        } else if (!vendaProduto && !multaLivro && original) {
            descricao = "Matrícula Parcelada";
            descricaoCor = "#0000FF";
        } else if (!vendaProduto && !multaLivro) {
            descricao = "Matrícula Reparcelada";
            descricaoCor = "#32CD32";
        } else if (multaLivro && (parcela == null || parcela == 0)) {
            descricao = "Multa livro à vista";
            descricaoCor = "#FF0000";
        } else if (multaLivro) {
            descricao = "Multa livro Parcelada";
            descricaoCor = "#FF00FF";
        } else if (parcela == null || parcela == 0) {
            descricao = "Venda à vista";
            descricaoCor = "#0000FF";
        } else {
            descricao = "Venda Parcelada";
            descricaoCor = "#32CD32";
        }
        String situacao;
        String situacaoCor;
        if (TupleHelper.getLocalDate(r, "data_cancelamento") != null) {
            situacao = "Cancelado";
            situacaoCor = "#FFA500";
        } else if (TupleHelper.getLocalDate(r, "data_pagamento") != null) {
            situacao = "Pago";
            situacaoCor = "#0000FF";
        } else if (TupleHelper.getLocalDate(r, "data_vencimento") != null && TupleHelper.getLocalDate(r, "data_vencimento").isBefore(LocalDate.now())) {
            situacao = "Atraso";
            situacaoCor = "#FF0000";
        } else {
            situacao = "Pendente";
            situacaoCor = "#32CD32";
        }
        return new ParcelaResponse(
                TupleHelper.getLong(r, "id"), TupleHelper.getLong(r, "id_contrato"), parcela, TupleHelper.getInteger(r, "parcela_sequencia"),
                TupleHelper.getBigDecimal(r, "multa"), TupleHelper.getBigDecimal(r, "juros"), TupleHelper.getBigDecimal(r, "desconto"),
                TupleHelper.getLocalDate(r, "data_vencimento"), TupleHelper.getLocalDate(r, "data_pagamento"), TupleHelper.getLocalDate(r, "data_cancelamento"),
                TupleHelper.getBigDecimal(r, "valor"), TupleHelper.getBigDecimal(r, "valor_pago"), TupleHelper.getString(r, "forma_pagamento"),
                reparcela, cancelamento, original,
                vendaProduto, multaLivro, descricao, descricaoCor, situacao, situacaoCor,
                TupleHelper.getLong(r, "id_parcela_pix"));
    }

    private boolean asBoolean(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean b)return b;
        return "true".equalsIgnoreCase(o.toString()) || "1".equals(o.toString()) || "t".equalsIgnoreCase(o.toString());
    }

    private Uni<MatriculaResponse> matriculaDe(String username, Long matriculaId) {
        return repository.pessoaIdPorUsername(username)
                .onItem().ifNull().failWith(() -> new NotFoundException("Aluno não encontrado"))
                .onItem().transformToUni(pessoaId -> repository.matriculasPorPessoa(pessoaId)
                        .map(rows -> rows.stream().map(this::toMatricula)
                                .filter(m -> m.id().equals(matriculaId))
                                .findFirst()
                                .orElseThrow(() -> new NotFoundException("Matrícula não encontrada"))));
    }

    private List<GrauData> toGraus(List<Tuple> rows) {
        Map<Long, GrauData> graus = new LinkedHashMap<>();
        for (Tuple row : rows) {
            Long grauId = TupleHelper.getLong(row, "grau_id");
            GrauData grau = graus.computeIfAbsent(grauId, id -> new GrauData(id, TupleHelper.getString(row, "grau_descricao"),
                    TupleHelper.getBigDecimal(row, "nota_maxima"), TupleHelper.getBigDecimal(row, "media_sem_exame"), TupleHelper.getBigDecimal(row, "media_final"), TupleHelper.getBigDecimal(row, "frequencia_minima"), new ArrayList<>()));
            grau.notas().add(new GrauNotaData(TupleHelper.getLong(row, "ncm_id"), TupleHelper.getLong(row, "id_grau_nota"), TupleHelper.getString(row, "grau_nota_nome"), TupleHelper.getInteger(row, "numero_nota"),
                    TupleHelper.getBigDecimal(row, "peso"), TupleHelper.getBigDecimal(row, "nota_grau"), new ArrayList<>()));
        }
        return new ArrayList<>(graus.values());
    }

    private void vincularAvaliacoes(List<GrauData> graus, List<Tuple> avaliacoes) {
        Map<Long, List<AvaliacaoResponse>> porNcm = new LinkedHashMap<>();
        for (Tuple row : avaliacoes) {
            porNcm.computeIfAbsent(TupleHelper.getLong(row, "ncm_id"), id -> new ArrayList<>())
                    .add(new AvaliacaoResponse(TupleHelper.getInteger(row, "ordem"), TupleHelper.getBigDecimal(row, "nota"), TupleHelper.getString(row, "conceito")));
        }
        for (GrauData grau : graus)
            for (GrauNotaData nota : grau.notas()) {
                nota.avaliacoes().addAll(porNcm.getOrDefault(nota.id(), List.of()));
            }
    }

    private BigDecimal media(List<GrauData> graus) {
        BigDecimal soma = ZERO, pesos = ZERO;
        boolean temNota = false;
        for (GrauData grau : graus)
            for (GrauNotaData nota : grau.notas()) {
                BigDecimal valor = nota.nota();
                if (valor == null) continue;
                temNota = true;
                BigDecimal peso = nota.peso();
                if (peso != null && peso.signum() > 0) {
                    soma = soma.add(valor.multiply(peso));
                    pesos = pesos.add(peso);
                } else {
                    soma = soma.add(valor);
                    pesos = pesos.add(ONE);
                }
            }
        if (!temNota || pesos.signum() == 0) return null;
        return soma.divide(pesos, 2, RoundingMode.HALF_UP);
    }

    private String status(MatriculaResponse matricula, List<GrauData> graus) {
        BigDecimal media = media(graus);
        if (media == null || graus.isEmpty()) return "SEM NOTAS";
        GrauData grau = graus.get(0);
        BigDecimal freqMin = grau.frequenciaMinima();
        if (matricula.percentualPresenca() != null && freqMin != null
                && matricula.percentualPresenca().compareTo(freqMin) < 0) return "REPROVADO POR FREQUÊNCIA";
        if (grau.mediaFinal() != null && media.compareTo(grau.mediaFinal()) < 0) return "EM EXAME";
        return "APROVADO";
    }

    private AlunoPerfilResponse toPerfil(Tuple row) {
        return new AlunoPerfilResponse(TupleHelper.getString(row, "username"), TupleHelper.getString(row, "nome"), TupleHelper.getString(row, "nome_social"), TupleHelper.getString(row, "cpf"),
                TupleHelper.getString(row, "rg"), TupleHelper.getLocalDate(row, "data_nascimento"), TupleHelper.getString(row, "email"), TupleHelper.getString(row, "telefone"), TupleHelper.getString(row, "celular"), TupleHelper.getString(row, "foto"),
                TupleHelper.getString(row, "nome_pai"), TupleHelper.getString(row, "nome_mae"), TupleHelper.getString(row, "nome_referencia"), TupleHelper.getString(row, "telefone_referencia"),
                TupleHelper.getString(row, "facebook"), TupleHelper.getString(row, "twitter"), TupleHelper.getString(row, "telefone_comercial"),
                TupleHelper.getString(row, "genero"), TupleHelper.getString(row, "etnia"), TupleHelper.getString(row, "escolaridade"), TupleHelper.getString(row, "estado_civil"));
    }

    private PessoaDadosResponse toPessoaDados(Tuple r) {
        return new PessoaDadosResponse(TupleHelper.getLong(r, "id"), TupleHelper.getString(r, "nome"), TupleHelper.getString(r, "cpf"), TupleHelper.getString(r, "rg"),
                TupleHelper.getLocalDate(r, "data_nascimento"), TupleHelper.getString(r, "email"), TupleHelper.getString(r, "telefone"), TupleHelper.getString(r, "celular"));
    }

    private LigacaoNapResponse toLigacaoNap(Tuple r) {
        return new LigacaoNapResponse(TupleHelper.getLong(r, "id"), TupleHelper.getLocalDateTime(r, "data_inicial"), TupleHelper.getString(r, "telefone"),
                TupleHelper.getString(r, "observacao"), TupleHelper.getString(r, "resultado"), TupleHelper.getLocalDate(r, "retorno_aula"));
    }

    private EmailNapResponse toEmailNap(Tuple r) {
        return new EmailNapResponse(TupleHelper.getLong(r, "id"), TupleHelper.getLocalDateTime(r, "data"), TupleHelper.getString(r, "email"),
                TupleHelper.getString(r, "assunto"), TupleHelper.getString(r, "mensagem"));
    }

    private LigacaoCobrancaResponse toLigacaoCobranca(Tuple r) {
        return new LigacaoCobrancaResponse(TupleHelper.getLong(r, "id"), TupleHelper.getLocalDateTime(r, "data_inicial"), TupleHelper.getString(r, "telefone"),
                TupleHelper.getString(r, "observacao"), TupleHelper.getString(r, "resultado"), TupleHelper.getInteger(r, "qtde_parcela"), TupleHelper.getBigDecimal(r, "valor"));
    }

    private EmailCobrancaResponse toEmailCobranca(Tuple r) {
        return new EmailCobrancaResponse(TupleHelper.getLong(r, "id"), TupleHelper.getLocalDateTime(r, "data"), TupleHelper.getString(r, "email"),
                TupleHelper.getString(r, "assunto"), TupleHelper.getString(r, "mensagem"), TupleHelper.getInteger(r, "qtde_parcela"), TupleHelper.getBigDecimal(r, "valor"));
    }

    private HistoricoAlunoResponse toHistoricoAluno(Tuple r) {
        return new HistoricoAlunoResponse(TupleHelper.getLong(r, "id"), TupleHelper.getLocalDateTime(r, "data_registro"), TupleHelper.getString(r, "descricao"),
                TupleHelper.getLong(r, "id_usuario"), TupleHelper.getString(r, "usuario_nome"));
    }

    private TrocaTurmaResponse toTrocaTurma(Tuple r) {
        return new TrocaTurmaResponse(
                TupleHelper.getLong(r, "id"),
                TupleHelper.getLocalDateTime(r, "data"),
                TupleHelper.getString(r, "usuario_nome"),
                TupleHelper.getString(r, "curso"),
                TupleHelper.getString(r, "componente"),
                TupleHelper.getString(r, "unidade"),
                TupleHelper.getInteger(r, "turma_antes"),
                TupleHelper.getInteger(r, "turma_depois"));
    }

    private MatriculaResponse toMatricula(Tuple row) {
        return new MatriculaResponse(TupleHelper.getLong(row, "id"), TupleHelper.getString(row, "curso"), TupleHelper.getString(row, "componente"), TupleHelper.getString(row, "unidade"),
                TupleHelper.getInteger(row, "turma"), TupleHelper.getString(row, "periodo"), TupleHelper.getInteger(row, "ano"), TupleHelper.getString(row, "status"), TupleHelper.getLocalDate(row, "data"),
                TupleHelper.getBigDecimal(row, "media_final"), TupleHelper.getBigDecimal(row, "percentual_presenca"), TupleHelper.getInteger(row, "qtde_aula"), TupleHelper.getInteger(row, "qtde_aula_feita"), TupleHelper.getInteger(row, "qtde_aula_presente"),
                TupleHelper.getInteger(row, "qtde_aula_meia_presente"), TupleHelper.getInteger(row, "qtde_falta"), TupleHelper.getInteger(row, "qtde_aula_atrasado"), TupleHelper.getString(row, "professor"));
    }

    private MatriculaContratoResponse toMatriculaContrato(Tuple r) {
        return new MatriculaContratoResponse(
                TupleHelper.getLong(r, "id"), TupleHelper.getLong(r, "turma"), TupleHelper.getLocalDate(r, "data_inicio"), TupleHelper.getLocalDate(r, "data_fim"),
                TupleHelper.getString(r, "grupo"), TupleHelper.getString(r, "componente"), TupleHelper.getInteger(r, "carga_horaria"), TupleHelper.getString(r, "unidade"), TupleHelper.getString(r, "professor"),
                TupleHelper.getString(r, "status_turma"), TupleHelper.getString(r, "status_matricula"), TupleHelper.getLocalDate(r, "data_cancelamento"), TupleHelper.getBoolean(r, "troca_turma"));
    }

    private GrauResponse toGrau(GrauData grau) {
        return new GrauResponse(grau.id(), grau.descricao(), grau.notaMaxima(), grau.mediaSemExame(), grau.mediaFinal(),
                grau.frequenciaMinima(), grau.notas().stream()
                .map(n -> new GrauNotaResponse(n.id(), n.idGrauNota(), n.nome(), n.numeroNota(), n.peso(), n.nota(), n.avaliacoes()))
                .toList());
    }

    private <T> Uni<List<T>> sequencial(List<Uni<T>> unis) {
        return sequencial(unis, 0, new ArrayList<>());
    }

    private <T> Uni<List<T>> sequencial(List<Uni<T>> unis, int i, List<T> acumulado) {
        if (i >= unis.size()) return Uni.createFrom().item(acumulado);
        return unis.get(i).onItem().transformToUni(item -> {
            acumulado.add(item);
            return sequencial(unis, i + 1, acumulado);
        });
    }
}