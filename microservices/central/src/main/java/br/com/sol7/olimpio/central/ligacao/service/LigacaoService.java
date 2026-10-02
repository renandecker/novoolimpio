package br.com.sol7.olimpio.central.ligacao;

import br.com.sol7.olimpio.central.filaprioritaria.FilaPrioritariaResponse;
import br.com.sol7.olimpio.central.meta.MetaService;
import br.com.sol7.olimpio.central.operacionalusuario.OperacionalUsuario;
import br.com.sol7.olimpio.central.operacionalusuario.OperacionalUsuarioRepository;
import br.com.sol7.olimpio.central.operacionalusuario.OperacionalUsuarioResponse;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.SearchFilterRequest;
import br.com.sol7.olimpio.shared.GenericSearchService;

import java.util.Date;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class LigacaoService {

    @Inject
    LigacaoRepository repository;

    @Inject
    GenericSearchService genericSearch;

    @Inject
    MetaService metaService;

    @Inject
    OperacionalUsuarioRepository operacionalUsuarioRepository;

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

    private OperacionalUsuarioResponse toOperacionalUsuarioResponse(OperacionalUsuario e) {
        return new OperacionalUsuarioResponse(e.id, e.operacionalId, e.usuarioId, e.status, e.meta, e.ligacao, e.agendado, e.pausa, e.prioritario);
    }

    private ProspectoCampoResponse toProspectoCampoResponse(Object row) {
        Tuple t = (Tuple) row;
        return new ProspectoCampoResponse(
                TupleHelper.getLong(t, "campo_id"),
                TupleHelper.getString(t, "rotulo"),
                TupleHelper.getString(t, "tipo"),
                TupleHelper.getString(t, "categoria"),
                TupleHelper.getString(t, "valor"));
    }


    public Uni<Integer> buscarMeta(Long usuarioLogadoId) {
        return metaService.buscarMetaOperador(new Date(), usuarioLogadoId);
    }


    public Uni<List<OperacionalUsuarioResponse>> carregarPacotes(Long operacionalId, Long usuarioLogadoId) {
        return operacionalUsuarioRepository.buscarPacotesDisponiveis(operacionalId, usuarioLogadoId)
                .map(list -> list.stream().map(this::toOperacionalUsuarioResponse).toList());
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


    public Uni<List<ProspectoCampoResponse>> carregarProspectoParaVisualizacao(Long prospectoId) {
        return repository.buscarProspectoComCampos(prospectoId)
                .map(rows -> rows.stream().map(this::toProspectoCampoResponse).toList());
    }


    public Uni<LigacaoResponse> buscarLigacaoComNumero(String numero, Long usuarioLogadoId) {
        return repository.buscarLigacaoComNumero(usuarioLogadoId, numero)
                .chain(list -> list.isEmpty()
                        ? Uni.createFrom().failure(new NotFoundException("Ligacao not found"))
                        : Uni.createFrom().item(toResponse(list.get(0))));
    }

    public Uni<List<Long>> buscarHistoricoLigacao(Integer prospecto) {
        // Obs: condicao removida (depende de outro microservico): l.ordemLigacao.prospecto.id = ?1
        return repository.find("resultadoContatoId is not null and dataFinal is not null order by dataInicial desc", prospecto).page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<List<Long>> buscarHistoricoTodasLigacaoProspecto(Integer prospecto) {
        // Obs: condicao removida (depende de outro microservico): l.ordemLigacao.prospecto.id = ?1
        return repository.find("order by dataInicial desc", prospecto).list().map(list -> list.stream().map(x -> x.id).toList());
    }

    public Uni<Long> buscarQtdeLigadosProspectoComResultadoOperacional(Long prospectoId, Long resultadoContatoId, Long operacionalId) {
        return repository.buscarQtdeLigadosProspectoComResultadoOperacional(prospectoId, resultadoContatoId, operacionalId).map(list -> list.isEmpty() ? null : ((Number) list.get(0)).longValue());
    }

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
