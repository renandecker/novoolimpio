package br.com.sol7.olimpio.financeiro.formapagamento;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "fin_forma_pagamento")
public class FormaPagamento extends PanacheEntity {

    @Column(name = "qtd_vezes")
    public Integer vezes;
    @Column(name = "juros")
    public BigDecimal juros;
    @Column(name = "desconto")
    public BigDecimal desconto;
    @Column(name = "ajuste_parcela_aluno")
    public BigDecimal ajusteParcelaAluno;
    @Column(name = "ajuste_parcela")
    public BigDecimal ajusteParcela;
    @Column(name = "operacao")
    public String operacao;  // era QueryOperation (enum/embeddable) no legado
    @Column(name = "tipo_regra")
    public String tipoRegra;  // era TipoRegra (enum/embeddable) no legado
    @Column(name = "tipo_regra_valor")
    public String tipoRegraValor;  // era TipoRegraValor (enum/embeddable) no legado
    @Column(name = "periodicidade")
    public String periodicidade;  // era Periodicidade (enum/embeddable) no legado
    @Column(name = "id_perfil")
    public Long perfilId;  // referencia a Perfil (id, cross-service)
    @Column(name = "regra")
    public boolean regra;
    @Column(name = "ativo")
    public boolean ativo;
    @Column(name = "usado")
    public boolean usado;
    @Column(name = "ajuste")
    public boolean ajuste;
    @Column(name = "cota")
    public boolean cota;
    @Column(name = "tipo_pessoa")
    public int tipoPessoa;
    @Column(name = "valor_regra")
    public BigDecimal valorRegra;
    @Column(name = "percentual_minimo")
    public BigDecimal percentualMinimo;
    @Column(name = "percentual_maximo")
    public BigDecimal percentualMaximo;
    @Column(name = "percentual_minimo_aluno")
    public BigDecimal percentualMinimoAluno;
    @Column(name = "percentual_maximo_aluno")
    public BigDecimal percentualMaximoAluno;
    @Column(name = "valor_cota")
    public Integer valorCota;
    @Column(name = "valor_controle_cota")
    public Integer valorCotaControle;
    @Temporal(TemporalType.DATE)
    @Column(name = "data_controle_cota")
    public Date dateCotaControle;
}
