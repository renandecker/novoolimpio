package br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricular;
import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricularRepository;
import br.com.sol7.olimpio.educacao.criterio.Criterio;
import br.com.sol7.olimpio.educacao.criterio.CriterioRepository;
import br.com.sol7.olimpio.educacao.criterio.CriterioService;
import br.com.sol7.olimpio.educacao.curso.Curso;
import br.com.sol7.olimpio.educacao.curso.CursoRepository;
import br.com.sol7.olimpio.educacao.curriculo.Curriculo;
import br.com.sol7.olimpio.educacao.curriculo.CurriculoRepository;
import br.com.sol7.olimpio.educacao.diaaula.DiaAula;
import br.com.sol7.olimpio.educacao.diaaula.DiaAulaRepository;
import br.com.sol7.olimpio.educacao.diaaula.DiaAulaResponse;
import br.com.sol7.olimpio.educacao.enumm.TipoPlanejamentoAula;
import br.com.sol7.olimpio.educacao.grupo.Grupo;
import br.com.sol7.olimpio.educacao.grupo.GrupoRepository;
import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricular;
import br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular.OcorrenciaComponenteCurricularRepository;
import br.com.sol7.olimpio.educacao.periodo.Periodo;
import br.com.sol7.olimpio.educacao.periodo.PeriodoRepository;
import br.com.sol7.olimpio.educacao.sala.Sala;
import br.com.sol7.olimpio.educacao.sala.SalaRepository;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAula;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAulaRepository;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacao;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacaoRepository;
import br.com.sol7.olimpio.educacao.unidade.Unidade;
import br.com.sol7.olimpio.educacao.unidade.UnidadeRepository;
import br.com.sol7.olimpio.educacao.professor.Professor;
import br.com.sol7.olimpio.educacao.professor.ProfessorRepository;
import br.com.sol7.olimpio.educacao.basico.PessoaFisica;
import br.com.sol7.olimpio.educacao.basico.PessoaFisicaRepository;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class OferecimentoComponenteCurricularService {

    @Inject
    OferecimentoComponenteCurricularRepository repository;
    @Inject
    DiaAulaRepository diaAulaRepository;
    @Inject
    TurnoEducacaoRepository turnoEducacaoRepository;
    @Inject
    TempoAulaRepository tempoAulaRepository;
    @Inject
    ComponenteCurricularRepository componenteCurricularRepository;
    @Inject
    PeriodoRepository periodoRepository;
    @Inject
    SalaRepository salaRepository;
    @Inject
    GrupoRepository grupoRepository;
    @Inject
    CurriculoRepository curriculoRepository;
    @Inject
    UnidadeRepository unidadeRepository;
    @Inject
    CursoRepository cursoRepository;
    @Inject
    CriterioRepository criterioRepository;
    @Inject
    CriterioService criterioService;
    @Inject
    OcorrenciaComponenteCurricularRepository ocorrenciaRepository;
    @Inject
    ProfessorRepository professorRepository;
    @Inject
    PessoaFisicaRepository pessoaFisicaRepository;

    // Migrado de SchedulingService.replicarOferecimentoAuto() (legado, L279-326): rotina automatica
    // de replicacao de oferecimentos. Roda verificarDisciplina (status de disciplinas), seleciona os
    // oferecimentos elegiveis usando o SQL configurado em bas_config (chave SQL_REPLICAR_OFERECIMENTOS,
    // com fallback para o SQL padrao do legado), replica cada id via replicarOferecimento e repete ate
    // nao restarem oferecimentos elegiveis (recursao com salvaguarda de iteracoes, como no legado que
    // repete em 2 runs/15min). A geracao de chamadas assinadas (PDF) nao foi portada (dominio chamadaassinada).
    public Uni<Integer> replicarOferecimentoAutomatico() {
        return replicarOferecimentoAutomatico(0, 0);
    }

    private Uni<Integer> replicarOferecimentoAutomatico(int iteracao, int total) {
        if (iteracao >= 50) {
            return Uni.createFrom().item(total);
        }
        return repository.verificarDisciplina()
                .chain(v -> repository.verificarchamadaAssinada())
                .chain(v -> repository.buscarSqlConfigReplicacao())
                .chain(sql -> repository.listarIdsParaReplicacao(
                        sql == null || sql.isBlank() ? OferecimentoComponenteCurricularRepository.SQL_REPLICAR_OFERECIMENTOS_PADRAO : sql))
                .chain(ids -> {
                    if (ids == null || ids.isEmpty()) {
                        return Uni.createFrom().item(total);
                    }
                    Uni<Integer> acc = Uni.createFrom().item(total);
                    for (Long id : ids) {
                        acc = acc.chain(t -> replicarOferecimento(id)
                                .onFailure().recoverWithItem(0)
                                .map(n -> t + n));
                    }
                    return acc.chain(t -> replicarOferecimentoAutomatico(iteracao + 1, t));
                });
    }

    public Uni<List<OferecimentoComponenteCurricularResponse>> list() {
        return withRefs(repository.listAll());
    }

    public Uni<PagedResponse<OferecimentoComponenteCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        Uni<List<OferecimentoComponenteCurricular>> items = repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list();
        return withRefs(items)
                .onItem().transformToUni(res -> repository.count()
                        .map(count -> new PagedResponse<>(res, count, p, s)));
    }


    public Uni<OferecimentoComponenteCurricularResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found"))
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<OferecimentoComponenteCurricularResponse> create(OferecimentoComponenteCurricularRequest r) {
        var e = new OferecimentoComponenteCurricular();
        apply(e, r);
        return repository.persist(e)
                .flatMap(x -> loadRefs().map(refs -> toResponse(x, refs)));
    }

    public Uni<OferecimentoComponenteCurricularResponse> update(Long id, OferecimentoComponenteCurricularRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found"))
                .invoke(e -> apply(e, r))
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("OferecimentoComponenteCurricular not found")));
    }

    private void apply(OferecimentoComponenteCurricular e, OferecimentoComponenteCurricularRequest r) {
        e.unidadeId = r.unidadeId();
        e.periodoId = r.periodoId();
        e.grupoId = r.grupoId();
        e.salaId = r.salaId();
        e.dataInicio = r.dataInicio();
        e.dataFim = r.dataFim();
        e.dataAlteracao = r.dataAlteracao();
        e.tipoReplicacao = r.tipoReplicacao();
        e.tipoPlanejamento = r.tipoPlanejamento() != null && !r.tipoPlanejamento().isBlank() ? TipoPlanejamentoAula.fromNameOrDefault(r.tipoPlanejamento()).name() : null;
        e.diasReplicar = r.diasReplicar();
        e.qtdeSequencia = r.qtdeSequencia();
        e.qtdeEspacoCaderno = r.qtdeEspacoCaderno();
        e.curriculoId = r.curriculoId();
        e.professorId = r.professorId();
        e.componenteCurricularId = r.componenteCurricularId();
        e.componenteCurricularReplicarId = r.componenteCurricularReplicarId();
        e.vagas = r.vagas();
        e.inscritos = r.inscritos();
        e.dataCancelamento = r.dataCancelamento();
        e.registraFrequencia = r.registraFrequencia();
        e.possuiAvaliacao = r.possuiAvaliacao();
        e.replicar = r.replicar();
        e.replicado = r.replicado();
        e.detalharReplicacao = r.detalharReplicacao();
        e.salas = r.salas();
        e.status = r.status();
        e.sequencia = r.sequencia();
    }

    private OferecimentoComponenteCurricularResponse toResponse(OferecimentoComponenteCurricular e, Refs refs) {
        return new OferecimentoComponenteCurricularResponse(e.id, e.unidadeId, e.periodoId, e.grupoId, e.salaId, e.dataInicio, e.dataFim, e.dataAlteracao, e.tipoReplicacao, e.tipoPlanejamento, e.diasReplicar, e.qtdeSequencia, e.qtdeEspacoCaderno, e.curriculoId, e.professorId, e.componenteCurricularId, e.componenteCurricularReplicarId, e.vagas, e.inscritos, e.dataCancelamento, e.registraFrequencia, e.possuiAvaliacao, e.replicar, e.replicado, e.detalharReplicacao, e.salas, e.status, e.sequencia,
                refs != null ? unidadeDescricao(refs.unidade(e.unidadeId)) : null,
                refs != null && e.periodoId != null ? refs.periodo(e.periodoId).descricao : null,
                refs != null && e.grupoId != null ? refs.grupo(e.grupoId).nome : null,
                refs != null && e.salaId != null ? refs.sala(e.salaId).descricao : null,
                refs != null ? curriculoDescricao(refs.curriculo(e.curriculoId), refs.curso(e.curriculoId)) : null,
                refs != null && e.componenteCurricularId != null ? refs.componente(e.componenteCurricularId).descricao : null,
                refs != null ? refs.professorNome(e.professorId) : null);
    }

    private String unidadeDescricao(Unidade u) {
        if (u == null) return null;
        return firstNonBlank(u.sucinto, u.nomeFantasia, u.razaoSocial);
    }

    private String curriculoDescricao(Curriculo c, Curso curso) {
        if (c == null) return null;
        return firstNonBlank(curso != null ? curso.nome : null, c.descricao, c.sucinto, c.sigla);
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return null;
    }

    // ----- resolucao de descricoes (refs locais, sem N+1) -----

    private record Refs(List<Periodo> periodos, List<Grupo> grupos, List<Sala> salas,
                        List<Curriculo> curriculos, List<ComponenteCurricular> componentes,
                        List<Unidade> unidades, List<Curso> cursos,
                        List<Professor> professores, List<PessoaFisica> pessoasFisicas) {
        Periodo periodo (Long id){
            if (id == null) return null;
            return periodos.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        Grupo grupo (Long id){
            if (id == null) return null;
            return grupos.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        Sala sala (Long id){
            if (id == null) return null;
            return salas.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        Curriculo curriculo (Long id){
            if (id == null) return null;
            return curriculos.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        ComponenteCurricular componente (Long id){
            if (id == null) return null;
            return componentes.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        Unidade unidade (Long id){
            if (id == null) return null;
            return unidades.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
        Curso curso (Long id){
            if (id == null) return null;
            Curriculo c = curriculo(id);
            if (c == null || c.cursoId == null) return null;
            return cursos.stream().filter(x -> x.id.equals(c.cursoId)).findFirst().orElse(null);
        }
        String professorNome (Long professorId){
            if (professorId == null) return null;
            Professor p = professores.stream().filter(x -> x.id.equals(professorId)).findFirst().orElse(null);
            if (p == null) return null;
            PessoaFisica pf = pessoasFisicas.stream().filter(x -> x.id.equals(p.pessoaId)).findFirst().orElse(null);
            return pf != null ? pf.nome : null;
        }
    }

    private Uni<Refs> loadRefs() {
        return periodoRepository.listAll()
                .onItem().transformToUni(periodos -> grupoRepository.listAll()
                        .onItem().transformToUni(grupos -> salaRepository.listAll()
                                .onItem().transformToUni(salas -> curriculoRepository.listAll()
                                        .onItem().transformToUni(curriculos -> componenteCurricularRepository.listAll()
                                                .onItem().transformToUni(componentes -> unidadeRepository.listAll()
                                                        .onItem().transformToUni(unidades -> cursoRepository.listAll()
                                                                .onItem().transformToUni(cursos -> professorRepository.listAll()
                                                                        .onItem().transformToUni(professores -> pessoaFisicaRepository.listAll()
                                                                                .map(pessoasFisicas -> new Refs(periodos, grupos, salas, curriculos, componentes, unidades, cursos, professores, pessoasFisicas))))))))));
    }

    private Uni<List<OferecimentoComponenteCurricularResponse>> withRefs(Uni<List<OferecimentoComponenteCurricular>> items) {
        return loadRefs().onItem().transformToUni(refs -> items.map(list -> list.stream().map(e -> toResponse(e, refs)).toList()));
    }

    // ----- fluxo de geracao de aulas (migrado de OferecimentoComponenteCurricularService.getNumeroDiasAula / calcularDiasAula / gerarAula, linhas 441-784 do legado) -----

    // Media de horas semanais (dias de aula) -> cargaHoraria do componente / mediaHorasDia.
    public Uni<Long> getNumeroDiasAula(OferecimentoComponenteCurricular of) {
        if (of == null || of.diasAula == null || of.diasAula.isEmpty() || of.componenteCurricularId == null) {
            return Uni.createFrom().item(0L);
        }
        return Uni.combine().all()
                .unis(turnoEducacaoRepository.listAll(), tempoAulaRepository.listAll(),
                        componenteCurricularRepository.findById(of.componenteCurricularId))
                .asTuple()
                .map(tuple -> {
                    ComponenteCurricular cc = tuple.getItem3();
                    if (cc == null || cc.cargaHoraria == null) return 0L;
                    double horasSemana = 0;
                    for (DiaAula d : of.diasAula) {
                        horasSemana += horasAula(d, tuple.getItem1(), tuple.getItem2());
                    }
                    double mediaHorasDia = horasSemana / of.diasAula.size();
                    return (long) Math.ceil(cc.cargaHoraria / mediaHorasDia);
                });
    }

    public Uni<Long> calcularDiasAula(OferecimentoComponenteCurricular novo, List<DiaAula> diasAulaSelecionado) {
        novo.diasAula = new LinkedHashSet<>(diasAulaSelecionado);
        return getNumeroDiasAula(novo);
    }

    // Calcula e retorna as OcorrenciaComponenteCurricular a persistir (nao persiste aqui).
    // Migrado de OferecimentoComponenteCurricularService.gerarAula (legado, L915-1027), com os
    // branches por TipoPlanejamentoAula (DISPONIBILIDADE_LIVRE/AULA/SEQUENTE).
    public Uni<List<OcorrenciaComponenteCurricular>> gerarAula(OferecimentoComponenteCurricular of, Date dataInicio, List<Long> diasAulaSelecionado) {
        if (of == null || diasAulaSelecionado == null || diasAulaSelecionado.isEmpty()) {
            return Uni.createFrom().item(List.of());
        }
        TipoPlanejamentoAula tipo = TipoPlanejamentoAula.fromNameOrDefault(of.tipoPlanejamento);
        Uni<List<TurnoEducacao>> turnosU = turnoEducacaoRepository.listAll();
        Uni<List<TempoAula>> temposU = tempoAulaRepository.listAll();
        Uni<List<DiaAula>> diasU = diaAulaRepository.listAll();
        Uni<ComponenteCurricular> ccU = of.componenteCurricularId != null
                ? componenteCurricularRepository.findById(of.componenteCurricularId)
                : Uni.createFrom().nullItem();
        Uni<Curriculo> curriculoU = of.curriculoId != null
                ? curriculoRepository.findById(of.curriculoId)
                : Uni.createFrom().nullItem();
        Uni<Criterio> criterioU = carregarCriterio(of);
        return Uni.combine().all().unis(turnosU, temposU, diasU, ccU, curriculoU, criterioU).asTuple()
                .flatMap(tuple -> {
                    List<TurnoEducacao> turnos = tuple.getItem1();
                    List<TempoAula> tempos = tuple.getItem2();
                    List<DiaAula> todas = tuple.getItem3();
                    ComponenteCurricular cc = tuple.getItem4();
                    Curriculo curriculo = tuple.getItem5();
                    Criterio criterio = tuple.getItem6();
                    if (cc == null || cc.cargaHoraria == null) {
                        return Uni.createFrom().item(List.of());
                    }
                    Map<Long, DiaAula> diaPorId = todas.stream().collect(Collectors.toMap(d -> d.id, d -> d));
                    List<DiaAula> selecionados = diasAulaSelecionado.stream()
                            .map(diaPorId::get).filter(Objects::nonNull).toList();
                    if (selecionados.isEmpty()) {
                        return Uni.createFrom().item(List.of());
                    }
                    for (DiaAula d : selecionados) hydrate(d, turnos, tempos);
                    double horasSemana = 0;
                    for (DiaAula d : selecionados) horasSemana += horasAula(d, turnos, tempos);
                    double mediaHorasDia = horasSemana / selecionados.size();
                    long quantidadeAulas = (long) Math.ceil(cc.cargaHoraria / mediaHorasDia);
                    if (quantidadeAulas <= 0) {
                        return Uni.createFrom().item(List.of());
                    }
                    of.diasAula = new LinkedHashSet<>(selecionados);

                    if (tipo == TipoPlanejamentoAula.DISPONIBILIDADE_LIVRE) {
                        return Uni.createFrom().item(gerarOcorrenciasLivre(of, quantidadeAulas));
                    }

                    Calendar cal = Calendar.getInstance();
                    cal.setTime(dataInicio);
                    cal.add(Calendar.DAY_OF_YEAR, (int) Math.min(quantidadeAulas + 14, 370));
                    Date fimJanela = cal.getTime();
                    cal.setTime(dataInicio);

                    Long tipoCursoId = curriculo != null ? curriculo.tipoCursoId : null;
                    return repository.buscarFeriados(dataInicio, fimJanela, of.unidadeId, tipoCursoId)
                            .flatMap(feriados -> {
                                Set<Date> feriadoSet = new HashSet<>(feriados);
                                if (of.salaId == null) {
                                    return Uni.createFrom().item(gerarOcorrencias(of, selecionados, feriadoSet, null, criterio, dataInicio, quantidadeAulas, Map.of()));
                                }
                                return ocorrenciaRepository
                                        .find("ativo = true and data between ?1 and ?2 and salaId = ?3", dataInicio, fimJanela, of.salaId).list()
                                        .map(existentes -> {
                                            Map<Long, Long> diaAulaTurno = new HashMap<>();
                                            for (DiaAula d : todas) diaAulaTurno.put(d.id, d.turnoEducacaoId);
                                            return gerarOcorrencias(of, selecionados, feriadoSet, existentes, criterio, dataInicio, quantidadeAulas, diaAulaTurno);
                                        });
                            });
                });
    }

    // Migrado de OferecimentoComponenteCurricularService.gerarAula (legado, L975-985) -
    // DISPONIBILIDADE_LIVRE: gera as ocorrencias sem data nem diaAula (agendamento livre,
    // definido depois na UI), como no legado.
    private List<OcorrenciaComponenteCurricular> gerarOcorrenciasLivre(OferecimentoComponenteCurricular of, long quantidadeAulas) {
        List<OcorrenciaComponenteCurricular> geradas = new ArrayList<>();
        for (int i = 0; i < quantidadeAulas; i++) {
            OcorrenciaComponenteCurricular oc = new OcorrenciaComponenteCurricular();
            oc.oferecimentoComponenteCurricularId = of.id;
            oc.professorId = of.professorId;
            oc.salaId = of.salaId;
            oc.ativo = true;
            oc.aulaPresencial = true;
            oc.aulaCoringa = false;
            geradas.add(oc);
        }
        return geradas;
    }

    private List<OcorrenciaComponenteCurricular> gerarOcorrencias(OferecimentoComponenteCurricular of,
                                                                  List<DiaAula> selecionados, Set<Date> feriadoSet,
                                                                  List<OcorrenciaComponenteCurricular> existentes,
                                                                  Criterio criterio, Date dataInicio, long quantidadeAulas,
                                                                  Map<Long, Long> diaAulaTurno) {
        List<OcorrenciaComponenteCurricular> geradas = new ArrayList<>();
        Calendar calendario = Calendar.getInstance();
        calendario.setTime(dataInicio);
        int caluloDia = 1;
        int salvaguarda = 0;
        while (caluloDia <= quantidadeAulas && salvaguarda < 2000) {
            Date dia = calendario.getTime();
            int diaSemana = calendario.get(Calendar.DAY_OF_WEEK);
            salvaguarda++;
            if (!periodoDefinidoNosCriterios(dia, criterio) && !feriadoSet.contains(dia)) {
                for (DiaAula da : selecionados) {
                    if (da.diaSemanaId != null && da.diaSemanaId.intValue() == diaSemana) {
                        boolean conflito = existentes != null && existentes.stream().anyMatch(o ->
                                o.oferecimentoComponenteCurricularId != null && !o.oferecimentoComponenteCurricularId.equals(of.id)
                                        && o.data != null && o.data.equals(dia)
                                        && o.diaAulaId != null
                                        && Objects.equals(diaAulaTurno.get(o.diaAulaId), da.turnoEducacaoId));
                        if (!conflito) {
                            OcorrenciaComponenteCurricular oc = new OcorrenciaComponenteCurricular();
                            oc.oferecimentoComponenteCurricularId = of.id;
                            oc.professorId = of.professorId;
                            oc.salaId = of.salaId;
                            oc.diaAulaId = da.id;
                            oc.data = dia;
                            oc.ativo = true;
                            oc.aulaPresencial = true;
                            oc.aulaCoringa = false;
                            geradas.add(oc);
                            caluloDia++;
                            if (caluloDia > quantidadeAulas) break;
                        }
                    }
                }
            }
            calendario.add(Calendar.DAY_OF_YEAR, 1);
        }
        if (!geradas.isEmpty()) {
            of.dataInicio = geradas.get(0).data;
            of.dataFim = geradas.get(geradas.size() - 1).data;
        }
        return geradas;
    }

    // Criterio mais recente (id desc) do curriculo+unidade do oferecimento.
    private Uni<Criterio> carregarCriterio(OferecimentoComponenteCurricular of) {
        if (of.curriculoId == null || of.unidadeId == null) {
            return Uni.createFrom().nullItem();
        }
        return criterioService.buscarCriterio(of.curriculoId, of.unidadeId)
                .flatMap(ids -> ids == null || ids.isEmpty()
                        ? Uni.createFrom().nullItem()
                        : criterioRepository.findById(ids.get(0)));
    }

    // Migrado de OferecimentoCursoController.periodoDefinidoNosCriterios (legado, L624) -
    // datas invalidas por criterio sao apenas informativas na UI.
    private boolean periodoDefinidoNosCriterios(Date data, Criterio criterio) {
        if (criterio == null || (criterio.dataInicio == null && criterio.dataFim == null)) {
            return false;
        }
        return criterio.dataInicio != null && criterio.dataInicio.after(data);
    }

    // Horas de aula de um DiaAula: diferenca (min) entre inicio/fim do turno dividida pelo tempo de aula.
    private double horasAula(DiaAula d, List<TurnoEducacao> turnos, List<TempoAula> tempos) {
        hydrate(d, turnos, tempos);
        TurnoEducacao t = d.turnoEducacao;
        TempoAula ta = d.tempoAula;
        if (t == null || ta == null || t.inicio == null || t.fim == null) return 0;
        long minutos = java.time.Duration.between(t.inicio, t.fim).toMinutes();
        return minutos / (double) (ta.minutos > 0 ? ta.minutos : 1);
    }

    private void hydrate(DiaAula d, List<TurnoEducacao> turnos, List<TempoAula> tempos) {
        if (d.turnoEducacaoId != null && turnos != null) {
            d.turnoEducacao = turnos.stream().filter(t -> t.id.equals(d.turnoEducacaoId)).findFirst().orElse(null);
        }
        if (d.tempoAulaId != null && tempos != null) {
            d.tempoAula = tempos.stream().filter(t -> t.id.equals(d.tempoAulaId)).findFirst().orElse(null);
        }
    }

    // Gera e persiste as ocorrencias de um unico oferecimento (regeneracao: apaga as ativas primeiro).
    public Uni<Integer> gerarAula(Long oferecimentoComponenteCurricularId, Date dataInicio, List<Long> diasAulaSelecionado) {
        if (diasAulaSelecionado == null || diasAulaSelecionado.isEmpty()) {
            return Uni.createFrom().item(0);
        }
        return repository.findById(oferecimentoComponenteCurricularId)
                .onItem().ifNull().failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found"))
                .flatMap(of -> ocorrenciaRepository.delete("ativo = true and oferecimentoComponenteCurricularId = ?1", of.id)
                        .flatMap(v -> gerarAula(of, dataInicio, diasAulaSelecionado)))
                .flatMap(lista -> ocorrenciaRepository.persist(lista).replaceWith(lista.size()));
    }

    // Gera aulas para varios oferecimentos (ex.: grupo inteiro no 'gerar-aula-curso-sequencia').
    public Uni<Integer> gerarAulaBatch(List<Long> ids, Date dataInicio, List<Long> diasAulaSelecionado, Long salaId, Long professorId) {
        if (ids == null || ids.isEmpty() || diasAulaSelecionado == null || diasAulaSelecionado.isEmpty()) {
            return Uni.createFrom().item(0);
        }
        Uni<List<OcorrenciaComponenteCurricular>> acc = Uni.createFrom().item(new ArrayList<>());
        for (Long id : ids) {
            acc = acc.flatMap(lista -> repository.findById(id)
                    .onItem().ifNull().continueWith(() -> null)
                    .flatMap(of -> {
                        if (of == null) return Uni.createFrom().item(lista);
                        if (salaId != null) of.salaId = salaId;
                        if (professorId != null) of.professorId = professorId;
                        return ocorrenciaRepository.delete("ativo = true and oferecimentoComponenteCurricularId = ?1", of.id)
                                .flatMap(v -> gerarAula(of, dataInicio, diasAulaSelecionado))
                                .map(g -> {
                                    lista.addAll(g);
                                    return lista;
                                });
                    }));
        }
        return acc.flatMap(lista -> ocorrenciaRepository.persist(lista).replaceWith(lista.size()));
    }

    // ----- replicacao de oferecimentos (migrado de OferecimentoComponenteCurricularService.replicarOferecimento, legado L743-837) -----

    // Replica um oferecimento (id): cria um novo a partir do "velho", calcula a dataInicio conforme
    // o tipoReplicacao (0-3) usando o ultimo oferecimento do grupo, gera as ocorrencias (gerarAula)
    // e atualiza datas/status. Dependencias cross-service nao mapeadas aqui (professores disponiveis
    // e chamadas assinadas) sao mantidas como no-ops.
    public Uni<Integer> replicarOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.findById(oferecimentoComponenteCurricularId)
                .onItem().ifNull().failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found"))
                .flatMap(this::replicarOferecimento);
    }

    private Uni<Integer> replicarOferecimento(OferecimentoComponenteCurricular velho) {
        if (velho.salaId == null) {
            return Uni.createFrom().item(0);
        }
        return repository.buscarDiasAulaPorOferecimento(velho.id)
                .flatMap(diasAulaSelecionado -> {
                    if (diasAulaSelecionado == null || diasAulaSelecionado.isEmpty()) {
                        return Uni.createFrom().item(0);
                    }
                    return salaRepository.findById(velho.salaId)
                            .map(sala -> sala != null && sala.quantidadeAlunos != null ? sala.quantidadeAlunos : velho.vagas)
                            .flatMap(vagas -> {
                                OferecimentoComponenteCurricular novo = new OferecimentoComponenteCurricular();
                                copiarParaReplicacao(velho, novo, vagas);
                                novo.diasAula = new LinkedHashSet<>(diasAulaSelecionado);
                                return calcularDataInicioReplicacao(velho)
                                        .flatMap(dataInicio -> {
                                            if (dataInicio == null) {
                                                return Uni.createFrom().item(0);
                                            }
                                            List<Long> diasIds = diasAulaSelecionado.stream().map(d -> d.id).toList();
                                            return gerarAula(novo, dataInicio, diasIds)
                                                    .flatMap(ocorrencias -> {
                                                        if (ocorrencias == null || ocorrencias.isEmpty()) {
                                                            return Uni.createFrom().item(0);
                                                        }
                                                        novo.professorId = velho.professorId;
                                                        velho.replicar = false;
                                                        return repository.persist(novo)
                                                                .flatMap(n -> {
                                                                    for (OcorrenciaComponenteCurricular o : ocorrencias) {
                                                                        o.oferecimentoComponenteCurricularId = n.id;
                                                                    }
                                                                    return ocorrenciaRepository.persist(ocorrencias);
                                                                })
                                                                .flatMap(list -> repository.atualizaStatosInscritosOferecimento(novo.id))
                                                                .chain(() -> repository.atualizaDataOferecimento(novo.id))
                                                                .replaceWith(ocorrencias.size());
                                                    });
                                        });
                            });
                });
    }

    private void copiarParaReplicacao(OferecimentoComponenteCurricular velho, OferecimentoComponenteCurricular novo, Integer vagas) {
        novo.componenteCurricularId = velho.componenteCurricularId;
        novo.curriculoId = velho.curriculoId;
        novo.dataAlteracao = new Date();
        novo.salaId = velho.salaId;
        novo.vagas = vagas;
        novo.qtdeSequencia = velho.qtdeSequencia;
        novo.qtdeEspacoCaderno = velho.qtdeEspacoCaderno;
        novo.grupoId = velho.grupoId;
        novo.possuiAvaliacao = velho.possuiAvaliacao;
        novo.registraFrequencia = velho.registraFrequencia;
        novo.sequencia = velho.sequencia;
        novo.unidadeId = velho.unidadeId;
        novo.replicar = true;
        novo.tipoPlanejamento = velho.tipoPlanejamento;
        novo.replicado = true;
        novo.detalharReplicacao = velho.detalharReplicacao;
        novo.tipoReplicacao = velho.tipoReplicacao;
        novo.componenteCurricularReplicarId = velho.componenteCurricularReplicarId;
        novo.diasReplicar = velho.diasReplicar;
    }

    // Data de inicio da replicacao a partir do ultimo oferecimento do grupo (ou do proprio
    // oferecimento quando nao ha anterior), conforme o tipoReplicacao (0=ini, 1=ini+1d,
    // 2=fim, 3=fim+1d) - migrado de obtemDataInicioRecplicacao (legado).
    private Uni<Date> calcularDataInicioReplicacao(OferecimentoComponenteCurricular velho) {
        Uni<java.util.List<OferecimentoComponenteCurricular>> ultimoU;
        if (velho.detalharReplicacao && velho.componenteCurricularReplicarId != null) {
            ultimoU = repository.ultimoOferecimentoDoGrupoComponente(velho.grupoId, velho.componenteCurricularReplicarId)
                    .flatMap(lista -> lista.isEmpty()
                            ? repository.ultimoOferecimentoDoGrupo(velho.grupoId)
                            : Uni.createFrom().item(lista));
        } else {
            ultimoU = repository.ultimoOferecimentoDoGrupo(velho.grupoId);
        }
        return ultimoU.map(ultimo -> {
            if (!velho.detalharReplicacao) {
                if (ultimo != null && !ultimo.isEmpty()) {
                    return ultimo.get(0).dataFim;
                }
                return velho.dataFim;
            }
            return obtemDataInicioReplicacao(velho, ultimo);
        });
    }

    private Date obtemDataInicioReplicacao(OferecimentoComponenteCurricular velho, List<OferecimentoComponenteCurricular> ultimo) {
        OferecimentoComponenteCurricular u = ultimo != null && !ultimo.isEmpty() ? ultimo.get(0) : null;
        Date base;
        if (velho.tipoReplicacao == 0 || velho.tipoReplicacao == 1) {
            base = u != null ? u.dataInicio : velho.dataInicio;
        } else {
            base = u != null ? u.dataFim : velho.dataFim;
        }
        if (velho.tipoReplicacao == 1 || velho.tipoReplicacao == 3) {
            Calendar c = Calendar.getInstance();
            c.setTime(base);
            c.add(Calendar.DAY_OF_YEAR, 1);
            return c.getTime();
        }
        return base;
    }

    // Migrado de OferecimentoCursoController.buscarTurnoEducacao (legado) - "descricao: HH:mm as HH:mm".
    public Uni<String> buscarTurnoEducacao(Long ocorrenciaComponenteCurricularId) {
        if (ocorrenciaComponenteCurricularId == null) {
            return Uni.createFrom().item("");
        }
        return ocorrenciaRepository.findById(ocorrenciaComponenteCurricularId)
                .onItem().ifNull().continueWith(() -> null)
                .flatMap(o -> o == null || o.diaAulaId == null ? Uni.createFrom().item("")
                        : diaAulaRepository.findById(o.diaAulaId)
                        .onItem().ifNull().continueWith(() -> null)
                        .flatMap(da -> da == null || da.turnoEducacaoId == null ? Uni.createFrom().item("")
                                : turnoEducacaoRepository.findById(da.turnoEducacaoId)
                                .onItem().ifNull().continueWith(() -> null)
                                .map(t -> t == null ? ""
                                        : t.descricao + ": " + DateTimeFormatter.ofPattern("HH:mm").format(t.inicio)
                                        + " as " + DateTimeFormatter.ofPattern("HH:mm").format(t.fim))));
    }

    // Turmas (OferecimentoComponenteCurricular) de um grupo - migrado de GrupoRepository.listarOferecimentos.
    public Uni<List<OferecimentoComponenteCurricularResponse>> listarOferecimentosPorGrupo(Long grupoId) {
        return withRefs(repository.listarOferecimentosPorGrupo(grupoId));
    }

    // Dias de aula (edc_oferecimento_dias_aula) de todos os oferecimentos de um grupo.
    public Uni<List<DiaAulaResponse>> buscarDiasAulaPorGrupo(Long grupoId) {
        return repository.buscarDiasAulaPorGrupo(grupoId)
                .flatMap(dias -> Uni.combine().all()
                        .unis(turnoEducacaoRepository.listAll(), tempoAulaRepository.listAll())
                        .asTuple()
                        .map(tuple -> dias.stream().map(d -> {
                            hydrate(d, tuple.getItem1(), tuple.getItem2());
                            return toDiaAulaResponse(d);
                        }).toList()));
    }

    private DiaAulaResponse toDiaAulaResponse(DiaAula e) {
        return new DiaAulaResponse(e.id, e.diaSemanaId, e.turnoEducacaoId, e.tempoAulaId,
                e.turnoEducacaoId != null && e.turnoEducacao != null ? e.turnoEducacao.descricao : null,
                e.tempoAulaId != null && e.tempoAula != null ? e.tempoAula.descricao : null,
                e.turnoEducacao != null ? e.turnoEducacao.inicio : null,
                e.turnoEducacao != null ? e.turnoEducacao.fim : null,
                e.tempoAula != null ? e.tempoAula.minutos : null);
    }


    // Migrado de OferecimentoComponenteCurricularController.autoCompleteCurriculo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:184, camada controller)
    // Logica original (adaptar):
    // public List<Curriculo> autoCompleteCurriculo(String query) {
    //         try {
    //             FacesContext context = FacesContext.getCurrentInstance();
    //             Unidade unidade = (Unidade) UIComponent.getCurrentComponent(context).getAttributes().get("filter");
    //             if(!ObjectUtil.nullOrEmpty(unidade)){
    //                 if (query.equals("")) {
    //                     return curriculoService.unidadeCurso(unidade);
    //                 }
    //                 return curriculoService.autoCompleteComUnidade(query.toLowerCase(), unidade);
    //             }
    //         } catch (Exception e) {
    //             e.printStackTrace();
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        // Obs: depende do microservico basico (Unidade 'filter' vem da tela/controller JSF) e do CurriculoService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OferecimentoComponenteCurricularController.verificarCadernoOferecimento (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:366, camada controller)
    // Logica original (adaptar):
    // private void verificarCadernoOferecimento() {
    //         boolean verificarOcorrencia = false;
    //         if (!ObjectUtil.nullOrEmpty(ocorrenciaComponenteCurricularsRemover)) {
    //             cadernoComponenteCurricularListConflito = new ArrayList<>();
    //             List<CadernoComponenteCurricular> cadernos = cadernoComponenteCurricularService.buscarCadernoChamadaComOcorrenciasPresencasFeitas(ocorrenciaComponenteCurricularsRemover);
    //             if (!ObjectUtil.nullOrEmpty(cadernos)) {
    //                 for (CadernoComponenteCurricular cadernoComponenteCurricular : cadernos) {
    //                     if (cadernoComponenteCurricular.getPresenca() != 'n') {
    //                         cadernoComponenteCurricularLis ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> verificarCadernoOferecimento() {
        // Obs: logica de UI do controller JSF (depende do CadernoComponenteCurricularService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:630, camada controller)
    // Logica original (adaptar):
    // public List<DiaSemana> autoComplete(String query) {
    //         if (!ObjectUtil.nullOrEmpty(diaSemanaService.autocompleteCriterio(getEntity().getUnidade(), getEntity().getCurriculo()))) {
    //             return diaSemanaService.autocompleteCriterio(getEntity().getUnidade(), getEntity().getCurriculo());
    //         } else {
    //             return diaSemanaService.autocomplete(query);
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do DiaSemanaService (entidade DiaSemana) e de Unidade/Curriculo (basico/educacao)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OferecimentoComponenteCurricularController.autocompleteGrupo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:638, camada controller)
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteGrupo(String query) {
    //         if (getEntity().getCurriculo() != null && getEntity().getGrupo() != null && !query.equals("")) {
    //             return oferecimentoComponenteCurricularService.autocompleteComCurriculoGrupoComQuery(query, getEntity().getGrupo(), getEntity().getCurriculo());
    //         }
    //         if (getEntity().getCurriculo() != null && getEntity().getGrupo() != null && query.equals("")) {
    //             return oferecimentoComponenteCurricularService.autocompleteComCurriculoGrupoSemQuery(getEntity().getGrupo(), getEntity().getCurriculo());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autocompleteGrupo(String query) {
        // Obs: logica de UI do controller JSF (depende do curriculo/grupo da entidade em edicao e do ComponenteCurricular)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de OferecimentoComponenteCurricularController.buscarInformacoesOferecimentos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:670, camada controller)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public void buscarInformacoesOferecimentos(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         this.oferecimentoComponenteCurricular = oferecimentoComponenteCurricular;
    //         ocorrenciaComponenteCurricularsDialogo = ocorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimento(oferecimentoComponenteCurricular);
    //         diaAulasDialogo = diaAulaService.buscaDiasAulaOferecimentoList(oferecimentoComponenteCurricular);
    //     }
    public Uni<Void> buscarInformacoesOferecimentos(Long oferecimentoComponenteCurricularId) {
        // Obs: logica de UI do controller JSF (depende do OcorrenciaComponenteCurricularService e DiaAulaService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularController.gerarAula (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:830, camada controller)
    // Logica original (adaptar):
    // private void gerarAula() {
    //         try {
    //             alteracaodiaaula = true;
    //             bloquearProximo = false;
    //             Calendar calendario = Calendar.getInstance();
    //             calendario.setTime(dataInicio);
    //             listOcorrenciaRemove();
    //             ocorrenciaComponenteCurriculars = new ArrayList<>();
    //             if (ObjectUtil.nullOrEmpty(diasAulaSelecionado)) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Marque pelo menos um Dia da Semana.");
    //                 return;
    //             }
    // // ... (truncado, ver fonte original)
    public Uni<Void> gerarAula() {
        // Obs: logica de UI do controller JSF (gera OcorrenciaComponenteCurricular/DiaAula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularController.buscarTurnoEducacao (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/OferecimentoComponenteCurricularController.java:884, camada controller)
    // Observacao: parametro ocorrenciaComponenteCurricularId: era OcorrenciaComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public String buscarTurnoEducacao(OcorrenciaComponenteCurricular ocorrenciaComponenteCurricular) {
    //         if (!ObjectUtil.nullOrEmpty(ocorrenciaComponenteCurricular.getDiaAula())) {
    //             return (ocorrenciaComponenteCurricular.getDiaAula().getTurnoEducacao().getDescricao() + ": " + DateUtil.transformarDateEmHora(ocorrenciaComponenteCurricular.getDiaAula().getTurnoEducacao().getInicio()) + " as " + DateUtil.transformarDateEmHora(ocorrenciaComponenteCurricular.getDiaAula().getTurnoEducacao().getFim()));
    //         }
    //         return "";
    //     }
    // Obs: implementado em buscarTurnoEducacao(Long ocorrenciaComponenteCurricularId)


    // Migrado de OferecimentoComponenteCurricularService.buscarMatrizCurricular (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:57, camada service)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id)
    // Logica original (adaptar):
    // public List<MatrizCurricular> buscarMatrizCurricular(Curriculo curriculo) {
    //         return getOferecimentoComponenteCurricularRepository().buscarMatrizCurricular(curriculo);
    //     }
    public Uni<List<Long>> buscarMatrizCurricular(Long curriculoId) {
        return repository.buscarMatrizCurricular(curriculoId).map(list -> list.stream()
                .map(x -> ((Number) ((Object[]) x)[0]).longValue())
                .toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.autocompleteComCurriculoGrupoComQuery (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:61, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id); parametro curriculoId: era Curriculo (referencia por id)
    // JPQL original: select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and off.grupo = ?2 and off.curriculo = ?3 and off.status <> 'CANCELADA' and   (lower(off.componenteCurricular.descricao) like '%' || ?1 || '%'  OR str(off.id) = ?1 or lower(off.componenteCurricular.sucinto) like '%' || ?1 || '%')
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteComCurriculoGrupoComQuery(String query, Grupo grupo, Curriculo curriculo) {
    //         return getOferecimentoComponenteCurricularRepository().autocompleteComCurriculoGrupoComQuery(query.toLowerCase().trim(), grupo, curriculo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComCurriculoGrupoComQuery(String query, Long grupoId, Long curriculoId) {
        return repository.autocompleteComCurriculoGrupoComQuery(query.toLowerCase().trim(), grupoId, curriculoId)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.autocompleteComCurriculoGrupoSemQuery (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:65, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id); parametro curriculoId: era Curriculo (referencia por id)
    // JPQL original: select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and  off.grupo = ?1 and off.curriculo = ?2 and off.status <> 'CANCELADA'
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteComCurriculoGrupoSemQuery(Grupo grupo, Curriculo curriculo) {
    //         return getOferecimentoComponenteCurricularRepository().autocompleteComCurriculoGrupoSemQuery(grupo, curriculo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComCurriculoGrupoSemQuery(Long grupoId, Long curriculoId) {
        return repository.autocompleteComCurriculoGrupoSemQuery(grupoId, curriculoId)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.autocompleteComCurriculoComQuery (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:69, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id); parametro curriculoId: era Curriculo (referencia por id)
    // JPQL original: select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and  off.curriculo = ?2 and off.status <> 'CANCELADA' and   (lower(off.componenteCurricular.descricao) like '%' || ?1 || '%'  OR str(off.id) = ?1 or lower(off.componenteCurricular.sucinto) like '%' || ?1 || '%')
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteComCurriculoComQuery(String query, Grupo grupo, Curriculo curriculo) {
    //         return getOferecimentoComponenteCurricularRepository().autocompleteComCurriculoComQuery(query.toLowerCase().trim(), curriculo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComCurriculoComQuery(String query, Long grupoId, Long curriculoId) {
        return repository.autocompleteComCurriculoComQuery(query.toLowerCase().trim(), curriculoId)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.autocompleteComCurriculoSemQuery (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:73, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id); parametro curriculoId: era Curriculo (referencia por id)
    // JPQL original: select distinct off.componenteCurricular from OferecimentoComponenteCurricular off where off.unidade.ativo = true and off.curriculo = ?1 and off.status <> 'CANCELADA'
    // Logica original (adaptar):
    // public List<ComponenteCurricular> autocompleteComCurriculoSemQuery(Grupo grupo, Curriculo curriculo) {
    //         return getOferecimentoComponenteCurricularRepository().autocompleteComCurriculoSemQuery(curriculo, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autocompleteComCurriculoSemQuery(Long grupoId, Long curriculoId) {
        return repository.autocompleteComCurriculoSemQuery(curriculoId)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarOcorrenciaComOFerecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:77, camada service)
    // Observacao: retorno: era OferecimentoComponenteCurricular (referencia por id); parametro entityId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where  o.unidade.ativo = true and oc.ativo = true  and o= ?1 order by oc.data
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricular buscarOcorrenciaComOFerecimento(OferecimentoComponenteCurricular entity) {
    //         return getOferecimentoComponenteCurricularRepository().buscarOcorrenciaComOFerecimento(entity);
    //     }
    public Uni<Long> buscarOcorrenciaComOFerecimento(Long entityId) {
        return repository.buscarOcorrenciaComOFerecimento(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarTodosOcorrenciaComOFerecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:81, camada service)
    // Observacao: retorno: era OferecimentoComponenteCurricular (referencia por id); parametro entityId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares oc where   o.unidade.ativo = true and o= ?1 order by oc.data
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricular buscarTodosOcorrenciaComOFerecimento(OferecimentoComponenteCurricular entity) {
    //         return getOferecimentoComponenteCurricularRepository().buscarTodosOcorrenciaComOFerecimento(entity);
    //     }
    public Uni<Long> buscarTodosOcorrenciaComOFerecimento(Long entityId) {
        return repository.buscarTodosOcorrenciaComOFerecimento(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarOferecimentoAbertasComSala (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:85, camada service)
    // Observacao: parametro salaId: era Sala (referencia por id)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> buscarOferecimentoAbertasComSala(Sala sala) {
    //         return getOferecimentoComponenteCurricularRepository().buscarOferecimentoAbertasComSala(sala);
    //     }
    public Uni<List<Long>> buscarOferecimentoAbertasComSala(Long salaId) {
        // Obs: condicao removida (depende de outro microservico): o.unidade.ativo = true
        return repository.find("salaId = ?1 and (status = 'LIBERADA' or status  = 'PENDENTE' or status  = 'LOTADA' or status = 'EM_ANDAMENTO')", salaId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarOferecimentoComOcorrencia (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:89, camada service)
    // Observacao: retorno: era OferecimentoComponenteCurricular (referencia por id); parametro entityId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where  o.unidade.ativo = true  and c.ativo = true and o = ?1 order by c.data
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricular buscarOferecimentoComOcorrencia(OferecimentoComponenteCurricular entity) {
    //         return getOferecimentoComponenteCurricularRepository().buscarOferecimentoComOcorrencia(entity);
    //     }
    public Uni<Long> buscarOferecimentoComOcorrencia(Long entityId) {
        return repository.buscarOferecimentoComOcorrencia(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarOferecimentoComOcorrenciaTodos (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:93, camada service)
    // Observacao: retorno: era OferecimentoComponenteCurricular (referencia por id); parametro entityId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OferecimentoComponenteCurricular o join fetch o.ocorrenciaComponenteCurriculares c where o = ?1 order by c.data
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricular buscarOferecimentoComOcorrenciaTodos(OferecimentoComponenteCurricular entity) {
    //         return getOferecimentoComponenteCurricularRepository().buscarOferecimentoComOcorrenciaTodos(entity);
    //     }
    public Uni<Long> buscarOferecimentoComOcorrenciaTodos(Long entityId) {
        return repository.buscarOferecimentoComOcorrenciaTodos(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarExisteConflito (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:98, camada service)
    // Observacao: parametro salaId: era Sala (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> verificarExisteConflito(Date data, Sala sala, Unidade unidade) {
    //         return getOferecimentoComponenteCurricularRepository().verificarExisteConflito(data, sala, unidade);
    //     }
    public Uni<List<Long>> verificarExisteConflito(Date data, Long salaId, Long unidadeId) {
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade = ?3
        return repository.find("ativo = true and data = ?1 and salaId = ?2", data, salaId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarExisteConflitoComOferecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:102, camada service)
    // Observacao: parametro salaId: era Sala (referencia por id); parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> verificarExisteConflitoComOferecimento(Date data, Sala sala, OferecimentoComponenteCurricular oferecimentoComponenteCurricular, Unidade unidade) {
    //         return getOferecimentoComponenteCurricularRepository().verificarExisteConflitoComOferecimento(data, sala, oferecimentoComponenteCurricular, unidade);
    //     }
    public Uni<List<Long>> verificarExisteConflitoComOferecimento(Date data, Long salaId, Long oferecimentoComponenteCurricularId, Long unidadeId) {
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade = ?4
        return repository.find("ativo = true and data = ?1 and salaId = ?2 and oferecimentoComponenteCurricular <> ?3", data, salaId, oferecimentoComponenteCurricularId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarExisteConflitoComOferecimentos (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:106, camada service)
    // Observacao: parametro salaId: era Sala (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> verificarExisteConflitoComOferecimentos(Date data, Sala sala, List<OferecimentoComponenteCurricular> oferecimentoComponenteCurricular, Unidade unidade) {
    //         return getOferecimentoComponenteCurricularRepository().verificarExisteConflitoComOferecimentos(data, sala, oferecimentoComponenteCurricular, unidade);
    //     }
    public Uni<List<Long>> verificarExisteConflitoComOferecimentos(Date data, Long salaId, List<Long> oferecimentoComponenteCurricular, Long unidadeId) {
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade = ?4
        return repository.find("ativo = true and data = ?1 and salaId = ?2 and oferecimentoComponenteCurricular not in (?3)", data, salaId, oferecimentoComponenteCurricular, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarComponentessDoOferecimentos (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:110, camada service)
    // Observacao: parametro componenteCurricularId: era ComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> buscarComponentessDoOferecimentos(ComponenteCurricular componenteCurricular) {
    //         return getOferecimentoComponenteCurricularRepository().buscarComponentessDoOferecimentos(componenteCurricular);
    //     }
    public Uni<List<Long>> buscarComponentessDoOferecimentos(Long componenteCurricularId) {
        // Obs: condicao removida (depende de outro microservico): o.unidade.ativo = true
        return repository.find("componenteCurricularId = ?1", componenteCurricularId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarExisteConflitoProrrogandoDisciplina (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:114, camada service)
    // Observacao: parametro salaId: era Sala (referencia por id); parametro oId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> verificarExisteConflitoProrrogandoDisciplina(Date data, Sala sala, OferecimentoComponenteCurricular o) {
    //         return getOferecimentoComponenteCurricularRepository().verificarExisteConflitoProrrogandoDisciplina(data, sala, o);
    //     }
    public Uni<List<Long>> verificarExisteConflitoProrrogandoDisciplina(Date data, Long salaId, Long oId) {
        // Obs: condicao removida (depende de outro microservico): o.oferecimentoComponenteCurricular.unidade.ativo = true
        return repository.find("ativo = true and data = ?1 and salaId = ?2 and oferecimentoComponenteCurricular <> ?3", data, salaId, oId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarDisciplina (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:280, camada service)
    // Logica original (adaptar):
    // public void verificarDisciplina() {
    //         try {
    //             hibernateService.executeUpdateSQL(" UPDATE edc_oferecimento_componente_curricular o" +
    //                     "  SET status = 'CANCELADA' where (o.status = 'PENDENTE' or o.status = 'LIBERADA') and o.inscritos = 0 " +
    //                     "  and (select count(oco) from edc_ocorrencia_componente_curricular oco where oco.fl_ativo = true " +
    //                     "  and oco.data < current_date and oco.id_oferecimento_componente_curricular = o.id) > " +
    //                     "  (select c.qtd_aulas_tolerancia_matricula from edc_criterio c where c.id_curriculo  = o.id_curso order by c.id desc limit 1)");
    // 
    //             hibernateService.executeUpda ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> verificarDisciplina() {
        // Obs: rotina de manutencao com multiplos UPDATEs nativos (edc_oferecimento/ocorrencia/criterio/matricula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarOferecimentoComDiasAula (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:329, camada service)
    // Observacao: retorno: era OferecimentoComponenteCurricular (referencia por id); parametro entityId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OferecimentoComponenteCurricular o join fetch o.diasAula c where o.unidade.ativo = true and o = ?1
    // Logica original (adaptar):
    // public OferecimentoComponenteCurricular buscarOferecimentoComDiasAula(OferecimentoComponenteCurricular entity) {
    //         return getOferecimentoComponenteCurricularRepository().buscarOferecimentoComDiasAula(entity);
    //     }
    public Uni<Long> buscarOferecimentoComDiasAula(Long entityId) {
        return repository.buscarOferecimentoComDiasAula(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de OferecimentoComponenteCurricularService.verificarchamadaAssinada (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:346, camada service)
    // Logica original (adaptar):
    // public void verificarchamadaAssinada() {
    //         hibernateService.executeUpdateSQL("update edc_oferecimento_componente_curricular set qtde_sequencia = 1 where qtde_sequencia = 0");
    //         List<Integer> oferecimentoComponenteCurriculars = (List<Integer>) hibernateService.executeSQL(" select o.id FROM edc_oferecimento_componente_curricular o where  " +
    //                 " o.data_inicio <= current_date and o.status != 'CANCELADA' and" +
    //                 " not exists(select cha.id from edc_chamada_assinada_impressa cha where cha.id_oferecimento_componente_curricular = o.id)" +
    //                 " order by o.data_inicio");
    // 
    //         for (Integer ii : oferecimentoComponenteCurriculars) {
    //             Of ...
    public Uni<Void> verificarchamadaAssinada() {
        // Obs: depende do ChamadaAssinadaImpressaService (carregarChamadasNormais) com loop sobre oferecimentos
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularService.ajustesreplica (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:359, camada service)
    // Logica original (adaptar):
    // public void ajustesreplica() {
    //         hibernateService.executeUpdateSQL("   UPDATE edc_oferecimento_componente_curricular" +
    //                 "        SET fl_replicar = false" +
    //                 "        WHERE id_unidade is null or id_grupo is null or data_inicio is null or data_fim is null");
    // 
    //         List<Integer> oferecimentoComponenteCurriculars = (List<Integer>) hibernateService.executeSQL("select off.id as turma " +
    //                 " from edc_oferecimento_componente_curricular off where " +
    //                 "   id_unidade is not null and id_grupo is not null" +
    //                 " and not exists(select oco.id_oferecimento_componente_curricular " +
    //                 " from edc_oferecimento_di ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> ajustesreplica() {
        // Obs: rotina de manutencao com UPDATEs nativos e dependencia do DiaAulaService (dias de aula)
        return Uni.createFrom().voidItem();
    }


    // Migrado de OferecimentoComponenteCurricularService.autoCompleteComUnidade (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:491, camada service)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autoCompleteComUnidade(String query, List<Unidade> unidades) {
    //         return getOferecimentoComponenteCurricularRepository().autoCompleteComUnidade(query.toLowerCase().trim(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUnidade(String query, List<Long> unidades) {
        // Obs: condicao removida (depende de outro microservico): o.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): (lower(o.componenteCurricular.descricao) like '%' || ?1 || '%' or str(o.id) like '%' || ?1 || '%')
        return repository.find("status = 'EM_ANDAMENTO' and unidadeId in (?2) order by id", query.toLowerCase().trim(), unidades).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.autoCompleteComUnidadeChamadaAssinada (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:495, camada service)
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> autoCompleteComUnidadeChamadaAssinada(String query, List<Unidade> unidades) {
    //         return getOferecimentoComponenteCurricularRepository().autoCompleteComUnidadeChamadaAssinada(query.toLowerCase().trim(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComUnidadeChamadaAssinada(String query, List<Long> unidades) {
        // Obs: condicao removida (depende de outro microservico): o.unidade.ativo = true
        // Obs: condicao removida (depende de outro microservico): (lower(o.componenteCurricular.descricao) like '%' || ?1 || '%' or str(o.id) like '%' || ?1 || '%')
        return repository.find("(status = 'EM_ANDAMENTO' or status = 'LIBERADA') and unidadeId in (?2) order by id", query.toLowerCase().trim(), unidades).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OferecimentoComponenteCurricularService.buscarCriterios (src/main/java/br/com/sol7/olimpio/service/services/educacao/OferecimentoComponenteCurricularService.java:786, camada service)
    // Observacao: retorno: era Criterio (referencia por id); parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // Logica original (adaptar):
    // public Criterio buscarCriterios(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         Criterio criterio = new Criterio();
    //         List<Criterio> criterios = criterioService.buscarCriterio(oferecimentoComponenteCurricular.getCurriculo(), oferecimentoComponenteCurricular.getUnidade());
    //         if (ObjectUtil.nullOrEmpty(criterios)) {
    //             return criterio;
    //         } else {
    //             if (!ObjectUtil.nullOrEmpty(criterios)) {
    //                 criterio = criterios.get(0);
    //                 if (criterios.size() > 1) {
    //                     criterioService.corrigeCriterioDuplicadoPorunidadeCurso(criterio);
    //                 }
    //             }
    // // ... (truncado, ver fonte original)
    public Uni<Long> buscarCriterios(Long oferecimentoComponenteCurricularId) {
        return repository.findById(oferecimentoComponenteCurricularId)
                .onItem().ifNull().continueWith(() -> null)
                .flatMap(of -> of == null ? Uni.createFrom().nullItem() : carregarCriterio(of).map(c -> c == null ? null : c.id));
    }

    public Uni<Void> atulizarStatosInscritosOferecimentoTrocaTurma(Long contratoId) {
        return repository.atulizarStatosInscritosOferecimentoTrocaTurma(contratoId).replaceWithVoid();
    }

    public Uni<Void> atulizarStatosInscritosOferecimentoGrupo(Long grupoId) {
        return repository.atulizarStatosInscritosOferecimentoGrupo(grupoId).replaceWithVoid();
    }

    public Uni<Void> atulizarSalasOferecimentoComGrupo(Long grupoId) {
        return repository.atulizarSalasOferecimentoComGrupo(grupoId).replaceWithVoid();
    }

    public Uni<Void> atulizarSalasOferecimentoComOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.atulizarSalasOferecimentoComOferecimento(oferecimentoComponenteCurricularId).replaceWithVoid();
    }

    public Uni<Void> atulizarVagasOferecimento(Long oferecimentoComponenteCurricularId, Integer vagas) {
        return repository.atulizarVagasOferecimento(oferecimentoComponenteCurricularId, vagas).replaceWithVoid();
    }

    public Uni<Void> atulizarStatosInscritosOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.atulizarStatosInscritosOferecimento(oferecimentoComponenteCurricularId).replaceWithVoid();
    }

    public Uni<Void> atulizarStatosInscritosOferecimentoCurso(Long curriculoId) {
        return repository.atulizarStatosInscritosOferecimentoCurso(curriculoId).replaceWithVoid();
    }

    public Uni<List<Long>> listarOferecimentosPendentes(List<Long> unidades) {
        return repository.listarOferecimentosPendentes(unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> listarOferecimentosDisponiveis(List<Long> componentes, List<Long> unidades, Long pessoaId) {
        return repository.listarOferecimentosDisponiveis(componentes, unidades, pessoaId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> listarOferecimentosDisponiveisComGrupo(List<Long> componentes, List<Long> unidades, Long pessoaId, String grupo) {
        return repository.listarOferecimentosDisponiveisComGrupo(componentes, unidades, pessoaId, grupo).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> listarOferecimentosRematriculaDisponiveisComGrupo(List<Long> componentes, List<Long> unidades, Long pessoaId, String grupo) {
        return repository.listarOferecimentosRematriculaDisponiveisComGrupo(componentes, unidades, pessoaId, grupo).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> listarOferecimentosDisponiveisComGrupoUnidade(List<Long> componentes, Integer codUnidade, Long pessoaId, String grupo) {
        return repository.listarOferecimentosDisponiveisComGrupoUnidade(componentes, codUnidade, pessoaId, grupo).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> listagemOferecimentoPorUnidadeCalendario(Long unidades, Date inicio, Date fim) {
        return repository.listagemOferecimentoPorUnidadeCalendarioIds(unidades, inicio, fim);
    }

    public Uni<List<Long>> consultaListarOferecimentos(Long unidades) {
        return repository.consultaListarOferecimentos(unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Void> atualizaDataOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.atualizaDataOferecimento(oferecimentoComponenteCurricularId).replaceWithVoid();
    }

    public Uni<Void> atualizaDataOferecimentoGrupo(Long grupoId) {
        return repository.atualizaDataOferecimentoGrupo(grupoId).replaceWithVoid();
    }

    public Uni<List<String>> listarGruposDisponiveisComUnidadesRematricula(Long curriculoId, List<Long> unidades, Long pessoaId) {
        return repository.listarGruposDisponiveisComUnidadesRematriculaStr(curriculoId, unidades, pessoaId);
    }

    public Uni<List<String>> listarGruposDisponiveisComUnidades(Long curriculoId, List<Long> unidades) {
        return repository.listarGruposDisponiveisComUnidadesStr(curriculoId, unidades);
    }

    public Uni<Void> ajutarOferecimento(Long oferecimentoComponenteCurricularId, Long diaAulaId) {
        return repository.ajutarOferecimento(oferecimentoComponenteCurricularId, diaAulaId).replaceWithVoid();
    }

    public Uni<Long> saveOrUpdate(Long id, Date dataAlteracao) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("OferecimentoComponenteCurricular not found"))
                .flatMap(of -> {
                    of.dataAlteracao = dataAlteracao;
                    return repository.persist(of).replaceWith(of.id);
                });
    }

    public Uni<List<Long>> listProfessoresDisponiveisComponente(Long componenteCurricularId, Long unidadeId) {
        return professorRepository.buscarListaProfessoresParaTurma(componenteCurricularId, unidadeId)
                .map(list -> list.stream().map(x -> x.id).toList());
    }

}

