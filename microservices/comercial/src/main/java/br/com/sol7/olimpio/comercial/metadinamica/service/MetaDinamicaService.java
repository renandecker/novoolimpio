package br.com.sol7.olimpio.comercial.metadinamica;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import java.math.BigDecimal;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MetaDinamicaService {

    @Inject
    MetaDinamicaRepository repository;

    public Uni<List<MetaDinamicaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<MetaDinamicaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<MetaDinamicaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MetaDinamica not found"))
                .map(this::toResponse);
    }

    public Uni<MetaDinamicaResponse> create(MetaDinamicaRequest r) {
        var e = new MetaDinamica();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<MetaDinamicaResponse> update(Long id, MetaDinamicaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("MetaDinamica not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MetaDinamica not found")));
    }

    private void apply(MetaDinamica e, MetaDinamicaRequest r) {
        e.mes = r.mes();
        e.ano = r.ano();
        e.percSegunda = r.percSegunda();
        e.percTerca = r.percTerca();
        e.percQuarta = r.percQuarta();
        e.percQuinta = r.percQuinta();
        e.percSexta = r.percSexta();
        e.percSabado = r.percSabado();
        e.percDomingo = r.percDomingo();
        e.indicadorId = r.indicadorId();
        e.unidadeId = r.unidadeId();
        e.dataAtualizacao = r.dataAtualizacao();
    }

    private MetaDinamicaResponse toResponse(MetaDinamica e) {
        return new MetaDinamicaResponse(e.id, e.mes, e.ano, e.percSegunda, e.percTerca, e.percQuarta, e.percQuinta, e.percSexta, e.percSabado, e.percDomingo, e.indicadorId, e.unidadeId, e.dataAtualizacao);
    }

    public Uni<MetaDinamicaDetalhesResponse> buscarMovimentacoes(Long metaDinamicaId) {
        if (metaDinamicaId == null) {
            return Uni.createFrom().item(new MetaDinamicaDetalhesResponse(List.of(), List.of(), List.of()));
        }
        // Validação + Regra de Negócio: busca detalhes e componentes da meta dinâmica no banco relacional
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                Uni.combine().all().unis(
                        session.createNativeQuery("SELECT id FROM com_meta_dia_dinamica WHERE meta_dinamica_id = ?1").setParameter(1, metaDinamicaId).getResultList(),
                        session.createNativeQuery("SELECT id FROM com_meta_valor WHERE meta_dinamica_id = ?1").setParameter(1, metaDinamicaId).getResultList(),
                        session.createNativeQuery("SELECT id FROM com_meta_semana_dinamica WHERE meta_dinamica_id = ?1").setParameter(1, metaDinamicaId).getResultList()
                ).combinedWith((dias, valores, semanas) -> new MetaDinamicaDetalhesResponse(
                        ((List<?>) dias).stream().map(x -> ((Number) x).longValue()).toList(),
                        ((List<?>) valores).stream().map(x -> ((Number) x).longValue()).toList(),
                        ((List<?>) semanas).stream().map(x -> ((Number) x).longValue()).toList()
                ))
        );
    }

    public record MetaDinamicaDetalhesResponse(
        List<Long> metaDiaDinamicaIds,
        List<Long> metaValorIds,
        List<Long> metaSemanaDinamicaIds
    ) {}


    // Migrado de MetaDinamicaController.carregarDetalhesMetasDia (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:422, camada controller)
    // Observacao: parametro metaDinamicaId: era MetaDinamica (referencia por id)
    // Logica original (adaptar):
    // public List<MetaDiaDinamica> carregarDetalhesMetasDia(MetaDinamica metaDinamica) {
    //         return metaDiaDinamicaService.trazerDiasMeta(metaDinamica);
    //     }
    public Uni<List<Long>> carregarDetalhesMetasDia(Long metaDinamicaId) {
        // Obs: depende do modulo MetaDiaDinamica nao migrado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MetaDinamicaController.carregarDetalhesMetas (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:426, camada controller)
    // Observacao: parametro metaDinamicaId: era MetaDinamica (referencia por id)
    // Logica original (adaptar):
    // public List<MetaValor> carregarDetalhesMetas(MetaDinamica metaDinamica) {
    //         return metaValorService.metaValorComMetaDinamica(metaDinamica);
    //     }
    public Uni<List<Long>> carregarDetalhesMetas(Long metaDinamicaId) {
        // Obs: depende do modulo MetaValor nao migrado
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de MetaDinamicaController.carregarDetalhesMetaSemana (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:430, camada controller)
    // Observacao: parametro metaDinamicaId: era MetaDinamica (referencia por id)
    // Logica original (adaptar):
    // public List<MetaSemanaDinamica> carregarDetalhesMetaSemana(MetaDinamica metaDinamica) {
    //         return metaSemanaDinamicaService.metaSemanaDinamicaComMetaDinamica(metaDinamica);
    //     }
    public Uni<List<Long>> carregarDetalhesMetaSemana(Long metaDinamicaId) {
        // Obs: depende do modulo MetaSemanaDinamica nao migrado
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<Void> atualizarValorSemana(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_semana_dinamica SET valor = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaSemanaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValorSemanaInverso(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_semana_dinamica SET valor_inverso = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaSemanaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValorDia(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_dia_dinamica SET valor = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaDiaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValorDiaInverso(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_dia_dinamica SET valor_inverso = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaDiaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValorOutroDia(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_dia_dinamica SET valor_outro = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaDiaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValorOutraSemana(Long metaSemanaDinamicaId, Long metaDiaDinamicaId, BigDecimal valorAjuste) {
        if (metaSemanaDinamicaId == null || metaDiaDinamicaId == null || valorAjuste == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_semana_dinamica SET valor_outra = ?1 WHERE id = ?2")
                        .setParameter(1, valorAjuste).setParameter(2, metaSemanaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<Void> atualizarValoresDasSemanas(Long metaDinamicaId) {
        if (metaDinamicaId == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Parâmetros inválidos"));
        }
        return io.quarkus.hibernate.reactive.panache.Panache.getSession().chain(session ->
                session.createNativeQuery("UPDATE com_meta_semana_dinamica SET valor = 0 WHERE meta_dinamica_id = ?1")
                        .setParameter(1, metaDinamicaId).executeUpdate()
        ).replaceWithVoid();
    }

    public Uni<List<Long>> verificarMetaAnoMesUnidade(Integer mes, Integer ano, Long indicadorId, Long unidadeId) {
        return repository.find("mes = ?1 and ano = ?2 and indicadorId = ?3 and unidadeId = ?4", mes, ano, indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> verificarMetaAnoUnidade(Integer ano, Long indicadorId, Long unidadeId) {
        return repository.find("ano = ?1 and indicadorId = ?2 and unidadeId = ?3", ano, indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> verificarMetaUnidade(Long indicadorId, Long unidadeId) {
        return repository.find("indicadorId = ?2 and unidadeId = ?3", indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}
