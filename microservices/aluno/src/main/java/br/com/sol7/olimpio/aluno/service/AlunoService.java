package br.com.sol7.olimpio.aluno.service;

import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AlunoPerfilResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.AvaliacaoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResumoResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.BoletimResponse;
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
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.LigacaoNapResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.MatriculaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.OcorrenciaPresencaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ParcelaResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.PessoaDadosResponse;
import br.com.sol7.olimpio.aluno.dto.AlunoDtos.ResumoFinanceiroResponse;
import br.com.sol7.olimpio.aluno.repository.AlunoRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
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
            for (Object[] row : rows) {
                String presenca = asString(row[2]).trim().toLowerCase();
                String descricao = PRESENCA_DESCRICAO.getOrDefault(presenca, presenca.isEmpty() ? "Sem marcação" : presenca);
                ocorrencias.add(new OcorrenciaPresencaResponse(asLocalDate(row[1]), presenca, descricao, asString(row[3])));
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
                .combinedWith(r -> new FinanceiroResponse(
                        toResumo(r.get(0)),
                        ((List<?>) r.get(1)).stream().map(row -> toContratoFinanceiro((Object[]) row)).toList(),
                        ((List<?>) r.get(2)).stream().map(row -> toParcela((Object[]) row)).toList(),
                        ((List<?>) r.get(3)).stream().map(row -> toParcela((Object[]) row)).toList(),
                        ((List<?>) r.get(4)).stream().map(row -> toParcela((Object[]) row)).toList(),
                        ((List<?>) r.get(5)).stream().map(row -> toParcela((Object[]) row)).toList()));
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
                .combinedWith(r -> new HistoricoNapResponse(
                        ((List<?>) r.get(0)).stream().map(row -> toLigacaoNap((Object[]) row)).toList(),
                        ((List<?>) r.get(1)).stream().map(row -> toEmailNap((Object[]) row)).toList()));
    }

    public Uni<HistoricoCobrancaResponse> historicoCobranca(Long pessoaId) {
        return Uni.combine().all().unis(
                repository.historicoCobrancaLigacaoPorPessoa(pessoaId),
                repository.historicoCobrancaEmailPorPessoa(pessoaId))
                .combinedWith(r -> new HistoricoCobrancaResponse(
                        ((List<?>) r.get(0)).stream().map(row -> toLigacaoCobranca((Object[]) row)).toList(),
                        ((List<?>) r.get(1)).stream().map(row -> toEmailCobranca((Object[]) row)).toList()));
    }

    public Uni<List<HistoricoAlunoResponse>> historicoAluno(Long pessoaId) {
        return repository.historicoAlunoPorPessoa(pessoaId)
                .map(rows -> rows.stream().map(this::toHistoricoAluno).toList());
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

    private ResumoFinanceiroResponse toResumo(Object row) {
        if (row == null) return new ResumoFinanceiroResponse("Em dia", 0, 0, 0, BigDecimal.ZERO);
        Object[] r = (Object[]) row;
        Integer diasAtraso = asInt(r[0]);
        Integer atrasadas = asInt(r[1]);
        Integer restantes = asInt(r[2]);
        BigDecimal pendente = asBigDecimal(r[3]) == null ? BigDecimal.ZERO : asBigDecimal(r[3]);
        String situacao = diasAtraso != null && diasAtraso > 0 ? "Atraso" : "Em dia";
        return new ResumoFinanceiroResponse(situacao, diasAtraso, atrasadas, restantes, pendente);
    }

    private ContratoFinanceiroResponse toContratoFinanceiro(Object[] r) {
        LocalDate dataCancelamento = asLocalDate(r[4]);
        String status;
        if (dataCancelamento != null && !asBoolean(r[5])) {
            status = "Cancelado " + dataCancelamento;
        } else if (dataCancelamento == null && !asBoolean(r[6])) {
            status = "Ativo sem inscrição";
        } else if (dataCancelamento != null && asBoolean(r[5])) {
            status = "Desistente " + dataCancelamento;
        } else {
            status = "Ativo";
        }
        return new ContratoFinanceiroResponse(
                asLong(r[0]), asString(r[1]), asString(r[2]), asString(r[3]), status,
                asInt(r[7]), asInt(r[8]), asLocalDate(r[9]), asBigDecimal(r[10]),
                asInt(r[11]), asLocalDate(r[12]), asBigDecimal(r[13]));
    }

    private ParcelaResponse toParcela(Object[] r) {
        boolean vendaProduto = asBoolean(r[16]);
        boolean multaLivro = asBoolean(r[17]);
        boolean reparcela = asBoolean(r[13]);
        boolean cancelamento = asBoolean(r[14]);
        boolean original = asBoolean(r[15]);
        Integer parcela = asInt(r[2]);
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
        if (asLocalDate(r[9]) != null) {
            situacao = "Cancelado";
            situacaoCor = "#FFA500";
        } else if (asLocalDate(r[8]) != null) {
            situacao = "Pago";
            situacaoCor = "#0000FF";
        } else if (asLocalDate(r[7]) != null && asLocalDate(r[7]).isBefore(LocalDate.now())) {
            situacao = "Atraso";
            situacaoCor = "#FF0000";
        } else {
            situacao = "Pendente";
            situacaoCor = "#32CD32";
        }
        return new ParcelaResponse(
                asLong(r[0]), asLong(r[1]), parcela, asInt(r[3]),
                asBigDecimal(r[4]), asBigDecimal(r[5]), asBigDecimal(r[6]),
                asLocalDate(r[7]), asLocalDate(r[8]), asLocalDate(r[9]),
                asBigDecimal(r[10]), asBigDecimal(r[11]), asString(r[12]),
                reparcela, cancelamento, original,
                vendaProduto, multaLivro, descricao, descricaoCor, situacao, situacaoCor);
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

    private List<GrauData> toGraus(List<Object[]> rows) {
        Map<Long, GrauData> graus = new LinkedHashMap<>();
        for (Object[] row : rows) {
            Long grauId = asLong(row[0]);
            GrauData grau = graus.computeIfAbsent(grauId, id -> new GrauData(id, asString(row[1]),
                    asBigDecimal(row[8]), asBigDecimal(row[9]), asBigDecimal(row[10]), asBigDecimal(row[11]), new ArrayList<>()));
            grau.notas().add(new GrauNotaData(asLong(row[2]), asLong(row[3]), asString(row[4]), asInt(row[5]),
                    asBigDecimal(row[6]), asBigDecimal(row[7]), new ArrayList<>()));
        }
        return new ArrayList<>(graus.values());
    }

    private void vincularAvaliacoes(List<GrauData> graus, List<Object[]> avaliacoes) {
        Map<Long, List<AvaliacaoResponse>> porNcm = new LinkedHashMap<>();
        for (Object[] row : avaliacoes) {
            porNcm.computeIfAbsent(asLong(row[0]), id -> new ArrayList<>())
                    .add(new AvaliacaoResponse(asInt(row[1]), asBigDecimal(row[2]), asString(row[3])));
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

    private AlunoPerfilResponse toPerfil(Object[] row) {
        return new AlunoPerfilResponse(asString(row[0]), asString(row[1]), asString(row[2]), asString(row[3]),
                asString(row[4]), asLocalDate(row[5]), asString(row[6]), asString(row[7]), asString(row[8]), asString(row[9]),
                asString(row[10]), asString(row[11]), asString(row[12]), asString(row[13]),
                asString(row[14]), asString(row[15]), asString(row[16]),
                asString(row[17]), asString(row[18]), asString(row[19]), asString(row[20]));
    }

    private PessoaDadosResponse toPessoaDados(Object[] r) {
        return new PessoaDadosResponse(asLong(r[0]), asString(r[1]), asString(r[2]), asString(r[3]),
                asLocalDate(r[4]), asString(r[5]), asString(r[6]), asString(r[7]));
    }

    private LigacaoNapResponse toLigacaoNap(Object[] r) {
        return new LigacaoNapResponse(asLong(r[0]), asLocalDateTime(r[1]), asString(r[2]),
                asString(r[3]), asString(r[4]), asLocalDate(r[5]));
    }

    private EmailNapResponse toEmailNap(Object[] r) {
        return new EmailNapResponse(asLong(r[0]), asLocalDateTime(r[1]), asString(r[2]),
                asString(r[3]), asString(r[4]));
    }

    private LigacaoCobrancaResponse toLigacaoCobranca(Object[] r) {
        return new LigacaoCobrancaResponse(asLong(r[0]), asLocalDateTime(r[1]), asString(r[2]),
                asString(r[3]), asString(r[4]), asInt(r[5]), asBigDecimal(r[6]));
    }

    private EmailCobrancaResponse toEmailCobranca(Object[] r) {
        return new EmailCobrancaResponse(asLong(r[0]), asLocalDateTime(r[1]), asString(r[2]),
                asString(r[3]), asString(r[4]), asInt(r[5]), asBigDecimal(r[6]));
    }

    private HistoricoAlunoResponse toHistoricoAluno(Object[] r) {
        return new HistoricoAlunoResponse(asLong(r[0]), asLocalDateTime(r[1]), asString(r[2]),
                asLong(r[3]), asString(r[4]));
    }

    private MatriculaResponse toMatricula(Object[] row) {
        return new MatriculaResponse(asLong(row[0]), asString(row[1]), asString(row[2]), asString(row[3]),
                asInt(row[4]), asString(row[5]), asInt(row[6]), asString(row[7]), asLocalDate(row[8]),
                asBigDecimal(row[9]), asBigDecimal(row[10]), asInt(row[11]), asInt(row[12]), asInt(row[13]),
                asInt(row[14]), asInt(row[15]), asInt(row[16]), asString(row[17]));
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

    private String asString(Object o) {
        return o == null ? "" : o.toString();
    }

    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n)return n.longValue();
        return Long.valueOf(o.toString());
    }

    private Integer asInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n)return n.intValue();
        return Integer.valueOf(o.toString());
    }

    private BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof BigDecimal b)return b;
        if (o instanceof Number n)return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(o.toString());
    }

    private LocalDate asLocalDate(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDate d)return d;
        if (o instanceof LocalDateTime d)return d.toLocalDate();
        if (o instanceof java.sql.Date d)return d.toLocalDate();
        if (o instanceof java.sql.Timestamp d)return d.toLocalDateTime().toLocalDate();
        if (o instanceof java.util.Date d)return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        String s = o.toString();
        if (s.length() >= 10) {
            try {
                return LocalDate.parse(s.substring(0, 10));
            } catch (RuntimeException ignored) {
                // fall through
            }
        }
        return LocalDate.parse(s);
    }

    private LocalDateTime asLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime d)return d;
        if (o instanceof LocalDate d)return d.atStartOfDay();
        if (o instanceof java.sql.Timestamp d)return d.toLocalDateTime();
        if (o instanceof java.util.Date d)
        return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        String s = o.toString();
        if (s.length() >= 16) {
            try {
                return LocalDateTime.parse(s.substring(0, 16).replace(' ', 'T'));
            } catch (RuntimeException ignored) {
                // fall through
            }
        }
        return LocalDateTime.parse(s);
    }
}
