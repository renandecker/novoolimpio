package br.com.sol7.olimpio.financeiro.fundocaixa;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="fundo_caixa") public class FundoCaixa extends PanacheEntity { public String nome; public String dadosJson; }