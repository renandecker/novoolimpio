package br.com.sol7.olimpio.educacao.ocorrenciacomponentecurricular;

import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricular;
import br.com.sol7.olimpio.educacao.componentecurricular.ComponenteCurricularRepository;
import br.com.sol7.olimpio.educacao.diaaula.DiaAula;
import br.com.sol7.olimpio.educacao.diaaula.DiaAulaRepository;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricular;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularRepository;
import br.com.sol7.olimpio.educacao.sala.Sala;
import br.com.sol7.olimpio.educacao.sala.SalaRepository;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAula;
import br.com.sol7.olimpio.educacao.tempoaula.TempoAulaRepository;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacao;
import br.com.sol7.olimpio.educacao.turnoeducacao.TurnoEducacaoRepository;
import br.com.sol7.olimpio.educacao.professor.Professor;
import br.com.sol7.olimpio.educacao.professor.ProfessorRepository;
import br.com.sol7.olimpio.educacao.basico.PessoaFisica;
import br.com.sol7.olimpio.educacao.basico.PessoaFisicaRepository;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Date;

@ApplicationScoped
@WithTransaction
public class OcorrenciaComponenteCurricularService {

    @Inject
    OcorrenciaComponenteCurricularRepository repository;
    @Inject
    SalaRepository salaRepository;
    @Inject
    DiaAulaRepository diaAulaRepository;
    @Inject
    TurnoEducacaoRepository turnoEducacaoRepository;
    @Inject
    TempoAulaRepository tempoAulaRepository;
    @Inject
    OferecimentoComponenteCurricularRepository oferecimentoRepository;
    @Inject
    ComponenteCurricularRepository componenteCurricularRepository;
    @Inject
    ProfessorRepository professorRepository;
    @Inject
    PessoaFisicaRepository pessoaFisicaRepository;

    public Uni<List<OcorrenciaComponenteCurricularResponse>> list() {
        return withRefs(repository.listAll());
    }

    public Uni<PagedResponse<OcorrenciaComponenteCurricularResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        Uni<List<OcorrenciaComponenteCurricular>> items = repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list();
        return withRefs(items)
                .onItem().transformToUni(res -> repository.count()
                        .map(count -> new PagedResponse<>(res, count, p, s)));
    }


    public Uni<OcorrenciaComponenteCurricularResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OcorrenciaComponenteCurricular not found"))
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<OcorrenciaComponenteCurricularResponse> create(OcorrenciaComponenteCurricularRequest r) {
        var e = new OcorrenciaComponenteCurricular();
        apply(e, r);
        return repository.persist(e)
                .flatMap(x -> loadRefs().map(refs -> toResponse(x, refs)));
    }

    public Uni<OcorrenciaComponenteCurricularResponse> update(Long id, OcorrenciaComponenteCurricularRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OcorrenciaComponenteCurricular not found"))
                .invoke(e -> apply(e, r))
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("OcorrenciaComponenteCurricular not found")));
    }

    // @QueryParam Date nunca casa no RESTEasy Reactive (sempre 404); a API recebe
    // LocalDate (ISO yyyy-MM-dd) e converte para java.util.Date no filtro do DATE.
    private static Date toDate(LocalDate d) {
        return d == null ? null : java.sql.Date.valueOf(d);
    }

    private void apply(OcorrenciaComponenteCurricular e, OcorrenciaComponenteCurricularRequest r) {
        e.professorId = r.professorId();
        e.salaId = r.salaId();
        e.ativo = r.ativo();
        e.oferecimentoComponenteCurricularId = r.oferecimentoComponenteCurricularId();
        e.data = r.data();
        e.diaAulaId = r.diaAulaId();
        e.aulaCoringa = r.aulaCoringa();
        e.aulaPresencial = r.aulaPresencial();
    }

    // ----- resolucao de descricoes (refs locais, sem N+1) -----

    private record Refs(List<Sala> salas, List<DiaAula> diaAulas,
                        List<OferecimentoComponenteCurricular> oferecimentos,
                        List<ComponenteCurricular> componentes,
                        List<Professor> professores, List<PessoaFisica> pessoasFisicas) {
        String salaDescricao (Long id){
            if (id == null) return null;
            return salas.stream().filter(x -> x.id.equals(id)).map(x -> x.descricao).findFirst().orElse(null);
        }
        String diaAulaDescricao (Long id){
            if (id == null) return null;
            return diaAulas.stream().filter(x -> x.id.equals(id)).map(d -> {
                TurnoEducacao t = d.turnoEducacao;
                if (t == null || t.inicio == null || t.fim == null) return null;
                return t.descricao + ": " + DateTimeFormatter.ofPattern("HH:mm").format(t.inicio)
                        + " as " + DateTimeFormatter.ofPattern("HH:mm").format(t.fim);
            }).findFirst().orElse(null);
        }
        Long diaSemanaId (Long id){
            if (id == null) return null;
            return diaAulas.stream().filter(x -> x.id.equals(id)).map(x -> x.diaSemanaId).findFirst().orElse(null);
        }
        Long turnoEducacaoId (Long id){
            if (id == null) return null;
            return diaAulas.stream().filter(x -> x.id.equals(id)).map(x -> x.turnoEducacaoId).findFirst().orElse(null);
        }
        Long tempoAulaId (Long id){
            if (id == null) return null;
            return diaAulas.stream().filter(x -> x.id.equals(id)).map(x -> x.tempoAulaId).findFirst().orElse(null);
        }
        String oferecimentoDescricao (Long id){
            if (id == null) return null;
            return oferecimentos.stream().filter(x -> x.id.equals(id)).findFirst()
                    .map(of -> of.componenteCurricularId != null
                            ? componentes.stream().filter(c -> c.id.equals(of.componenteCurricularId)).map(c -> c.descricao).findFirst().orElse(null)
                            : null)
                    .orElse(null);
        }
        String professorNome (Long professorId){
            if (professorId == null) return null;
            Professor p = professores.stream().filter(x -> x.id.equals(professorId)).findFirst().orElse(null);
            if (p == null) return null;
            PessoaFisica pf = pessoasFisicas.stream().filter(x -> x.id.equals(p.pessoaId)).findFirst().orElse(null);
            return pf != null ? pf.nome : null;
        }
    }

    private void hydrate(DiaAula d, List<TurnoEducacao> turnos, List<TempoAula> tempos) {
        if (d.turnoEducacaoId != null && turnos != null) {
            d.turnoEducacao = turnos.stream().filter(t -> t.id.equals(d.turnoEducacaoId)).findFirst().orElse(null);
        }
        if (d.tempoAulaId != null && tempos != null) {
            d.tempoAula = tempos.stream().filter(t -> t.id.equals(d.tempoAulaId)).findFirst().orElse(null);
        }
    }

    private Uni<Refs> loadRefs() {
        return salaRepository.listAll()
                .onItem().transformToUni(salas -> diaAulaRepository.listAll()
                        .onItem().transformToUni(dias -> turnoEducacaoRepository.listAll()
                                .onItem().transformToUni(turnos -> tempoAulaRepository.listAll()
                                        .onItem().transformToUni(tempos -> oferecimentoRepository.listAll()
                                                .onItem().transformToUni(oferecimentos -> componenteCurricularRepository.listAll()
                                                        .onItem().transformToUni(componentes -> professorRepository.listAll()
                                                                .onItem().transformToUni(professores -> pessoaFisicaRepository.listAll()
                                                                        .map(pessoasFisicas -> {
                                                                            for (DiaAula d : dias)
                                                                                hydrate(d, turnos, tempos);
                                                                            return new Refs(salas, dias, oferecimentos, componentes, professores, pessoasFisicas);
                                                                        }))))))));
    }

    private Uni<List<OcorrenciaComponenteCurricularResponse>> withRefs(Uni<List<OcorrenciaComponenteCurricular>> items) {
        return loadRefs().onItem().transformToUni(refs -> items.map(list -> list.stream().map(e -> toResponse(e, refs)).toList()));
    }

    private OcorrenciaComponenteCurricularResponse toResponse(OcorrenciaComponenteCurricular e, Refs refs) {
        return new OcorrenciaComponenteCurricularResponse(e.id, e.professorId, e.salaId, e.ativo, e.oferecimentoComponenteCurricularId, e.data, e.diaAulaId, e.aulaCoringa, e.aulaPresencial,
                refs != null ? refs.professorNome(e.professorId) : null,
                refs != null ? refs.salaDescricao(e.salaId) : null,
                refs != null ? refs.diaAulaDescricao(e.diaAulaId) : null,
                refs != null ? refs.oferecimentoDescricao(e.oferecimentoComponenteCurricularId) : null,
                refs != null ? refs.diaSemanaId(e.diaAulaId) : null,
                refs != null ? refs.turnoEducacaoId(e.diaAulaId) : null,
                refs != null ? refs.tempoAulaId(e.diaAulaId) : null);
    }

    public Uni<List<Long>> buscarOcorrenciaPorProfessor(Long professorId, LocalDate inicio, LocalDate fim) {
        return repository.buscarOcorrenciaPorProfessor(professorId, toDate(inicio), toDate(fim)).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatas(Long oferecimentoComponenteCurricularId, LocalDate inicio, LocalDate fim) {
        return repository.buscarOcorrenciaPorOferecimentoEDatas(oferecimentoComponenteCurricularId, toDate(inicio), toDate(fim)).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatasCoringa(Long oferecimentoComponenteCurricularId, LocalDate inicio, LocalDate fim, Boolean coringa) {
        return repository.buscarOcorrenciaPorOferecimentoEDatasCoringa(oferecimentoComponenteCurricularId, toDate(inicio), toDate(fim), coringa).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaExtras(Long oferecimentoComponenteCurricularId) {
        return repository.buscarOcorrenciaExtras(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaNormais(Long oferecimentoComponenteCurricularId) {
        return repository.buscarOcorrenciaNormais(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.buscarOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarTodasOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
        return repository.buscarTodasOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade(LocalDate date, List<Long> unidades) {
        return repository.buscarOcorrenciaPorDataUnidade(toDate(date), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade2(LocalDate inicio, LocalDate fim, List<Long> unidades) {
        return repository.buscarOcorrenciaPorDataUnidade(toDate(inicio), toDate(fim), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoComGrupo(Long grupoId) {
        return repository.buscarOcorrenciaPorOferecimentoComGrupo(grupoId).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<OcorrenciaComponenteCurricularResponse>> buscarOcorrenciaPorOferecimentoComGrupoCompleto(Long grupoId) {
        return repository.buscarOcorrenciaPorOferecimentoComGrupo(grupoId)
                .flatMap(list -> withRefs(Uni.createFrom().item(list)));
    }

}

