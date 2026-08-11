package br.com.sol7.olimpio.educacao.oferecimentocurso;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.educacao.curriculo.Curriculo;
import br.com.sol7.olimpio.educacao.curriculo.CurriculoRepository;
import br.com.sol7.olimpio.educacao.grupo.Grupo;
import br.com.sol7.olimpio.educacao.grupo.GrupoRepository;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularResponse;
import br.com.sol7.olimpio.educacao.oferecimentocomponentecurricular.OferecimentoComponenteCurricularService;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class OferecimentoCursoService {

    @Inject GrupoRepository grupoRepository;
    @Inject CurriculoRepository curriculoRepository;
    @Inject OferecimentoComponenteCurricularService oferecimentoService;

    public Uni<List<OferecimentoCursoResponse>> list() {
        return withRefs(grupoRepository.listAll());
    }

    public Uni<PagedResponse<OferecimentoCursoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        Uni<List<Grupo>> items = grupoRepository.findAll(io.quarkus.panache.common.Sort.by("id").descending())
                .page(io.quarkus.panache.common.Page.of(p, s)).list();
        return withRefs(items)
                .onItem().transformToUni(res -> grupoRepository.count()
                        .map(count -> new PagedResponse<>(res, count, p, s)));
    }

    public Uni<OferecimentoCursoResponse> find(Long id) {
        return grupoRepository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OferecimentoCurso (Grupo) not found"))
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<OferecimentoCursoResponse> create(OferecimentoCursoRequest r) {
        var e = new Grupo();
        e.unidadeId = r.unidadeId();
        e.curriculoId = r.curriculoId();
        e.nome = r.nome();
        return grupoRepository.persist(e)
                .flatMap(x -> loadRefs().map(refs -> toResponse(x, refs)));
    }

    public Uni<OferecimentoCursoResponse> update(Long id, OferecimentoCursoRequest r) {
        return grupoRepository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("OferecimentoCurso (Grupo) not found"))
                .invoke(e -> {
                    e.unidadeId = r.unidadeId();
                    e.curriculoId = r.curriculoId();
                    e.nome = r.nome();
                })
                .flatMap(e -> loadRefs().map(refs -> toResponse(e, refs)));
    }

    public Uni<Void> delete(Long id) {
        return grupoRepository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("OferecimentoCurso (Grupo) not found")));
    }

    // Grupo + turmas (OferecimentoComponenteCurricular) - detalhe do "Oferecimento Curso".
    public Uni<OferecimentoCursoDetalheResponse> detalhe(Long id) {
        return find(id).flatMap(curso -> listarOferecimentos(id)
                .map(ofs -> new OferecimentoCursoDetalheResponse(curso, ofs)));
    }

    // Migrado de GrupoRepository.listarOferecimentos (legado) - turmas do grupo.
    public Uni<List<OferecimentoComponenteCurricularResponse>> listarOferecimentos(Long grupoId) {
        return oferecimentoService.listarOferecimentosPorGrupo(grupoId);
    }

    // Migrado de OferecimentoCursoController.gerarAulaCursoSequencia + gerarAula (legado L537-760):
    // gera (e persiste) as OcorrenciaComponenteCurricular de todas as turmas do grupo a partir dos DiasAula.
    public Uni<Integer> gerarAulaCursoSequencia(GerarAulaCursoSequenciaRequest r) {
        if (r.grupoId() == null || r.diasAulaSelecionado() == null || r.diasAulaSelecionado().isEmpty()) {
            return Uni.createFrom().item(0);
        }
        return listarOferecimentos(r.grupoId())
                .flatMap(lista -> oferecimentoService.gerarAulaBatch(
                        lista.stream().map(OferecimentoComponenteCurricularResponse::id).toList(),
                        r.dataInicio(), r.diasAulaSelecionado(), r.salaId(), r.professorId()));
    }

    // Migrado de OferecimentoCursoController.buscarTurnoEducacao (legado, L196) -
    // "descricao: HH:mm as HH:mm" do turno da ocorrencia.
    public Uni<String> buscarTurnoEducacao(Long ocorrenciaComponenteCurricularId) {
        return oferecimentoService.buscarTurnoEducacao(ocorrenciaComponenteCurricularId);
    }

    public Uni<List<Long>> autoComplete(String query) {
        if (query == null || query.isEmpty()) {
            return grupoRepository.findAll(io.quarkus.panache.common.Sort.by("nome"))
                    .page(io.quarkus.panache.common.Page.of(0, 10)).list()
                    .map(list -> list.stream().map(g -> g.id).toList());
        }
        return grupoRepository.autoComplete(query.toLowerCase())
                .map(list -> list.stream().map(g -> g.id).toList());
    }

    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        // Obs: no legado depende da Unidade (filter da tela) - cross-service; retorna por descricao.
        if (query == null || query.isEmpty()) {
            return curriculoRepository.findAll(io.quarkus.panache.common.Sort.by("descricao"))
                    .page(io.quarkus.panache.common.Page.of(0, 10)).list()
                    .map(list -> list.stream().map(c -> c.id).toList());
        }
        return curriculoRepository.find("lower(descricao) like '%' || ?1 || '%' order by descricao", query.toLowerCase())
                .page(io.quarkus.panache.common.Page.of(0, 10)).list()
                .map(list -> list.stream().map(c -> c.id).toList());
    }

    // ----- resolucao de descricoes (refs locais, sem N+1) -----

    private record Refs(List<Curriculo> curriculos) {
        Curriculo curriculo(Long id) {
            if (id == null) return null;
            return curriculos.stream().filter(x -> x.id.equals(id)).findFirst().orElse(null);
        }
    }

    private Uni<Refs> loadRefs() {
        return curriculoRepository.listAll().map(Refs::new);
    }

    private Uni<List<OferecimentoCursoResponse>> withRefs(Uni<List<Grupo>> items) {
        return loadRefs().onItem().transformToUni(refs -> items.map(list -> list.stream().map(e -> toResponse(e, refs)).toList()));
    }

    private OferecimentoCursoResponse toResponse(Grupo e, Refs refs) {
        return new OferecimentoCursoResponse(e.id, e.nome, e.unidadeId, e.curriculoId,
                null, // unidade_descricao - cross-service (basico)
                refs != null && e.curriculoId != null ? refs.curriculo(e.curriculoId).descricao : null);
    }
}
