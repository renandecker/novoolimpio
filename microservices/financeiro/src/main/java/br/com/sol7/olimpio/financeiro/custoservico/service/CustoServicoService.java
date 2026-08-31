package br.com.sol7.olimpio.financeiro.custoservico;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CustoServicoService {

    @Inject
    CustoServicoRepository repository;

    public Uni<List<CustoServicoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CustoServicoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CustoServicoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CustoServico not found"))
                .map(this::toResponse);
    }

    public Uni<CustoServicoResponse> create(CustoServicoRequest r) {
        var e = new CustoServico();
        apply(e, r);
        e.dataAlteracao = new Date();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CustoServicoResponse> update(Long id, CustoServicoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CustoServico not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("CustoServico not found")));
    }

    private void apply(CustoServico e, CustoServicoRequest r) {
        e.valorEmail = r.valorEmail();
        e.valorSms = r.valorSms();
        e.valorLigacao = r.valorLigacao();
        e.dataAlteracao = r.dataAlteracao();
        e.tipoSms = r.tipoSms();
        e.tipoLigacao = r.tipoLigacao();
        e.tipoEmail = r.tipoEmail();
    }

    private CustoServicoResponse toResponse(CustoServico e) {
        return new CustoServicoResponse(e.id, e.valorEmail, e.valorSms, e.valorLigacao, e.dataAlteracao, e.tipoSms, e.tipoLigacao, e.tipoEmail);
    }


    // Migrado de CustoServicoController.buscarMovimentacoes (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CustoServicoController.java:102, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarMovimentacoes(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             try {
    //                 listaDetalheUnidade = custoServicoService.buscarCustoServicoComUnidade((CustoServico) event.getData()).getUnidades();
    //             } catch (Exception e) {
    //                 listaDetalheUnidade = new ArrayList<>();
    //             }
    //         }
    //     }
    public Uni<Void> buscarMovimentacoes(String event) {
        // Obs: metodo de UI no legado (seta listaDetalheUnidade a partir de buscarCustoServicoComUnidade); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }


    // Migrado de CustoServicoService.buscarCustoServicoComUnidade (src/main/java/br/com/sol7/olimpio/service/services/financeiro/CustoServicoService.java:24, camada service)
    // Observacao: retorno: era CustoServico (referencia por id); parametro custoServicoId: era CustoServico (referencia por id)
    // JPQL original: select c from CustoServico c left join fetch c.unidades where c = ?1
    // Logica original (adaptar):
    // public CustoServico buscarCustoServicoComUnidade(CustoServico custoServico) {
    //         return getCustoServicoRepository().buscarCustoServicoComUnidade(custoServico);
    //     }
    public Uni<Long> buscarCustoServicoComUnidade(Long custoServicoId) {
        return repository.buscarCustoServicoComUnidade(custoServicoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de CustoServicoService.buscarCustoServicoPorUnidade (src/main/java/br/com/sol7/olimpio/service/services/financeiro/CustoServicoService.java:28, camada service)
    // Observacao: retorno: era CustoServico (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public CustoServico buscarCustoServicoPorUnidade(Unidade unidade) {
    //         List<CustoServico> custoServicos = getCustoServicoRepository().buscarCustoServicoPorUnidade(unidade);
    //         if (!ObjectUtil.nullOrEmpty(custoServicos)) {
    //             return custoServicos.get(0);
    //         }
    //         return null;
    //     }
    public Uni<Long> buscarCustoServicoPorUnidade(Long unidadeId) {
        return repository.buscarCustoServicoPorUnidade(unidadeId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

}
