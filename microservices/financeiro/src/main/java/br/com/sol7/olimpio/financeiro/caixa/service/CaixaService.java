package br.com.sol7.olimpio.financeiro.caixa;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import java.util.Date;
import java.math.BigDecimal;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class CaixaService {

    @Inject CaixaRepository repository;

    // Migrado de SchedulingService.fechamentoCaixaAbertos() (legado) - fecha todos os caixas
    // em aberto e calcula entradas/saidas/sangria de cada um. NAO envia o e-mail de resumo
    // (dependia de RotinaEnvioEmailController + Layout da unidade no legado) - o resumo
    // calculado e devolvido para quem chamar decidir o que fazer (log, e-mail, etc) -
    // ver RELATORIO_SCHEDULE.md.
    public Uni<List<FechamentoCaixaResumo>> fechamentoAutomatico() {
        return repository.buscarCaixasAbertos().chain(lista -> {
            List<Uni<FechamentoCaixaResumo>> unis = lista.stream().map(caixa ->
                    Uni.combine().all().unis(
                            repository.somarEntradas(caixa.id),
                            repository.somarSaidas(caixa.id),
                            repository.somarSangria(caixa.id)
                    ).asTuple().chain(t -> repository.fecharCaixaNativo(caixa.id)
                            .replaceWith(new FechamentoCaixaResumo(caixa.id, caixa.unidadeId, t.getItem1(), t.getItem2(), t.getItem3())))
            ).toList();
            return Uni.join().all(unis).andFailFast();
        });
    }

    public record FechamentoCaixaResumo(Long caixaId, Long unidadeId, java.math.BigDecimal entradas,
                                         java.math.BigDecimal saidas, java.math.BigDecimal sangria) {}

    public Uni<List<CaixaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CaixaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CaixaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Caixa not found"))
                .map(this::toResponse);
    }

    public Uni<CaixaResponse> create(CaixaRequest r) {
        var e = new Caixa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CaixaResponse> update(Long id, CaixaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Caixa not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Caixa not found")));
    }

    private void apply(Caixa e, CaixaRequest r) { e.data = r.data(); e.dataFechamento = r.dataFechamento(); e.usuarioId = r.usuarioId(); e.fundoCaixa = r.fundoCaixa(); e.impressoraId = r.impressoraId(); e.unidadeId = r.unidadeId(); e.idCaixaUnidade = r.idCaixaUnidade(); e.documento = r.documento(); }

    private CaixaResponse toResponse(Caixa e) {
        return new CaixaResponse(e.id, e.data, e.dataFechamento, e.usuarioId, e.fundoCaixa, e.impressoraId, e.unidadeId, e.idCaixaUnidade, e.documento);
    }


    // Migrado de CaixaController.autoCompleteAlunoPagamentoPendente (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:269, camada controller)
    // Logica original (adaptar):
    // public List<Pessoa> autoCompleteAlunoPagamentoPendente(String query) {
    //         if(caixaUnico){
    //             return contratoService.autoCompleteAlunoPagamentoPendenteUnidade(query, caixa.getUnidade());
    //         }
    //         return contratoService.autoCompleteAlunoPagamentoPendente(query);
    //     }
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendente(String query) {
        // Obs: depende do microservico comercial (contratoService.autoCompleteAlunoPagamentoPendente / autoCompleteAlunoPagamentoPendenteUnidade)
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CaixaController.buscarDetalheCaixaParcelas (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:276, camada controller)
    // Observacao: parametro event: era ToggleEvent no legado
    // Logica original (adaptar):
    // public void buscarDetalheCaixaParcelas(ToggleEvent event) {
    //         if (event.getVisibility() == Visibility.VISIBLE) {
    //             MovimentacaoFinanceira mmm = (MovimentacaoFinanceira) event.getData();
    //             FilterParcelaMovimentacaoFinanceira filterParcela = new FilterParcelaMovimentacaoFinanceira(mmm);
    //             parcelasDetalhes = new BaseLazyModelJPASpecific<Parcela>(parcelaService.getParcelaRepository(), filterParcela);
    //         }
    //     }
    public Uni<Void> buscarDetalheCaixaParcelas(String event) {
        // Obs: metodo de UI no legado (seta BaseLazyModelJPASpecific de parcelasDetalhes); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }


    // Migrado de CaixaController.autoCompleteMovimento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:377, camada controller)
    // Logica original (adaptar):
    // public List<Movimento> autoCompleteMovimento(String query) {
    //         if (categoriaFinanceira.getId() != null) {
    //             return movimentoService.autoCompleteComTipo(query, categoriaFinanceira);
    //         }
    //         return new ArrayList<>();
    //     }
    public Uni<List<Long>> autoCompleteMovimento(String query) {
        // Obs: depende do estado de UI (categoriaFinanceira.getId()) nao disponivel na assinatura
        return Uni.createFrom().item(java.util.List.of());
    }


    // Migrado de CaixaController.verificarSenhaResponsavel (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:559, camada controller)
    // Logica original (adaptar):
    // private boolean verificarSenhaResponsavel() {
    //         try {
    //             if (configuracaoCaixa == null) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Necess\u00E1rio configurar o caixa para esse usu\u00E1rio");
    //                 return false;
    //             }
    // 
    //             if (!ObjectUtil.nullOrEmpty(usuarioService.findByLoginAndSenha(configuracaoCaixa.getResponsavel().getLogin(), senha))) {
    //                 return true;
    //             } else {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Senha inválida, digite sua senha do autorizador " + configuracaoCaixa.getRespons ...
    // // ... (truncado, ver fonte original)
    public Uni<Boolean> verificarSenhaResponsavel() {
        // Obs: depende do estado de UI (configuracaoCaixa) e do microservico basico (usuarioService.findByLoginAndSenha)
        return Uni.createFrom().item(false);
    }


    // Migrado de CaixaController.verificarSenhaOperador (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:581, camada controller)
    // Logica original (adaptar):
    // private boolean verificarSenhaOperador() {
    //         try {
    //             if (configuracaoCaixa == null) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Necess\u00E1rio configurar o caixa para esse usu\u00E1rio");
    //                 return false;
    //             }
    // 
    //             if (!ObjectUtil.nullOrEmpty(usuarioService.findByLoginAndSenha(configuracaoCaixa.getUsuario().getLogin(), senha))) {
    //                 return true;
    //             } else {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Senha inválida, digite sua senha do operador " + configuracaoCaixa.getResponsavel().get ...
    // // ... (truncado, ver fonte original)
    public Uni<Boolean> verificarSenhaOperador() {
        // Obs: depende do estado de UI (configuracaoCaixa) e do microservico basico (usuarioService.findByLoginAndSenha)
        return Uni.createFrom().item(false);
    }


    // Migrado de CaixaController.imprimirComprovantePagamento (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:604, camada controller)
    // Logica original (adaptar):
    // private void imprimirComprovantePagamento() {
    //         //FIXME teste
    //         parcela.setValorPago(new BigDecimal(valorCobrado));
    //         parcela.setUsuario(usuarioLogadoController.getUsuario());
    //         parcela.setCodigoVerificador(numerosAleatorios(10) + parcela.getId().toString());
    // 
    //         ComprovantePagamento comprovantePagamento = atributosCompovante();
    //         impressoraController.imprimeComprovante(comprovantePagamento);
    //     }
    public Uni<Void> imprimirComprovantePagamento() {
        // Obs: depende do microservico comercial (Parcela) e basico (impressoraController.imprimeComprovante)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CaixaController.buscarNumeroParcela (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:736, camada controller)
    // Logica original (adaptar):
    // public void buscarNumeroParcela() {
    //         try {
    //             limpaPagamento();
    //             if (parcelaService.findById(numeroLancamento) == null) {
    //                 MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Parcela não encontrada.");
    //                 return;
    //             }
    //             if(caixaUnico){
    //                 parcela = parcelaService.obterParcelaDaunidade(numeroLancamento,caixa.getUnidade().getId());
    //             }else{
    //                 parcela = parcelaService.findById(numeroLancamento);
    //             }
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarNumeroParcela() {
        // Obs: depende do microservico comercial (parcelaService.findById / obterParcelaDaunidade)
        return Uni.createFrom().voidItem();
    }


    // Migrado de CaixaController.buscarParcela (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:757, camada controller)
    // Logica original (adaptar):
    // private void buscarParcela() {
    //         cheque = new Cheque();
    //         transferencia = new Transferencia();
    //         deposito = new Deposito();
    //         cartao = new PagamentoCartao();
    //         cartao.setTipoPagamentoCartao(TipoPagamentoCartao.DEBITO);
    //         valorRecebido = 0;
    //         valorCobrado = 0;
    //         juros = 0;
    //         desconto = 0;
    //         troco = 0;
    //         multa = 0;
    // // ... (truncado, ver fonte original)
    public Uni<Void> buscarParcela() {
        // Obs: metodo de UI no legado (inicializa cheque/transferencia/deposito/cartao e valores de tela); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }


    // Migrado de CaixaController.buscarParcelasAluno (src/main/java/br/com/sol7/olimpio/control/controllers/financeiro/CaixaController.java:1486, camada controller)
    // Logica original (adaptar):
    // public void buscarParcelasAluno() {
    //         limpaPagamento();
    //         parcela = null;
    //         listarParcelas();
    //     }
    public Uni<Void> buscarParcelasAluno() {
        // Obs: metodo de UI no legado (limpaPagamento + listarParcelas); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }


    // Migrado de CaixaService.buscarAberturaCaixa (src/main/java/br/com/sol7/olimpio/service/services/financeiro/CaixaService.java:27, camada service)
    // Observacao: parametro usuarioId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public List<Caixa> buscarAberturaCaixa(Usuario usuario) {
    //         return getCaixaRepository().buscarAberturaCaixa(usuario);
    //     }
    public Uni<List<Long>> buscarAberturaCaixa(Long usuarioId) {
                return repository.find("usuarioId = ?1 and date(data) = current_date order by id", usuarioId).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de CaixaService.buscarAberturaCaixaComUsuarioUnidade (src/main/java/br/com/sol7/olimpio/service/services/financeiro/CaixaService.java:31, camada service)
    // Observacao: retorno: era Caixa (referencia por id); parametro usuarioId: era Usuario (referencia por id); parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public Caixa buscarAberturaCaixaComUsuarioUnidade(Usuario usuario, Unidade unidade) {
    //         return getCaixaRepository().buscarAberturaCaixaComUsuarioUnidade(usuario, unidade);
    //     }
    public Uni<Long> buscarAberturaCaixaComUsuarioUnidade(Long usuarioId, Long unidadeId) {
                return repository.find("usuarioId = ?1 and unidadeId = ?2 and date(data) = current_date", usuarioId, unidadeId).firstResult().map(x -> x == null ? null : x.id);
    }

}
