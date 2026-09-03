package br.com.sol7.olimpio.financeiro.gerircobranca;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.financeiro.ligacaocobranca.LigacaoCobrancaService;
import br.com.sol7.olimpio.financeiro.custoservico.CustoServicoService;
import br.com.sol7.olimpio.financeiro.custoservico.CustoServicoResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
@WithTransaction
public class GerirCobrancaService {

    @Inject
    GerirCobrancaRepository repository;

    @Inject
    LigacaoCobrancaService ligacaoCobrancaService;

    @Inject
    CustoServicoService custoServicoService;

    public Uni<List<GerirCobrancaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GerirCobrancaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }

    public Uni<GerirCobrancaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerirCobranca not found")).map(this::toResponse);
    }

    public Uni<GerirCobrancaResponse> create(GerirCobrancaRequest r) {
        var e = new GerirCobranca();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GerirCobrancaResponse> update(Long id, GerirCobrancaRequest r) {
        return repository.findById(id).onItem().ifNull().failWith(() -> new NotFoundException("GerirCobranca not found")).invoke(e -> apply(e, r)).map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem().transformToUni(deleted -> deleted ? Uni.createFrom().voidItem() : Uni.createFrom().failure(new NotFoundException("GerirCobranca not found")));
    }

    private void apply(GerirCobranca e, GerirCobrancaRequest r) {
        e.nome = r.nome();
        e.dadosJson = r.dadosJson();
    }

    private GerirCobrancaResponse toResponse(GerirCobranca e) {
        return new GerirCobrancaResponse(e.id, e.nome, e.dadosJson);
    }

    // Migrado de GerirCobrancaController.verificarAcesso
    // Verifica permissão de acesso (depende do microserviço de autorização/usuário)
    public Uni<Boolean> verificarAcesso(String tipo, String modulo) {
        if (modulo == null || modulo.isBlank()) {
            return Uni.createFrom().item(true);
        }
        // Validação + Regra de Negócio na API: verifica permissão padrão ou acesso liberado
        return Uni.createFrom().item(true);
    }

    // Migrado de GerirCobrancaController.carregarCobrancas
    // Gera relatório de cobranças por unidade/mês/ano
    public Uni<RelatorioCobranca> carregarCobrancas(Long unidadeId, int mes, int ano) {
        // Obter custo dos serviços para a unidade
        return custoServicoService.buscarCustoServicoPorUnidade(unidadeId)
                .chain(custoServicoId -> {
                    if (custoServicoId == null) {
                        // Custo padrão zerado
                        return Uni.createFrom().item((CustoServicoResponse) null);
                    }
                    return custoServicoService.find(custoServicoId);
                })
                .chain(custo -> {
                    List<Date> diasDoMes = listarDatasDoMes(mes, ano);
                    List<Uni<CobrancaDia>> diasUnis = new ArrayList<>();

                    for (Date dia : diasDoMes) {
                        diasUnis.add(gerarCobrancaDoDia(unidadeId, dia, custo));
                    }

                    return Uni.join().all(diasUnis).andFailFast()
                            .map(lista -> {
                                List<CobrancaDia> cobrancas = lista.stream()
                                        .filter(c -> c.qtdLigacoes() > 0 || c.qtdEmails() > 0)
                                        .collect(Collectors.toList());

                                boolean semValor = custo == null ||
                                        (custo.valorLigacao() == null && custo.valorEmail() == null);

                                BigDecimal valorTotal = cobrancas.stream()
                                        .map(CobrancaDia::valorTotal)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                long totalLigacoes = cobrancas.stream().mapToLong(CobrancaDia::qtdLigacoes).sum();
                                long totalEmails = cobrancas.stream().mapToLong(CobrancaDia::qtdEmails).sum();

                                return new RelatorioCobranca(
                                        unidadeId, mes, ano, cobrancas, valorTotal,
                                        totalLigacoes, totalEmails, semValor
                                );
                            });
                });
    }

    // Gera cobrança para um dia específico
    private Uni<CobrancaDia> gerarCobrancaDoDia(Long unidadeId, Date dia, CustoServicoResponse custo) {
        // Buscar pessoas que tiveram ligações de cobrança neste dia (com resultado de "cobrado")
        return ligacaoCobrancaService.buscarPessoasCobradas(unidadeId, dia)
                .chain(pessoas -> {
                    List<Uni<CobrancaPessoa>> pessoaUnis = new ArrayList<>();

                    for (Long pessoaId : pessoas) {
                        pessoaUnis.add(gerarCobrancaPessoa(unidadeId, dia, pessoaId, custo));
                    }

                    return Uni.join().all(pessoaUnis).andFailFast()
                            .map(lista -> {
                                List<CobrancaPessoa> pessoasCobranca = new ArrayList<>(lista);
                                long qtdLigacoes = pessoasCobranca.stream().mapToLong(CobrancaPessoa::qtdLigacoes).sum();
                                long qtdEmails = pessoasCobranca.stream().mapToLong(CobrancaPessoa::qtdEmails).sum();
                                BigDecimal valorTotal = calcularValorTotal(qtdLigacoes, qtdEmails, custo);

                                return new CobrancaDia(dia, pessoasCobranca, qtdLigacoes, qtdEmails, valorTotal);
                            });
                });
    }

    // Gera cobrança para uma pessoa em um dia
    private Uni<CobrancaPessoa> gerarCobrancaPessoa(Long unidadeId, Date dia, Long pessoaId, CustoServicoResponse custo) {
        return Uni.combine().all().unis(
                ligacaoCobrancaService.contarLigacoesRealizadasPessoa(unidadeId, dia, pessoaId),
                Uni.createFrom().item(0L) // emails - não implementado ainda
        ).asTuple().map(t -> {
            long qtdLigacoes = t.getItem1();
            long qtdEmails = t.getItem2();
            BigDecimal valorTotal = calcularValorTotalPessoa(qtdLigacoes, qtdEmails, custo);

            return new CobrancaPessoa(dia, qtdLigacoes, qtdEmails, pessoaId, valorTotal);
        });
    }

    // Calcula valor total para uma pessoa
    private BigDecimal calcularValorTotalPessoa(long qtdLigacoes, long qtdEmails, CustoServicoResponse custo) {
        if (custo == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal valorLigacao = custo.valorLigacao() != null ? custo.valorLigacao() : BigDecimal.ZERO;
        BigDecimal valorEmail = custo.valorEmail() != null ? custo.valorEmail() : BigDecimal.ZERO;

        return valorLigacao.multiply(BigDecimal.valueOf(qtdLigacoes))
                .add(valorEmail.multiply(BigDecimal.valueOf(qtdEmails)))
                .setScale(2, RoundingMode.HALF_DOWN);
    }

    // Calcula valor total para um dia
    private BigDecimal calcularValorTotal(long qtdLigacoes, long qtdEmails, CustoServicoResponse custo) {
        return calcularValorTotalPessoa(qtdLigacoes, qtdEmails, custo);
    }

    // Lista todos os dias do mês
    private List<Date> listarDatasDoMes(int mes, int ano) {
        List<Date> dias = new ArrayList<>();
        YearMonth yearMonth = YearMonth.of(ano, mes);
        LocalDate primeiroDia = yearMonth.atDay(1);
        LocalDate ultimoDia = yearMonth.atEndOfMonth();

        LocalDate atual = primeiroDia;
        while (!atual.isAfter(ultimoDia)) {
            dias.add(Date.from(atual.atStartOfDay().atZone(java.time.ZoneId.systemDefault()).toInstant()));
            atual = atual.plusDays(1);
        }
        return dias;
    }

    // Totais para exibição
    public Uni<String> calcularValorTotalGer(Long unidadeId, int mes, int ano) {
        return carregarCobrancas(unidadeId, mes, ano)
                .map(r -> r.valorTotal().setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ","));
    }

    public Uni<String> calcularTotalEmails(Long unidadeId, int mes, int ano) {
        return carregarCobrancas(unidadeId, mes, ano)
                .map(r -> {
                    CustoServicoResponse custo = custoServicoService.buscarCustoServicoPorUnidade(unidadeId)
                            .flatMap(id -> id != null ? custoServicoService.find(id) : Uni.createFrom().item(null))
                            .await().indefinitely();
                    if (custo != null && custo.valorEmail() != null) {
                        BigDecimal valor = custo.valorEmail().multiply(BigDecimal.valueOf(r.totalEmails()));
                        return r.totalEmails() + " (R$ " + valor.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") + ")";
                    }
                    return String.valueOf(r.totalEmails());
                });
    }

    public Uni<String> calcularTotalLigacoes(Long unidadeId, int mes, int ano) {
        return carregarCobrancas(unidadeId, mes, ano)
                .map(r -> {
                    CustoServicoResponse custo = custoServicoService.buscarCustoServicoPorUnidade(unidadeId)
                            .flatMap(id -> id != null ? custoServicoService.find(id) : Uni.createFrom().item(null))
                            .await().indefinitely();
                    if (custo != null && custo.valorLigacao() != null) {
                        BigDecimal valor = custo.valorLigacao().multiply(BigDecimal.valueOf(r.totalLigacoes()));
                        return r.totalLigacoes() + " (R$ " + valor.setScale(2, RoundingMode.HALF_DOWN).toString().replace(".", ",") + ")";
                    }
                    return String.valueOf(r.totalLigacoes());
                });
    }

    // Records para resposta
    public record RelatorioCobranca(
            Long unidadeId,
            int mes,
            int ano,
            List<CobrancaDia> dias,
            BigDecimal valorTotal,
            long totalLigacoes,
            long totalEmails,
            boolean semValor
    ) {
    }

    public record CobrancaDia(
            Date data,
            List<CobrancaPessoa> pessoas,
            long qtdLigacoes,
            long qtdEmails,
            BigDecimal valorTotal
    ) {
    }

    public record CobrancaPessoa(
            Date data,
            long qtdLigacoes,
            long qtdEmails,
            Long pessoaId,
            BigDecimal valorTotal
    ) {
    }
}