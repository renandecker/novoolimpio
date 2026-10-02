package br.com.sol7.olimpio.basico.pessoajuridica.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository;
import br.com.sol7.olimpio.basico.pessoajuridica.dto.PessoaJuridicaRequest;
import br.com.sol7.olimpio.basico.pessoajuridica.dto.PessoaJuridicaResponse;
import br.com.sol7.olimpio.basico.pessoajuridica.entity.PessoaJuridica;
import br.com.sol7.olimpio.basico.pessoajuridica.repository.PessoaJuridicaRepository;

@ApplicationScoped
@WithTransaction
public class PessoaJuridicaService {

    @Inject
    PessoaJuridicaRepository repository;
    @Inject
    PessoaRepository pessoaRepository;

    public Uni<List<PessoaJuridicaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PessoaJuridicaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PessoaJuridicaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaJuridica not found"))
                .map(this::toResponse);
    }

    public Uni<PessoaJuridicaResponse> create(PessoaJuridicaRequest r) {
        var e = new PessoaJuridica();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PessoaJuridicaResponse> update(Long id, PessoaJuridicaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaJuridica not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PessoaJuridica not found")));
    }

    private void apply(PessoaJuridica e, PessoaJuridicaRequest r) {
        e.pessoaId = r.pessoaId();
        e.nomeFantasia = r.nomeFantasia();
        e.razaoSocial = r.razaoSocial();
        e.cnpj = r.cnpj();
        e.fax = r.fax();
        e.inscricaoMunicipal = r.inscricaoMunicipal();
        e.inscricaoEstadual = r.inscricaoEstadual();
    }

    private PessoaJuridicaResponse toResponse(PessoaJuridica e) {
        return new PessoaJuridicaResponse(e.id, e.pessoaId, e.nomeFantasia, e.razaoSocial, e.cnpj, e.fax, e.inscricaoMunicipal, e.inscricaoEstadual);
    }

    public Uni<Boolean> verificarExistencia(Integer id, String nome, String cnpj, String email) {
        return verificaExistenciaCnpj(id, cnpj)
                .chain(achou -> achou ? Uni.createFrom().item(true) : verificaExistenciaEmail(id, email));
    }

    private Uni<Boolean> verificaExistenciaCnpj(Integer id, String cnpj) {
        if (cnpj == null || cnpj.isBlank()) return Uni.createFrom().item(false);
        return (id != null ? pessoaRepository.existenciaPessoaComCnpj(cnpj, id) : pessoaRepository.existenciaPessoaComCnpj(cnpj)).map(list -> !list.isEmpty());
    }

    private Uni<Boolean> verificaExistenciaEmail(Integer id, String email) {
        if (email == null || email.isBlank()) return Uni.createFrom().item(false);
        return (id != null ? pessoaRepository.existenciaPessoaComEmail(email, id) : pessoaRepository.existenciaPessoaComEmail(email)).map(list -> !list.isEmpty());
    }


    // Migrado de PessoaJuridicaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaJuridicaController.java:466, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoComplete(String query) {
    //         return pessoaJuridicaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (unidades disponiveis) para filtrar
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaJuridicaController.autoCompleteTodos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaJuridicaController.java:470, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteTodos(String query) {
    //         return pessoaJuridicaService.autoCompleteTodos(query);
    //     }
    public Uni<List<Long>> autoCompleteTodos(String query) {
        // Obs: depende do usuario logado (unidades disponiveis) para filtrar
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaJuridicaService.buscarPessoaComCnpj (src/main/java/br/com/sol7/olimpio/service/services/basico/PessoaJuridicaService.java:48, camada service)
    // JPQL original: select p from PessoaJuridica pj inner join pj.pessoa p left join p.unidades u where u.ativo = true and pj.cnpj = ?1
    // Logica original (adaptar):
    // public List<PessoaJuridica> buscarPessoaComCnpj(String cnpj) {
    //         return getPessoaJuridicaRepository().buscarPessoaComCnpj(cnpj);
    //     }
    public Uni<List<Long>> buscarPessoaComCnpj(String cnpj) {
        return repository.buscarPessoaComCnpj(cnpj).map(list -> list.stream().map(x -> x.id).toList());
    }

}
