package br.com.sol7.olimpio.educacao.valorcurso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "edc_valor_curso")
public class ValorCurso extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "dias_spc")
    public int diasSpc;
    @Column(name = "dias_tolerancia_multa")
    public int diasToleranciaMulta;
    @Column(name = "id_curriculo")
    public Long curriculoId;  // referencia a Curriculo (id, cross-service)
    @Column(name = "valor")
    public BigDecimal valor;
    @Column(name = "juros")
    public BigDecimal juros;
    @Column(name = "multa")
    public BigDecimal multa;
    @Column(name = "desconto_carne")
    public BigDecimal descontoCarne;
    @Column(name = "valor_desconto_aluno")
    public BigDecimal valorDescontoAluno;
    @Column(name = "cobra_rematricula")
    public boolean cobraRematricula;
    @Column(name = "valor_hora")
    public boolean valorHora;
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
    public BigDecimal qtdePacelas;
}
