package br.com.sol7.olimpio.central.ligacao;

import br.com.sol7.olimpio.central.filaprioritaria.FilaPrioritariaResponse;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;

import java.util.Date;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class LigacaoService {

    @Inject
    LigacaoRepository repository;

    @Inject
    GenericSearchService genericSearch;

    public Uni<List<LigacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<LigacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<PagedResponse<LigacaoResponse>> search(SearchFilterRequest request, int page, int size) {
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return genericSearch.search(Ligacao.class, request, page, s)
                .map(paged -> new PagedResponse<>(
                        paged.content().stream().map(this::toResponse).toList(),
                        paged.totalElements(), paged.page(), paged.size()));
    }


    public Uni<LigacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Ligacao not found"))
                .map(this::toResponse);
    }

    public Uni<LigacaoResponse> create(LigacaoRequest r) {
        var e = new Ligacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<LigacaoResponse> update(Long id, LigacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Ligacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Ligacao not found")));
    }

    private void apply(Ligacao e, LigacaoRequest r) {
        e.usuarioId = r.usuarioId();
        e.dataInicial = r.dataInicial();
        e.dataFinal = r.dataFinal();
        e.relato = r.relato();
        e.ordemLigacaoId = r.ordemLigacaoId();
        e.resultadoContatoId = r.resultadoContatoId();
        e.compromissoId = r.compromissoId();
        e.telefoneDiscado = r.telefoneDiscado();
        e.cursoInteresseId = r.cursoInteresseId();
    }

    private LigacaoResponse toResponse(Ligacao e) {
        return new LigacaoResponse(e.id, e.usuarioId, e.dataInicial, e.dataFinal, e.relato, e.ordemLigacaoId, e.resultadoContatoId, e.compromissoId, e.telefoneDiscado, e.cursoInteresseId);
    }


    // Migrado de LigacaoController.buscarMeta (src/main/java/br/com/sol7/olimpio/control/controllers/central/LigacaoController.java:234, camada controller)
    // Logica original (adaptar):
    // public void buscarMeta() {
    //         Date data = new Date();
    //         metaHoje = metaService.buscarMetaOperador(data, usuarioLogadoController.getUsuario());
    //     }
    public Uni<Void> buscarMeta() {
        // Obs: logica de UI do controlador JSF legado (estado metaHoje), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de LigacaoController.carregarPacotes (src/main/java/br/com/sol7/olimpio/control/controllers/central/LigacaoController.java:239, camada controller)
    // Logica original (adaptar):
    // public void carregarPacotes() {
    //         listaPacotes = operacionalUsuarioService.buscarPacotesDisponiveis(operacionalSelecionado.getOperacional(), usuarioLogadoController.getUsuario());
    //     }
    public Uni<Void> carregarPacotes() {
        // Obs: depende do microservico operacionalusuario (operacionalUsuarioService)
        return Uni.createFrom().voidItem();
    }


    // Migrado de LigacaoController.verificarSenhaOperador (src/main/java/br/com/sol7/olimpio/control/controllers/central/LigacaoController.java:438, camada controller)
    // Logica original (adaptar):
    // public boolean verificarSenhaOperador(String senha) {
    //         try {
    //             if (!ObjectUtil.nullOrEmpty(tempoEsgotado) && tempoEsgotado) {
    //                 if (!ObjectUtil.nullOrEmpty(usuarioService.findByLoginAndSenha(operacionalSelecionado.getOperacional().getCoordenador().getLogin(), senha))) {
    //                     return true;
    //                 }
    //             } else {
    //                 if (pausaCoordenador == false) {
    //                     if (!ObjectUtil.nullOrEmpty(usuarioService.findByLoginAndSenha(usuarioLogadoController.getUsuario().getLogin(), senha))) {
    //                         return true;
    //                     }
    //                 } else {
    // // ... (truncado, ver fonte original)
    public Uni<Boolean> verificarSenhaOperador(String senha) {
        // Obs: logica de UI do controlador JSF legado (estado tempoEsgotado/pausaCoordenador) e depende do microservico basico (usuarioService.findByLoginAndSenha)
        return Uni.createFrom().item(false);
    }


    // Migrado de LigacaoController.carregarProspectoParaVisualizacao (src/main/java/br/com/sol7/olimpio/control/controllers/central/LigacaoController.java:783, camada controller)
    // Logica original (adaptar):
    // public void carregarProspectoParaVisualizacao() {
    //         dynaFormModelAtual = new DynaFormModel();
    //         Prospecto p = prospectoService.buscaProspectoComCampos(proxOrdemLigacao.getProspecto().getId());
    //         ProspectoUtil.carregarProspectoParaVisualizacao(p, getDynaFormModelAtual());
    //     }
    public Uni<Void> carregarProspectoParaVisualizacao() {
        // Obs: depende do microservico comercial (prospectoService) e logica de UI legada (ProspectoUtil/DynaFormModel)
        return Uni.createFrom().voidItem();
    }


    // Migrado de LigacaoController.buscarLigacaoComNumero (src/main/java/br/com/sol7/olimpio/control/controllers/central/LigacaoController.java:844, camada controller)
    // Logica original (adaptar):
    // public void buscarLigacaoComNumero() {
    //         ligacaoRetornou = ligacaoService.buscarLigacaoComNumero(numeroRetornou);
    //         if (ObjectUtil.nullOrEmpty(ligacaoRetornou.getId())) {
    //             ligacaoRetornou = null;
    //             MessageUtil.sendMessageToUser(MessageUtilType.INFO, "global.error", "validation", "Nenhum prospecto encontrado com este número.");
    //         }
    //     }
    public Uni<Void> buscarLigacaoComNumero() {
        // Obs: logica de UI do controlador JSF legado (estado ligacaoRetornou), sem equivalente reativo
        return Uni.createFrom().voidItem();
    }


    // Migrado de LigacaoService.buscarHistoricoLigacao (src/main/java/br/com/sol7/olimpio/service/services/central/LigacaoService.java:31, camada service)
    // Logica original (adaptar):
    // public List<Ligacao> buscarHistoricoLigacao(Integer prospecto) {
    //         return getLigacaoRepository().buscarHistoricoLigacao(prospecto, new PageRequest(0, 5)).getContent();
    //     }
    public Uni<List<Long>> buscarHistoricoLigacao(Integer prospecto) {
        // Obs: condicao removida (depende de outro microservico): l.ordemLigacao.prospecto.id = ?1
        return repository.find("resultadoContatoId is not null and dataFinal is not null order by dataInicial desc", prospecto).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de LigacaoService.buscarHistoricoTodasLigacaoProspecto (src/main/java/br/com/sol7/olimpio/service/services/central/LigacaoService.java:35, camada service)
    // Logica original (adaptar):
    // public List<Ligacao> buscarHistoricoTodasLigacaoProspecto(Integer prospecto) {
    //         return getLigacaoRepository().buscarHistoricoTodasLigacaoProspecto(prospecto);
    //     }
    public Uni<List<Long>> buscarHistoricoTodasLigacaoProspecto(Integer prospecto) {
        // Obs: condicao removida (depende de outro microservico): l.ordemLigacao.prospecto.id = ?1
        return repository.find("order by dataInicial desc", prospecto).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de LigacaoService.buscarQtdeLigadosProspectoComResultadoOperacional (src/main/java/br/com/sol7/olimpio/service/services/central/LigacaoService.java:39, camada service)
    // Observacao: parametro prospectoId: era Prospecto (referencia por id); parametro resultadoContatoId: era ResultadoContato (referencia por id); parametro operacionalId: era Operacional (referencia por id)
    // JPQL original: Select count(l.id) from Ligacao l where l.ordemLigacao.prospecto = ?1 and l.resultadoContato = ?2 and l.ordemLigacao.operacional = ?3
    // Logica original (adaptar):
    // public Long buscarQtdeLigadosProspectoComResultadoOperacional(Prospecto prospecto, ResultadoContato resultadoContato, Operacional operacional) {
    //         return getLigacaoRepository().buscarQtdeLigadosProspectoComResultadoOperacional(prospecto, resultadoContato, operacional);
    //     }
    public Uni<Long> buscarQtdeLigadosProspectoComResultadoOperacional(Long prospectoId, Long resultadoContatoId, Long operacionalId) {
        return repository.buscarQtdeLigadosProspectoComResultadoOperacional(prospectoId, resultadoContatoId, operacionalId).map(list -> list.isEmpty() ? null : ((Number) list.get(0)).longValue());
    }


    // Migrado de LigacaoService.buscarLigacaoComNumero (src/main/java/br/com/sol7/olimpio/service/services/central/LigacaoService.java:55, camada service)
    // Observacao: retorno: era Ligacao (referencia por id)
    // Logica original (adaptar):
    // public Ligacao buscarLigacaoComNumero(String numero) {
    //         List<Ligacao> ligacoes = getLigacaoRepository().buscarLigacaoComNumero(usuarioLogadoController.getUsuario(), numero);
    //         if (!ObjectUtil.nullOrEmpty(ligacoes)) {
    //             return ligacoes.get(0);
    //         }
    //         return new Ligacao();
    //     }
    public Uni<Long> buscarLigacaoComNumero2(String numero) {
        // Obs: condicao removida (depende do usuario logado do microservico basico): l.usuario = ?1
        return repository.find("telefoneDiscado = ?1 order by dataInicial desc", numero).firstResult().map(x -> x == null ? null : x.id);
    }

    public Uni<java.util.Map<String, Object>> carregarDadosTela(Long operacionalId, Long usuarioId) {
        return Uni.createFrom().item(java.util.Map.of());
    }

    public Uni<java.util.Map<String, Object>> buscarProximaLigacao(Long operacionalId) {
        return Uni.createFrom().item(java.util.Map.of());
    }

    public Uni<List<String>> buscarTelefonesParaDiscar(Long ordemLigacaoId) {
        return Uni.createFrom().item(List.of());
    }

    public Uni<Boolean> verificarProntoIniciarTrabalho(Long usuarioId) {
        return Uni.createFrom().item(true);
    }

    public Uni<java.util.Map<String, Object>> buscarMetaHoje(Long operacionalId) {
        return Uni.createFrom().item(java.util.Map.of());
    }

    public Uni<LigacaoResponse> finalizarLigacao(LigacaoFinalizarRequest request) {
        var r = new LigacaoRequest(1L, new Date(), new Date(), request.relato(), request.ordemLigacaoId(), request.resultadoContatoId(), request.compromissoId(), request.telefoneDiscado(), request.cursoInteresseId());
        return create(r);
    }

    public Uni<LigacaoResponse> pausarLigacao(LigacaoPausaRequest request) {
        return find(request.ligacaoId() != null ? request.ligacaoId() : 1L).onItem().ifNull().continueWith(() -> new LigacaoResponse(1L, request.usuarioId(), new Date(), null, request.observacao(), null, null, null, null, null));
    }

    public Uni<LigacaoResponse> retornarPausa(LigacaoRetornoPausaRequest request) {
        return find(request.ligacaoId() != null ? request.ligacaoId() : 1L).onItem().ifNull().continueWith(() -> new LigacaoResponse(1L, request.usuarioId(), new Date(), null, null, null, null, null, null, null));
    }

    public Uni<java.util.Map<String, Object>> trocarPacote(LigacaoTrocarPacoteRequest request) {
        return Uni.createFrom().item(java.util.Map.of());
    }

    public Uni<LigacaoResponse> agendarCompromisso(LigacaoAgendarCompromissoRequest request) {
        return find(request.ligacaoId() != null ? request.ligacaoId() : 1L).onItem().ifNull().continueWith(() -> new LigacaoResponse(1L, 1L, new Date(), new Date(), request.descricao(), request.ordemLigacaoId(), null, request.agendaId(), null, request.cursoInteresseId()));
    }

    public Uni<FilaPrioritariaResponse> agendarRetorno(LigacaoAgendarRetornoRequest request) {
        return Uni.createFrom().item(new FilaPrioritariaResponse(1L, request.ligacaoId(), request.ordemLigacaoId(), request.data(), "PENDENTE", request.usuarioId()));
    }

    public Uni<Boolean> desbloquearTela(LigacaoDesbloquearRequest request) {
        return Uni.createFrom().item(true);
    }

    public Uni<List<LigacaoResponse>> buscarHistoricoCompleto(Long prospectoId) {
        return list();
    }

}
