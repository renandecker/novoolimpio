package br.com.sol7.olimpio.comercial.acao;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class AcaoService {

    @Inject
    AcaoRepository repository;

    public Uni<List<AcaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<AcaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<AcaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Acao not found"))
                .map(this::toResponse);
    }

    public Uni<AcaoResponse> create(AcaoRequest r) {
        validate(r);
        var e = new Acao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<AcaoResponse> update(Long id, AcaoRequest r) {
        validate(r);
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Acao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    private void validate(AcaoRequest r) {
        if (r.descricao() == null || r.descricao().trim().length() < 3 || r.descricao().trim().length() > 255) {
            throw new jakarta.ws.rs.BadRequestException("Descrição deve ter entre 3 e 255 caracteres");
        }
        if (r.responsavelId() == null) throw new jakarta.ws.rs.BadRequestException("Contratante (responsável) é obrigatório");
        if (r.tipoAcaoId() == null) throw new jakarta.ws.rs.BadRequestException("TipoAção é obrigatório");
        if (r.dataInicial() == null || r.dataFinal() == null || r.dataFinalCaptacao() == null || r.dataColeta() == null) {
            throw new jakarta.ws.rs.BadRequestException("Datas são obrigatórias");
        }
        if (r.meta() == null) throw new jakarta.ws.rs.BadRequestException("Meta é obrigatória");
        if (r.custo() == null) throw new jakarta.ws.rs.BadRequestException("Custo é obrigatório");
        if (r.dataFinal().before(r.dataInicial())) {
            throw new jakarta.ws.rs.BadRequestException("Data Invalida! Data inicial maior que data final!");
        }
        if (r.dataFinalCaptacao().before(r.dataInicial())) {
            throw new jakarta.ws.rs.BadRequestException("A data final de captação não pode ser anterior a data inicial");
        }
        if (r.dataFinal().before(r.dataFinalCaptacao())) {
            throw new jakarta.ws.rs.BadRequestException("A data final de Cadastro não pode ser anterior a data final de Captação");
        }
        if (r.dataColeta().before(r.dataInicial()) || r.dataColeta().after(r.dataFinal())) {
            throw new jakarta.ws.rs.BadRequestException("A data da coleta tem que estar entre a data inicial e data Final");
        }
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Acao not found")));
    }

    private void apply(Acao e, AcaoRequest r) {
        e.descricao = r.descricao();
        e.dataColeta = r.dataColeta();
        e.tipoAcaoId = r.tipoAcaoId();
        e.dataInicial = r.dataInicial();
        e.dataFinalCaptacao = r.dataFinalCaptacao();
        e.dataFinal = r.dataFinal();
        e.meta = r.meta();
        e.custo = r.custo();
        e.responsavelId = r.responsavelId();
    }

    private AcaoResponse toResponse(Acao e) {
        return new AcaoResponse(e.id, e.descricao, e.dataColeta, e.tipoAcaoId, e.dataInicial, e.dataFinalCaptacao, e.dataFinal, e.meta, e.custo, e.responsavelId);
    }

    public Uni<List<Long>> autoCompleteEmAberto(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteEmAberto(query.toLowerCase().trim(), unidadesIds).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query).map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarAcaoComCampos(Integer idAcao) {
        return repository.buscarAcaoComCampos(idAcao).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<Long> buscarAcaoComUnidades(Long acaoId) {
        return repository.buscarAcaoComUnidades(acaoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> autoCompleteEmAberto2(String query, List<Long> unidades) {
        return repository.autoCompleteEmAberto(query, unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

}
