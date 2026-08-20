package br.com.sol7.olimpio.financeiro.valorproduto;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "fin_valor_produto")
public class ValorProduto extends PanacheEntity {

    @Column(name = "vezes")
    public int vezes;
    @Column(name = "juros")
    public BigDecimal juros;
    @Column(name = "desconto")
    public BigDecimal desconto;
    @Column(name = "multa")
    public BigDecimal multa;
    @Column(name = "dias_spc")
    public int diasSpc;
    @Column(name = "dias_tolerancia_multa")
    public int diasToleranciaMulta;
}
