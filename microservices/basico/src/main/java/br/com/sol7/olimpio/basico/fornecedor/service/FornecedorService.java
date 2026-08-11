package br.com.sol7.olimpio.basico.fornecedor.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.fornecedor.dto.FornecedorRequest;
import br.com.sol7.olimpio.basico.fornecedor.dto.FornecedorResponse;
import br.com.sol7.olimpio.basico.fornecedor.entity.Fornecedor;
import br.com.sol7.olimpio.basico.fornecedor.repository.FornecedorRepository;

@ApplicationScoped
@WithTransaction
public class FornecedorService {

    @Inject FornecedorRepository repository;

    public Uni<List<FornecedorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FornecedorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<FornecedorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Fornecedor not found"))
                .map(this::toResponse);
    }

    public Uni<FornecedorResponse> create(FornecedorRequest r) {
        var e = new Fornecedor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FornecedorResponse> update(Long id, FornecedorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Fornecedor not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Fornecedor not found")));
    }

    private void apply(Fornecedor e, FornecedorRequest r) { e.pessoaId = r.pessoaId(); e.ativo = r.ativo(); e.longitude = r.longitude(); e.latitude = r.latitude(); }

    private FornecedorResponse toResponse(Fornecedor e) {
        return new FornecedorResponse(e.id, e.pessoaId, e.ativo, e.longitude, e.latitude);
    }


    // Migrado de FornecedorController.autoCompletePessoa (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FornecedorController.java:66, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoa(String query) {
    //         if (query.equals("")) {
    //             return fornecedorService.autoCompleteSOmenteUnidade(unidades);
    //         } else {
    //             return fornecedorService.autoCompletePessoa(query, unidades);
    //         }
    //     }
    public Uni<List<Long>> autoCompletePessoa(String query) {
        // Obs: depende das unidades do usuario logado (nao disponiveis na assinatura) -
        // ver autoCompletePessoa2(query, unidades)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FornecedorController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FornecedorController.java:74, camada controller)
    // Logica original (adaptar):
    // public List<Fornecedor> autoComplete(String query) {
    //         if (query == "") {
    //             return fornecedorService.autoCompleteSOmenteUnidadeFornecedor(unidades);
    //         } else {
    //             return fornecedorService.autoCompleteFornecedor(query, unidades);
    //         }
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende das unidades do usuario logado (nao disponiveis na assinatura) -
        // ver autoCompleteFornecedor2(query, unidades)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FornecedorController.autoCompleteFornecedor (src/main/java/br/com/sol7/olimpio/control/controllers/basico/FornecedorController.java:82, camada controller)
    // Logica original (adaptar):
    // public List<Fornecedor> autoCompleteFornecedor(String query) {
    //         if (query == "") {
    //             return fornecedorService.autoCompleteSOmenteUnidadeFornecedor(unidades);
    //         } else {
    //             return fornecedorService.autoCompleteFornecedor(query, unidades);
    //         }
    //     }
    public Uni<List<Long>> autoCompleteFornecedor(String query) {
        // Obs: depende das unidades do usuario logado (nao disponiveis na assinatura) -
        // ver autoCompleteFornecedor2(query, unidades)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de FornecedorService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/basico/FornecedorService.java:25, camada service)
    // JPQL original: select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    // Logica original (adaptar):
    // public List<Fornecedor> autoComplete(String query, List<Unidade> unidades) {
    //         return this.getFornecedorRepository().autoComplete(query.toLowerCase(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete2(String query, List<Long> unidades) {
                return repository.autoComplete(query.toLowerCase(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FornecedorService.autoCompletePessoa (src/main/java/br/com/sol7/olimpio/service/services/basico/FornecedorService.java:29, camada service)
    // JPQL original: select distinct p from Pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    // Logica original (adaptar):
    // public List<Pessoa> autoCompletePessoa(String query, List<Unidade> unidades) {
    //         return this.getFornecedorRepository().autoCompletePessoa(query.toLowerCase(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompletePessoa2(String query, List<Long> unidades) {
        return repository.autoCompletePessoa(query.toLowerCase(), unidades)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de FornecedorService.autoCompleteSOmenteUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/FornecedorService.java:38, camada service)
    // JPQL original: select distinct p from PessoaJuridica f inner join f.pessoa p inner join  p.unidades u where u IN (?1)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteSOmenteUnidade(List<Unidade> unidades) {
    //         return this.getFornecedorRepository().autoCompleteSOmenteUnidade(unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteSOmenteUnidade(List<Long> unidades) {
        return repository.autoCompleteSOmenteUnidade(unidades)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de FornecedorService.autoCompleteFornecedor (src/main/java/br/com/sol7/olimpio/service/services/basico/FornecedorService.java:42, camada service)
    // JPQL original: select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?2) and (lower(p.pessoaJuridica.nomeFantasia) like '%' || ?1 || '%' OR (p.pessoaJuridica.cnpj) like '%' || ?1 || '%' OR (p.pessoaJuridica.razaoSocial) like '%' || ?1 || '%')  order by p.pessoaJuridica.nomeFantasia
    // Logica original (adaptar):
    // public List<Fornecedor> autoCompleteFornecedor(String query, List<Unidade> unidades) {
    //         return this.getFornecedorRepository().autoCompleteFornecedor(query.toLowerCase(), unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteFornecedor2(String query, List<Long> unidades) {
                return repository.autoCompleteFornecedor(query.toLowerCase(), unidades).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de FornecedorService.autoCompleteSOmenteUnidadeFornecedor (src/main/java/br/com/sol7/olimpio/service/services/basico/FornecedorService.java:46, camada service)
    // JPQL original: select distinct f from Fornecedor f inner join f.pessoa p inner join  p.unidades u where u IN (?1)
    // Logica original (adaptar):
    // public List<Fornecedor> autoCompleteSOmenteUnidadeFornecedor(List<Unidade> unidades) {
    //         return this.getFornecedorRepository().autoCompleteSOmenteUnidadeFornecedor(unidades, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteSOmenteUnidadeFornecedor(List<Long> unidades) {
                return repository.autoCompleteSOmenteUnidadeFornecedor(unidades).map(list -> list.stream().map(x -> x.id).toList());
    }

}
