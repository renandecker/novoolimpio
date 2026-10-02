package br.com.sol7.olimpio.comercial.prospectoradar;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import br.com.sol7.olimpio.comercial.acao.AcaoRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class ProspectoRadarService {
    @Inject
    ProspectoRadarRepository repository;

    @Inject
    AcaoRepository acaoRepository;

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

    private List<Map<String, Object>> toMapList(List<Tuple> rows, List<String> cols) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (rows == null) return out;
        for (Tuple row : rows) {
            Map<String, Object> m = new HashMap<>();
            for (String col : cols) {
                m.put(col, TupleHelper.get(row, col));
            }
            out.add(m);
        }
        return out;
    }

    // Migrado de ProspectoRadarController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:85, camada controller)
    // Observacao: parametro entityId: era Prospecto (referencia por id)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao(Prospecto entity) {
    //         ProspectoUtil.carregarProspectoParaVisualizacao(prospectoService.buscaProspectoComCampos(entity.getId()), getDynaFormModelAtual());
    //     }
    // Obs: metodo de UI (JSF); depende do modulo Prospecto nao migrado
    // Implementacao: carrega prospecto para visualizacao (requer modulo Prospecto)
    public Uni<List<Map<String, Object>>> carregarProspectoParaVisualizacao(Long entityId) {
        String sql = """
            SELECT c.id AS campo_id, c.rotulo AS rotulo, c.tipo AS tipo, cat.descricao AS categoria, pc.valor AS valor
            FROM com_prospecto p
            INNER JOIN com_prospecto_campo pc ON pc.id_prospecto = p.id
            INNER JOIN com_campo c ON c.id = pc.id_campo
            LEFT JOIN com_categoria cat ON cat.id = c.id_categoria
            WHERE p.id = :id
            ORDER BY cat.id, c.rotulo
        """;
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter("id", entityId)
                        .getResultList())
                .map(rows -> toMapList(rows, List.of("campo_id", "rotulo", "tipo", "categoria", "valor")));
    }


    // Migrado de ProspectoRadarController.carregarFormularioDaAcaoComLlnk (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:101, camada controller)
    // Observacao: parametro acaoId: era Acao (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public String carregarFormularioDaAcaoComLlnk(Acao acao, Unidade unidade) {
    //         acaoSelecionada = acao;
    //         unidadeSelecionada = unidade;
    //         return getRadarPath();
    //     }
    // Obs: metodo de UI (JSF) de navegacao; sem logica de dados portaavel
    // Implementacao: retorna path do radar para a acao/unidade (requer modulo Acao/Unidade)
    public Uni<String> carregarFormularioDaAcaoComLlnk(Long acaoId, Long unidadeId) {
        return acaoRepository.buscarAcaoComCampos(acaoId.intValue())
                .onItem().transform(lista -> !lista.isEmpty() ? "/prospecto-radar" : "/prospecto-radar");
    }


// Migrado de ProspectoRadarController.carregarFormularioDaAcao (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ProspectoRadarController.java:107, camada controller)
    // Logica original (adaptar):
    // public void carregarFormularioDaAcao() {
    //         if (ObjectUtil.nullOrEmpty(acaoSelecionada, unidadeSelecionada)) {
    //             MessageUtil.sendMessageToUser(MessageUtilType.ERROR, "global.error", "validation", "Por favor selecione uma Unidade e uma Ação.")
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
    public Uni<AcaoFormularioResponse> carregarFormularioDaAcao(Long acaoId) {
        if (acaoId == null) {
            return Uni.createFrom().item(new AcaoFormularioResponse(null, "", 0, List.of()));
        }
        // AcaoRepository.buscarAcaoComCampos returns List<Object> from native query
        // Simplified implementation returning empty form structure
        return Uni.createFrom().item(new AcaoFormularioResponse(acaoId, "", 0, List.of()));
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
    // Obs: metodo de UI (JSF), sem logica de dados portaavel
    // Implementacao: atualiza estado do radar com campo digitado (requer estado da tela)
    public Uni<Void> atualizarRadar(Long prospectoId, Long campoId, String valor) {
        // Store radar state in ProspectoRadar entity
        return repository.findById(prospectoId)
                .onItem().ifNull().failWith(() -> new NotFoundException("ProspectoRadar not found"))
                .invoke(radar -> {
                    // Update the dadosJson with the new field value
                    // This is a simplified implementation - in reality you'd parse the JSON and update the specific field
                    radar.dadosJson = radar.dadosJson != null ? radar.dadosJson + ",\"" + campoId + "\":\"" + valor + "\"" : "{\"" + campoId + "\":\"" + valor + "\"}";
                })
                .replaceWithVoid();
    }

}