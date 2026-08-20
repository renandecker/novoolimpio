package br.com.sol7.olimpio.financeiro.configuracaocaixa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConfiguracaoCaixaService {

    @Inject
    ConfiguracaoCaixaRepository repository;

    public Uni<List<ConfiguracaoCaixaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConfiguracaoCaixaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConfiguracaoCaixaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoCaixa not found"))
                .map(this::toResponse);
    }

    public Uni<ConfiguracaoCaixaResponse> create(ConfiguracaoCaixaRequest r) {
        var e = new ConfiguracaoCaixa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConfiguracaoCaixaResponse> update(Long id, ConfiguracaoCaixaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("ConfiguracaoCaixa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("ConfiguracaoCaixa not found")));
    }

    private void apply(ConfiguracaoCaixa e, ConfiguracaoCaixaRequest r) {
        e.unidadeId = r.unidadeId();
        e.fundoCaixa = r.fundoCaixa();
        e.dias = r.dias();
        e.email = r.email();
        e.impressao = r.impressao();
        e.pagPropriaUnid = r.pagPropriaUnid();
        e.usuarioId = r.usuarioId();
        e.responsavelId = r.responsavelId();
        e.templateCaixa = r.templateCaixa();
        e.tipoModeloCaixa = r.tipoModeloCaixa();
    }

    private ConfiguracaoCaixaResponse toResponse(ConfiguracaoCaixa e) {
        return new ConfiguracaoCaixaResponse(e.id, e.unidadeId, e.fundoCaixa, e.dias, e.email, e.impressao, e.pagPropriaUnid, e.usuarioId, e.responsavelId, e.templateCaixa, e.tipoModeloCaixa);
    }


    // Migrado de ConfiguracaoCaixaController.autoCompleteUsuario (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/ConfiguracaoCaixaController.java:273, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteUsuario(String query) {
    //         if (getEntity().getUnidade() != null && !query.equals("")) {
    //             return usuarioService.autoCompleteUsuario(query, getEntity().getUnidade());
    //         }
    //         if (getEntity().getUnidade() != null && query.equals("")) {
    //             return usuarioService.buscarUsuarioPorUnidade(getEntity().getUnidade());
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteUsuario(String query) {
        // Obs: depende do microservico basico (usuarioService.autoCompleteUsuario / usuarioService.buscarUsuarioPorUnidade)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de ConfiguracaoCaixaService.buscarConfiguracaoComUnidadeUsuario (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoCaixaService.java:45, camada service)
    // Observacao: retorno: era ConfiguracaoCaixa (referencia por id); parametro usuarioId: era Usuario (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public ConfiguracaoCaixa buscarConfiguracaoComUnidadeUsuario(Usuario usuario, Unidade unidade) {
    //         return getConfiguracaoCaixaRepository().buscarConfiguracaoComUnidadeUsuario(usuario, unidade);
    //     }
    public Uni<Long> buscarConfiguracaoComUnidadeUsuario(Long usuarioId, Long unidadeId) {
        return repository.find("usuarioId =?1 and unidadeId =?2 order by id desc", usuarioId, unidadeId).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de ConfiguracaoCaixaService.buscarConfiguracaoComUsuario (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoCaixaService.java:49, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<ConfiguracaoCaixa> buscarConfiguracaoComUsuario(Usuario usuario) {
    //         return getConfiguracaoCaixaRepository().buscarConfiguracaoComUsuario(usuario);
    //     }
    public Uni<List<Long>> buscarConfiguracaoComUsuario(Long usuarioId) {
        return repository.find("usuarioId =?1 order by unidade.sucinto", usuarioId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ConfiguracaoCaixaService.buscarConfiguracaoCaixaUnico (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoCaixaService.java:53, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<ConfiguracaoCaixa> buscarConfiguracaoCaixaUnico(Usuario usuario) {
    //         return getConfiguracaoCaixaRepository().buscarConfiguracaoCaixaUnico(usuario);
    //     }
    public Uni<List<Long>> buscarConfiguracaoCaixaUnico(Long usuarioId) {
        return repository.find("usuarioId =?1 and pagPropriaUnid = true order by unidade.sucinto", usuarioId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ConfiguracaoCaixaService.buscarConfiguracaoComUnidadeUsuarioId (src/main/java/br/com/sol7/olimpio/service/services/financeiro/ConfiguracaoCaixaService.java:57, camada service)
    // Observacao: retorno: era ConfiguracaoCaixa (referencia por id); parametro usuarioId: era Usuario (referencia por id); parametro unidadeId: era Unidade (referencia por id); parametro configuracaoCaixaId: era ConfiguracaoCaixa (referencia por id)
    // Logica original (adaptar):
    // public ConfiguracaoCaixa buscarConfiguracaoComUnidadeUsuarioId(Usuario usuario, Unidade unidade, ConfiguracaoCaixa configuracaoCaixa) {
    //         return getConfiguracaoCaixaRepository().buscarConfiguracaoComUnidadeUsuarioId(usuario, unidade, configuracaoCaixa);
    //     }
    public Uni<Long> buscarConfiguracaoComUnidadeUsuarioId(Long usuarioId, Long unidadeId, Long configuracaoCaixaId) {
        return repository.find("usuarioId =?1 and unidadeId =?2 and c <> ?3 order by id desc", usuarioId, unidadeId, configuracaoCaixaId).firstResult().map(x -> x == null ? null : x.id);
    }

}
