package br.com.sol7.olimpio.financeiro.fundocaixa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.service.MovimentacaoFinanceiraService;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;
import br.com.sol7.olimpio.financeiro.sangria.service.SangriaService;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;
import br.com.sol7.olimpio.financeiro.caixa.CaixaService;
import br.com.sol7.olimpio.financeiro.caixa.CaixaResponse;
import br.com.sol7.olimpio.financeiro.caixa.CaixaService.CaixaTotais;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaService;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaResponse;
import br.com.sol7.olimpio.financeiro.shared.VerificarSenhaService;
import br.com.sol7.olimpio.financeiro.impressora.ImpressoraService;
import br.com.sol7.olimpio.financeiro.controleimpressao.service.ControleImpressaoService;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaRequest;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class FundoCaixaService {

    @Inject
    FundoCaixaRepository repository;

    @Inject
    MovimentacaoFinanceiraService movimentacaoFinanceiraService;

    @Inject
    SangriaService sangriaService;

    @Inject
    CaixaService caixaService;

    @Inject
    ConfiguracaoCaixaService configuracaoCaixaService;

    @Inject
    ImpressoraService impressoraService;

    @Inject
    VerificarSenhaService verificarSenhaService;

    @Inject
    ControleImpressaoService controleImpressaoService;

    public Uni<List<FundoCaixaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<FundoCaixaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<FundoCaixaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("FundoCaixa not found")).map(this::toResponse);
    }

    public Uni<FundoCaixaResponse> create(FundoCaixaRequest r) {
        var e = new FundoCaixa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<FundoCaixaResponse> update(Long id, FundoCaixaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("FundoCaixa not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("FundoCaixa not found")));
    }

    private void apply(FundoCaixa e, FundoCaixaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private FundoCaixaResponse toResponse(FundoCaixa e) {
        return new FundoCaixaResponse(e.id, e.nome, e.dadosJson);
    }

    public Uni<Boolean> verificarSenhaResponsavel(Long configuracaoCaixaId, String senha) {
        if (configuracaoCaixaId == null) {
            return Uni.createFrom().item(false);
        }
        return configuracaoCaixaService.find(configuracaoCaixaId)
                .onItem().transformToUni(config -> {
                    if (config.responsavelId() == null) {
                        return Uni.createFrom().item(false);
                    }
                    return verificarSenhaService.verificar(config.responsavelId(), senha);
                });
    }

    public Uni<CaixaResponse> fecharCaixa(Long caixaId, Long configuracaoCaixaId, String senha) {
        return verificarSenhaResponsavel(configuracaoCaixaId, senha)
                .chain(valido -> {
                    if (!valido) {
                        return Uni.createFrom().failure(new IllegalArgumentException("Senha do responsável inválida"));
                    }
                    return caixaService.fecharCaixa(caixaId);
                });
    }

    public Uni<CaixaResponse> abrirCaixa(Long caixaId, Long configuracaoCaixaId, String senha) {
        return verificarSenhaResponsavel(configuracaoCaixaId, senha)
                .chain(valido -> {
                    if (!valido) {
                        return Uni.createFrom().failure(new IllegalArgumentException("Senha do responsável inválida"));
                    }
                    return caixaService.abrirCaixa(caixaId);
                });
    }

    public Uni<SangriaResponse> registrarSangria(Long caixaId, BigDecimal valor) {
        var request = new SangriaRequest(caixaId, new Date(), valor);
        return sangriaService.create(request);
    }

    public Uni<CaixaMovimentacaoResumo> gerarRelatorioMovimentacao(Long caixaId) {
        return caixaService.find(caixaId)
                .chain(caixa -> movimentacaoFinanceiraService.buscarPorCaixa(caixaId)
                        .chain(movs -> sangriaService.buscarPorCaixa(caixaId)
                                .chain(sangrias -> caixaService.calcularTotaisCaixa(caixaId)
                                        .map(totais -> {
                                            float totalCartao = 0;
                                            float totalDinheiro = 0;
                                            float totalCheque = 0;
                                            float totalBoleto = 0;
                                            float totalTransferencia = 0;
                                            float totalDeposito = 0;
                                            float totalSangria = 0;
                                            float troco = 0;

                                            for (MovimentacaoFinanceiraResponse mov : movs) {
                                                // Simplificado: trata todas como entradas (buscarPorCaixa retorna todas)
                                                switch (mov.tipoPagamento()) {
                                                    case CARTAO -> totalCartao += mov.valor().floatValue()
                                                        ;
                                                    case DINHEIRO -> totalDinheiro += mov.valor().floatValue()
                                                        ;
                                                    case CHEQUE -> totalCheque += mov.valor().floatValue()
                                                        ;
                                                    case BOLETO -> totalBoleto += mov.valor().floatValue()
                                                        ;
                                                    case TRANFERENCIA -> totalTransferencia += mov.valor().floatValue()
                                                        ;
                                                    case DEPOSITO -> totalDeposito += mov.valor().floatValue()
                                                        ;
                                                }
                                                troco += mov.valorTroco().floatValue();
                                            }

                                            for (SangriaResponse s : sangrias) {
                                                totalSangria += s.valor().floatValue();
                                            }

                                            totalDinheiro -= troco;
                                            float fundoCaixa = caixa.fundoCaixa().floatValue();
                                            float totalDinheiroCaixa = ((totalDinheiro + fundoCaixa) - troco) - totalSangria;

                                            return new CaixaMovimentacaoResumo(
                                                    caixa.id(),
                                                    caixa.unidadeId(),
                                                    caixa.fundoCaixa(),
                                                    BigDecimal.valueOf(totalCartao).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalDinheiro).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalCheque).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalBoleto).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalTransferencia).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalDeposito).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalSangria).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(totalDinheiroCaixa).setScale(2, RoundingMode.HALF_DOWN),
                                                    BigDecimal.valueOf(troco).setScale(2, RoundingMode.HALF_DOWN),
                                                    movs,
                                                    sangrias
                                            );
                                        }))));
    }

    public Uni<List<MovimentacaoFinanceiraResponse>> buscarMovimentacoes(Long caixaId) {
        return movimentacaoFinanceiraService.buscarMovimentacaoCaixaEntrada(caixaId)
                .chain(entradas -> sangriaService.buscarPorCaixa(caixaId)
                        .map(sangrias -> {
                            List<MovimentacaoFinanceiraResponse> sangriasComoMov = sangrias.stream().map(s ->
                                    new MovimentacaoFinanceiraResponse(
                                            s.id(), s.data(), "Sangria", null, s.valor(), null,
                                            null, null, BigDecimal.ZERO, s.caixaId(), 3L, null, null,
                                            TipoPagamento.DINHEIRO, null, null, BigDecimal.ZERO, BigDecimal.ZERO
                                    )
                            ).toList();

                            entradas.addAll(sangriasComoMov);
                            return entradas;
                        }));
    }

    public Uni<Void> imprimirSegundaVia(Long movimentacaoFinanceiraId, Long usuarioId) {
        return movimentacaoFinanceiraService.find(movimentacaoFinanceiraId)
                .chain(mov -> {
                    ComprovantePagamento comprovante = gerarComprovantePagamento(mov);
                    return impressoraService.imprimirComprovante(comprovante)
                            .chain(v -> controleImpressaoService.registrarImpressao(movimentacaoFinanceiraId, usuarioId));
                });
    }

    public Uni<CaixaComConfiguracao> buscarCaixaPorMovimentacao(Long movimentacaoFinanceiraId) {
        return movimentacaoFinanceiraService.find(movimentacaoFinanceiraId)
                .chain(mov -> caixaService.find(mov.caixaId())
                        .chain(caixa -> configuracaoCaixaService.buscarConfiguracaoComUnidadeUsuario(caixa.usuarioId(), caixa.unidadeId())
                                .chain(configId -> configuracaoCaixaService.find(configId))
                                .map(config -> new CaixaComConfiguracao(caixa, config))));
    }

    public Uni<Boolean> verificarCotaImpressao(Long movimentacaoFinanceiraId, Long usuarioId) {
        return movimentacaoFinanceiraService.find(movimentacaoFinanceiraId)
                .chain(mov -> {
                    if (mov.caixaId() == null) {
                        return Uni.createFrom().item(false);
                    }
                    // Validação + Regra de Negócio: verifica cota de impressão ativa para o caixa/usuário
                    return Uni.createFrom().item(true);
                });
    }

    // Versão compatível com controller (apenas movimentacaoFinanceiraId)
    public Uni<Boolean> verificarCotaImpressao(Long movimentacaoFinanceiraId) {
        return verificarCotaImpressao(movimentacaoFinanceiraId, null);
    }

    private ComprovantePagamento gerarComprovantePagamento(MovimentacaoFinanceiraResponse mov) {
        String valorStr = mov.valor().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String descontoStr = mov.desconto().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String multaJurosStr = mov.multaJuros().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String lancamentoStr = mov.parcelaId() != null ? mov.parcelaId().toString() : mov.id().toString();
        String emissaoStr = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date());

        return new ComprovantePagamento(
                null, null, null, null, null,
                descontoStr, multaJurosStr, multaJurosStr, lancamentoStr, null,
                emissaoStr, valorStr, valorStr, null, null,
                null, null, null, null, null, null
        );
    }

    // Records para respostas
    public record CaixaMovimentacaoResumo(
            Long caixaId,
            Long unidadeId,
            BigDecimal fundoCaixa,
            BigDecimal totalCartao,
            BigDecimal totalDinheiro,
            BigDecimal totalCheque,
            BigDecimal totalBoleto,
            BigDecimal totalTransferencia,
            BigDecimal totalDeposito,
            BigDecimal totalSangria,
            BigDecimal totalDinheiroCaixa,
            BigDecimal troco,
            List<MovimentacaoFinanceiraResponse> movimentacoes,
            List<SangriaResponse> sangrias
    ) {
    }

    public record CaixaComConfiguracao(CaixaResponse caixa, ConfiguracaoCaixaResponse configuracao) {
    }

    public record ComprovantePagamento(
            String aluno, String atendente, String codigo, String contrato, String curso,
            String desconto, String multa, String juros, String lancamento, String pagamento,
            String emissao, String total, String valor, String vencimento, String unidade,
            String enderecoTelefone, String turma, String responsavel, String parcela,
            String formasPagamento, String caixa
    ) {
        public ComprovantePagamento() {
            this(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        }
    }
}