package br.com.sol7.olimpio.financeiro.configuracaoparcela;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoParcelaService {

    @Inject ConfiguracaoParcelaRepository repository;

    public Uni<List<ConfiguracaoParcelaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoParcelaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConfiguracaoParcelaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoParcela not found"))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoParcelaResponse> create(ConfiguracaoParcelaRequest r) {
        var e = new ConfiguracaoParcela();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoParcelaResponse> update(Long id, ConfiguracaoParcelaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoParcela not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ConfiguracaoParcela not found")));
    }

    private void apply(ConfiguracaoParcela e, ConfiguracaoParcelaRequest r) { e.unidadeId = r.unidadeId(); e.diasValidadePreCancelamento = r.diasValidadePreCancelamento(); e.vezesPreCancelamento = r.vezesPreCancelamento(); e.jurosReparcela = r.jurosReparcela(); e.multaReparcela = r.multaReparcela(); e.descontoReparcela = r.descontoReparcela(); e.percDescJurMul = r.percDescJurMul(); e.percDescValor = r.percDescValor(); e.percValorMinReparcela = r.percValorMinReparcela(); e.qtdeParcCancelamento = r.qtdeParcCancelamento(); e.prazoParcEntrada = r.prazoParcEntrada(); e.prazoParcSegunda = r.prazoParcSegunda(); e.prazoReparcEntrada = r.prazoReparcEntrada(); e.prazoReparcSegunda = r.prazoReparcSegunda(); e.qtdeReaprcelamento = r.qtdeReaprcelamento(); e.qtdePacelas = r.qtdePacelas(); e.qtdeReparcValorManual = r.qtdeReparcValorManual(); e.percParcelaValor = r.percParcelaValor(); e.percParcelaAlterar = r.percParcelaAlterar(); e.perfilEditarParcelasId = r.perfilEditarParcelasId(); e.perfilDescParcelasId = r.perfilDescParcelasId(); e.templateReparcelamento = r.templateReparcelamento(); e.templateCancelamento = r.templateCancelamento(); e.templateCancelamentoPrevisao = r.templateCancelamentoPrevisao(); e.templateCancelamentoCurso = r.templateCancelamentoCurso(); e.percMultaCancelamento = r.percMultaCancelamento(); e.qtdeDiasCancelamentoParcela = r.qtdeDiasCancelamentoParcela(); e.percMinimoCancelamento = r.percMinimoCancelamento(); e.tipoModeloCancelamentoCurso = r.tipoModeloCancelamentoCurso(); e.tipoModeloCancelamento = r.tipoModeloCancelamento(); e.tipoModeloCancelamentoPrecisao = r.tipoModeloCancelamentoPrecisao(); e.tipoModeloCancelamentoReparcelamento = r.tipoModeloCancelamentoReparcelamento(); }

    private ConfiguracaoParcelaResponse toResponse(ConfiguracaoParcela e) {
        return new ConfiguracaoParcelaResponse(e.id, e.unidadeId, e.diasValidadePreCancelamento, e.vezesPreCancelamento, e.jurosReparcela, e.multaReparcela, e.descontoReparcela, e.percDescJurMul, e.percDescValor, e.percValorMinReparcela, e.qtdeParcCancelamento, e.prazoParcEntrada, e.prazoParcSegunda, e.prazoReparcEntrada, e.prazoReparcSegunda, e.qtdeReaprcelamento, e.qtdePacelas, e.qtdeReparcValorManual, e.percParcelaValor, e.percParcelaAlterar, e.perfilEditarParcelasId, e.perfilDescParcelasId, e.templateReparcelamento, e.templateCancelamento, e.templateCancelamentoPrevisao, e.templateCancelamentoCurso, e.percMultaCancelamento, e.qtdeDiasCancelamentoParcela, e.percMinimoCancelamento, e.tipoModeloCancelamentoCurso, e.tipoModeloCancelamento, e.tipoModeloCancelamentoPrecisao, e.tipoModeloCancelamentoReparcelamento);
    }


    // Migrado de ConfiguracaoParcelaController.carregarNovoCancelamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/ConfiguracaoParcelaController.java:166, camada controller)
    // Logica original (adaptar):
    // public void carregarNovoCancelamento() {
    //         cancelamento = new Cancelamento();
    //         cancelamento.setPerfis(new ArrayList<>());
    //         cancelamento.setUnidades(new ArrayList<>());
    //     }
    // Obs: metodo de UI (inicializacao de tela do Cancelamento), sem logica de dados portavel
    public Uni<Void> carregarNovoCancelamento() {
        return Uni.createFrom().voidItem();
    }


    // Migrado de ConfiguracaoParcelaService.buscarConf (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoParcelaService.java:22, camada service)
    // Observacao: retorno: era ConfiguracaoParcela (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public ConfiguracaoParcela buscarConf(Unidade unidade) {
    //         return getConfiguracaoParcelaRepository().buscarConf(unidade);
    //     }
    public Uni<Long> buscarConf(Long unidadeId) {
                return repository.find("unidadeId = ?1 order by id desc", unidadeId).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ConfiguracaoParcelaService.buscarConf (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoParcelaService.java:26, camada service)
    // Observacao: retorno: era ConfiguracaoParcela (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public ConfiguracaoParcela buscarConf(Unidade unidade, Integer id) {
    //         return getConfiguracaoParcelaRepository().buscarConf(unidade, id);
    //     }
    public Uni<Long> buscarConf2(Long unidadeId, Integer id) {
                return repository.find("unidadeId = ?1 order by id desc", unidadeId, id).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ConfiguracaoParcelaService.buscarConfComUnidades (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoParcelaService.java:30, camada service)
    // Logica original (adaptar):
    // public List<ConfiguracaoParcela> buscarConfComUnidades(List<Unidade> unidade) {
    //         return getConfiguracaoParcelaRepository().buscarConfComUnidades(unidade);
    //     }
    public Uni<List<Long>> buscarConfComUnidades(List<Long> unidade) {
                return repository.find("unidadeId in (?1) order by id desc", unidade).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ConfiguracaoParcelaService.buscarConfComUnidadesNotCancelamento (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoParcelaService.java:34, camada service)
    // JPQL original: Select c from ConfiguracaoParcela c left join fetch c.cancelamentos where c.unidade not in (?1) order by c.id desc
    // Logica original (adaptar):
    // public List<ConfiguracaoParcela> buscarConfComUnidadesNotCancelamento(List<Unidade> unidade) {
    //         return getConfiguracaoParcelaRepository().buscarConfComUnidadesNotCancelamento(unidade);
    //     }
    public Uni<List<Long>> buscarConfComUnidadesNotCancelamento(List<Long> unidade) {
                return repository.buscarConfComUnidadesNotCancelamento(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }

}
