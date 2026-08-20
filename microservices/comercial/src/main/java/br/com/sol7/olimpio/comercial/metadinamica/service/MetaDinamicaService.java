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


    // Migrado de MetaDinamicaController.buscarMovimentacoes (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:153, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarMovimentacoes(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             MetaDinamica mmdd = (MetaDinamica) event.getData();
    //             listaMetaDiaDinamicas = metaDiaDinamicaService.trazerDiasMeta(mmdd);
    //             listaMetaValors = metaValorService.metaValorComMetaDinamica(mmdd);
    //             listaMetaSemanaDinamicas = metaSemanaDinamicaService.metaSemanaDinamicaComMetaDinamica(mmdd);
    //         }
    //     }
    public Uni<Void> buscarMovimentacoes(String event) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaValor/MetaSemanaDinamica nao migrados
        return Uni.createFrom().voidItem();
    }


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


    // Migrado de MetaDinamicaController.atualizarValorSemana (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1099, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorSemana(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteSemana().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //             qtde = ca ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorSemana(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValorSemanaInverso (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1173, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorSemanaInverso(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteSemanaInverso().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //         ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorSemanaInverso(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValorDia (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1248, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorDia(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteDia().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //             qtde = calculaD ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorDia(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValorDiaInverso (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1322, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorDiaInverso(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteDiaInverso().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //             q ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorDiaInverso(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValorOutroDia (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1397, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorOutroDia(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteOutroDia().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //             qtde  ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorOutroDia(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValorOutraSemana (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1473, camada controller)
    // Observacao: parametro metaDinamicaSemanaWapper: era MetaDinamicaSemanaWapper no legado; parametro metaDiaDinamicaWapper: era MetaDiaDinamicaWapper no legado
    // Logica original (adaptar):
    // public void atualizarValorOutraSemana(MetaDinamicaSemanaWapper metaDinamicaSemanaWapper, MetaDiaDinamicaWapper metaDiaDinamicaWapper) {
    //         BigDecimal valorSeparado = new BigDecimal(0);
    //         BigDecimal valorRestante = new BigDecimal(0);
    //         int qtde = 0;
    //         boolean adicionando = false;
    //         if (metaDiaDinamicaWapper.getValorAjusteOutraSemana().floatValue() == metaDiaDinamicaWapper.getMetaDiaDinamica().getValor().floatValue()) {
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "aviso", "valor_igual", null, getMetaDinamica().getClass().getSimpleName());
    //             return;
    //         }
    //         if (!metaDinamica.getIndicador().isSemana()) {
    //             ...
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValorOutraSemana(String metaDinamicaSemanaWapper, String metaDiaDinamicaWapper) {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica/MetaValor nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaController.atualizarValoresDasSemanas (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/MetaDinamicaController.java:1550, camada controller)
    // Logica original (adaptar):
    // public void atualizarValoresDasSemanas() {
    //         for (MetaDinamicaMetaWapper mdm : metaDinamicaWapper.getMetaDinamicaMetaWappers()) {
    //             for (MetaDinamicaSemanaWapper mds : mdm.getMetaDinamicaSemanaWappers()) {
    //                 for (MetaDiaDinamicaWapper mdd : mds.getMetaDiaDinamicaWappers()) {
    //                     if (!ObjectUtil.nullOrEmpty(mdd.getMetaDiaDinamica().getData())) {
    //                         mds.getMetaSemanaDinamica().setValorSemana(new BigDecimal(0));
    //                         mds.getMetaSemanaDinamica().setPercentualSemana(new BigDecimal(0));
    //                     }
    //                 }
    //             }
    //         }
    // 
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarValoresDasSemanas() {
        // Obs: metodo de UI (JSF); depende dos modulos MetaDiaDinamica/MetaSemanaDinamica nao migrados
        return Uni.createFrom().voidItem();
    }


    // Migrado de MetaDinamicaService.verificarMetaAnoMesUnidade (src/main/java/br/com/sol7/olimpio/service/services/comercial/MetaDinamicaService.java:29, camada service)
    // Observacao: parametro indicadorId: era Indicador (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<MetaDinamica> verificarMetaAnoMesUnidade(Integer mes, Integer ano, Indicador indicador, Unidade unidade) {
    //         return getMetaDinamicaRepository().verificarMetaAnoMesUnidade(mes, ano, indicador, unidade);
    //     }
    public Uni<List<Long>> verificarMetaAnoMesUnidade(Integer mes, Integer ano, Long indicadorId, Long unidadeId) {
        return repository.find("mes = ?1 and ano = ?2 and indicadorId = ?3 and unidadeId = ?4", mes, ano, indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaDinamicaService.verificarMetaAnoUnidade (src/main/java/br/com/sol7/olimpio/service/services/comercial/MetaDinamicaService.java:33, camada service)
    // Observacao: parametro indicadorId: era Indicador (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<MetaDinamica> verificarMetaAnoUnidade(Integer ano, Indicador indicador, Unidade unidade) {
    //         return getMetaDinamicaRepository().verificarMetaAnoUnidade(ano, indicador, unidade);
    //     }
    public Uni<List<Long>> verificarMetaAnoUnidade(Integer ano, Long indicadorId, Long unidadeId) {
        return repository.find("ano = ?1 and indicadorId = ?2 and unidadeId = ?3", ano, indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de MetaDinamicaService.verificarMetaUnidade (src/main/java/br/com/sol7/olimpio/service/services/comercial/MetaDinamicaService.java:37, camada service)
    // Observacao: parametro indicadorId: era Indicador (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<MetaDinamica> verificarMetaUnidade(Indicador indicador, Unidade unidade) {
    //         return getMetaDinamicaRepository().verificarMetaUnidade(indicador, unidade);
    //     }
    public Uni<List<Long>> verificarMetaUnidade(Long indicadorId, Long unidadeId) {
        return repository.find("indicadorId = ?2 and unidadeId = ?3", indicadorId, unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}
