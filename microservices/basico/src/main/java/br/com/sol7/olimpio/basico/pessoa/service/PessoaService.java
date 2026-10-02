package br.com.sol7.olimpio.basico.pessoa.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.pessoa.dto.PessoaRequest;
import br.com.sol7.olimpio.basico.pessoa.dto.PessoaResponse;
import br.com.sol7.olimpio.basico.pessoa.entity.Pessoa;
import br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository;

@ApplicationScoped
@WithTransaction
public class PessoaService {

    @Inject
    PessoaRepository repository;

    public Uni<List<PessoaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PessoaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PessoaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Pessoa not found"))
                .map(this::toResponse);
    }

    public Uni<PessoaResponse> create(PessoaRequest r) {
        var e = new Pessoa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PessoaResponse> update(Long id, PessoaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Pessoa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Pessoa not found")));
    }

    private void apply(Pessoa e, PessoaRequest r) {
        e.numero = r.numero();
        e.complemento = r.complemento();
        e.email = r.email();
        e.telefone = r.telefone();
        e.celular = r.celular();
        e.foto = r.foto();
        e.observacao = r.observacao();
        e.comunicado = r.comunicado();
        e.logradouroId = r.logradouroId();
        e.dataCadastro = r.dataCadastro();
        e.dataAlteracao = r.dataAlteracao();
    }

    private PessoaResponse toResponse(Pessoa e) {
        return new PessoaResponse(e.id, e.numero, e.complemento, e.email, e.telefone, e.celular, e.foto, e.observacao, e.comunicado, e.logradouroId, e.dataCadastro, e.dataAlteracao);
    }


    // Migrado de PessoaController.gerarLogin (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaController.java:124, camada controller)
    // Logica original (adaptar):
    // public String gerarLogin() {
    //         try {
    //             Usuario usuario = new Usuario();
    //             String nomecompleto = "";
    //             if (getEntity().getPessoaFisica() != null) {
    //                 nomecompleto = removerAcentos(getEntity().getPessoaFisica().getNome().toLowerCase());
    //             } else {
    //                 nomecompleto = removerAcentos(getEntity().getPessoaJuridica().getRazaoSocial().toLowerCase());
    //             }
    //             String nome[] = nomecompleto.split(" ");
    //             String login = nome[0];
    //             if (nome.length >= 2) {
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarLogin() {
        // Obs: depende da entidade da sessao JSF (nome da pessoa) para montar o login e da unicidade em usuarioService.buscarLoginExistente
        return Uni.createFrom().item(null);
    }

    public Uni<Long> buscarPessoaComUnidades(Long entityId) {
        return repository.buscarPessoaComUnidades(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }

    public Uni<List<Long>> buscarPessoaPorUnidades(List<Long> unidade) {
        return repository.buscarPessoaPorUnidades(unidade).map(list -> list.stream().map(x -> x.id).toList());
    }

    // Retorna os ids de Unidade vinculados a uma Pessoa via bas_pessoa_unidade.
    public Uni<List<Long>> buscarUnidades(Long pessoaId) {
        if (pessoaId == null) {
            return Uni.createFrom().item(java.util.Collections.emptyList());
        }
        return repository.buscarUnidadesPorPessoa(pessoaId);
    }

}
