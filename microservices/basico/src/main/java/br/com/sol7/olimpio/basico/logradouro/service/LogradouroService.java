package br.com.sol7.olimpio.basico.logradouro.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroRequest;
import br.com.sol7.olimpio.basico.logradouro.dto.LogradouroResponse;
import br.com.sol7.olimpio.basico.logradouro.entity.Logradouro;
import br.com.sol7.olimpio.basico.logradouro.repository.LogradouroRepository;

@ApplicationScoped
@WithTransaction
public class LogradouroService {

    @Inject
    LogradouroRepository repository;

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
    public Uni<Void> atualizarTodosLogradouro() {
        // Obs: preenchimento automatico via webservice dos Correios (CorreioQualCep) -
        // integracao externa, ver RELATORIO_SCHEDULE.md
        return Uni.createFrom().voidItem();
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
    public Uni<Void> atualizarTodosCoordenadaAPI() {
        // Obs: coordenadas via webservice dos Correios (CorreioCepAberto) - integracao externa
        return Uni.createFrom().voidItem();
    }


    // Migrado de LogradouroController.atualizarCoordenadaAPI (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:180, camada controller)
    // Observacao: parametro logradouroId: era Logradouro (referencia por id)
    // Logica original (adaptar):
    // private void atualizarCoordenadaAPI(Logradouro logradouro, String token) {
    //         CorreioCepAberto correio = new CorreioCepAberto();
    //         if (ObjectUtil.nullOrEmpty(logradouro.getLatitude()) && ObjectUtil.nullOrEmpty(logradouro.getLongitude())) {
    //             if (ObjectUtil.nullOrEmpty(token)) {
    //                 List<ConfiguracaoEmail> configuracaoEmail = configuracaoEmailService.busaConfiguracaoEmailPadrao();
    // 
    //                 token = configuracaoEmail.get(0).getTokenCorreio();
    //             }
    //             String coordenada = "";
    //             try {
    //                 coordenada = ObjectUtil.nullOrEmptyObject(correio.getLatLongApi(logradouro.getCep(), token));
    //             } catch (Exception e) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarCoordenadaAPI(Long logradouroId, String token) {
        // Obs: coordenadas via webservice dos Correios (CorreioCepAberto) - integracao externa
        return Uni.createFrom().voidItem();
    }


    // Migrado de LogradouroController.atualizarLogradouro (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:210, camada controller)
    // Observacao: parametro logradouroId: era Logradouro (referencia por id)
    // Logica original (adaptar):
    // public void atualizarLogradouro(Logradouro logradouro) {
    //         CorreioQualCep correio = new CorreioQualCep();
    // 
    //         String novologradouro = "";
    //         try {
    //             novologradouro = ObjectUtil.nullOrEmptyObject(correio.getEndereco(logradouro.getCep()));
    //         } catch (IOException e) {
    //             novologradouro = "";
    //         }
    //         if (!ObjectUtil.nullOrEmpty(novologradouro)) {
    //             logradouro.setDescricao(novologradouro);
    //             if (ObjectUtil.nullOrEmpty(logradouro.getBairro())) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizarLogradouro(Long logradouroId) {
        // Obs: preenchimento automatico via webservice dos Correios (CorreioQualCep) -
        // integracao externa, ver RELATORIO_SCHEDULE.md
        return Uni.createFrom().voidItem();
    }


    // Migrado de LogradouroController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:418, camada controller)
    // Logica original (adaptar):
    // public List<Logradouro> autoComplete(String query) {
    //         return logradouroService.autoComplete(query);
    //     }
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


    // Migrado de LogradouroController.autoCompleteLogradouroTroca (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:549, camada controller)
    // Logica original (adaptar):
    // public List<Logradouro> autoCompleteLogradouroTroca(String query) {
    //         try {
    //             if (!query.equals("")) {
    //                 return logradouroService.autoComplete(query);
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


    // Migrado de LogradouroController.buscarEnderecoCadastro (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:760, camada controller)
    // Logica original (adaptar):
    // public void buscarEnderecoCadastro(String cep) {
    //         stringcep = cep;
    //         buscarEndereco();
    //         setEntity(logradouro);
    //     }
    public Uni<Void> buscarEnderecoCadastro(String cep) {
        // Obs: metodo de UI do controller JSF (setar campos de tela e navegar)
        return Uni.createFrom().voidItem();
    }


    // Migrado de LogradouroController.buscarEndereco (src/main/java/br/com/sol7/olimpio/control/controllers/basico/LogradouroController.java:766, camada controller)
    // Logica original (adaptar):
    // public void buscarEndereco() {
    //         if (stringcep != null) {
    //             stringcep = stringcep.replace("-", "");
    //             stringcep = stringcep.replace(".", "");
    //             listaLogradouro = logradouroService.buscaCep(stringcep);
    //             if (!ObjectUtil.nullOrEmpty(listaLogradouro)) {
    //                 listaBairro = new ArrayList<>();
    //                 listaCidade = new ArrayList<>();
    //                 bairro = new Bairro();
    //                 cidade = new Cidade();
    //                 logradouro = new Logradouro();
    //                 if (!ObjectUtil.nullOrEmpty(listaLogradouro)) {
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarEndereco() {
        // Obs: metodo de UI do controller JSF (popula listas de logradouros/bairros/cidades na tela)
        return Uni.createFrom().voidItem();
    }


    // Migrado de LogradouroService.autoCompleteComBairro (src/main/java/br/com/sol7/olimpio/service/services/basico/LogradouroService.java:59, camada service)
    // Observacao: parametro bairroId: era Bairro (referencia por id)
    // Logica original (adaptar):
    // public List<Logradouro> autoCompleteComBairro(String query, Bairro bairro) {
    //         return this.getLogradouroRepository().autoCompleteComBairro(query.toLowerCase().trim(), bairro, new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoCompleteComBairro(String query, Long bairroId) {
        return repository.find("bairroId = ?2 and (lower(descricao) like '%' || ?1 || '%') order by descricao", query.toLowerCase().trim(), bairroId).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de LogradouroService.atualizar (src/main/java/br/com/sol7/olimpio/service/services/basico/LogradouroService.java:75, camada service)
    // Logica original (adaptar):
    // public void atualizar() {
    //         hibernateService.executeUpdateSQL("DELETE FROM bas_logradouro log WHERE " +
    //                 " not exists(select pes.id FROM bas_pessoa pes WHERE log.id = pes.id_logradouro )" +
    //                 " and " +
    //                 " not exists(select pes.id FROM bas_unidade pes WHERE log.id = pes.id_logradouro )");
    // 
    //         hibernateService.executeUpdateSQL("DELETE FROM bas_bairro log WHERE" +
    //                 "    not exists(select pes.id FROM bas_logradouro pes WHERE log.id = pes.id_bairro )");
    // 
    //         CorreioQualCep correioQualCep = new CorreioQualCep();
    // 
    //         List<Logradouro> logradouros = this.getLogradouroRepository().buscaLogradouroSemLogradouro();
    // // ... (truncado, ver fonte original)
    public Uni<Void> atualizar() {
        // Implementado: limpeza de logradouros/bairros orfaos (via SQL).
        // NAO implementado: preenchimento automatico de logradouro/bairro via webservice dos
        // Correios (CorreioQualCep) - integracao externa, ver RELATORIO_SCHEDULE.md.
        return repository.limparOrfaosNativo();
    }

}
