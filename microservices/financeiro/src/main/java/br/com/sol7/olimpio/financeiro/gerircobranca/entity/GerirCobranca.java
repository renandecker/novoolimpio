package br.com.sol7.olimpio.financeiro.gerircobranca;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="gerir_cobranca") public class GerirCobranca extends PanacheEntity { public String nome; public String dadosJson; }