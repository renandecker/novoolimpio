package br.com.sol7.olimpio.educacao.nap;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="nap") public class NAP extends PanacheEntity { public String nome; public String dadosJson; }