package br.com.sol7.olimpio.basico.bairro.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.bairro.dto.BairroRequest;
import br.com.sol7.olimpio.basico.bairro.dto.BairroResponse;
import br.com.sol7.olimpio.basico.bairro.entity.Bairro;
import br.com.sol7.olimpio.basico.bairro.repository.BairroRepository;

@ApplicationScoped
@WithTransaction
public class BairroService {

    @Inject
    BairroRepository repository;

    public Uni<List<BairroResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<BairroResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<BairroResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bairro not found"))
                .map(this::toResponse);
    }

    public Uni<BairroResponse> create(BairroRequest r) {
        var e = new Bairro();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<BairroResponse> update(Long id, BairroRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Bairro not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Bairro not found")));
    }

    private void apply(Bairro e, BairroRequest r) {
        e.descricao = r.descricao();
        e.cidadeId = r.cidadeId();
    }

    private BairroResponse toResponse(Bairro e) {
        return new BairroResponse(e.id, e.descricao, e.cidadeId);
    }


    // Migrado de BairroController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/BairroController.java:81, camada controller)
    // Logica original (adaptar):
    // public List<Bairro> autoComplete(String query) {
    //         if (cidade != null) {
    //             return bairroService.autoCompleteComCidade(query, cidade);
    //         } else {
    //             return bairroService.autoComplete(query);
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de BairroController.autoCompleteLogradouroTroca (src/main/java/br/com/sol7/olimpio/control/controllers/basico/BairroController.java:89, camada controller)
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteLogradouroTroca(String query) {
    //         try {
    //             if (!query.equals("")) {
    //                 return bairroService.autoComplete(query);
    //             } else {
    //                 return new ArrayList<>();
    //             }
    //         } catch (Exception e) {
    //             return new ArrayList<>();
    //         }
    //     }
    public Uni<List<Long>> autoCompleteLogradouroTroca(String query) {
        if (query == null || query.equals("")) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de BairroService.autoCompleteComCep (src/main/java/br/com/sol7/olimpio/service/services/basico/BairroService.java:28, camada service)
    // JPQL original: select distinct c.bairro from Logradouro c where c.cep = ?2 and lower(c.bairro.descricao) like '%' || ?1 || '%'  OR str(c.id) = ?1  order by c.descricao
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteComCep(String query, String cep) {
    //         return this.getBairroRepository().autoCompleteComCep(query.toLowerCase(), cep, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCep(String query, String cep) {
        return repository.autoCompleteComCep(query.toLowerCase(), cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de BairroService.autoCompleteComCidade (src/main/java/br/com/sol7/olimpio/service/services/basico/BairroService.java:33, camada service)
    // Observacao: parametro cidadeId: era Cidade (referencia por id)
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteComCidade(String query, Cidade cidade) {
    //         return this.getBairroRepository().autoCompleteComCidade(query.toLowerCase(), cidade, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCidade(String query, Long cidadeId) {
        return repository.find("cidadeId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase(), cidadeId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de BairroService.autoCompleteComCidadeComCep (src/main/java/br/com/sol7/olimpio/service/services/basico/BairroService.java:37, camada service)
    // Observacao: parametro cidadeId: era Cidade (referencia por id)
    // JPQL original: select distinct c.bairro from Logradouro c where c.bairro.cidade = ?2 and c.cep = ?3 and (lower(c.bairro.descricao) like '%' || ?1 || '%')  order by c.bairro.descricao
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteComCidadeComCep(String query, Cidade cidade, String cep) {
    //         return this.getBairroRepository().autoCompleteComCidadeComCep(query.toLowerCase(), cidade, cep, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCidadeComCep(String query, Long cidadeId, String cep) {
        return repository.autoCompleteComCidadeComCep(query.toLowerCase(), cidadeId, cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de BairroService.autoCompleteComCidadeEstado (src/main/java/br/com/sol7/olimpio/service/services/basico/BairroService.java:41, camada service)
    // Observacao: parametro cidadeId: era Cidade (referencia por id); parametro estadoId: era Estado (referencia por id)
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteComCidadeEstado(String query, Cidade cidade, Estado estado) {
    //         return this.getBairroRepository().autoCompleteComCidadeEstado(query.toLowerCase(), cidade, estado, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCidadeEstado(String query, Long cidadeId, Long estadoId) {
        // Obs: condicao removida (depende de outro microservico): c.cidade.estado = ?3
        return repository.find("cidadeId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase(), cidadeId, estadoId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de BairroService.autoCompleteComCidadeEstadoComCep (src/main/java/br/com/sol7/olimpio/service/services/basico/BairroService.java:45, camada service)
    // Observacao: parametro cidadeId: era Cidade (referencia por id); parametro estadoId: era Estado (referencia por id)
    // JPQL original: select distinct c.bairro from Logradouro c where c.cep = ?4 and c.bairro.cidade = ?2 and c.bairro.cidade.estado = ?3 and (lower(c.bairro.descricao) like '%' || ?1 || '%')  order by c.bairro.descricao
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteComCidadeEstadoComCep(String query, Cidade cidade, Estado estado, String cep) {
    //         return this.getBairroRepository().autoCompleteComCidadeEstadoComCep(query.toLowerCase(), cidade, estado, cep, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCidadeEstadoComCep(String query, Long cidadeId, Long estadoId, String cep) {
        return repository.autoCompleteComCidadeEstadoComCep(query.toLowerCase(), cidadeId, estadoId, cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Opcoes ricas (id + descricao + cidadeId) para os autocompletes da tela de logradouro.
    public Uni<List<BairroResponse>> autoCompleteOpcoes(String query, Long cidadeId) {
        if (cidadeId != null) {
            return repository.autoCompleteComCidade(query.toLowerCase(), cidadeId)
                    .map(list -> list.stream().map(this::toResponse).toList());
        }
        return repository.autoComplete(query.toLowerCase())
                .map(list -> list.stream().map(this::toResponse).toList());
    }

}
