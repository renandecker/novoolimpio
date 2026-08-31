package br.com.sol7.olimpio.financeiro.campanhanegociacao;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
@WithTransaction
public class CampanhaNegociacaoService {

    @Inject
    CampanhaNegociacaoRepository repository;

    public Uni<List<CampanhaNegociacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<CampanhaNegociacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<CampanhaNegociacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CampanhaNegociacao not found"))
                .map(this::toResponse);
    }

    public Uni<CampanhaNegociacaoResponse> create(CampanhaNegociacaoRequest r) {
        var e = new CampanhaNegociacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaNegociacaoResponse> update(Long id, CampanhaNegociacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("CampanhaNegociacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("CampanhaNegociacao not found")));
    }

    private void apply(CampanhaNegociacao e, CampanhaNegociacaoRequest r) {
        e.descricao = r.descricao();
        e.diaPagamentoAntecipado = r.diaPagamentoAntecipado();
        e.diasParaVencer = r.diasParaVencer();
        e.dia = r.dia();
        e.mes = r.mes();
        e.parcela = r.parcela();
        e.ano = r.ano();
        e.valor = r.valor();
        e.percentual = r.percentual();
        e.ativo = r.ativo();
        e.dataFim = r.dataFim();
        e.tipoCampanha = r.tipoCampanha();
        e.objetivo = r.objetivo();
        e.condicaoEspecial = r.condicaoEspecial();
        e.beneficioProximoMes = r.beneficioProximoMes();
        e.tipoOferta = r.tipoOferta();
    }

    private CampanhaNegociacaoResponse toResponse(CampanhaNegociacao e) {
        return new CampanhaNegociacaoResponse(e.id, e.descricao, e.diaPagamentoAntecipado, e.diasParaVencer, e.dia, e.mes, e.parcela, e.ano, e.valor, e.percentual, e.ativo, e.dataFim, e.tipoCampanha, e.objetivo, e.condicaoEspecial, e.beneficioProximoMes, e.tipoOferta);
    }

    // Factory methods to create the 4 campaign types

    public Uni<CampanhaNegociacaoResponse> criarCampanhaParcelaZeroAtrito(String nomeCliente, Integer mesReferencia) {
        var e = new CampanhaNegociacao();
        e.descricao = "Parcela Zero Atrito";
        e.tipoCampanha = "PARCELA_ZERO_ATRITO";
        e.objetivo = "atrasos_recentes";
        e.condicaoEspecial = "isencao_juros_multa_pix_mesmo_dia";
        e.tipoOferta = "isenacao_juros_multa";
        e.valor = BigDecimal.ZERO;
        e.percentual = BigDecimal.ZERO;
        e.ativo = true;
        e.dataFim = null;
        e.diaPagamentoAntecipado = 0;
        e.diasParaVencer = 0;
        e.dia = 0;
        e.mes = mesReferencia;
        e.parcela = 0;
        e.ano = java.time.YearMonth.now().getYear();
        e.mes = mesReferencia;
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaNegociacaoResponse> criarCampanhaTrocaDesconto(Integer percentualDesconto, Integer mesReferencia) {
        var e = new CampanhaNegociacao();
        e.descricao = "Troca por Desconto";
        e.tipoCampanha = "TROCA_POR_DESCONTO";
        e.objetivo = "liquidacao_rapida";
        e.condicaoEspecial = "desconto_percentual_fixo_liq_imediata";
        e.tipoOferta = "desconto_percentual";
        e.valor = BigDecimal.ZERO;
        e.percentual = percentualDesconto != null ? BigDecimal.valueOf(percentualDesconto) : BigDecimal.valueOf(10);
        e.ativo = true;
        e.dataFim = null;
        e.diaPagamentoAntecipado = 0;
        e.diasParaVencer = 0;
        e.dia = 0;
        e.mes = mesReferencia;
        e.parcela = 0;
        e.ano = java.time.YearMonth.now().getYear();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaNegociacaoResponse> criarCampanhaSegundaChance(String modalidadeReagendamento) {
        var e = new CampanhaNegociacao();
        e.descricao = "Segunda Chance";
        e.tipoCampanha = "SEGUNDA_CHANCE";
        e.objetivo = "prevencao_inadimplencia";
        e.condicaoEspecial = modalidadeReagendamento != null ? modalidadeReagendamento : "pula_mes_atual_para_final_contrato";
        e.tipoOferta = "reagendamento_sem_multa";
        e.valor = BigDecimal.ZERO;
        e.percentual = BigDecimal.ZERO;
        e.ativo = true;
        e.dataFim = null;
        e.diaPagamentoAntecipado = 0;
        e.diasParaVencer = 0;
        e.dia = 0;
        e.mes = 0;
        e.parcela = 0;
        e.ano = java.time.YearMonth.now().getYear();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<CampanhaNegociacaoResponse> criarCampanhaQuitaFacil(Integer percentualBonusProximoMes) {
        var e = new CampanhaNegociacao();
        e.descricao = "Quita Fáci";
        e.tipoCampanha = "QUITA_FACIL";
        e.objetivo = "engajamento_retencao";
        e.condicaoEspecial = "quittar_parcela_desbloqueie_beneficio";
        e.tipoOferta = "quittar_1_desbloqueie_beneficio_proximo_mes";
        e.valor = BigDecimal.ZERO;
        e.percentual = percentualBonusProximoMes != null ? BigDecimal.valueOf(percentualBonusProximoMes) : BigDecimal.valueOf(15);
        e.ativo = true;
        e.dataFim = null;
        e.beneficioProximoMes = true;
        e.diaPagamentoAntecipado = 0;
        e.diasParaVencer = 0;
        e.dia = 0;
        e.mes = 0;
        e.parcela = 0;
        e.ano = java.time.YearMonth.now().getYear();
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    // Trigger methods based on account status

    public Uni<CampanhaNegociacaoResponse> triggerPorAtrasoRecente(Long clienteId, Integer diasAtraso) {
        if (diasAtraso <= 30) {
            return criarCampanhaParcelaZeroAtrito("Cliente " + clienteId, java.time.LocalDate.now().getMonthValue());
        }
        return null;
    }

    public Uni<CampanhaNegociacaoResponse> triggerPorLiquidezRapida(Long clienteId) {
        return criarCampanhaTrocaDesconto(null, java.time.LocalDate.now().getMonthValue());
    }

    public Uni<CampanhaNegociacaoResponse> triggerPorPrevencaoInadimplencia(Long clienteId) {
        return criarCampanhaSegundaChance(null);
    }

    public Uni<CampanhaNegociacaoResponse> triggerPorEngajamento(Long clienteId) {
        return criarCampanhaQuitaFacil(null);
    }
}
