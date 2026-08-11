package br.com.sol7.olimpio.basico.cidade.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.cidade.dto.CidadeRequest;
import br.com.sol7.olimpio.basico.cidade.dto.CidadeResponse;
import br.com.sol7.olimpio.basico.cidade.entity.Cidade;
import br.com.sol7.olimpio.basico.cidade.repository.CidadeRepository;

@ApplicationScoped
@WithTransaction
public class CidadeService {

    @Inject CidadeRepository repository;

    public Uni<List<CidadeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CidadeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CidadeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Cidade not found"))
                .map(this::toResponse);
    }

    public Uni<CidadeResponse> create(CidadeRequest r) {
        var e = new Cidade();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CidadeResponse> update(Long id, CidadeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Cidade not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Cidade not found")));
    }

    private void apply(Cidade e, CidadeRequest r) { e.nome = r.nome(); e.praca = r.praca(); e.area = r.area(); e.ibge = r.ibge(); e.estadoId = r.estadoId(); }

    private CidadeResponse toResponse(Cidade e) {
        return new CidadeResponse(e.id, e.nome, e.praca, e.area, e.ibge, e.estadoId);
    }


    // Migrado de CidadeController.autoCompleteLogradouroTroca (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CidadeController.java:49, camada controller)
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteLogradouroTroca(String query) {
    //         try {
    //             if (!query.equals("")) {
    //                 return cidadeService.autoComplete(query);
    //             } else {
    //                 return new ArrayList<>();
    //             }
    //         } catch (Exception e) {
    //             return new ArrayList<>();
    //         }
    //     }
    public Uni<List<Long>> autoCompleteLogradouroTroca(String query) {
        if (query.equals("")) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CidadeController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/CidadeController.java:134, camada controller)
    // Logica original (adaptar):
    // public List<Cidade> autoComplete(String query) {
    //         return cidadeService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CidadeService.autoCompleteComCep (src/main/java/br/com/sol7/olimpio/service/services/basico/CidadeService.java:27, camada service)
    // JPQL original: select distinct c.bairro.cidade from Logradouro c where c.cep = ?2 and (lower(c.bairro.cidade.nome) like '%' || lower(?1) || '%'  OR  str(c.bairro.cidade.id) = ?1 or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.nome) like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.uf) like '%' || ?1 || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' ) order by c.bairro.cidade.nome
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteComCep(String query, String cep) {
    //         return this.getCidadeRepository().autoCompleteComCep(query.toLowerCase(), cep, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComCep(String query, String cep) {
        return repository.autoCompleteComCep(query.toLowerCase(), cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de CidadeService.autoCompleteComEstado (src/main/java/br/com/sol7/olimpio/service/services/basico/CidadeService.java:36, camada service)
    // Observacao: parametro estadoId: era Estado (referencia por id)
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteComEstado(String query, Estado estado) {
    //         return this.getCidadeRepository().autoCompleteComEstado(query.toLowerCase(), estado, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComEstado(String query, Long estadoId) {
                // Obs: condicao removida (depende de outro microservico): (lower(c.nome) like '%' || lower(?1) || '%'  OR  str(c.id) = ?1 or  lower(c.nome||c.estado.nome) like '%' || lower(?1) || '%' or  lower(c.nome||c.estado.uf) like '%' || ?1 || '%' or  lower(c.nome||' ('||c.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.nome||' ('||c.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.nome||' '||c.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' )
        return repository.find("estadoId = ?2 order by nome", query.toLowerCase(), estadoId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CidadeService.autoCompleteComEstadoComCep (src/main/java/br/com/sol7/olimpio/service/services/basico/CidadeService.java:40, camada service)
    // Observacao: parametro estadoId: era Estado (referencia por id)
    // JPQL original: select distinct c.bairro.cidade from Logradouro c where c.cep = ?3 and (c.bairro.cidade.estado = ?2 and (lower(c.bairro.cidade.nome) like '%' || lower(?1) || '%'  OR  str(c.bairro.cidade.id) = ?1 or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.nome) like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||c.bairro.cidade.estado.uf) like '%' || ?1 || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.nome||')') like '%' || lower(?1) || '%' or  lower(c.bairro.cidade.nome||' ('||c.bairro.cidade.estado.uf||')') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.nome),'(',''),')','') like '%' || lower(?1) || '%' or  replace(replace(lower(c.bairro.cidade.nome||' '||c.bairro.cidade.estado.uf),'(',''),')','') like '%' || lower(?1) || '%' )) order by c.bairro.cidade.nome
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteComEstadoComCep(String query, Estado estado, String cep) {
    //         return this.getCidadeRepository().autoCompleteComEstadoComCep(query.toLowerCase(), estado, cep, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComEstadoComCep(String query, Long estadoId, String cep) {
        return repository.autoCompleteComEstadoComCep(query.toLowerCase(), estadoId, cep).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

}
