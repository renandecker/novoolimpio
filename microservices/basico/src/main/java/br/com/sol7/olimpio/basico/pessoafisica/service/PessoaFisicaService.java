package br.com.sol7.olimpio.basico.pessoafisica.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.pessoa.repository.PessoaRepository;
import br.com.sol7.olimpio.basico.pessoafisica.dto.PessoaFisicaRequest;
import br.com.sol7.olimpio.basico.pessoafisica.dto.PessoaFisicaResponse;
import br.com.sol7.olimpio.basico.pessoafisica.entity.PessoaFisica;
import br.com.sol7.olimpio.basico.pessoafisica.repository.PessoaFisicaRepository;

@ApplicationScoped
@WithTransaction
public class PessoaFisicaService {

    @Inject PessoaFisicaRepository repository;
    @Inject PessoaRepository pessoaRepository;

    public Uni<List<PessoaFisicaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<PessoaFisicaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<PessoaFisicaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaFisica not found"))
                .map(this::toResponse);
    }

    public Uni<PessoaFisicaResponse> create(PessoaFisicaRequest r) {
        var e = new PessoaFisica();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<PessoaFisicaResponse> update(Long id, PessoaFisicaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("PessoaFisica not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("PessoaFisica not found")));
    }

    private void apply(PessoaFisica e, PessoaFisicaRequest r) { e.pessoaId = r.pessoaId(); e.nomeSocial = r.nomeSocial(); e.nome = r.nome(); e.cpf = r.cpf(); e.rg = r.rg(); e.nomeReferencia = r.nomeReferencia(); e.telefoneReferencia = r.telefoneReferencia(); e.celularReferencia = r.celularReferencia(); e.nomeReferencia2 = r.nomeReferencia2(); e.telefoneReferencia2 = r.telefoneReferencia2(); e.celularReferencia2 = r.celularReferencia2(); e.dataEmissaoRg = r.dataEmissaoRg(); e.orgaoEmissorRg = r.orgaoEmissorRg(); e.cidadeOrigemId = r.cidadeOrigemId(); e.nomePai = r.nomePai(); e.nomeMae = r.nomeMae(); e.dataNascimento = r.dataNascimento(); e.generoId = r.generoId(); e.etniaId = r.etniaId(); e.escolaridadeId = r.escolaridadeId(); e.estadoCivilId = r.estadoCivilId(); e.facebook = r.facebook(); e.twitter = r.twitter(); e.googlePlus = r.googlePlus(); e.telefoneComercial = r.telefoneComercial(); }

    private PessoaFisicaResponse toResponse(PessoaFisica e) {
        return new PessoaFisicaResponse(e.id, e.pessoaId, e.nomeSocial, e.nome, e.cpf, e.rg, e.nomeReferencia, e.telefoneReferencia, e.celularReferencia, e.nomeReferencia2, e.telefoneReferencia2, e.celularReferencia2, e.dataEmissaoRg, e.orgaoEmissorRg, e.cidadeOrigemId, e.nomePai, e.nomeMae, e.dataNascimento, e.generoId, e.etniaId, e.escolaridadeId, e.estadoCivilId, e.facebook, e.twitter, e.googlePlus, e.telefoneComercial);
    }


    // Migrado de PessoaFisicaController.verificarExistencia (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:331, camada controller)
    // Logica original (adaptar):
    // public boolean verificarExistencia(Integer id, String nome, String cpf, String rg, String email) {
    //         List<Pessoa> pessoas = new ArrayList<>();
    //         if (!ObjectUtil.nullOrEmpty(cpf)) {
    //             if (!ObjectUtil.nullOrEmpty(id)) {
    //                 pessoas = pessoaService.existenciaPessoaComCpf(id, cpf);
    //             } else {
    //                 pessoas = pessoaService.existenciaPessoaComCpf(cpf);
    //             }
    // 
    //             if (!ObjectUtil.nullOrEmpty(pessoas) && !validapessoa) {
    //                 pessoa = pessoaService.buscarPessoaComUnidades(pessoas.get(0));
    //                 carregaFotoPessoa(pessoa);
    // // ... (truncado, ver fonte original)
    public Uni<Boolean> verificarExistencia(Integer id, String nome, String cpf, String rg, String email) {
        return verificaExistenciaCpf(id, cpf)
                .chain(achou -> achou ? Uni.createFrom().item(true) : verificaExistenciaRg(id, rg))
                .chain(achou -> achou ? Uni.createFrom().item(true) : verificaExistenciaEmail(id, email));
    }

    private Uni<Boolean> verificaExistenciaCpf(Integer id, String cpf) {
        if (cpf == null || cpf.isBlank()) return Uni.createFrom().item(false);
        return (id != null ? pessoaRepository.existenciaPessoaComCpf(cpf, id) : pessoaRepository.existenciaPessoaComCpf(cpf)).map(list -> !list.isEmpty());
    }

    private Uni<Boolean> verificaExistenciaRg(Integer id, String rg) {
        if (rg == null || rg.isBlank()) return Uni.createFrom().item(false);
        return (id != null ? pessoaRepository.existenciaPessoaComRg(rg, id) : pessoaRepository.existenciaPessoaComRg(rg)).map(list -> !list.isEmpty());
    }

    private Uni<Boolean> verificaExistenciaEmail(Integer id, String email) {
        if (email == null || email.isBlank()) return Uni.createFrom().item(false);
        return (id != null ? pessoaRepository.existenciaPessoaComEmail(email, id) : pessoaRepository.existenciaPessoaComEmail(email)).map(list -> !list.isEmpty());
    }


    // Migrado de PessoaFisicaController.autoCompleteTodos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:639, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteTodos(String query) {
    //         return pessoaFisicaService.autoCompleteTodos(query);
    //     }
    public Uni<List<Long>> autoCompleteTodos(String query) {
        // Obs: depende do usuario logado (unidades disponiveis) para filtrar
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaFisicaController.autoCompleteContratoTodos (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:643, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteContratoTodos(String query) {
    //         return contratoService.autoCompleteAluno(query);
    //     }
    public Uni<List<Long>> autoCompleteContratoTodos(String query) {
        // Obs: depende do microservico educacao (Contrato) - contratoService.autoCompleteAluno
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaFisicaController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:648, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoComplete(String query) {
    //         return pessoaFisicaService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        // Obs: depende do usuario logado (unidades disponiveis) para filtrar
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaFisicaController.autoCompleteTestemunha (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:652, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteTestemunha(String query) {
    //         return pessoaFisicaService.autoCompleteTestemunha(query);
    //     }
    public Uni<List<Long>> autoCompleteTestemunha(String query) {
        // Obs: depende do usuario logado (unidades disponiveis) para filtrar
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de PessoaFisicaController.autoCompleteAcao (src/main/java/br/com/sol7/olimpio/control/controllers/basico/PessoaFisicaController.java:656, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAcao(String query) {
    //         return pessoaFisicaService.autoCompleteAcao(query);
    //     }
    public Uni<List<Long>> autoCompleteAcao(String query) {
        return repository.autoCompleteAcao(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de PessoaFisicaService.buscarPessoaComCpf (src/main/java/br/com/sol7/olimpio/service/services/basico/PessoaFisicaService.java:49, camada service)
    // JPQL original: select p from PessoaFisica pf inner join pf.pessoa p inner join p.unidades u where u.ativo = true and pf.cpf = ?1
    // Logica original (adaptar):
    // public List<PessoaFisica> buscarPessoaComCpf(String cpf) {
    //         return getPessoaFisicaRepository().buscarPessoaComCpf(cpf, new PageRequest(0, 1)).getContent();
    //     }
    public Uni<List<Long>> buscarPessoaComCpf(String cpf) {
        return repository.buscarPessoaComCpf(cpf).map(list -> list.stream().map(x -> x.id).toList());
    }

}
