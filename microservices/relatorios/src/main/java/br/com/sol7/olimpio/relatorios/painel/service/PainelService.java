package br.com.sol7.olimpio.relatorios.painel.service;
import br.com.sol7.olimpio.relatorios.estrutura.entity.Estrutura;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.relatorios.painel.repository.PainelRepository;
import br.com.sol7.olimpio.relatorios.painel.entity.Painel;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelRequest;
import br.com.sol7.olimpio.relatorios.painel.dto.PainelResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class PainelService {

    @Inject
    PainelRepository repository;

    public Uni<List<PainelResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PainelResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PainelResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .map(this::toResponse);
    }

    public Uni<PainelResponse> create(PainelRequest r) {
        var e = new Painel();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PainelResponse> update(Long id, PainelRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Painel not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Painel not found")));
    }

    private void apply(Painel e, PainelRequest r) {
        e.nome = r.nome();
    }

    private PainelResponse toResponse(Painel e) {
        return new PainelResponse(e.id, e.nome);
    }


    // Migrado de PainelService.buscarUnidades (src/main/java/br/com/sol7/olimpio/service/services/relatorios/PainelService.java:27, camada service)
    // Observacao: parametro id: era Painel (referencia por id)
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidades(Painel id) {
    //         return getConexaoRepository().buscarUnidades(id);
    //     }
    public Uni<List<Long>> buscarUnidades(Long id) {
        // Obs: depende do microservico basico (Unidade) - repository.buscarUnidades
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PainelService.buscarPerfils (src/main/java/br/com/sol7/olimpio/service/services/relatorios/PainelService.java:31, camada service)
    // Observacao: parametro id: era Painel (referencia por id)
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfils(Painel id) {
    //         return getConexaoRepository().buscarPerfils(id);
    //     }
    public Uni<List<Long>> buscarPerfils(Long id) {
        // Obs: depende do microservico basico (Perfil) - repository.buscarPerfils
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PainelService.buscarUsuarios (src/main/java/br/com/sol7/olimpio/service/services/relatorios/PainelService.java:35, camada service)
    // Observacao: parametro id: era Painel (referencia por id)
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuarios(Painel id) {
    //         return getConexaoRepository().buscarUsuarios(id);
    //     }
    public Uni<List<Long>> buscarUsuarios(Long id) {
        // Obs: depende do microservico basico (Usuario) - repository.buscarUsuarios
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PainelService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/relatorios/PainelService.java:40, camada service)
    // Observacao: parametro estruturaId: era Estrutura (referencia por id)
    // Logica original (adaptar):
    // public List<Painel> autoComplete(String query,Estrutura estrutura) {
    // 		return this.getConexaoRepository().autoComplete(query.toLowerCase(),estrutura, new PageRequest(0,10)).getContent();
    // 	}
    public Uni<List<Long>> autoComplete(String query, Long estruturaId) {
        return repository.autoComplete(query.toLowerCase(), estruturaId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
