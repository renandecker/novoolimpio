package br.com.sol7.olimpio.basico.logradouro.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.basico.bairro.dto.BairroResponse;
import br.com.sol7.olimpio.basico.bairro.entity.Bairro;
import br.com.sol7.olimpio.basico.bairro.repository.BairroRepository;
import br.com.sol7.olimpio.basico.cidade.dto.CidadeResponse;
import br.com.sol7.olimpio.basico.cidade.entity.Cidade;
import br.com.sol7.olimpio.basico.cidade.repository.CidadeRepository;
import br.com.sol7.olimpio.basico.logradouro.dto.BuscarEnderecoResponse;
import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroRequest;
import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroResponse;
import br.com.sol7.olimpio.basico.logradouro.entity.Logradouro;
import br.com.sol7.olimpio.basico.logradouro.repository.LogradouroRepository;
import br.com.sol7.olimpio.basico.shared.util.CorreioQualCep;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class LogradouroService {

    @Inject
    LogradouroRepository repository;

    @Inject
    BairroRepository bairroRepository;

    @Inject
    CidadeRepository cidadeRepository;

    @Inject
    CorreioQualCep correioQualCep;

    public Uni<List<LogradouroResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<LogradouroResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<LogradouroResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Logradouro not found"))
                .map(this::toResponse);
    }

    public Uni<LogradouroResponse> create(LogradouroRequest r) {
        var e = new Logradouro();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<LogradouroResponse> update(Long id, LogradouroRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Logradouro not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Logradouro not found")));
    }

    private void apply(Logradouro e, LogradouroRequest r) {
        e.descricao = r.descricao();
        e.cep = r.cep();
        e.tipo = r.tipo();
        e.complemento = r.complemento();
        e.local = r.local();
        e.longitude = r.longitude();
        e.latitude = r.latitude();
        e.bairroId = r.bairroId();
    }

    private LogradouroResponse toResponse(Logradouro e) {
        return new LogradouroResponse(e.id, e.descricao, e.cep, e.tipo, e.complemento, e.local, e.longitude, e.latitude, e.bairroId);
    }


    // Migrado de LogradouroController.atualizarTodosLogradouro (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:153, camada controller)
    // Logica original (adaptar):
    // public void atualizarTodosLogradouro() {
    //         List<Integer> logradouros = (List<Integer>) hibernateService.executeSQL("select id from bas_logradouro " +
    //                 " where cep is not null order by id desc");
    // 
    //         for (Integer log : logradouros) {
    //             Logradouro logradouro = logradouroService.findById(log);
    //             atualizarLogradouro(logradouro);
    //         }
    //     }
    public Uni<Integer> atualizarTodosLogradouro() {
        return Uni.createFrom().item(0);
    }


    // Migrado de LogradouroController.atualizarTodosCoordenadaAPI (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:163, camada controller)
    // Logica original (adaptar):
    // public void atualizarTodosCoordenadaAPI() {
    //         List<Integer> logradouros = (List<Integer>) hibernateService.executeSQL("select id from bas_logradouro " +
    //                 " where cep is not null and (longitude is null or latitude is null) order by id desc");
    // 
    //         List<ConfiguracaoEmail> configuracaoEmail = configuracaoEmailService.busaConfiguracaoEmailPadrao();
    // 
    //         for (Integer log : logradouros) {
    //             Logradouro logradouro = logradouroService.findById(log);
    //             atualizarCoordenadaAPI(logradouro, configuracaoEmail.get(0).getTokenCorreio());
    //         }
    //     }
    public Uni<Integer> atualizarTodosCoordenadaAPI() {
        return Uni.createFrom().item(0);
    }

    public Uni<LogradouroResponse> atualizarCoordenadaAPI(Long logradouroId, String token) {
        return find(logradouroId);
    }

    public Uni<LogradouroResponse> atualizarLogradouro(Long logradouroId) {
        return find(logradouroId);
    }

    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de LogradouroController.autoCompleteCidadeEdita (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:422, camada controller)
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteCidadeEdita(String query) {
    //         if (estado != null) {
    //             if (estado.getId() != null) {
    //                 return cidadeService.autoCompleteComEstado(query, estado);
    //             } else {
    //                 return cidadeService.autoComplete(query);
    //             }
    //         } else {
    //             return cidadeService.autoComplete(query);
    //         }
    //     }
    public Uni<List<Long>> autoCompleteCidadeEdita(String query) {
        // Obs: depende do estado selecionado na tela (campo JSF); delegava a cidadeService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de LogradouroController.autoCompleteCidade (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:434, camada controller)
    // Logica original (adaptar):
    // public List<Cidade> autoCompleteCidade(String query) {
    //         if (stringcep == null) {
    //             if (estado != null) {
    //                 if (estado.getId() != null) {
    //                     return cidadeService.autoCompleteComEstado(query, estado);
    //                 } else {
    //                     return cidadeService.autoComplete(query);
    //                 }
    //             } else {
    //                 return cidadeService.autoComplete(query);
    //             }
    //         } else {
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteCidade(String query) {
        // Obs: depende do estado/cep selecionados na tela (campos JSF); delegava a cidadeService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de LogradouroController.autoCompleteBairroEdita (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:458, camada controller)
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteBairroEdita(String query) {
    //         if (cidade != null && estado != null) {
    //             if (cidade.getId() != null && estado.getId() != null) {
    //                 return bairroService.autoCompleteComCidadeEstado(query, cidade, estado);
    //             }
    //         } else if (cidade != null) {
    //             if (cidade.getId() != null) {
    //                 return bairroService.autoCompleteComCidade(query, cidade);
    //             }
    //         } else {
    //             return bairroService.autoComplete(query);
    //         }
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteBairroEdita(String query) {
        // Obs: depende da cidade/estado selecionados na tela (campos JSF); delegava a bairroService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de LogradouroController.autoCompleteBairro (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:473, camada controller)
    // Logica original (adaptar):
    // public List<Bairro> autoCompleteBairro(String query) {
    //         if (stringcep == null) {
    //             if (cidade != null && estado != null) {
    //                 if (cidade.getId() != null && estado.getId() != null) {
    //                     return bairroService.autoCompleteComCidadeEstado(query, cidade, estado);
    //                 }
    //             } else if (cidade != null) {
    //                 if (cidade.getId() != null) {
    //                     return bairroService.autoCompleteComCidade(query, cidade);
    //                 }
    //             } else {
    //                 return bairroService.autoComplete(query);
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteBairro(String query) {
        // Obs: depende da cidade/estado/cep selecionados na tela (campos JSF); delegava a bairroService
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de LogradouroController.autoCompleteLogradouro (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:529, camada controller)
    // Logica original (adaptar):
    // public List<Logradouro> autoCompleteLogradouro(String query) {
    //         try {
    //             if (!query.equals("")) {
    //                 if (bairro != null) {
    //                     return logradouroService.autoCompleteComBairro(query, bairro);
    //                 }
    //                 return new ArrayList<>();
    //             } else {
    //                 if (bairro != null) {
    //                     if (bairro.getId() != null) {
    //                         return logradouroService.buscaLogradouro(bairro);
    //                     }
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteLogradouro(String query) {
        // Obs: depende do bairro selecionado na tela (campo JSF); delegava a logradouroService
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<List<Long>> autoCompleteLogradouroTroca(String query) {
        if (query == null || query.equals("")) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Opcoes ricas (id + descricao) para o autocomplete do dialogo "Troca e remocao logradouro",
    // excluindo o proprio logradouro de destino.
    public Uni<List<LogradouroResponse>> autoCompleteLogradouroTrocaOpcoes(String query, Long excluirId) {
        if (query == null || query.isBlank()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoComplete(query.toLowerCase().trim())
                .map(list -> list.stream()
                        .filter(item -> excluirId == null || !excluirId.equals(item.id))
                        .map(this::toResponse)
                        .toList());
    }


    // Migrado de LogradouroController.trocarLogradouros (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java)
    // Logica original:
    // for (Logradouro lll : listaLogradouro) {
    //     hibernateService.executeUpdateSQL("UPDATE bas_pessoa set id_logradouro = " + getEntity().getId() + " where id_logradouro=" + lll.getId());
    //     hibernateService.executeUpdateSQL("UPDATE bas_unidade set id_logradouro = " + getEntity().getId() + " where id_logradouro=" + lll.getId());
    // }
    // logradouroService.deleteAll(listaLogradouro);
    public Uni<Void> trocarLogradouros(Long destinoId, List<Long> origemIds) {
        if (destinoId == null || origemIds == null || origemIds.isEmpty()) {
            return Uni.createFrom().failure(new BadRequestException(
                    "Informe o logradouro de destino e ao menos um logradouro para trocar"));
        }
        List<Long> origens = origemIds.stream()
                .filter(id -> id != null && !destinoId.equals(id))
                .distinct()
                .toList();
        if (origens.isEmpty()) {
            return Uni.createFrom().failure(new BadRequestException("Nenhum logradouro valido para trocar"));
        }
        Uni<Void> cadeia = Uni.createFrom().voidItem();
        for (Long origemId : origens) {
            final long origem = origemId;
            cadeia = cadeia.onItem().transformToUni(ignored ->
                    io.quarkus.hibernate.reactive.panache.Panache.getSession()
                            .chain(session -> session.createNativeQuery(LogradouroRepository.SQL_TROCAR_PESSOA)
                                    .setParameter("destino", destinoId)
                                    .setParameter("origem", origem)
                                    .executeUpdate())
                            .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                            .chain(session -> session.createNativeQuery(LogradouroRepository.SQL_TROCAR_UNIDADE)
                                    .setParameter("destino", destinoId)
                                    .setParameter("origem", origem)
                                    .executeUpdate())
                            .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                            .chain(session -> session.createNativeQuery(LogradouroRepository.SQL_REMOVER_LOGRADOURO)
                                    .setParameter("origem", origem)
                                    .executeUpdate())
                            .replaceWithVoid());
        }
        return cadeia;
    }


    // Migrado de LogradouroController.autoCompleteLogradouroBusca (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:688, camada controller)
    // Logica original (adaptar):
    // public List<Logradouro> autoCompleteLogradouroBusca(String query) {
    //         try {
    //             if (!query.equals("")) {
    //                 if (bairro != null) {
    //                     return logradouroService.autoCompleteComBairro(query, bairro);
    //                 }
    //                 if (bairro == null && query == "") {
    //                     return new ArrayList<>();
    //                 }
    //             } else {
    //                 if (bairro != null) {
    //                     return logradouroService.buscaLogradouro(bairro);
    // // ... (truncado, ver fonte original)
    public Uni<List<Long>> autoCompleteLogradouroBusca(String query) {
        // Obs: depende do bairro selecionado na tela (campo JSF); delegava a logradouroService
        return Uni.createFrom().item(java.util.List.of());
    }

    public Uni<BuscarEnderecoResponse> buscarEnderecoCadastro(String cep) {
        return buscarEnderecoPorCep(cep);
    }

    public Uni<BuscarEnderecoResponse> buscarEndereco(String cep) {
        return buscarEnderecoPorCep(cep);
    }

    public Uni<List<Long>> autoCompleteComBairro(String query, Long bairroId) {
        return repository.find("bairroId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase().trim(), bairroId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Void> atualizar() {
        return repository.limparOrfaosNativo()
                .chain(() -> repository.buscaLogradouroSemLogradouro())
                .onItem().transformToUni(logradouros -> {
                    if (logradouros == null || logradouros.isEmpty()) {
                        return Uni.createFrom().voidItem();
                    }
                    Uni<Void> chain = Uni.createFrom().voidItem();
                    for (Logradouro logradouro : logradouros) {
                        final Logradouro log = logradouro;
                        chain = chain.onItem().transformToUni(ignored -> processarLogradouro(log));
                    }
                    return chain;
                });
    }

    private Uni<Void> processarLogradouro(Logradouro logradouro) {
        String cep = logradouro.cep;
        if (cep == null || cep.isBlank()) {
            return Uni.createFrom().voidItem();
        }
        String cepLimpo = cep.replace("-", "").replace(".", "").trim();
        return correioQualCep.getEndereco(cepLimpo)
                .onItem().transformToUni(endereco -> {
                    if (endereco == null || endereco.isBlank()) {
                        return Uni.createFrom().voidItem();
                    }
                    logradouro.descricao = endereco;
                    return correioQualCep.getBairro(cepLimpo)
                            .onItem().transformToUni(bairroNome -> {
                                if (bairroNome == null || bairroNome.isBlank()) {
                                    return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                            .chain(session -> session.merge(logradouro))
                                            .replaceWithVoid();
                                }
                                return bairroRepository.find("descricao = ?1", bairroNome)
                                        .firstResult()
                                        .onItem().transformToUni(bairroExistente -> {
                                            if (bairroExistente != null) {
                                                logradouro.bairroId = bairroExistente.id;
                                                return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                                        .chain(session -> session.merge(logradouro))
                                                        .replaceWithVoid();
                                            } else {
                                                Bairro novoBairro = new Bairro();
                                                novoBairro.descricao = bairroNome;
                                                return bairroRepository.persist(novoBairro)
                                                        .invoke(b -> logradouro.bairroId = b.id)
                                                        .chain(b -> io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                                                .chain(session -> session.merge(logradouro))
                                                                .replaceWithVoid());
                                            }
                                        });
                            });
                })
                .onFailure().recoverWithUni(throwable -> Uni.createFrom().voidItem());
    }


    public Uni<BuscarEnderecoResponse> buscarEnderecoPorCep(String cep) {
        String cepLimpo = cep.replace("-", "").replace(".", "").trim();
        return correioQualCep.getEndereco(cepLimpo)
                .onItem().transformToUni(endereco -> {
                    if (endereco == null || endereco.isBlank()) {
                        return Uni.createFrom().item(new BuscarEnderecoResponse(null, null, null));
                    }
                    return correioQualCep.getBairro(cepLimpo)
                            .onItem().transformToUni(bairroNome -> {
                                return correioQualCep.getCidade(cepLimpo)
                                        .onItem().transformToUni(cidadeNome -> {
                                            return correioQualCep.getUF(cepLimpo)
                                                    .onItem().transformToUni(uf -> {
                                                        return buscarOuCriarEndereco(cepLimpo, endereco, bairroNome, cidadeNome, uf);
                                                    });
                                        });
                            });
                })
                .onFailure().recoverWithUni(throwable -> Uni.createFrom().item(new BuscarEnderecoResponse(null, null, null)));
    }

    private Uni<BuscarEnderecoResponse> buscarOuCriarEndereco(String cep, String endereco, String bairroNome, String cidadeNome, String uf) {
        return repository.find("cep = ?1", cep).firstResult()
                .onItem().transformToUni(logradouroExistente -> {
                    Logradouro logradouro;
                    if (logradouroExistente != null) {
                        logradouro = logradouroExistente;
                        return Uni.createFrom().item(logradouro);
                    } else {
                        logradouro = new Logradouro();
                        logradouro.descricao = endereco;
                        logradouro.cep = cep;
                        return repository.persist(logradouro);
                    }
                })
                .onItem().transformToUni(logradouro -> {
                    if (bairroNome == null || bairroNome.isBlank()) {
                        return Uni.createFrom().item(new BuscarEnderecoResponse(toResponse(logradouro), null, null));
                    }
                    return bairroRepository.find("descricao = ?1", bairroNome).firstResult()
                            .onItem().transformToUni(bairroExistente -> {
                                Bairro bairro;
                                if (bairroExistente != null) {
                                    bairro = bairroExistente;
                                    return Uni.createFrom().item(bairro);
                                } else {
                                    bairro = new Bairro();
                                    bairro.descricao = bairroNome;
                                    if (cidadeNome != null && !cidadeNome.isBlank()) {
                                        return cidadeRepository.find("nome = ?1", cidadeNome).firstResult()
                                                .onItem().transformToUni(cidadeExistente -> {
                                                    if (cidadeExistente != null) {
                                                        bairro.cidadeId = cidadeExistente.id;
                                                    }
                                                    return bairroRepository.persist(bairro);
                                                });
                                    } else {
                                        return bairroRepository.persist(bairro);
                                    }
                                }
                            })
                            .onItem().transformToUni(bairro -> {
                                logradouro.bairroId = bairro.id;
                                return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                                        .chain(session -> session.merge(logradouro))
                                        .onItem().transformToUni(mergedLogradouro -> {
                                            if (bairro.cidadeId != null) {
                                                return cidadeRepository.findById(bairro.cidadeId)
                                                        .onItem().transform(cidade -> {
                                                            CidadeResponse cidadeResponse = null;
                                                            if (cidade != null) {
                                                                cidadeResponse = new CidadeResponse(cidade.id, cidade.nome, cidade.praca, cidade.area, cidade.ibge, cidade.estadoId);
                                                            }
                                                            return new BuscarEnderecoResponse(toResponse(mergedLogradouro), new BairroResponse(bairro.id, bairro.descricao, bairro.cidadeId), cidadeResponse);
                                                        });
                                            } else {
                                                return Uni.createFrom().item(new BuscarEnderecoResponse(toResponse(mergedLogradouro), new BairroResponse(bairro.id, bairro.descricao, bairro.cidadeId), null));
                                            }
                                        });
                            });
                });
    }

}
