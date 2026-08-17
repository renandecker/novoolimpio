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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Date;

@ApplicationScoped
@WithTransaction
public class OcorrenciaComponenteCurricularService {

    @Inject OcorrenciaComponenteCurricularRepository repository;
    @Inject SalaRepository salaRepository;
    @Inject DiaAulaRepository diaAulaRepository;
    @Inject TurnoEducacaoRepository turnoEducacaoRepository;
    @Inject TempoAulaRepository tempoAulaRepository;
    @Inject OferecimentoComponenteCurricularRepository oferecimentoRepository;
    @Inject ComponenteCurricularRepository componenteCurricularRepository;
    @Inject ProfessorRepository professorRepository;
    @Inject PessoaFisicaRepository pessoaFisicaRepository;

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

    private void apply(OcorrenciaComponenteCurricular e, OcorrenciaComponenteCurricularRequest r) { e.professorId = r.professorId(); e.salaId = r.salaId(); e.ativo = r.ativo(); e.oferecimentoComponenteCurricularId = r.oferecimentoComponenteCurricularId(); e.data = r.data(); e.diaAulaId = r.diaAulaId(); e.aulaCoringa = r.aulaCoringa(); e.aulaPresencial = r.aulaPresencial(); }

    // ----- resolucao de descricoes (refs locais, sem N+1) -----

    private record Refs(List<Sala> salas, List<DiaAula> diaAulas,
                        List<OferecimentoComponenteCurricular> oferecimentos,
                        List<ComponenteCurricular> componentes,
                        List<Professor> professores, List<PessoaFisica> pessoasFisicas) {
        String salaDescricao(Long id) {
            if (id == null) return null;
            return salas.stream().filter(x -> x.id.equals(id)).map(x -> x.descricao).findFirst().orElse(null);
        }
        String diaAulaDescricao(Long id) {
            if (id == null) return null;
            return diaAulas.stream().filter(x -> x.id.equals(id)).map(d -> {
                TurnoEducacao t = d.turnoEducacao;
                if (t == null || t.inicio == null || t.fim == null) return null;
                return t.descricao + ": " + DateTimeFormatter.ofPattern("HH:mm").format(t.inicio)
                        + " as " + DateTimeFormatter.ofPattern("HH:mm").format(t.fim);
            }).findFirst().orElse(null);
        }
        String oferecimentoDescricao(Long id) {
            if (id == null) return null;
            return oferecimentos.stream().filter(x -> x.id.equals(id)).findFirst()
                    .map(of -> of.componenteCurricularId != null
                            ? componentes.stream().filter(c -> c.id.equals(of.componenteCurricularId)).map(c -> c.descricao).findFirst().orElse(null)
                            : null)
                    .orElse(null);
        }
        String professorNome(Long professorId) {
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
                                                                            for (DiaAula d : dias) hydrate(d, turnos, tempos);
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
                refs != null ? refs.oferecimentoDescricao(e.oferecimentoComponenteCurricularId) : null);
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorProfessor (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:25, camada service)
    // Observacao: parametro professorId: era Professor (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true  and o.professor= ?1 and o.data  between ?2 and ?3  order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorProfessor(Professor professor, Date inicio, Date fim) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorProfessor(professor, inicio, fim);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorProfessor(Long professorId, Date inicio, Date fim) {
                return repository.buscarOcorrenciaPorProfessor(professorId, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatas (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:29, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3  order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorOferecimentoEDatas(OferecimentoComponenteCurricular oferecimentoComponenteCurricular, Date inicio, Date fim) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorOferecimentoEDatas(oferecimentoComponenteCurricular, inicio, fim);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatas(Long oferecimentoComponenteCurricularId, Date inicio, Date fim) {
                return repository.buscarOcorrenciaPorOferecimentoEDatas(oferecimentoComponenteCurricularId, inicio, fim).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoEDatasCoringa (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:33, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.oferecimentoComponenteCurricular= ?1 and o.data  between ?2 and ?3 and o.aulaCoringa = ?4 order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorOferecimentoEDatasCoringa(OferecimentoComponenteCurricular oferecimentoComponenteCurricular, Date inicio, Date fim, Boolean coringa) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorOferecimentoEDatasCoringa(oferecimentoComponenteCurricular, inicio, fim,coringa);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoEDatasCoringa(Long oferecimentoComponenteCurricularId, Date inicio, Date fim, Boolean coringa) {
                return repository.buscarOcorrenciaPorOferecimentoEDatasCoringa(oferecimentoComponenteCurricularId, inicio, fim, coringa).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaExtras (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:37, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = true and o.oferecimentoComponenteCurricular= ?1 order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaExtras(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaExtras(oferecimentoComponenteCurricular);
    //     }
    public Uni<List<Long>> buscarOcorrenciaExtras(Long oferecimentoComponenteCurricularId) {
                return repository.buscarOcorrenciaExtras(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaNormais (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:41, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where o.ativo = true and o.aulaCoringa = false and o.oferecimentoComponenteCurricular= ?1 order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaNormais(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaNormais(oferecimentoComponenteCurricular);
    //     }
    public Uni<List<Long>> buscarOcorrenciaNormais(Long oferecimentoComponenteCurricularId) {
                return repository.buscarOcorrenciaNormais(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:45, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and ofe = ?1 order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorOferecimento(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorOferecimento(oferecimentoComponenteCurricular);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
                return repository.buscarOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarTodasOcorrenciaPorOferecimento (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:49, camada service)
    // Observacao: parametro oferecimentoComponenteCurricularId: era OferecimentoComponenteCurricular (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe where ofe = ?1
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarTodasOcorrenciaPorOferecimento(OferecimentoComponenteCurricular oferecimentoComponenteCurricular) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarTodasOcorrenciaPorOferecimento(oferecimentoComponenteCurricular);
    //     }
    public Uni<List<Long>> buscarTodasOcorrenciaPorOferecimento(Long oferecimentoComponenteCurricularId) {
                return repository.buscarTodasOcorrenciaPorOferecimento(oferecimentoComponenteCurricularId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorDataUnidade (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:54, camada service)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.data  between Date(?1) and Date(?2)  and o.oferecimentoComponenteCurricular.unidade in (?3) order by o.oferecimentoComponenteCurricular.id
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorDataUnidade(Date date, List<Unidade> unidades) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorDataUnidade(date, unidades);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade(Date date, List<Long> unidades) {
                return repository.buscarOcorrenciaPorDataUnidade(date, unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorDataUnidade (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:58, camada service)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.data  between Date(?1) and Date(?2)  and o.oferecimentoComponenteCurricular.unidade in (?3) order by o.oferecimentoComponenteCurricular.id
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorDataUnidade(Date inicio, Date fim, List<Unidade> unidades) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorDataUnidade(inicio, fim, unidades);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorDataUnidade2(Date inicio, Date fim, List<Long> unidades) {
                return repository.buscarOcorrenciaPorDataUnidade(inicio, fim, unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de OcorrenciaComponenteCurricularService.buscarOcorrenciaPorOferecimentoComGrupo (src/main/java/br/com/sol7/olimpio/service/services/educacao/OcorrenciaComponenteCurricularService.java:63, camada service)
    // Observacao: parametro grupoId: era Grupo (referencia por id)
    // JPQL original: select o from OcorrenciaComponenteCurricular o inner join o.oferecimentoComponenteCurricular ofe  where o.ativo = true and o.aulaCoringa = false and ofe.grupo = ?1 order by o.data
    // Logica original (adaptar):
    // public List<OcorrenciaComponenteCurricular> buscarOcorrenciaPorOferecimentoComGrupo(Grupo grupo) {
    //         return getOcorrenciaComponenteCurricularRepository().buscarOcorrenciaPorOferecimentoComGrupo(grupo);
    //     }
    public Uni<List<Long>> buscarOcorrenciaPorOferecimentoComGrupo(Long grupoId) {
                return repository.buscarOcorrenciaPorOferecimentoComGrupo(grupoId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
