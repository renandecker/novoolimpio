package br.com.sol7.olimpio.financeiro.configuracaoparcela;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "fin_configuracao_parcela")
public class ConfiguracaoParcela extends PanacheEntity {

    @Column(name = "id_unidade")
    public Long unidadeId;  // referencia a Unidade (id, cross-service)
    @Column(name = "dias_validade_pre_cancelamento")
    public Integer diasValidadePreCancelamento;
    @Column(name = "vezes_pre_cancelamento")
    public Integer vezesPreCancelamento;
    @Column(name = "fl_juros_reparcela")
    public boolean jurosReparcela;
    @Column(name = "fl_multa_reparcela")
    public boolean multaReparcela;
    @Column(name = "fl_desconto_reparcela")
    public boolean descontoReparcela;
    @Column(name = "perc_desc_jur_mul")
    public BigDecimal percDescJurMul;
    @Column(name = "perc_desc_valor")
    public BigDecimal percDescValor;
    @Column(name = "perc_valor_min_entrada")
    public BigDecimal percValorMinReparcela;
    @Column(name = "qtde_parc_cancelamento")
    public Integer qtdeParcCancelamento;
    @Column(name = "prazo_parc_entrada")
    public Integer prazoParcEntrada;
    @Column(name = "prazo_parc_segunda")
    public Integer prazoParcSegunda;
    @Column(name = "prazo_reparc_entrada")
    public Integer prazoReparcEntrada;
    @Column(name = "prazo_reparc_segunda")
    public Integer prazoReparcSegunda;
    @Column(name = "qtde_reparcelamento")
    public Integer qtdeReaprcelamento;
    @Column(name = "qtde_parcelas")
    public BigDecimal qtdePacelas;
    @Column(name = "qtde_reparcela_valor_manual")
    public BigDecimal qtdeReparcValorManual;
    @Column(name = "perc_parcelas_valor")
    public BigDecimal percParcelaValor;
    @Column(name = "perc_parcelas_alterar")
    public BigDecimal percParcelaAlterar;
    @Column(name = "id_perfil_edit_parc")
    public Long perfilEditarParcelasId;  // referencia a Perfil (id, cross-service)
    @Column(name = "id_perfil_desc_reparc")
    public Long perfilDescParcelasId;  // referencia a Perfil (id, cross-service)
    @Column(name = "template_reparcelamento")
    public String templateReparcelamento;
    @Column(name = "template_cancelamento")
    public String templateCancelamento;
    @Column(name = "template_cancelamento_previsao")
    public String templateCancelamentoPrevisao;
    @Column(name = "template_cancelamento_curso")
    public String templateCancelamentoCurso;
    @Column(name = "perc_multa_cancelamento")
    public BigDecimal percMultaCancelamento;
    @Column(name = "dias_cancelamento_parcela")
    public Integer qtdeDiasCancelamentoParcela;
    @Column(name = "perc_minimo_cancelamento")
    public BigDecimal percMinimoCancelamento;
    @Column(name = "tipo_modelo_cancelamento_curso")
    public int tipoModeloCancelamentoCurso;
    @Column(name = "tipo_modelo_cancelamento")
    public int tipoModeloCancelamento;
    @Column(name = "tipo_modelo_cancelamento_previsao")
    public int tipoModeloCancelamentoPrecisao;
    @Column(name = "tipo_modelo_reparcelamento")
    public int tipoModeloCancelamentoReparcelamento;
}
