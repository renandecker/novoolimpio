package br.com.sol7.olimpio.educacao.criterio;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CriterioService {

    @Inject
    CriterioRepository repository;

    public Uni<List<CriterioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CriterioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CriterioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Criterio not found"))
                .map(this::toResponse);
    }

    public Uni<CriterioResponse> create(CriterioRequest r) {
        validar(r);
        // Regra do legado (corrigeCriterioDuplicadoPorunidadeCurso): um criterio por (curso, unidade)
        return repository.buscarCriterio(r.curriculoId(), r.unidadeId())
                .chain(existentes -> !existentes.isEmpty()
                        ? Uni.createFrom().failure(new BadRequestException("já existe um critério para este curso e unidade"))
                        : persistNovo(r));
    }

    private Uni<CriterioResponse> persistNovo(CriterioRequest r) {
        var e = new Criterio();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CriterioResponse> update(Long id, CriterioRequest r) {
        validar(r);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Criterio not found"))
                .chain(e -> repository.buscarCriterio(r.curriculoId(), r.unidadeId())
                        .chain(outros -> outros.stream().anyMatch(c -> !c.id.equals(e.id))
                                ? Uni.createFrom().failure(new BadRequestException("já existe um critério para este curso e unidade"))
                                : Uni.createFrom().item(e)))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Criterio not found")));
    }

    // Regras/validações do cadastro no legado (CriterioController.salvar, extracted_aceso):
    // 1) curso obrigatório ("selecione_um_curso"); 2) unidade obrigatória ("selecione_um_unidade");
    // 3) dataInicio não pode ser posterior a dataFim ("global.insert.error.retroativo");
    // 4) quantidades numéricas não negativas (keyFilter num na tela)
    private void validar(CriterioRequest r) {
        if (r.curriculoId() == null) {
            throw new BadRequestException("selecione um curso");
        }
        if (r.unidadeId() == null) {
            throw new BadRequestException("selecione uma unidade");
        }
        if (r.dataInicio() != null && r.dataFim() != null && r.dataInicio().after(r.dataFim())) {
            throw new BadRequestException("a data de início não pode ser posterior à data de fim");
        }
        if (r.periodo() < 0 || r.qtdTurmaAbertas() < 0 || r.qtdAulasToleraciaMatricula() < 0) {
            throw new BadRequestException("quantidades não podem ser negativas");
        }
    }

    // Legado: TipoMatricula (LIVRE, GRUPO); ao salvar, o default é LIVRE
    private String normalizarTipoMatricula(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return "LIVRE";
        }
        var t = tipo.trim().toUpperCase();
        if (!t.equals("LIVRE") && !t.equals("GRUPO")) {
            throw new BadRequestException("tipoMatricula deve ser LIVRE ou GRUPO");
        }
        return t;
    }

    private void apply(Criterio e, CriterioRequest r) {
        e.unidadeId = r.unidadeId();
        e.curriculoId = r.curriculoId();
        e.mes = r.mes();
        e.periodo = r.periodo();
        e.qtdTurmaAbertas = r.qtdTurmaAbertas();
        e.qtdAulasToleraciaMatricula = r.qtdAulasToleraciaMatricula();
        e.dataInicio = r.dataInicio();
        e.dataFim = r.dataFim();
        e.tipoMatricula = normalizarTipoMatricula(r.tipoMatricula());
    }

    private CriterioResponse toResponse(Criterio e) {
        return new CriterioResponse(e.id, e.unidadeId, e.curriculoId, e.mes, e.periodo, e.qtdTurmaAbertas, e.qtdAulasToleraciaMatricula, e.dataInicio, e.dataFim, e.tipoMatricula);
    }


    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return repository.find("lower(nome) like ?1", "%" + q + "%").list()
                .map(list -> list.stream().map(x -> x.id).toList());
    }


    public Uni<List<Long>> autoComplete(String query) {
        String q = query == null ? "" : query.toLowerCase();
        return repository.find("lower(nome) like ?1", "%" + q + "%").list()
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarCriterioComDiasSemana(Long curriculoId, Long unidadeId) {
        return repository.buscarCriterioComDiasSemana(curriculoId, unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarCriterioComTurno(Long curriculoId, Long unidadeId) {
        return repository.buscarCriterioComTurno(curriculoId, unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarCriterio(Long curriculoId, Long unidadeId) {
        return repository.find("curriculoId =?1 and unidadeId = ?2 order by id desc", curriculoId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

