package br.com.sol7.olimpio.comercial.prospectoradar;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import io.smallrye.mutiny.Uni;

@ApplicationScoped
@WithTransaction
public class ProspectoRadarService {
    @Inject
    ProspectoRadarRepository repository;

    public Uni<List<ProspectoRadarResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ProspectoRadarResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<ProspectoRadarResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoRadar not found")).map(this::toResponse);
    }

    public Uni<ProspectoRadarResponse> create(ProspectoRadarRequest r) {
        var e = new ProspectoRadar();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ProspectoRadarResponse> update(Long id, ProspectoRadarRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("ProspectoRadar not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("ProspectoRadar not found")));
    }

    private void apply(ProspectoRadar e, ProspectoRadarRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private ProspectoRadarResponse toResponse(ProspectoRadar e) {
        return new ProspectoRadarResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de ProspectoRadarController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:85, camada controller)
    // Observacao: parametro entityId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Prospecto entity) {
    //         ProspectoUtil.carregarProspectoParaVisualizacao(prospectoService.buscaProspectoComCampos(entity.getId()), getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao(Long entityId) {
        // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ProspectoRadarController.carregarFormularioDaAcaoComLlnk (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:101, camada controller)
    // Observacao: parametro acaoId: era Acao (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public String carregarFormularioDaAcaoComLlnk(Acao acao, Unidade unidade) {
    //         acaoSelecionada = acao;
    //         unidadeSelecionada = unidade;
    //         return getRadarPath();
    //     }
    public Uni<String> carregarFormularioDaAcaoComLlnk(Long acaoId, Long unidadeId) {
        // Obs: metodo de UI (JSF) de navegacao; sem logica de dados portaavel
        return Uni.createFrom().item(null);
    }


    // Migrado de ProspectoRadarController.carregarFormularioDaAcao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:107, camada controller)
    // Logica original (adaptar):
    // public void carregarFormularioDaAcao() {
    //         if (ObjectUtil.nullOrEmpty(acaoSelecionada, unidadeSelecionada)) {
    //             MessageUtil.sendMessageToUser(MessageUtilType.ERROR, "global.error", "validation", "Por favor selecione uma Unidade e uma Ação.");
    //             return;
    //         }
    //         setDynaFormModelAtual(new DynaFormModel());
    // 
    //         Acao entidadeCarregada = acaoService.buscarAcaoComCampos(acaoSelecionada.getId());
    // 
    //         qtdeCamposBusca = 0;
    //         for (Campo c : entidadeCarregada.getCampos()) {
    //             if (c.getFlagBanco() || c.getFlagNome()) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> carregarFormularioDaAcao() {
        // Obs: metodo de UI (JSF); depende do modulo Campo/Prospecto nao migrado
        return Uni.createFrom().voidItem();
    }


    // Migrado de ProspectoRadarController.atualizarRadar (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:128, camada controller)
    // Observacao: parametro pro: era ProspectoHelper no legado
    // Logica original (adaptar):
    // public void atualizarRadar(ProspectoHelper pro) {
    //         try {
    //             ultimoCampoDigitado = pro;
    //             PropertyFilter propertyFilterTemp;
    //             // descobrir se o campo ja esta na lista
    //             int index = camposDigitados.indexOf(ultimoCampoDigitado.getPropertyFilter());
    //             Object valor = ultimoCampoDigitado.getPropertyFilter().getValue();
    // 
    //             if (index == -1) { // não existe
    //                 if (!ObjectUtil.nullOrEmpty(valor)) { // valor esta valido
    //                     camposDigitados.add(ultimoCampoDigitado.getPropertyFilter());
    //                 }
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarRadar(String pro) {
        // Obs: metodo de UI (JSF), sem logica de dados portaavel
        return Uni.createFrom().voidItem();
    }

}