package br.com.sol7.olimpio.educacao.valorcurso;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ValorCursoService {

    @Inject ValorCursoRepository repository;

    public Uni<List<ValorCursoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ValorCursoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ValorCursoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorCurso not found"))
                .map(this::toResponse);
    }

    public Uni<ValorCursoResponse> create(ValorCursoRequest r) {
        var e = new ValorCurso();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ValorCursoResponse> update(Long id, ValorCursoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ValorCurso not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ValorCurso not found")));
    }

    private void apply(ValorCurso e, ValorCursoRequest r) { e.data = r.data(); e.diasSpc = r.diasSpc(); e.diasToleranciaMulta = r.diasToleranciaMulta(); e.curriculoId = r.curriculoId(); e.valor = r.valor(); e.juros = r.juros(); e.multa = r.multa(); e.descontoCarne = r.descontoCarne(); e.valorDescontoAluno = r.valorDescontoAluno(); e.cobraRematricula = r.cobraRematricula(); e.valorHora = r.valorHora(); e.percDescJurMul = r.percDescJurMul(); e.percDescValor = r.percDescValor(); e.percValorMinEntrada = r.percValorMinEntrada(); e.prazoParcEntrada = r.prazoParcEntrada(); e.prazoParcSegunda = r.prazoParcSegunda(); e.qtdePacelas = r.qtdePacelas(); }

    private ValorCursoResponse toResponse(ValorCurso e) {
        return new ValorCursoResponse(e.id, e.data, e.diasSpc, e.diasToleranciaMulta, e.curriculoId, e.valor, e.juros, e.multa, e.descontoCarne, e.valorDescontoAluno, e.cobraRematricula, e.valorHora, e.percDescJurMul, e.percDescValor, e.percValorMinEntrada, e.prazoParcEntrada, e.prazoParcSegunda, e.qtdePacelas);
    }


    // Migrado de ValorCursoController.autoCompleteUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ValorCursoController.java:109, camada controller)
    // Logica original (adaptar):
    // public List<Unidade> autoCompleteUnidade(String query) {
    //         if (!query.equals("")) {
    //             return unidadeService.autoCompleteComUnidades(query, unidadesUsuario);
    //         } else {
    //             return unidadeService.autoCompleteComCurriculoSemBusca(unidadesUsuario);
    //         }
    //     }
    public Uni<List<Long>> autoCompleteUnidade(String query) {
        // Obs: depende do microservico basico (Unidade e unidades disponiveis do usuario logado)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de ValorCursoController.autoCompleteCurriculo (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/ValorCursoController.java:509, camada controller)
    // Logica original (adaptar):
    // public List<Curriculo> autoCompleteCurriculo(String query) {
    //         if (!query.equals("")) {
    //             return curriculoService.autoCompleteComUnidades(query, unidadesUsuario);
    //         }
    //         return curriculoService.autoCompleteComUnidades(unidadesUsuario);
    //     }
    public Uni<List<Long>> autoCompleteCurriculo(String query) {
        // Obs: depende do estado da tela (unidades disponiveis do usuario logado, curriculoService)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de ValorCursoService.buscarValoresComDesconto (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:23, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.desconto  d where v = ?1 order by d.descricao
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComDesconto(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComDesconto(valorCurso);
    //     }
    public Uni<Long> buscarValoresComDesconto(Long valorCursoId) {
                return repository.buscarValoresComDesconto(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarexistenciaValorCursoContrato (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:27, camada service)
    // Observacao: parametro valorCursoId: era ValorCurso (referencia por id)
    // Logica original (adaptar):
    // public boolean buscarexistenciaValorCursoContrato(ValorCurso valorCurso) {
    //         if (!ObjectUtil.nullOrEmpty(getValorCursoRepository().buscarexistenciaValorCursoContrato(valorCurso, new PageRequest(0, 1)).getContent())) {
    //             return true;
    //         }
    //         return false;
    //     }
    public Uni<Boolean> buscarexistenciaValorCursoContrato(Long valorCursoId) {
        return repository.buscarexistenciaValorCursoContrato(valorCursoId).map(list -> !list.isEmpty());
    }


    // Migrado de ValorCursoService.buscarValoresComTaxas (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:34, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.taxas t where v = ?1  order by t.descricao
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComTaxas(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComTaxas(valorCurso);
    //     }
    public Uni<Long> buscarValoresComTaxas(Long valorCursoId) {
                return repository.buscarValoresComTaxas(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComFormasPagamento (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:38, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.formasPagamento f where v = ?1 order by f.vezes
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComFormasPagamento(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComFormaPagamento(valorCurso);
    //     }
    public Uni<Long> buscarValoresComFormasPagamento(Long valorCursoId) {
                return repository.buscarValoresComFormaPagamento(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComDescontoAtivos (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:42, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.desconto d where v = ?1 and d.ativo = true order by d.descricao
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComDescontoAtivos(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComDescontoAtivos(valorCurso);
    //     }
    public Uni<Long> buscarValoresComDescontoAtivos(Long valorCursoId) {
                return repository.buscarValoresComDescontoAtivos(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComTaxasAtivos (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:46, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.taxas t where v = ?1 and t.ativo = true order by t.descricao
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComTaxasAtivos(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComTaxasAtivos(valorCurso);
    //     }
    public Uni<Long> buscarValoresComTaxasAtivos(Long valorCursoId) {
                return repository.buscarValoresComTaxasAtivos(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComFormasPagamentoAtivos (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:50, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.formasPagamento f where v = ?1 and f.ativo = true order by f.vezes
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComFormasPagamentoAtivos(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComFormaPagamentoAtivos(valorCurso);
    //     }
    public Uni<Long> buscarValoresComFormasPagamentoAtivos(Long valorCursoId) {
                return repository.buscarValoresComFormaPagamentoAtivos(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComRetencao (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:54, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.retencoes where v = ?1
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComRetencao(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComRetencao(valorCurso);
    //     }
    public Uni<Long> buscarValoresComRetencao(Long valorCursoId) {
                return repository.buscarValoresComRetencao(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValoresComUnidades (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:58, camada service)
    // Observacao: retorno: era ValorCurso (referencia por id); parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from ValorCurso v left join fetch v.unidades u where u.ativo = true and v = ?1
    // Logica original (adaptar):
    // public ValorCurso buscarValoresComUnidades(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValoresComUnidades(valorCurso);
    //     }
    public Uni<Long> buscarValoresComUnidades(Long valorCursoId) {
                return repository.buscarValoresComUnidades(valorCursoId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ValorCursoService.buscarValorCursoContrato (src/main/java/br/com/sol7/olimpio/service/services/educacao/ValorCursoService.java:62, camada service)
    // Observacao: parametro valorCursoId: era ValorCurso (referencia por id)
    // JPQL original: select v from Contrato c inner join c.valorCurso v where v = ?1
    // Logica original (adaptar):
    // public List<ValorCurso> buscarValorCursoContrato(ValorCurso valorCurso) {
    //         return getValorCursoRepository().buscarValorCursoContrato(valorCurso);
    //     }
    public Uni<List<Long>> buscarValorCursoContrato(Long valorCursoId) {
                return repository.buscarValorCursoContrato(valorCursoId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
