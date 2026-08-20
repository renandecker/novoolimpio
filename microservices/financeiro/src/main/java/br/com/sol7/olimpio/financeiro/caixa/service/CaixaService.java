package br.com.sol7.olimpio.financeiro.caixa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaService;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.service.MovimentacaoFinanceiraService;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.repository.MovimentacaoFinanceiraRepository;
import br.com.sol7.olimpio.financeiro.sangria.service.SangriaService;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaRequest;
import br.com.sol7.olimpio.financeiro.impressora.ImpressoraService;
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
public class CaixaService {

    @Inject
    CaixaRepository repository;
    @Inject
    MovimentacaoFinanceiraService movimentacaoFinanceiraService;
    @Inject
    MovimentacaoFinanceiraRepository movimentacaoRepository;
    @Inject
    SangriaService sangriaService;
    @Inject
    ConfiguracaoCaixaService configuracaoCaixaService;
    @Inject
    ImpressoraService impressoraService;
    // @Inject UsuarioService usuarioService; // Cross-service
    // @Inject ControleImpressaoService controleImpressaoService; // Não existe ainda
    // @Inject ParcelaService parcelaService; // Cross-service (comercial)

    // Migrado de SchedulingService.fechamentoCaixaAbertos() (legado)
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
                                        java.math.BigDecimal saidas, java.math.BigDecimal sangria) {
    }

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

    private void apply(Caixa e, CaixaRequest r) {
        e.data = r.data();
        e.dataFechamento = r.dataFechamento();
        e.usuarioId = r.usuarioId();
        e.fundoCaixa = r.fundoCaixa();
        e.impressoraId = r.impressoraId();
        e.unidadeId = r.unidadeId();
        e.idCaixaUnidade = r.idCaixaUnidade();
        e.documento = r.documento();
    }

    private CaixaResponse toResponse(Caixa e) {
        return new CaixaResponse(e.id, e.data, e.dataFechamento, e.usuarioId, e.fundoCaixa, e.impressoraId, e.unidadeId, e.idCaixaUnidade, e.documento);
    }

    // Migrado de CaixaController.autoCompleteAlunoPagamentoPendente
    public Uni<List<Long>> autoCompleteAlunoPagamentoPendente(String query) {
        // Obs: depende do microservico comercial (contratoService.autoCompleteAlunoPagamentoPendente / autoCompleteAlunoPagamentoPendenteUnidade)
        return Uni.createFrom().item(java.util.List.of());
    }

    // Migrado de CaixaController.buscarDetalheCaixaParcelas
    public Uni<Void> buscarDetalheCaixaParcelas(String event) {
        // Obs: metodo de UI no legado (seta BaseLazyModelJPASpecific de parcelasDetalhes); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaController.autoCompleteMovimento
    public Uni<List<Long>> autoCompleteMovimento(String query) {
        // Obs: depende do estado de UI (categoriaFinanceira.getId()) nao disponivel na assinatura
        return Uni.createFrom().item(java.util.List.of());
    }

    // ===== MÉTODOS MIGRADOS DO CAIXACONTROLLER/CAIXASERVICE ORIGINAL =====

    // Migrado de CaixaController.verificarSenhaResponsavel
    // Verifica senha do responsável configurado no caixa
    public Uni<Boolean> verificarSenhaResponsavel(Long configuracaoCaixaId, String senha) {
        if (configuracaoCaixaId == null) {
            return Uni.createFrom().item(false);
        }
        return configuracaoCaixaService.find(configuracaoCaixaId)
                .onItem().transformToUni(config -> {
                    if (config.responsavelId() == null) {
                        return Uni.createFrom().item(false);
                    }
                    // TODO: Chamar microserviço básico para verificar senha
                    // return usuarioService.verificarSenha(config.responsavelId(), senha);
                    return Uni.createFrom().item(false); // Stub
                });
    }

    // Migrado de CaixaController.verificarSenhaOperador
    // Verifica senha do operador configurado no caixa
    public Uni<Boolean> verificarSenhaOperador(Long configuracaoCaixaId, String senha) {
        if (configuracaoCaixaId == null) {
            return Uni.createFrom().item(false);
        }
        return configuracaoCaixaService.find(configuracaoCaixaId)
                .onItem().transformToUni(config -> {
                    if (config.usuarioId() == null) {
                        return Uni.createFrom().item(false);
                    }
                    // TODO: Chamar microserviço básico para verificar senha
                    // return usuarioService.verificarSenha(config.usuarioId(), senha);
                    return Uni.createFrom().item(false); // Stub
                });
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Boolean> verificarSenhaResponsavel() {
        return Uni.createFrom().item(false);
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Boolean> verificarSenhaOperador() {
        return Uni.createFrom().item(false);
    }

    // Migrado de CaixaController.fecharCaixa (via FundoCaixaController)
    // Fecha o caixa com data de fechamento atual
    public Uni<CaixaResponse> fecharCaixa(Long caixaId) {
        return find(caixaId)
                .chain(caixa -> {
                    if (caixa.dataFechamento() != null) {
                        return Uni.createFrom().failure(new IllegalStateException("Caixa já está fechado"));
                    }
                    // Atualizar data_fechamento via native query
                    return repository.fecharCaixaNativo(caixaId)
                            .replaceWith(find(caixaId));
                });
    }

    // Migrado de CaixaController.abrirCaixa (via FundoCaixaController)
    // Abre o caixa removendo a data de fechamento
    public Uni<CaixaResponse> abrirCaixa(Long caixaId) {
        return find(caixaId)
                .chain(caixa -> {
                    if (caixa.dataFechamento() == null) {
                        return Uni.createFrom().failure(new IllegalStateException("Caixa já está aberto"));
                    }
                    return repository.abrirCaixaNativo(caixaId)
                            .replaceWith(find(caixaId));
                });
    }

    // Migrado de CaixaController.registrarSangriaSegundaVia
    // Registra uma sangria (retirada de dinheiro do caixa)
    public Uni<SangriaResponse> registrarSangria(Long caixaId, BigDecimal valor) {
        var request = new SangriaRequest(caixaId, new Date(), valor);
        return sangriaService.create(request);
    }

    // Migrado de CaixaController.relatorioMov / totalRelatorio
    // Calcula totais do caixa por forma de pagamento
    public Uni<CaixaTotais> calcularTotaisCaixa(Long caixaId) {
        return Uni.combine().all().unis(
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "DINHEIRO"),
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "CHEQUE"),
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "CARTAO"),
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "BOLETO"),
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "TRANFERENCIA"),
                movimentacaoRepository.totalPorFormaPagamento(caixaId, "DEPOSITO"),
                movimentacaoRepository.totalTroco(caixaId),
                movimentacaoRepository.totaisParcela(caixaId),
                sangriaService.buscarPorCaixa(caixaId),
                find(caixaId)
        ).combinedWith(list -> {
            BigDecimal totalDinheiro = (BigDecimal) list.get(0);
            BigDecimal totalCheque = (BigDecimal) list.get(1);
            BigDecimal totalCartao = (BigDecimal) list.get(2);
            BigDecimal totalBoleto = (BigDecimal) list.get(3);
            BigDecimal totalTransferencia = (BigDecimal) list.get(4);
            BigDecimal totalDeposito = (BigDecimal) list.get(5);
            BigDecimal troco = (BigDecimal) list.get(6);
            Object[] totaisParcela = (Object[]) list.get(7);
            @SuppressWarnings("unchecked")
            List<SangriaResponse> sangrias = (List<SangriaResponse>) list.get(8);
            CaixaResponse caixa = (CaixaResponse) list.get(9);

            BigDecimal totalSangria = sangrias.stream()
                    .map(SangriaResponse::valor)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal valorTotalParcela = totaisParcela != null && totaisParcela.length >= 1 ? (BigDecimal) totaisParcela[0] : BigDecimal.ZERO;
            BigDecimal totalDesconto = totaisParcela != null && totaisParcela.length >= 2 ? (BigDecimal) totaisParcela[1] : BigDecimal.ZERO;
            BigDecimal totalMultaJuros = totaisParcela != null && totaisParcela.length >= 3 ? (BigDecimal) totaisParcela[2] : BigDecimal.ZERO;

            totalDinheiro = totalDinheiro.subtract(troco);
            BigDecimal fundoCaixa = caixa.fundoCaixa();
            BigDecimal totalDinheiroCaixa = totalDinheiro.add(fundoCaixa).subtract(troco).subtract(totalSangria);

            return new CaixaTotais(
                    totalDinheiro, totalCheque, totalCartao, totalBoleto,
                    totalTransferencia, totalDeposito, totalSangria, troco,
                    fundoCaixa, totalDinheiroCaixa,
                    valorTotalParcela, totalDesconto, totalMultaJuros
            );
        });
    }

    // Migrado de CaixaController.buscarMovimentacoes (via FundoCaixaController)
    // Busca movimentações de entrada do caixa + sangrias
    public Uni<List<MovimentacaoFinanceiraResponse>> buscarMovimentacaoCaixaEntrada(Long caixaId) {
        return movimentacaoFinanceiraService.buscarPorCaixa(caixaId)
                .chain(entradas -> sangriaService.buscarPorCaixa(caixaId)
                        .map(sangrias -> {
                            List<MovimentacaoFinanceiraResponse> entradasFiltradas = entradas.stream()
                                    .filter(m -> m.movimentoId() != null)
                                    .collect(java.util.stream.Collectors.toList());

                            List<MovimentacaoFinanceiraResponse> sangriasComoMov = sangrias.stream().map(s ->
                                    new MovimentacaoFinanceiraResponse(
                                            s.id(), s.data(), "Sangria", null, s.valor(), null,
                                            null, null, BigDecimal.ZERO, s.caixaId(), 3L, null, null,
                                            br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento.DINHEIRO, null, null, BigDecimal.ZERO, BigDecimal.ZERO
                                    )
                            ).toList();

                            entradasFiltradas.addAll(sangriasComoMov);
                            return entradasFiltradas;
                        }));
    }

    // Migrado de CaixaController.imprimirComprovantePagamento
    // Imprime comprovante de pagamento de parcela
    public Uni<Void> imprimirComprovantePagamento(Long movimentacaoFinanceiraId, Long usuarioId) {
        return movimentacaoFinanceiraService.find(movimentacaoFinanceiraId)
                .chain(mov -> {
                    ComprovantePagamento comprovante = gerarComprovantePagamento(mov);
                    return impressoraService.imprimirComprovante(comprovante)
                            .chain(v -> {
                                // TODO: Registrar controle de impressão
                                // return controleImpressaoService.registrarImpressao(movimentacaoFinanceiraId, usuarioId);
                                return Uni.createFrom().voidItem();
                            });
                });
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Void> imprimirComprovantePagamento() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaController.buscarNumeroParcela
    // Busca parcela por número (ID) e valida se pertence à unidade do caixa
    public Uni<ParcelaResponse> buscarNumeroParcela(Long numeroLancamento, Long caixaId, boolean caixaUnico) {
        // TODO: Chamar microserviço comercial (parcelaService)
        // if (caixaUnico) {
        //     return parcelaService.obterParcelaDaUnidade(numeroLancamento, caixa.unidadeId);
        // } else {
        //     return parcelaService.findById(numeroLancamento);
        // }
        return Uni.createFrom().item(null); // Stub
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Void> buscarNumeroParcela() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaService.buscarAberturaCaixa (original service)
    public Uni<List<Long>> buscarAberturaCaixa(Long usuarioId) {
        return repository.find("usuarioId = ?1 and date(data) = current_date order by id", usuarioId).list()
                .map(list -> list.stream().map(x -> x.id).toList());
    }

    // Migrado de CaixaService.buscarAberturaCaixaComUsuarioUnidade (original service)
    public Uni<Long> buscarAberturaCaixaComUsuarioUnidade(Long usuarioId, Long unidadeId) {
        return repository.find("usuarioId = ?1 and unidadeId = ?2 and date(data) = current_date", usuarioId, unidadeId).firstResult()
                .map(x -> x == null ? null : x.id);
    }

    // Migrado de CaixaService.textoEmailCaixa (original service)
    // Gera HTML do e-mail de fechamento automático de caixa
    public Uni<String> gerarTextoEmailCaixa(Long caixaId, LayoutDTO layout) {
        return find(caixaId)
                .chain(caixa -> calcularTotaisCaixa(caixaId)
                        .map(totais -> {
                            String nome = "Usuário " + caixa.usuarioId(); // TODO: buscar nome do usuário

                            String imagem = "";
                            if (layout != null && layout.url() != null && !layout.url().isEmpty()) {
                                imagem = "<img width=\"30\" src=\"" + layout.imagemEmail() + "\" alt=\"\">";
                            }

                            String mensagem = "Este caixa foi fechado automaticamente, pois o usuário " + nome + " não fechou.";

                            return "<table width=\"500\" border=\"1\" cellpadding=\"1\" cellspacing=\"1\" align=\"center\" style=\"background-color: #F0F0F0; border-collapse: collapse; border-color: #F0F0F0;\">" +
                                    "<tbody><tr style=\"background-color: #" + (layout != null ? layout.temaEmail() : "000000") + ";\"><td><p style=\"text-align: center; margin: 0;\"><span style=\"font-size: larger;\">" +
                                    " " + imagem + "</span></p></td></tr><tr><td><p>&nbsp;</p>" +
                                    "<p style=\"margin: 5px;\">" + mensagem +
                                    "</td></tr>" +
                                    "<br/>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px;\">" +
                                    "Nome Funcionário: " + nome +
                                    "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px;\">" +
                                    "Nome Unidade: " + caixa.unidadeId() + // TODO: buscar sucinto da unidade
                                    "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px;\">" +
                                    "Total Entradas: R$ " + totais.totalEntradas().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") +
                                    "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px;\">" +
                                    "Total Saídas: R$ " + totais.totalSaidas().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") +
                                    "</td>" +
                                    "</tr>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px;\">" +
                                    "Total Sangria: R$ " + totais.totalSangria().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") +
                                    "</td>" +
                                    "</tr>" +
                                    "<br/>" +
                                    "<br/>" +
                                    "<tr>" +
                                    "<td style = \" padding-left: 8px; font-size: 15px; font-weight: bold;\">" +
                                    "Número caixa: " + caixa.idCaixaUnidade() +
                                    "</td><tr><td style = \"text-align: center;\" >" +
                                    "<a href=\"" + (layout != null ? layout.url() : "") + "\">Acesse a plataforma clicando aqui.</a></p><p>&nbsp;</p></td></tr></tbody></table>";
                        }));
    }

    // Gera comprovante de pagamento (migração do atributosCompovante original)
    private ComprovantePagamento gerarComprovantePagamento(MovimentacaoFinanceiraResponse mov) {
        String vencimentoStr = mov.vencimento() != null ? mov.vencimento() : "";
        String pagamentoStr = ""; // dataPagamento não existe no response
        String emissaoStr = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date());
        String valorStr = mov.valor().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String descontoStr = mov.desconto().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String multaJurosStr = mov.multaJuros().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
        String lancamentoStr = mov.parcelaId() != null ? mov.parcelaId().toString() : mov.id().toString();

        return new ComprovantePagamento(
                null, null, null, null, null,
                descontoStr, multaJurosStr, multaJurosStr, lancamentoStr, pagamentoStr,
                emissaoStr, valorStr, valorStr, vencimentoStr, null,
                null, null, null, null, null, null
        );
    }

    // ===== RECORDS PARA RESPOSTAS =====

    public record CaixaTotais(
            BigDecimal totalDinheiro,
            BigDecimal totalCheque,
            BigDecimal totalCartao,
            BigDecimal totalBoleto,
            BigDecimal totalTransferencia,
            BigDecimal totalDeposito,
            BigDecimal totalSangria,
            BigDecimal troco,
            BigDecimal fundoCaixa,
            BigDecimal totalDinheiroCaixa,
            BigDecimal valorTotalParcela,
            BigDecimal totalDesconto,
            BigDecimal totalMultaJuros
    ) {
        // Para compatibilidade com gerarTextoEmailCaixa
        public BigDecimal totalEntradas () {
            return totalDinheiro.add(totalCheque).add(totalCartao).add(totalBoleto).add(totalTransferencia).add(totalDeposito);
        }
        public BigDecimal totalSaidas () {
            return BigDecimal.ZERO; // Saídas são calculadas separadamente se necessário
        }
    }

    // Migrado de CaixaController.buscarParcela
    // Método de UI no legado (inicializa cheque/transferencia/deposito/cartao e valores de tela)
    public Uni<Void> buscarParcela() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaController.buscarParcelasAluno
    // Método de UI no legado (limpaPagamento + listarParcelas)
    public Uni<Void> buscarParcelasAluno() {
        return Uni.createFrom().voidItem();
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

    public record LayoutDTO(
            String url,
            String imagemEmail,
            String temaEmail
    ) {
    }

    public record ParcelaResponse(
            Long id,
            Long contratoId,
            Long pessoaId,
            Integer parcela,
            Date dataVencimento,
            BigDecimal valor,
            BigDecimal valorPago,
            BigDecimal desconto,
            BigDecimal multaJuros,
            Date dataPagamento
    ) {
    }
}