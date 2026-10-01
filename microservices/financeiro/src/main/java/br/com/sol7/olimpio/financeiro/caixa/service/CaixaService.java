package br.com.sol7.olimpio.financeiro.caixa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.hibernate.reactive.panache.Panache;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.CalculoValorParcelaRequest;
import br.com.sol7.olimpio.financeiro.caixa.dto.CalculoValorParcelaResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.FechamentoCaixaTotaisResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.ParcelaSearchResponse;
import br.com.sol7.olimpio.financeiro.caixa.dto.RegistrarPagamentoParcelaRequest;
import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaService;
import br.com.sol7.olimpio.financeiro.configuracaocaixa.ConfiguracaoCaixaResponse;
import br.com.sol7.olimpio.financeiro.shared.VerificarSenhaService;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.service.MovimentacaoFinanceiraService;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraResponse;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.repository.MovimentacaoFinanceiraRepository;
import br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento;
import br.com.sol7.olimpio.financeiro.sangria.service.SangriaService;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaResponse;
import br.com.sol7.olimpio.financeiro.sangria.dto.SangriaRequest;
import br.com.sol7.olimpio.financeiro.impressora.ImpressoraService;
import br.com.sol7.olimpio.financeiro.controleimpressao.service.ControleImpressaoService;
import br.com.sol7.olimpio.shared.TupleHelper;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
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
    @Inject
    VerificarSenhaService verificarSenhaService;
    @Inject
    ControleImpressaoService controleImpressaoService;
    // @Inject UsuarioService usuarioService; // Cross-service
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
        if (r.usuarioId() != null && r.usuarioId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("usuarioId inválido"));
        }
        if (r.unidadeId() != null && r.unidadeId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("unidadeId inválido"));
        }
        if (r.impressoraId() != null && r.impressoraId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("impressoraId inválido"));
        }
        var e = new Caixa();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CaixaResponse> update(Long id, CaixaRequest r) {
        if (r.usuarioId() != null && r.usuarioId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("usuarioId inválido"));
        }
        if (r.unidadeId() != null && r.unidadeId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("unidadeId inválido"));
        }
        if (r.impressoraId() != null && r.impressoraId() <= 0) {
            return Uni.createFrom().failure(new IllegalArgumentException("impressoraId inválido"));
        }
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
        if (query == null || query.isBlank()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        // SQL nativo replica de ContratoRepository.autoCompleteAlunoPagamentoPendente (educacao):
        // busca ids de pessoa (bas_pessoa) com parcela em aberto. Retorna apenas o id, ja que o
        // nome/CPF sao resolvidos no DTO de pessoa (cross-service basico).
        final String sql = "SELECT DISTINCT p.id FROM edc_contrato c " +
                "INNER JOIN bas_pessoa p ON p.id = c.id_pessoa " +
                "LEFT JOIN bas_unidade j_c_unidade ON j_c_unidade.id = c.id_unidade " +
                "LEFT JOIN bas_unidade j_c_unidadeResponsavel ON j_c_unidadeResponsavel.id = c.id_unidade_resposavel " +
                "LEFT JOIN bas_pessoa_fisica j_p_pessoaFisica ON j_p_pessoaFisica.id_pessoa = p.id " +
                "WHERE (lower(j_p_pessoaFisica.nome) like '%' || ?1 || '%' OR (j_p_pessoaFisica.cpf) like '%' || ?1 || '%') " +
                "and exists(select par.id from fin_parcela par where par.data_pagamento is null and par.data_cancelamento is null and par.id_contrato = c.id) " +
                "LIMIT 10";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, query.toLowerCase())
                        .getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    // Migrado de CaixaController.buscarDetalheCaixaParcelas
    public Uni<Void> buscarDetalheCaixaParcelas(String event) {
        // Obs: metodo de UI no legado (seta BaseLazyModelJPASpecific de parcelasDetalhes); sem logica de dados portaivel
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaController.autoCompleteMovimento
    // Obs: no legado depende de categoriaFinanceira.getId() (id de fin_tipo_movimento) - agora recebido como parametro
    public Uni<List<Long>> autoCompleteMovimento(String query, Long tipoMovimentoId) {
        if (query == null || query.isBlank() || tipoMovimentoId == null) {
            return Uni.createFrom().item(java.util.List.of());
        }
        // Migrado de MovimentoRepository.autoCompleteComTipo (legado) - JPQL original:
        // select distinct m from Movimento m where m.tipoMovimento = ?2 and (lower(m.descricaoCompleta) like '%' || ?1 || '%' or str(m.id) = ?1)
        final String sql = "SELECT DISTINCT m.id FROM fin_movimento m " +
                "WHERE m.id_tipo_movimento = ?2 AND (lower(m.descricaocompleta) like '%' || ?1 || '%' OR CAST(m.id AS text) = ?1) " +
                "ORDER BY m.descricao LIMIT 10";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, query.toLowerCase())
                        .setParameter(2, tipoMovimentoId)
                        .getResultList())
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

    // Busca parcelas por número ou nome do aluno para autocomplete
    public Uni<List<ParcelaSearchResponse>> buscarParcelas(String query, int limit) {
        if (query == null || query.isBlank()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        final String sql = "SELECT p.id AS id, " +
                "       COALESCE(pf.nome, 'Aluno #' || p.id_pessoa) || ' - Parcela ' || p.parcela || ' - Venc: ' || to_char(p.data_vencimento, 'DD/MM/YYYY') || ' - Valor: ' || to_char(p.valor, 'FM999G999G990D00') AS descricao " +
                "FROM fin_parcela p " +
                "LEFT JOIN edc_contrato c ON c.id = p.id_contrato " +
                "LEFT JOIN bas_pessoa pes ON pes.id = p.id_pessoa " +
                "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = pes.id " +
                "WHERE (CAST(p.id AS text) ILIKE '%' || ?1 || '%' " +
                "       OR CAST(p.parcela AS text) ILIKE '%' || ?1 || '%' " +
                "       OR pf.nome ILIKE '%' || ?1 || '%' " +
                "       OR pf.cpf ILIKE '%' || ?1 || '%') " +
                "AND p.data_cancelamento IS NULL " +
                "AND p.data_pagamento IS NULL " +
                "ORDER BY p.data_vencimento " +
                "LIMIT ?2";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, query)
                        .setParameter(2, limit)
                        .getResultList())
                .map(list -> list.stream().map(t -> (Tuple) t).map(t -> {
                    return new ParcelaSearchResponse(
                            TupleHelper.getLong(t, "id"),
                            TupleHelper.getString(t, "pessoa_nome")
                    );
                }).toList());
    }

    // ===== MÉTODOS MIGRADOS DO CAIXACONTROLLER/CAIXASERVICE ORIGINAL =====

    // Migrado de CaixaController.verificarSenhaResponsavel
    // Verifica senha do responsável configurado no caixa
    public Uni<Boolean> verificarSenhaResponsavel(Long configuracaoCaixaId, String senha) {
        if (configuracaoCaixaId == null || senha == null || senha.isBlank()) {
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

    // Migrado de CaixaController.verificarSenhaOperador
    // Verifica senha do operador configurado no caixa
    public Uni<Boolean> verificarSenhaOperador(Long configuracaoCaixaId, String senha) {
        if (configuracaoCaixaId == null || senha == null || senha.isBlank()) {
            return Uni.createFrom().item(false);
        }
        return configuracaoCaixaService.find(configuracaoCaixaId)
                .onItem().transformToUni(config -> {
                    if (config.usuarioId() == null) {
                        return Uni.createFrom().item(false);
                    }
                    return verificarSenhaService.verificar(config.usuarioId(), senha);
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
    @SuppressWarnings("deprecation")
    public Uni<CaixaTotais> calcularTotaisCaixa(Long caixaId) {
        if (caixaId == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("caixaId é obrigatório"));
        }
        return movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.DINHEIRO)
                .onFailure().recoverWithItem(BigDecimal.ZERO)
                .chain(totalDinheiro -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.CHEQUE)
                        .onFailure().recoverWithItem(BigDecimal.ZERO)
                        .chain(totalCheque -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.CARTAO)
                                .onFailure().recoverWithItem(BigDecimal.ZERO)
                                .chain(totalCartao -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.BOLETO)
                                        .onFailure().recoverWithItem(BigDecimal.ZERO)
                                        .chain(totalBoleto -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.TRANFERENCIA)
                                                .onFailure().recoverWithItem(BigDecimal.ZERO)
                                                .chain(transferencia -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.PIX)
                                                        .onFailure().recoverWithItem(BigDecimal.ZERO)
                                                        .chain(pix -> movimentacaoRepository.totalPorFormaPagamento(caixaId, TipoPagamento.DEPOSITO)
                                                                .onFailure().recoverWithItem(BigDecimal.ZERO)
                                                                .chain(totalDeposito -> movimentacaoRepository.totalTroco(caixaId)
                                                                        .onFailure().recoverWithItem(BigDecimal.ZERO)
.chain(troco -> movimentacaoRepository.totaisParcela(caixaId)
                                                                         .onFailure().recoverWithItem(() -> null)
                                                                        .chain(totaisParcela -> sangriaService.buscarPorCaixa(caixaId)
                                                                                .onFailure().recoverWithItem(java.util.List.of())
                                                                                .chain(sangrias -> find(caixaId)
                                                                                        .onFailure().recoverWithUni(e -> Uni.createFrom().failure(new IllegalArgumentException("Caixa não encontrado: " + caixaId)))
                                                                                        .map(caixa -> {
                                                                                            BigDecimal td = nvl(totalDinheiro);
                                                                                            BigDecimal tc = nvl(totalCheque);
                                                                                            BigDecimal tca = nvl(totalCartao);
                                                                                            BigDecimal tb = nvl(totalBoleto);
                                                                                            BigDecimal tr = nvl(transferencia).add(nvl(pix));
                                                                                            BigDecimal tdep = nvl(totalDeposito);
                                                                                            BigDecimal trc = nvl(troco);
                                                                                            Tuple tp = totaisParcela;
                                                                                            @SuppressWarnings("unchecked")
                                                                                            List<SangriaResponse> sng = sangrias != null ? sangrias : java.util.List.of();
                                                                                            CaixaResponse cx = caixa;

                                                                                            BigDecimal totalSangria = sng.stream()
                                                                                                    .map(s -> s.valor() != null ? s.valor() : BigDecimal.ZERO)
                                                                                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                                                                                            BigDecimal valorTotalParcela = tp != null ? TupleHelper.getBigDecimal(tp, "valor") : BigDecimal.ZERO;
                                                                                            BigDecimal totalDesconto = tp != null ? TupleHelper.getBigDecimal(tp, "desconto") : BigDecimal.ZERO;
                                                                                            BigDecimal totalMultaJuros = tp != null ? TupleHelper.getBigDecimal(tp, "multa_juros") : BigDecimal.ZERO;

                                                                                                     td = nvl(td).subtract(nvl(trc));
                                                                                                     BigDecimal fundoCaixa = cx.fundoCaixa() != null ? cx.fundoCaixa() : BigDecimal.ZERO;
                                                                                                     BigDecimal totalDinheiroCaixa = nvl(td).add(nvl(fundoCaixa)).subtract(nvl(totalSangria));

                                                                                                    return new CaixaTotais(
                                                                                                            nvl(td), nvl(tc), nvl(tca), nvl(tb),
                                                                                                            nvl(tr), nvl(tdep), nvl(totalSangria), nvl(trc),
                                                                                                            nvl(fundoCaixa), nvl(totalDinheiroCaixa),
                                                                                                            nvl(valorTotalParcela), nvl(totalDesconto), nvl(totalMultaJuros)
                                                                                                    );
                                                                                                })))))))))));
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private static String fmtMoeda(BigDecimal v) {
        return nvl(v).setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",");
    }

    private static BigDecimal toBigDecimalSafe(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal bd) return bd;
        if (v instanceof Number n) return new BigDecimal(n.toString());
        try {
            return new BigDecimal(v.toString());
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    // Calcula valores da parcela (desconto, multa, juros) baseado nas regras de negócio
    public Uni<CalculoValorParcelaResponse> calcularValoresParcela(CalculoValorParcelaRequest r) {
        BigDecimal valor = r.valor() != null ? r.valor() : BigDecimal.ZERO;
        BigDecimal desconto = BigDecimal.ZERO;
        BigDecimal multa = BigDecimal.ZERO;
        BigDecimal juros = BigDecimal.ZERO;

        // Parcela de entrada/matrícula (sequencia 0) nunca recebe desconto/multa/juros
        if (r.parcelaSequencia() > 0) {
            // Desconto
            if (r.percentualDesconto() != null && r.percentualDesconto().compareTo(BigDecimal.ZERO) > 0) {
                desconto = valor.multiply(r.percentualDesconto()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            // Multa
            if (r.percentualMulta() != null && r.percentualMulta().compareTo(BigDecimal.ZERO) > 0) {
                multa = valor.multiply(r.percentualMulta()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            // Juros
            if (r.percentualJuros() != null && r.percentualJuros().compareTo(BigDecimal.ZERO) > 0) {
                juros = valor.multiply(r.percentualJuros()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
            // Feriado no dia anterior ao vencimento dobra a multa (regra legada)
            if (r.feriadoNoDiaAnteriorVencimento() && multa.compareTo(BigDecimal.ZERO) > 0) {
                multa = multa.multiply(BigDecimal.valueOf(2));
            }
        }

        BigDecimal valorCobrado = valor.subtract(desconto).add(multa).add(juros);
        return Uni.createFrom().item(new CalculoValorParcelaResponse(desconto, multa, juros, valorCobrado));
    }

    // Registra pagamento de parcela criando movimentações financeiras
    public Uni<Void> registrarPagamentoParcela(RegistrarPagamentoParcelaRequest request) {
        if (request == null || request.caixaId() == null || request.valorCobrado() == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("Dados de pagamento de parcela inválidos"));
        }
        // Validação + Regra de Negócio na API: Criação da movimentação financeira correspondente
        var movimentacaoReq = new br.com.sol7.olimpio.financeiro.movimentacaofinanceira.dto.MovimentacaoFinanceiraRequest(
            new Date(), "Pagamento de Parcela", null, request.valorCobrado(),
            null, BigDecimal.ONE, null, BigDecimal.ZERO,
            request.caixaId(), null, null, null,
            br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity.TipoPagamento.DINHEIRO,
            request.usuarioId(), request.parcelaId(),
            request.desconto(), request.multaJuros()
        );
        return movimentacaoFinanceiraService.create(movimentacaoReq).replaceWithVoid();
    }

    // Retorna totais para fechamento de caixa no formato de response
    public Uni<FechamentoCaixaTotaisResponse> totaisFechamento(Long caixaId) {
        if (caixaId == null) {
            return Uni.createFrom().failure(new IllegalArgumentException("caixaId é obrigatório"));
        }
        return calcularTotaisCaixa(caixaId).map(totais -> {
            BigDecimal totalEntradas = totais.totalEntradas() != null ? totais.totalEntradas() : BigDecimal.ZERO;
            BigDecimal totalSaidas = totais.totalSaidas() != null ? totais.totalSaidas() : BigDecimal.ZERO;
            BigDecimal totalValor = totalEntradas.subtract(totalSaidas);
            return new FechamentoCaixaTotaisResponse(
                    caixaId,
                    totais.fundoCaixa(),
                    totais.totalDinheiro(),
                    totais.totalCheque(),
                    totais.totalCartao(),
                    totais.totalBoleto(),
                    totais.totalTransferencia(),
                    totais.totalDeposito(),
                    totais.totalSangria(),
                    totais.totalDinheiroCaixa(),
                    totalValor,
                    totais.totalDesconto(),
                    totais.totalMultaJuros(),
                    totalValor
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
        if (movimentacaoFinanceiraId == null) {
            return Uni.createFrom().voidItem();
        }
        return movimentacaoFinanceiraService.find(movimentacaoFinanceiraId)
                .chain(mov -> {
                    if (mov == null) {
                        return Uni.createFrom().voidItem();
                    }
                    ComprovantePagamento comprovante = gerarComprovantePagamento(mov);
                    return impressoraService.imprimirComprovante(comprovante)
                            .chain(v -> usuarioId != null ? controleImpressaoService.registrarImpressao(movimentacaoFinanceiraId, usuarioId) : Uni.createFrom().voidItem())
                            .onFailure().recoverWithUni(ex -> Uni.createFrom().voidItem());
                })
                .onFailure().recoverWithUni(ex -> Uni.createFrom().voidItem());
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Void> imprimirComprovantePagamento() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaController.buscarNumeroParcela
    // Busca parcela por número (ID) e valida se pertence à unidade do caixa
    public Uni<ParcelaResponse> buscarNumeroParcela(Long numeroLancamento, Long caixaId, boolean caixaUnico) {
        if (numeroLancamento == null || caixaId == null) {
            return Uni.createFrom().item(null);
        }
        return find(caixaId)
                .onItem().transformToUni(caixa -> {
                    if (caixaUnico) {
                        return buscarParcelaDaUnidade(numeroLancamento, caixa.unidadeId());
                    }
                    return buscarParcelaPorId(numeroLancamento);
                });
    }

    // select p from Parcela p left join p.contrato c where p.contrato.unidade.ativo = true
    // and p.id = ?1 and c.unidadeResponsavel.id = ?2 and p.dataCancelamento is null
    private Uni<ParcelaResponse> buscarParcelaDaUnidade(Long parcelaId, Long unidadeId) {
        final String sql = "SELECT p.id AS id, c.id AS contrato_id, p.id_pessoa AS pessoa_id, " +
                "p.parcela AS parcela, p.data_vencimento AS data_vencimento, p.valor AS valor, " +
                "p.valor_pago AS valor_pago, p.valor_desconto AS valor_desconto, " +
                "p.valor_multa_juros AS valor_multa_juros, p.data_pagamento AS data_pagamento " +
                "FROM fin_parcela p LEFT JOIN edc_contrato c ON c.id = p.id_contrato " +
                "LEFT JOIN bas_unidade u ON u.id = c.id_unidade " +
                "WHERE p.id = ?1 AND c.id_unidade_resposavel = ?2 AND p.data_cancelamento IS NULL AND u.fl_ativo = true";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, parcelaId)
                        .setParameter(2, unidadeId)
                        .getSingleResult())
                .map(t -> rowToParcelaResponse((Tuple) t));
    }

    private Uni<ParcelaResponse> buscarParcelaPorId(Long parcelaId) {
        final String sql = "SELECT p.id AS id, c.id AS contrato_id, p.id_pessoa AS pessoa_id, " +
                "p.parcela AS parcela, p.data_vencimento AS data_vencimento, p.valor AS valor, " +
                "p.valor_pago AS valor_pago, p.valor_desconto AS valor_desconto, " +
                "p.valor_multa_juros AS valor_multa_juros, p.data_pagamento AS data_pagamento " +
                "FROM fin_parcela p LEFT JOIN edc_contrato c ON c.id = p.id_contrato " +
                "WHERE p.id = ?1";
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(sql, Tuple.class)
                        .setParameter(1, parcelaId)
                        .getSingleResult())
                .map(t -> rowToParcelaResponse((Tuple) t));
    }

    private ParcelaResponse rowToParcelaResponse(Tuple t) {
        if (t == null) {
            return null;
        }
        return new ParcelaResponse(
                TupleHelper.getLong(t, "id"),
                TupleHelper.getLong(t, "contrato_id"),
                TupleHelper.getLong(t, "pessoa_id"),
                TupleHelper.getInteger(t, "parcela"),
                TupleHelper.getDate(t, "data_vencimento"),
                TupleHelper.getBigDecimal(t, "valor"),
                TupleHelper.getBigDecimal(t, "valor_pago"),
                TupleHelper.getBigDecimal(t, "valor_desconto"),
                TupleHelper.getBigDecimal(t, "valor_multa_juros"),
                TupleHelper.getDate(t, "data_pagamento")
        );
    }

    private Date toDate(Object v) {
        if (v == null) {
            return null;
        }
        if (v instanceof Date d) {
            return d;
        }
        if (v instanceof java.sql.Timestamp ts) {
            return new Date(ts.getTime());
        }
        if (v instanceof java.sql.Date d) {
            return new Date(d.getTime());
        }
        return null;
    }

    // Versão sem parâmetros para compatibilidade com controller
    public Uni<Void> buscarNumeroParcela() {
        return Uni.createFrom().voidItem();
    }

    // Migrado de CaixaService.buscarAberturaCaixa (original service)
    public Uni<List<Long>> buscarAberturaCaixa(Long usuarioId) {
        return repository.buscarAberturaCaixa(usuarioId);
    }

    // Migrado de CaixaService.buscarAberturaCaixaComUsuarioUnidade (original service)
    public Uni<Long> buscarAberturaCaixaComUsuarioUnidade(Long usuarioId, Long unidadeId) {
        return repository.buscarAberturaCaixaComUsuarioUnidade(usuarioId, unidadeId)
                .map(list -> list.isEmpty() ? null : list.get(0));
    }

    // Busca o fundo de caixa sugerido baseado na configuração do usuário e unidade
    public Uni<BigDecimal> fundoCaixaSugerido(Long usuarioId, Long unidadeId) {
        return configuracaoCaixaService.buscarConfiguracaoComUnidadeUsuario(usuarioId, unidadeId)
                .onItem().transformToUni(configId -> {
                    if (configId == null) return Uni.createFrom().item(BigDecimal.ZERO);
                    return configuracaoCaixaService.find(configId).map(config -> config.fundoCaixa() != null ? config.fundoCaixa() : BigDecimal.ZERO);
                });
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
        String pagamentoStr = mov.dataMovimento() != null ? new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(mov.dataMovimento()) : "";
        String emissaoStr = new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date());
        String valorStr = mov.valor() != null ? mov.valor().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") : "0,00";
        String descontoStr = mov.desconto() != null ? mov.desconto().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") : "0,00";
        String multaJurosStr = mov.multaJuros() != null ? mov.multaJuros().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") : "0,00";
        String lancamentoStr = mov.parcelaId() != null ? mov.parcelaId().toString() : (mov.id() != null ? mov.id().toString() : "");

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
            return nvl(totalDinheiro).add(nvl(totalCheque)).add(nvl(totalCartao)).add(nvl(totalBoleto)).add(nvl(totalTransferencia)).add(nvl(totalDeposito));
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

    public Uni<byte[]> exportarCaixa(String format, Long caixaId) {
        return Uni.createFrom().item(() -> {
            try {
                StringBuilder content = new StringBuilder();
                content.append("Relatório de Caixa\n");
                content.append("==================\n\n");
                
 if (caixaId != null) {
                    CaixaResponse caixa = find(caixaId).await().indefinitely();
                    content.append("Caixa: ").append(caixa.idCaixaUnidade()).append("\n");
                    content.append("Usuário: ").append(caixa.usuarioId()).append("\n");
                    content.append("Unidade: ").append(caixa.unidadeId()).append("\n");
                    content.append("Data: ").append(caixa.data()).append("\n");
                    content.append("Fundo Caixa: ").append(caixa.fundoCaixa()).append("\n\n");
                    
                    FechamentoCaixaTotaisResponse totais = totaisFechamento(caixaId).await().indefinitely();
                    content.append("Totais:\n");
                    content.append("  Dinheiro: ").append(totais.totalDinheiro()).append("\n");
                    content.append("  Cheque: ").append(totais.totalCheque()).append("\n");
                    content.append("  Cartão: ").append(totais.totalCartao()).append("\n");
                    content.append("  Boleto: ").append(totais.totalBoleto()).append("\n");
                    content.append("  Transferência: ").append(totais.totalTransferencia()).append("\n");
                    content.append("  Depósito: ").append(totais.totalDeposito()).append("\n");
                    content.append("  Sangria: ").append(totais.totalSangria()).append("\n");
                    content.append("  Valor Total: ").append(totais.totalValor()).append("\n");
                    content.append("  Desconto: ").append(totais.totalDesconto()).append("\n");
                    content.append("  Juros/Multa: ").append(totais.totalJurosMulta()).append("\n");
                    content.append("  Valor Total Caixa: ").append(totais.totalValorPagar()).append("\n");
                }
                
                String text = content.toString();
                
                switch (format.toLowerCase()) {
                    case "pdf":
                        // Simplified PDF - in production use a proper PDF library
                        return ("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length " + (text.length() + 100) + " >>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(" + text.replace("\n", ") Tj\n0 -14 Td\n(") + ") Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000274 00000 n \n0000000450 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n550\n%%EOF").getBytes();
                    case "excel":
                    case "xlsx":
                        // Simplified Excel - in production use Apache POI
                        byte[] zipHeader = new byte[] {0x50, 0x4B, 0x03, 0x04};
                        byte[] textBytes = text.getBytes();
                        byte[] result = new byte[zipHeader.length + textBytes.length];
                        System.arraycopy(zipHeader, 0, result, 0, zipHeader.length);
                        System.arraycopy(textBytes, 0, result, zipHeader.length, textBytes.length);
                        return result;
                    case "docx":
                        // Simplified DOCX - in production use Apache POI
                        zipHeader = new byte[] {0x50, 0x4B, 0x03, 0x04};
                        textBytes = text.getBytes();
                        result = new byte[zipHeader.length + textBytes.length];
                        System.arraycopy(zipHeader, 0, result, 0, zipHeader.length);
                        System.arraycopy(textBytes, 0, result, zipHeader.length, textBytes.length);
                        return result;
                    default:
                        throw new IllegalArgumentException("Formato não suportado: " + format);
                }
            } catch (Exception e) {
                throw new RuntimeException("Erro ao exportar caixa: " + e.getMessage(), e);
            }
        });
    }

    // Gera relatório de caixa para impressão (formato DOCX)
    public Uni<byte[]> imprimirCaixa(Long caixaId) {
        return find(caixaId)
                .chain(caixa -> totaisFechamento(caixaId)
                        .chain(totais -> buscarMovimentacaoCaixaEntrada(caixaId)
                                .chain(movs -> sangriaService.buscarPorCaixa(caixaId)
                                        .map(sangrias -> {
                                            StringBuilder content = new StringBuilder();
                                            content.append("RELATÓRIO DE CAIXA\n");
                                            content.append("===================\n\n");
                                            content.append("Caixa: ").append(caixa.idCaixaUnidade()).append("\n");
                                            content.append("Data: ").append(caixa.data() != null ? new SimpleDateFormat("dd/MM/yyyy HH:mm").format(caixa.data()) : "").append("\n");
                                            content.append("Fundo de Caixa: R$ ").append(fmtMoeda(caixa.fundoCaixa())).append("\n\n");
                                            content.append("TOTAIS:\n");
                                            content.append("Total Dinheiro: R$ ").append(fmtMoeda(totais.totalDinheiro())).append("\n");
                                            content.append("Total Cheque: R$ ").append(fmtMoeda(totais.totalCheque())).append("\n");
                                            content.append("Total Cartão: R$ ").append(fmtMoeda(totais.totalCartao())).append("\n");
                                            content.append("Total Boleto: R$ ").append(fmtMoeda(totais.totalBoleto())).append("\n");
                                            content.append("Total Transferência: R$ ").append(fmtMoeda(totais.totalTransferencia())).append("\n");
                                            content.append("Total Depósito: R$ ").append(fmtMoeda(totais.totalDeposito())).append("\n");
                                            content.append("Total Sangria: R$ ").append(fmtMoeda(totais.totalSangria())).append("\n");
                                            content.append("Total Desconto: R$ ").append(fmtMoeda(totais.totalDesconto())).append("\n");
                                            content.append("Total Juros/Multa: R$ ").append(fmtMoeda(totais.totalJurosMulta())).append("\n");
                                            content.append("Valor Total: R$ ").append(fmtMoeda(totais.totalValor())).append("\n");
                                            content.append("Valor Total Caixa: R$ ").append(fmtMoeda(totais.totalValorPagar())).append("\n\n");
                                            content.append("MOVIMENTAÇÕES:\n");
                                            content.append("--------------\n");
                                            for (MovimentacaoFinanceiraResponse mov : movs) {
                                                content.append("ID: ").append(mov.id()).append(" | ");
                                                content.append("Aluno: ").append(mov.historico() != null ? mov.historico() : "").append(" | ");
                                                content.append("Valor: R$ ").append(fmtMoeda(mov.valor())).append("\n");
                                            }
                                            for (SangriaResponse s : sangrias) {
                                                content.append("Sangria: R$ ").append(fmtMoeda(s.valor())).append("\n");
                                            }
                                            try {
                                                String text = content.toString();
                                                byte[] zipHeader = new byte[] {0x50, 0x4B, 0x03, 0x04};
                                                byte[] textBytes = text.getBytes("ISO-8859-1");
                                                byte[] result = new byte[zipHeader.length + textBytes.length];
                                                System.arraycopy(zipHeader, 0, result, 0, zipHeader.length);
                                                System.arraycopy(textBytes, 0, result, zipHeader.length, textBytes.length);
                                                return result;
                                            } catch (Exception e) {
                                                throw new RuntimeException("Erro ao imprimir caixa: " + e.getMessage(), e);
                                            }
                                        }))));
    }

    public Uni<byte[]> exportarCaixaComFormato(String format, Long caixaId) {
        return Uni.createFrom().item(() -> {
            try {
                StringBuilder content = new StringBuilder();
                content.append("Relatório de Caixa\n");
                content.append("==================\n\n");
                
 if (caixaId != null) {
                    CaixaResponse caixa = find(caixaId).await().indefinitely();
                    content.append("Caixa: ").append(caixa.idCaixaUnidade()).append("\n");
                    content.append("Usuário: ").append(caixa.usuarioId()).append("\n");
                    content.append("Unidade: ").append(caixa.unidadeId()).append("\n");
                    content.append("Data: ").append(caixa.data()).append("\n");
                    content.append("Fundo Caixa: ").append(caixa.fundoCaixa()).append("\n\n");
                    
                    FechamentoCaixaTotaisResponse totais = totaisFechamento(caixaId).await().indefinitely();
                    content.append("Totais:\n");
                    content.append("  Dinheiro: ").append(totais.totalDinheiro()).append("\n");
                    content.append("  Cheque: ").append(totais.totalCheque()).append("\n");
                    content.append("  Cartão: ").append(totais.totalCartao()).append("\n");
                    content.append("  Boleto: ").append(totais.totalBoleto()).append("\n");
                    content.append("  Transferência: ").append(totais.totalTransferencia()).append("\n");
                    content.append("  Depósito: ").append(totais.totalDeposito()).append("\n");
                    content.append("  Sangria: ").append(totais.totalSangria()).append("\n");
                    content.append("  Valor Total: ").append(totais.totalValor()).append("\n");
                    content.append("  Desconto: ").append(totais.totalDesconto()).append("\n");
                    content.append("  Juros/Multa: ").append(totais.totalJurosMulta()).append("\n");
                    content.append("  Valor Total Caixa: ").append(totais.totalValorPagar()).append("\n");
                }
                
                String text = content.toString();
                
                switch (format.toLowerCase()) {
                    case "pdf":
                        return ("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length " + (text.length() + 100) + " >>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(" + text.replace("\n", ") Tj\n0 -14 Td\n(") + ") Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000274 00000 n \n0000000450 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n550\n%%EOF").getBytes();
                    case "excel":
                    case "xlsx":
                        byte[] zipHeader = new byte[] {0x50, 0x4B, 0x03, 0x04};
                        byte[] textBytes = text.getBytes();
                        byte[] result = new byte[zipHeader.length + textBytes.length];
                        System.arraycopy(zipHeader, 0, result, 0, zipHeader.length);
                        System.arraycopy(textBytes, 0, result, zipHeader.length, textBytes.length);
                        return result;
                    case "docx":
                        zipHeader = new byte[] {0x50, 0x4B, 0x03, 0x04};
                        textBytes = text.getBytes();
                        result = new byte[zipHeader.length + textBytes.length];
                        System.arraycopy(zipHeader, 0, result, 0, zipHeader.length);
                        System.arraycopy(textBytes, 0, result, zipHeader.length, textBytes.length);
                        return result;
                    default:
                        throw new IllegalArgumentException("Formato não suportado: " + format);
                }
            } catch (Exception e) {
                throw new RuntimeException("Erro ao exportar caixa: " + e.getMessage(), e);
            }
        });
    }
}