package br.com.sol7.olimpio.financeiro.ligacaocobranca;

import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@io.quarkus.hibernate.reactive.panache.common.WithTransaction
public class LigacaoCobrancaService {

    @Inject
    LigacaoCobrancaRepository repository;

    public Uni<List<LigacaoCobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<LigacaoCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<LigacaoCobrancaResponse>> pagedPorEtapa(Long etapasCobrancaId, int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.find("etapasCobrancaId", etapasCobrancaId)
                .page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("etapasCobrancaId", etapasCobrancaId)
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<LigacaoCobrancaResponse>> pagedSemEtapa(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.find("etapasCobrancaId is null")
                .page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count("etapasCobrancaId is null")
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<LigacaoCobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("LigacaoCobranca not found"))
                .map(this::toResponse);
    }

    public Uni<LigacaoCobrancaResponse> create(LigacaoCobrancaRequest r) {
        var e = new LigacaoCobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<LigacaoCobrancaResponse> update(Long id, LigacaoCobrancaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("LigacaoCobranca not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("LigacaoCobranca not found")));
    }

    private void apply(LigacaoCobranca e, LigacaoCobrancaRequest r) {
        e.usuarioId = r.usuarioId();
        e.contratoId = r.contratoId();
        e.dataInicial = r.dataInicial();
        e.dataFinal = r.dataFinal();
        e.resultadoCobrancaId = r.resultadoCobrancaId();
        e.telefone = r.telefone();
        e.observacao = r.observacao();
        e.compromissoId = r.compromissoId();
        e.ativo = r.ativo();
        e.etapasCobrancaId = r.etapasCobrancaId();
        e.qtdeParcela = r.qtdeParcela();
        e.valor = r.valor();
    }

    private LigacaoCobrancaResponse toResponse(LigacaoCobranca e) {
        return new LigacaoCobrancaResponse(e.id, e.usuarioId, e.contratoId, e.dataInicial, e.dataFinal, e.resultadoCobrancaId, e.telefone, e.observacao, e.compromissoId, e.ativo, e.etapasCobrancaId, e.qtdeParcela, e.valor);
    }

    // Retorna IDs de pessoas/contratos que foram cobradas em uma data
    public Uni<List<Long>> buscarPessoasCobradas(Long unidadeId, Date data) {
        return repository.buscarPessoasCobradas(unidadeId, data);
    }

    // Conta ligações realizadas para uma pessoa em uma data
    public Uni<Long> contarLigacoesRealizadasPessoa(Long unidadeId, Date data, Long pessoaId) {
        return repository.contarLigacoesRealizadasPessoa(unidadeId, data, pessoaId);
    }
}
