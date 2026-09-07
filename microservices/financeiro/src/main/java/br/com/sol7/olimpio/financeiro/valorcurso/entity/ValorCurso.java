package br.com.sol7.olimpio.financeiro.valorcurso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "edc_valor_curso")
public class ValorCurso extends PanacheEntity {

    @Column(name = "data")
    public LocalDate data;
    @Column(name = "id_curriculo")
    public Integer curriculoId;
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "valor_hora")
    public Boolean valorHora;
    @Column(name = "desconto_carne")
    public BigDecimal descontoCarne;
    @Column(name = "valor_desconto_aluno")
    public BigDecimal valorDescontoAluno;
    @Column(name = "dias_tolerancia_multa")
    public Integer diasToleranciaMulta;
    @Column(name = "dias_spc")
    public Integer diasSpc;
    @Column(name = "juros")
    public BigDecimal juros;
    @Column(name = "multa")
    public BigDecimal multa;
    @Column(name = "prc_desc_jur_mul")
    public BigDecimal percDescJurMul;
    @Column(name = "perc_desc_valor")
    public BigDecimal percDescValor;
    @Column(name = "perc_valor_min_entrada")
    public BigDecimal percValorMinEntrada;
    @Column(name = "prazo_parc_entrada")
    public Integer prazoParcEntrada;
    @Column(name = "prazo_parc_segunda")
    public Integer prazoParcSegunda;
    @Column(name = "qtde_parcelas")
    public BigDecimal qtdeParcelas;
    @Column(name = "cobra_rematricula")
    public Boolean cobraRematricula;
}
